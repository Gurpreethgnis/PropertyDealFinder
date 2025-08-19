#!/usr/bin/env python3
"""
Zillow Research Indices Data Ingestion

Downloads and processes Zillow ZHVI (Home Value) and ZORI (Rent) data for NJ/PA ZIP codes.
"""

import asyncio
import aiohttp
import asyncpg
import pandas as pd
import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
import tempfile
import zipfile
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
ZILLOW_BASE_URL = "https://files.zillowstatic.com/research/public_csvs"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")

# Zillow data file URLs
ZHVI_URL = f"{ZILLOW_BASE_URL}/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
ZORI_URL = f"{ZILLOW_BASE_URL}/zori/Zip_zori_sm_month.csv"

# NJ and PA ZIP codes (we'll filter to these states)
NJ_PA_STATES = {'NJ', 'PA'}

async def download_zillow_data(session: aiohttp.ClientSession, url: str) -> pd.DataFrame:
    """Download Zillow CSV data and return as pandas DataFrame."""
    
    try:
        logger.info(f"Downloading data from: {url}")
        
        async with session.get(url) as response:
            if response.status != 200:
                logger.error(f"Failed to download {url}: {response.status}")
                return pd.DataFrame()
            
            # Read CSV content
            content = await response.text()
            df = pd.read_csv(io.StringIO(content))
            
            logger.info(f"Downloaded {len(df)} rows from {url}")
            return df
            
    except Exception as e:
        logger.error(f"Error downloading {url}: {e}")
        return pd.DataFrame()

def filter_nj_pa_data(df: pd.DataFrame, state_col: str = 'State') -> pd.DataFrame:
    """Filter DataFrame to only include NJ and PA data."""
    
    if state_col not in df.columns:
        logger.warning(f"State column '{state_col}' not found in data")
        return df
    
    filtered = df[df[state_col].isin(NJ_PA_STATES)]
    logger.info(f"Filtered to {len(filtered)} NJ/PA rows")
    return filtered

def process_zhvi_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Process ZHVI (Home Value) data into standardized format."""
    
    if df.empty:
        return []
    
    # Find the most recent date column (last column that looks like a date)
    date_columns = []
    for col in df.columns:
        if col.startswith('20') and len(col) == 7:  # Format: 2024-01
            date_columns.append(col)
    
    if not date_columns:
        logger.warning("No date columns found in ZHVI data")
        return []
    
    # Use the most recent date
    latest_date = max(date_columns)
    logger.info(f"Processing ZHVI data for date: {latest_date}")
    
    processed_data = []
    
    for _, row in df.iterrows():
        try:
            zip_code = str(row.get('RegionName', '')).zfill(5)
            state = row.get('State', '')
            metro = row.get('Metro', '')
            home_value = row.get(latest_date, None)
            
            if not zip_code or zip_code == '00000' or pd.isna(home_value):
                continue
            
            # Parse the date
            try:
                metric_date = datetime.strptime(latest_date, '%Y-%m')
            except ValueError:
                metric_date = datetime.now()
            
            processed_data.append({
                'zip_code': zip_code,
                'state': state,
                'metric_date': metric_date,
                'metric_type': 'zillow_zhvi',
                'metric_value': float(home_value),
                'metric_unit': 'USD',
                'source': 'zillow_research',
                'metadata': {
                    'metro': metro,
                    'data_date': latest_date
                }
            })
            
        except Exception as e:
            logger.debug(f"Error processing ZHVI row: {e}")
            continue
    
    return processed_data

def process_zori_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Process ZORI (Rent) data into standardized format."""
    
    if df.empty:
        return []
    
    # Find the most recent date column
    date_columns = []
    for col in df.columns:
        if col.startswith('20') and len(col) == 7:  # Format: 2024-01
            date_columns.append(col)
    
    if not date_columns:
        logger.warning("No date columns found in ZORI data")
        return []
    
    # Use the most recent date
    latest_date = max(date_columns)
    logger.info(f"Processing ZORI data for date: {latest_date}")
    
    processed_data = []
    
    for _, row in df.iterrows():
        try:
            zip_code = str(row.get('RegionName', '')).zfill(5)
            state = row.get('State', '')
            metro = row.get('Metro', '')
            rent_value = row.get(latest_date, None)
            
            if not zip_code or zip_code == '00000' or pd.isna(rent_value):
                continue
            
            # Parse the date
            try:
                metric_date = datetime.strptime(latest_date, '%Y-%m')
            except ValueError:
                metric_date = datetime.now()
            
            processed_data.append({
                'zip_code': zip_code,
                'state': state,
                'metric_date': metric_date,
                'metric_type': 'zillow_zori',
                'metric_value': float(rent_value),
                'metric_unit': 'USD',
                'source': 'zillow_research',
                'metadata': {
                    'metro': metro,
                    'data_date': latest_date
                }
            })
            
        except Exception as e:
            logger.debug(f"Error processing ZORI row: {e}")
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
    logger.info("Starting Zillow data ingestion...")
    
    # Create HTTP session
    async with aiohttp.ClientSession() as session:
        # Download ZHVI data
        logger.info("Downloading ZHVI (Home Value) data...")
        zhvi_df = await download_zillow_data(session, ZHVI_URL)
        
        # Download ZORI data
        logger.info("Downloading ZORI (Rent) data...")
        zori_df = await download_zillow_data(session, ZORI_URL)
        
        if zhvi_df.empty and zori_df.empty:
            logger.error("No Zillow data retrieved")
            return
        
        # Filter to NJ/PA data
        zhvi_nj_pa = filter_nj_pa_data(zhvi_df)
        zori_nj_pa = filter_nj_pa_data(zori_df)
        
        # Process data
        zhvi_metrics = process_zhvi_data(zhvi_nj_pa)
        zori_metrics = process_zori_data(zori_nj_pa)
        
        all_metrics = zhvi_metrics + zori_metrics
        
        if not all_metrics:
            logger.error("No valid metrics data to process")
            return
        
        logger.info(f"Processed {len(zhvi_metrics)} ZHVI metrics and {len(zori_metrics)} ZORI metrics")
        
        # Connect to database
        try:
            conn = await asyncpg.connect(DATABASE_URL)
            logger.info("Connected to database")
            
            # Upsert metrics
            inserted_count = await upsert_market_metrics(conn, all_metrics)
            logger.info(f"Successfully processed {inserted_count} market metrics")
            
            # Close connection
            await conn.close()
            
        except Exception as e:
            logger.error(f"Database error: {e}")
            return
    
    logger.info("Zillow data ingestion completed")

if __name__ == "__main__":
    asyncio.run(main())
