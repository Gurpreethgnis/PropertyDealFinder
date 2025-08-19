#!/usr/bin/env python3
"""
NJ Construction Permits Data Ingestion

Pulls real permit data from NJ Socrata API and loads into the database.
"""

import asyncio
import aiohttp
import asyncpg
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
SOCRATA_ENDPOINT = "https://data.nj.gov/resource/w9se-dmra.json"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")

# Permit type mapping to normalize categories
PERMIT_TYPE_MAPPING = {
    "residential": ["residential", "single family", "multi-family", "apartment", "condo"],
    "commercial": ["commercial", "office", "retail", "industrial", "warehouse"],
    "renovation": ["renovation", "remodel", "addition", "alteration"],
    "demolition": ["demolition", "demolish"],
    "other": ["other", "miscellaneous", "unknown"]
}

async def fetch_nj_permits(session: aiohttp.ClientSession, months_back: int = 12) -> List[Dict[str, Any]]:
    """Fetch NJ permits data from Socrata API for the last N months."""
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months_back * 30)
    
    # Build query parameters
    params = {
        "$where": f"issue_date >= '{start_date.strftime('%Y-%m-%d')}'",
        "$limit": 50000,  # Large limit to get all recent permits
        "$order": "issue_date DESC"
    }
    
    try:
        logger.info(f"Fetching NJ permits from {start_date.date()} to {end_date.date()}")
        
        async with session.get(SOCRATA_ENDPOINT, params=params) as response:
            if response.status != 200:
                logger.error(f"API request failed: {response.status}")
                return []
            
            data = await response.json()
            logger.info(f"Retrieved {len(data)} permits from API")
            return data
            
    except Exception as e:
        logger.error(f"Error fetching permits: {e}")
        return []

def normalize_permit_type(permit_type: str) -> str:
    """Normalize permit type to standard categories."""
    if not permit_type:
        return "other"
    
    permit_type_lower = permit_type.lower()
    
    for category, keywords in PERMIT_TYPE_MAPPING.items():
        if any(keyword in permit_type_lower for keyword in keywords):
            return category
    
    return "other"

def parse_permit_cost(cost_str: str) -> float:
    """Parse permit cost from string, handling various formats."""
    if not cost_str:
        return 0.0
    
    try:
        # Remove common non-numeric characters
        cleaned = cost_str.replace('$', '').replace(',', '').replace(' ', '')
        return float(cleaned)
    except (ValueError, AttributeError):
        return 0.0

def parse_issue_date(date_str: str) -> datetime:
    """Parse issue date from various formats."""
    if not date_str:
        return datetime.now()
    
    # Try common date formats
    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%m-%d-%Y"
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    logger.warning(f"Could not parse date: {date_str}")
    return datetime.now()

async def upsert_permits(conn: asyncpg.Connection, permits: List[Dict[str, Any]]) -> int:
    """Upsert permits data into the database."""
    
    if not permits:
        return 0
    
    # Prepare the upsert query
    upsert_query = """
    INSERT INTO permits (
        permit_number, state, city, zip_code, permit_type, 
        issue_date, estimated_value, description, status, source
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (permit_number) DO UPDATE SET
        city = EXCLUDED.city,
        zip_code = EXCLUDED.zip_code,
        permit_type = EXCLUDED.permit_type,
        issue_date = EXCLUDED.issue_date,
        estimated_value = EXCLUDED.estimated_value,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    """
    
    # Process and insert permits
    inserted_count = 0
    for permit in permits:
        try:
            # Extract and normalize data
            permit_number = permit.get('permit_number', f"NJ_{permit.get('id', 'UNKNOWN')}")
            municipality = permit.get('municipality', '')
            permit_type_raw = permit.get('permit_type', '')
            est_cost = permit.get('est_cost', '0')
            issue_date_raw = permit.get('issue_date', '')
            location = permit.get('location_1', {})
            
            # Parse and validate data
            if not municipality or not issue_date_raw:
                continue
                
            # Normalize permit type
            permit_type = normalize_permit_type(permit_type_raw)
            
            # Parse cost
            estimated_value = parse_permit_cost(est_cost)
            
            # Parse date
            issue_date = parse_issue_date(issue_date_raw)
            
            # Extract ZIP code from location if available
            zip_code = None
            if location and isinstance(location, dict):
                address = location.get('human_address', '')
                # Try to extract ZIP from address
                if address:
                    # Simple ZIP extraction - could be improved
                    import re
                    zip_match = re.search(r'\b\d{5}\b', address)
                    if zip_match:
                        zip_code = zip_match.group()
            
            # If no ZIP found, skip this permit
            if not zip_code:
                logger.debug(f"Skipping permit {permit_number}: no ZIP code found")
                continue
            
            # Insert into database
            await conn.execute(
                upsert_query,
                permit_number,
                'NJ',
                municipality,
                zip_code,
                permit_type,
                issue_date,
                estimated_value,
                f"{permit_type_raw} - {municipality}",
                'issued',
                'nj_socrata'
            )
            
            inserted_count += 1
            
        except Exception as e:
            logger.error(f"Error processing permit {permit.get('id', 'UNKNOWN')}: {e}")
            continue
    
    return inserted_count

async def main():
    """Main ingestion function."""
    logger.info("Starting NJ permits ingestion...")
    
    # Create HTTP session
    async with aiohttp.ClientSession() as session:
        # Fetch permits data
        permits = await fetch_nj_permits(session, months_back=12)
        
        if not permits:
            logger.error("No permits data retrieved")
            return
        
        # Connect to database
        try:
            conn = await asyncpg.connect(DATABASE_URL)
            logger.info("Connected to database")
            
            # Upsert permits
            inserted_count = await upsert_permits(conn, permits)
            logger.info(f"Successfully processed {inserted_count} permits")
            
            # Close connection
            await conn.close()
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            return
    
    logger.info("NJ permits ingestion completed")

if __name__ == "__main__":
    asyncio.run(main())
