#!/usr/bin/env python3
"""
Zillow ZIP-Level Indices Ingestion Job
Loads ZHVI (home value) and ZORI (rent) indices by ZIP into market_metrics table.
"""

import os
import sys
import requests
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

class ZillowZipIngest:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")
        self.engine = create_engine(self.database_url)
        self.zillow_api_key = os.getenv("ZILLOW_API_KEY")
        
        # Zillow Research API endpoints
        self.zhvi_url = "https://api.bridgedataoutput.com/api/v2/zestimates"
        self.zori_url = "https://api.bridgedataoutput.com/api/v2/rentals"
        
        # NJ/PA ZIP codes to fetch data for
        self.target_zips = [
            '07302', '07102', '08540',  # NJ
            '19123', '19147'            # PA
        ]
        
    def fetch_zillow_data(self, zip_codes, metric_type):
        """Fetch Zillow data for specified ZIP codes"""
        print(f"🔍 Fetching Zillow {metric_type} data for {len(zip_codes)} ZIP codes...")
        
        if not self.zillow_api_key:
            print("⚠️ No Zillow API key provided. Using mock data.")
            return self.generate_mock_data(zip_codes, metric_type)
        
        try:
            # For now, we'll use mock data since Zillow API requires special access
            # In production, this would make actual API calls
            print("ℹ️ Zillow API integration requires special access. Using mock data.")
            return self.generate_mock_data(zip_codes, metric_type)
            
        except Exception as e:
            print(f"❌ Error fetching Zillow data: {e}")
            return self.generate_mock_data(zip_codes, metric_type)
    
    def generate_mock_data(self, zip_codes, metric_type):
        """Generate realistic mock data for development"""
        print("🎭 Generating mock Zillow data...")
        
        mock_data = []
        base_date = datetime.now()
        
        for zip_code in zip_codes:
            # Generate 12 months of data for trend analysis
            for i in range(12):
                date = base_date - timedelta(days=30*i)
                
                if metric_type == 'zillow_zhvi':
                    # Home value index (realistic NJ/PA values)
                    base_value = 350000 if zip_code.startswith('07') else 280000  # NJ vs PA
                    trend_factor = 1 + (i * 0.02)  # 2% monthly growth
                    value = base_value * trend_factor
                    
                    mock_data.append({
                        'zip_code': zip_code,
                        'metric_date': date.strftime('%Y-%m-%d'),
                        'metric_type': 'zillow_zhvi',
                        'metric_value': round(value, 2),
                        'metric_unit': 'dollars',
                        'source': 'Zillow Research (Mock)'
                    })
                    
                elif metric_type == 'zillow_zori':
                    # Rent index (realistic NJ/PA values)
                    base_rent = 2800 if zip_code.startswith('07') else 2200  # NJ vs PA
                    trend_factor = 1 + (i * 0.015)  # 1.5% monthly growth
                    rent = base_rent * trend_factor
                    
                    mock_data.append({
                        'zip_code': zip_code,
                        'metric_date': date.strftime('%Y-%m-%d'),
                        'metric_type': 'zillow_zori',
                        'metric_value': round(rent, 2),
                        'metric_unit': 'dollars',
                        'source': 'Zillow Research (Mock)'
                    })
        
        print(f"✅ Generated {len(mock_data)} mock data points")
        return mock_data
    
    def load_to_database(self, data, metric_type):
        """Load Zillow data into the database"""
        print(f"💾 Loading {metric_type} data into database...")
        
        try:
            with self.engine.connect() as conn:
                # Clear existing data for this metric type
                delete_query = text("DELETE FROM market_metrics WHERE metric_type = :metric_type")
                conn.execute(delete_query, {'metric_type': metric_type})
                conn.commit()
                
                # Insert new data
                for record in data:
                    insert_query = text("""
                        INSERT INTO market_metrics (
                            zip_code, state, metric_date, metric_type, 
                            metric_value, metric_unit, source
                        ) VALUES (
                            :zip_code, 
                            (SELECT state FROM properties WHERE zip_code = :zip_code LIMIT 1),
                            :metric_date, :metric_type, :metric_value, :metric_unit, :source
                        )
                    """)
                    
                    conn.execute(insert_query, record)
                
                conn.commit()
                print(f"✅ Successfully loaded {len(data)} {metric_type} records into database")
                
        except Exception as e:
            print(f"❌ Error loading to database: {e}")
            raise
    
    def run(self):
        """Main execution method"""
        print("🚀 Starting Zillow ZIP-Level Indices Ingestion...")
        
        try:
            # Fetch and load ZHVI (home value) data
            zhvi_data = self.fetch_zillow_data(self.target_zips, 'zillow_zhvi')
            if zhvi_data:
                self.load_to_database(zhvi_data, 'zillow_zhvi')
            
            # Fetch and load ZORI (rent) data
            zori_data = self.fetch_zillow_data(self.target_zips, 'zillow_zori')
            if zori_data:
                self.load_to_database(zori_data, 'zillow_zori')
            
            print("🎉 Zillow ZIP-Level Indices ingestion completed successfully!")
            
        except Exception as e:
            print(f"💥 Zillow ZIP-Level Indices ingestion failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    ingester = ZillowZipIngest()
    ingester.run()
