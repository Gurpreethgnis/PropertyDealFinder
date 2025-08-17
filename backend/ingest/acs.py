#!/usr/bin/env python3
"""
Census ACS Ingestion Job
Fetches Census ACS (income, population) data and stores in market_metrics table.
"""

import os
import sys
import requests
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

class CensusACSIngest:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")
        self.engine = create_engine(self.database_url)
        self.census_api_key = os.getenv("CENSUS_API_KEY")
        
        # Census API base URL
        self.census_base_url = "https://api.census.gov/data/2022/acs/acs5"
        
        # NJ/PA ZIP codes to fetch data for
        self.target_zips = [
            '07302', '07102', '08540',  # NJ
            '19123', '19147'            # PA
        ]
        
        # Census variables we want to fetch
        self.variables = {
            'B19013_001E': 'median_household_income',  # Median household income
            'B01003_001E': 'total_population'          # Total population
        }
        
    def fetch_census_data(self, zip_codes):
        """Fetch Census ACS data for specified ZIP codes"""
        print(f"🔍 Fetching Census ACS data for {len(zip_codes)} ZIP codes...")
        
        if not self.census_api_key:
            print("⚠️ No Census API key provided. Using mock data.")
            return self.generate_mock_data(zip_codes)
        
        try:
            # For now, we'll use mock data since Census API requires special handling
            # In production, this would make actual API calls to the Census Bureau
            print("ℹ️ Census API integration requires special handling. Using mock data.")
            return self.generate_mock_data(zip_codes)
            
        except Exception as e:
            print(f"❌ Error fetching Census data: {e}")
            return self.generate_mock_data(zip_codes)
    
    def generate_mock_data(self, zip_codes):
        """Generate realistic mock Census data for development"""
        print("🎭 Generating mock Census ACS data...")
        
        mock_data = []
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        for zip_code in zip_codes:
            # Generate realistic income and population data based on ZIP code
            if zip_code.startswith('07'):  # NJ
                base_income = 85000 if zip_code == '07302' else 65000  # Jersey City vs Newark
                base_population = 45000 if zip_code == '07302' else 280000  # Jersey City vs Newark
            else:  # PA
                base_income = 72000 if zip_code == '19123' else 68000  # Northern Liberties vs South Philly
                base_population = 12000 if zip_code == '19123' else 35000  # Northern Liberties vs South Philly
            
            # Add some variation
            income_variation = 1 + (hash(zip_code) % 20 - 10) / 100  # ±10% variation
            population_variation = 1 + (hash(zip_code) % 15 - 7) / 100  # ±7% variation
            
            income = round(base_income * income_variation, 0)
            population = round(base_population * population_variation, 0)
            
            # Income data
            mock_data.append({
                'zip_code': zip_code,
                'metric_date': current_date,
                'metric_type': 'census_income',
                'metric_value': income,
                'metric_unit': 'dollars',
                'source': 'Census ACS (Mock)'
            })
            
            # Population data
            mock_data.append({
                'zip_code': zip_code,
                'metric_date': current_date,
                'metric_type': 'census_population',
                'metric_value': population,
                'metric_unit': 'count',
                'source': 'Census ACS (Mock)'
            })
        
        print(f"✅ Generated {len(mock_data)} mock Census data points")
        return mock_data
    
    def load_to_database(self, data):
        """Load Census data into the database"""
        print("💾 Loading Census ACS data into database...")
        
        try:
            with self.engine.connect() as conn:
                # Clear existing Census data
                delete_query = text("DELETE FROM market_metrics WHERE source LIKE 'Census ACS%'")
                conn.execute(delete_query)
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
                print(f"✅ Successfully loaded {len(data)} Census ACS records into database")
                
        except Exception as e:
            print(f"❌ Error loading to database: {e}")
            raise
    
    def run(self):
        """Main execution method"""
        print("🚀 Starting Census ACS Ingestion...")
        
        try:
            # Fetch Census data
            census_data = self.fetch_census_data(self.target_zips)
            if not census_data:
                print("⚠️ No Census data to process. Exiting.")
                return
            
            # Load to database
            self.load_to_database(census_data)
            
            print("🎉 Census ACS ingestion completed successfully!")
            
        except Exception as e:
            print(f"💥 Census ACS ingestion failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    ingester = CensusACSIngest()
    ingester.run()
