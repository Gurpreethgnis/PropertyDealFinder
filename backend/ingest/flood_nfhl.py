"""
Flood Risk Ingestion Script (Sprint 3)
Pulls data from FEMA National Flood Hazard Layer (NFHL)
"""

import asyncio
import asyncpg
import aiohttp
import logging
from typing import List, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/propertyfinder")

# FEMA NFHL API endpoints
FEMA_BASE_URL = "https://hazards.fema.gov/nfhl/rest/services/public/NFHL/MapServer"

async def get_database_connection():
    """Get database connection."""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        logger.info("Connected to database")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

async def fetch_fema_flood_data(zip_code: str) -> Dict[str, Any]:
    """
    Fetch flood data from FEMA NFHL for a specific ZIP code.
    This is a simplified version - in production you'd use the full FEMA API.
    """
    try:
        # For development, we'll use mock data
        # In production, you'd make actual API calls to FEMA NFHL
        
        # Mock flood risk data based on ZIP patterns
        # This simulates what you'd get from the real FEMA API
        mock_data = {
            "zip_code": zip_code,
            "in_fema_special_flood_hazard_area": False,
            "zone": "X",
            "risk_level": "LOW"
        }
        
        # Simulate some high-risk areas
        if zip_code in ["07302", "07030", "19102", "19147"]:  # Waterfront areas
            mock_data.update({
                "in_fema_special_flood_hazard_area": True,
                "zone": "AE",
                "risk_level": "HIGH"
            })
        elif zip_code in ["07087", "08002", "19020", "19087", "19406"]:  # Suburban areas
            mock_data.update({
                "in_fema_special_flood_hazard_area": False,
                "zone": "X",
                "risk_level": "LOW"
            })
        elif zip_code in ["08540"]:  # Mixed areas
            mock_data.update({
                "in_fema_special_flood_hazard_area": True,
                "zone": "A",
                "risk_level": "HIGH"
            })
        
        return mock_data
        
    except Exception as e:
        logger.error(f"Error fetching FEMA data for {zip_code}: {e}")
        return None

async def upsert_flood_risk(conn: asyncpg.Connection, flood_data: Dict[str, Any]):
    """Upsert flood risk data into the database."""
    try:
        query = """
        INSERT INTO flood_risk (
            zip_code, city, state, in_fema_special_flood_hazard_area, 
            zone, risk_level, last_checked, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (zip_code) DO UPDATE SET
            in_fema_special_flood_hazard_area = EXCLUDED.in_fema_special_flood_hazard_area,
            zone = EXCLUDED.zone,
            risk_level = EXCLUDED.risk_level,
            last_checked = EXCLUDED.last_checked,
            updated_at = EXCLUDED.updated_at
        """
        
        # Get city/state from properties table
        city_state_query = """
        SELECT city, state FROM properties WHERE zip_code = $1 LIMIT 1
        """
        city_state_result = await conn.fetchrow(city_state_query, flood_data["zip_code"])
        
        city = city_state_result["city"] if city_state_result else None
        state = city_state_result["state"] if city_state_result else None
        
        await conn.execute(
            query,
            flood_data["zip_code"],
            city,
            state,
            flood_data["in_fema_special_flood_hazard_area"],
            flood_data["zone"],
            flood_data["risk_level"],
            datetime.now(),
            datetime.now()
        )
        
        logger.info(f"Upserted flood risk data for {flood_data['zip_code']}")
        
    except Exception as e:
        logger.error(f"Error upserting flood risk data: {e}")
        raise

async def get_zip_codes_to_process(conn: asyncpg.Connection) -> List[str]:
    """Get list of ZIP codes that need flood risk assessment."""
    try:
        # Get ZIP codes from properties table that don't have recent flood risk data
        query = """
        SELECT DISTINCT p.zip_code
        FROM properties p
        LEFT JOIN flood_risk fr ON p.zip_code = fr.zip_code
        WHERE fr.last_checked IS NULL 
           OR fr.last_checked < CURRENT_DATE - INTERVAL '90 days'
        ORDER BY p.zip_code
        LIMIT 100
        """
        
        result = await conn.fetch(query)
        return [row["zip_code"] for row in result]
        
    except Exception as e:
        logger.error(f"Error getting ZIP codes: {e}")
        return []

async def process_flood_risk_batch(conn: asyncpg.Connection, zip_codes: List[str]):
    """Process a batch of ZIP codes for flood risk assessment."""
    logger.info(f"Processing {len(zip_codes)} ZIP codes for flood risk")
    
    for zip_code in zip_codes:
        try:
            # Fetch flood data from FEMA
            flood_data = await fetch_fema_flood_data(zip_code)
            
            if flood_data:
                # Upsert into database
                await upsert_flood_risk(conn, flood_data)
                
                # Small delay to be respectful to external APIs
                await asyncio.sleep(0.1)
            else:
                logger.warning(f"No flood data returned for {zip_code}")
                
        except Exception as e:
            logger.error(f"Error processing {zip_code}: {e}")
            continue

async def main():
    """Main function to run flood risk ingestion."""
    logger.info("Starting flood risk ingestion")
    
    try:
        # Get database connection
        conn = await get_database_connection()
        
        # Get ZIP codes to process
        zip_codes = await get_zip_codes_to_process(conn)
        
        if not zip_codes:
            logger.info("No ZIP codes need flood risk assessment")
            return
        
        logger.info(f"Found {len(zip_codes)} ZIP codes to process")
        
        # Process in batches
        batch_size = 10
        for i in range(0, len(zip_codes), batch_size):
            batch = zip_codes[i:i + batch_size]
            await process_flood_risk_batch(conn, batch)
            logger.info(f"Processed batch {i//batch_size + 1}")
        
        # Get summary
        summary_query = """
        SELECT 
            COUNT(*) as total_records,
            COUNT(CASE WHEN in_fema_special_flood_hazard_area = true THEN 1 END) as high_risk_count,
            COUNT(CASE WHEN in_fema_special_flood_hazard_area = false THEN 1 END) as low_risk_count
        FROM flood_risk
        """
        
        summary = await conn.fetchrow(summary_query)
        
        logger.info("Flood risk ingestion completed successfully")
        logger.info(f"Total records: {summary['total_records']}")
        logger.info(f"High risk areas: {summary['high_risk_count']}")
        logger.info(f"Low risk areas: {summary['low_risk_count']}")
        
    except Exception as e:
        logger.error(f"Flood risk ingestion failed: {e}")
        raise
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
