#!/usr/bin/env python3
"""
Census ACS Data Ingestion

Pulls American Community Survey data for income and population by ZIP code for NJ/PA.
"""

import asyncio
import aiohttp
import asyncpg
import os
import logging
from datetime import datetime
from typing import List, Dict, Any
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
CENSUS_API_BASE = "https://api.census.gov/data/2022/acs/acs5"
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "mock_key")  # Get from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")

# Census variables to fetch
CENSUS_VARIABLES = {
    'B19013_001E': 'median_household_income',  # Median household income
    'B01003_001E': 'total_population',         # Total population
}

# NJ and PA state FIPS codes
STATE_FIPS = {
    'NJ': '34',
    'PA': '42'
}

async def fetch_census_data(session: aiohttp.ClientSession, state_fips: str, variables: List[str]) -> List[Dict[str, Any]]:
    """Fetch Census ACS data for a specific state."""
    
    # Build the API URL
    var_string = ','.join(variables)
    url = f"{CENSUS_API_BASE}?get={var_string}&for=zip%20code%20tabulation%20area:*&in=state:{state_fips}"
    
    if CENSUS_API_KEY != "mock_key":
        url += f"&key={CENSUS_API_KEY}"
    
    try:
        logger.info(f"Fetching Census data for state FIPS {state_fips}")
        
        async with session.get(url) as response:
            if response.status != 200:
                logger.error(f"Census API request failed: {response.status}")
                return []
            
            data = await response.json()
            
            # First row contains column headers
            if not data or len(data) < 2:
                logger.warning(f"No data returned for state FIPS {state_fips}")
                return []
            
            headers = data[0]
            rows = data[1:]
            
            logger.info(f"Retrieved {len(rows)} ZIP codes for state FIPS {state_fips}")
            
            # Convert to list of dictionaries
            processed_data = []
            for row in rows:
                if len(row) == len(headers):
                    row_dict = dict(zip(headers, row))
                    processed_data.append(row_dict)
            
            return processed_data
            
    except Exception as e:
        logger.error(f"Error fetching Census data for state FIPS {state_fips}: {e}")
        return []

def process_census_data(raw_data: List[Dict[str, Any]], state: str) -> List[Dict[str, Any]]:
    """Process raw Census data into standardized format."""
    
    if not raw_data:
        return []
    
    processed_data = []
    
    for row in raw_data:
        try:
            # Extract ZIP code (remove 'ZCTA5' prefix)
            zip_code_raw = row.get('zip code tabulation area', '')
            if not zip_code_raw or not zip_code_raw.startswith('ZCTA5'):
                continue
            
            zip_code = zip_code_raw.replace('ZCTA5', '')
            if len(zip_code) != 5:
                continue
            
            # Extract and parse values
            income_raw = row.get('B19013_001E', None)
            population_raw = row.get('B01003_001E', None)
            
            # Skip if no valid data
            if income_raw is None and population_raw is None:
                continue
            
            # Process income data
            if income_raw is not None and income_raw != '-666666666':
                try:
                    income = int(income_raw)
                    processed_data.append({
                        'zip_code': zip_code,
                        'state': state,
                        'metric_date': datetime.now(),
                        'metric_type': 'census_income',
                        'metric_value': float(income),
                        'metric_unit': 'USD',
                        'source': 'census_acs_2022'
                    })
                except (ValueError, TypeError):
                    logger.debug(f"Invalid income value for {zip_code}: {income_raw}")
            
            # Process population data
            if population_raw is not None and population_raw != '-666666666':
                try:
                    population = int(population_raw)
                    processed_data.append({
                        'zip_code': zip_code,
                        'state': state,
                        'metric_date': datetime.now(),
                        'metric_type': 'census_population',
                        'metric_value': float(population),
                        'metric_unit': 'people',
                        'source': 'census_acs_2022'
                    })
                except (ValueError, TypeError):
                    logger.debug(f"Invalid population value for {zip_code}: {population_raw}")
            
        except Exception as e:
            logger.debug(f"Error processing Census row for {row.get('zip code tabulation area', 'UNKNOWN')}: {e}")
            continue
    
    return processed_data

async def upsert_market_metrics(conn: asyncpg.Connection, metrics: List[Dict[str, Any]]) -> int:
    """Upsert market metrics data into the database."""
    
    if not metrics:
        return 0
    
    # Prepare the upsert query
    upsert_query = """
    INSERT INTO market_metrics (
        zip_code, state, metric_date, metric_type, metric_value, 
        metric_unit, source, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (zip_code, metric_date, metric_type) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        metric_unit = EXCLUDED.metric_unit,
        source = EXCLUDED.source,
        updated_at = CURRENT_TIMESTAMP
    """
    
    # Process and insert metrics
    inserted_count = 0
    for metric in metrics:
        try:
            # Insert into database
            await conn.execute(
                upsert_query,
                metric['zip_code'],
                metric['state'],
                metric['metric_date'],
                metric['metric_type'],
                metric['metric_value'],
                metric['metric_unit'],
                metric['source']
            )
            
            inserted_count += 1
            
        except Exception as e:
            logger.error(f"Error processing metric for {metric.get('zip_code', 'UNKNOWN')}: {e}")
            continue
    
    return inserted_count

async def main():
    """Main ingestion function."""
    logger.info("Starting Census ACS data ingestion...")
    
    # Check if we have a valid API key
    if CENSUS_API_KEY == "mock_key":
        logger.warning("Using mock Census API key. Set CENSUS_API_KEY environment variable for real data.")
        logger.info("Generating sample Census data for development...")
        await generate_sample_census_data()
        return
    
    # Create HTTP session
    async with aiohttp.ClientSession() as session:
        all_metrics = []
        
        # Fetch data for each state
        for state, fips in STATE_FIPS.items():
            logger.info(f"Processing {state} (FIPS: {fips})...")
            
            # Fetch raw Census data
            raw_data = await fetch_census_data(session, fips, list(CENSUS_VARIABLES.keys()))
            
            if raw_data:
                # Process the data
                processed_data = process_census_data(raw_data, state)
                all_metrics.extend(processed_data)
                
                logger.info(f"Processed {len(processed_data)} metrics for {state}")
            else:
                logger.warning(f"No data retrieved for {state}")
        
        if not all_metrics:
            logger.error("No Census data to process")
            return
        
        logger.info(f"Total metrics to process: {len(all_metrics)}")
        
        # Connect to database
        try:
            conn = await asyncpg.connect(DATABASE_URL)
            logger.info("Connected to database")
            
            # Upsert metrics
            inserted_count = await upsert_market_metrics(conn, all_metrics)
            logger.info(f"Successfully processed {inserted_count} Census metrics")
            
            # Close connection
            await conn.close()
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            return
    
    logger.info("Census ACS data ingestion completed")

async def generate_sample_census_data():
    """Generate sample Census data for development when no API key is available."""
    
    logger.info("Generating sample Census ACS data for development...")
    
    # Sample ZIP codes from our properties table
    sample_zips = [
        ('07302', 'NJ', 'Jersey City'),
        ('07102', 'NJ', 'Newark'),
        ('08540', 'NJ', 'Princeton'),
        ('07030', 'NJ', 'Hoboken'),
        ('07032', 'NJ', 'Union City'),
        ('19123', 'PA', 'Philadelphia'),
        ('19147', 'PA', 'Philadelphia'),
        ('19102', 'PA', 'Philadelphia'),
    ]
    
    sample_metrics = []
    
    for zip_code, state, city in sample_zips:
        # Generate realistic income data (NJ typically higher than PA)
        base_income = 85000 if state == 'NJ' else 72000
        income_variation = (hash(zip_code) % 20000) - 10000  # Deterministic variation
        income = max(50000, base_income + income_variation)
        
        # Generate realistic population data
        base_pop = 25000 if state == 'NJ' else 20000
        pop_variation = (hash(zip_code) % 10000) - 5000
        population = max(5000, base_pop + pop_variation)
        
        # Add income metric
        sample_metrics.append({
            'zip_code': zip_code,
            'state': state,
            'metric_date': datetime.now(),
            'metric_type': 'census_income',
            'metric_value': float(income),
            'metric_unit': 'USD',
            'source': 'census_acs_2022_sample'
        })
        
        # Add population metric
        sample_metrics.append({
            'zip_code': zip_code,
            'state': state,
            'metric_date': datetime.now(),
            'metric_type': 'census_population',
            'metric_value': float(population),
            'metric_unit': 'people',
            'source': 'census_acs_2022_sample'
        })
    
    # Connect to database and insert sample data
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        logger.info("Connected to database")
        
        # Upsert sample metrics
        inserted_count = await upsert_market_metrics(conn, sample_metrics)
        logger.info(f"Successfully inserted {inserted_count} sample Census metrics")
        
        # Close connection
        await conn.close()
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        return
    
    logger.info("Sample Census data generation completed")

if __name__ == "__main__":
    asyncio.run(main())
