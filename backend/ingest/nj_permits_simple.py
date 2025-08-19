#!/usr/bin/env python3
"""
NJ Permits Ingestion Job (Simplified - No Pandas)
Pulls construction permits from NJ Open Data (Socrata API) and loads into database.
"""

import os
import sys
import requests
import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

class NJPermitsIngestSimple:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")
        self.engine = create_engine(self.database_url)
        
        # NJ Open Data API endpoint for building permits
        self.api_url = "https://data.nj.gov/resource/w9se-dmra.json"
        
    def fetch_permits(self, limit=1000):
        """Fetch permits from NJ Open Data API"""
        print("🔍 Fetching NJ permit data...")
        
        try:
            # Calculate date range (last 12 months)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            params = {
                '$limit': limit,
                '$order': 'issue_date DESC',
                '$where': f"issue_date >= '{start_date.strftime('%Y-%m-%d')}'"
            }
            
            response = requests.get(self.api_url, params=params, timeout=30)
            response.raise_for_status()
            
            permits = response.json()
            print(f"✅ Fetched {len(permits)} NJ permits")
            return permits
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching NJ permits: {e}")
            return []
    
    def process_permits(self, permits):
        """Process and clean permit data"""
        print("🔄 Processing permit data...")
        
        processed = []
        for permit in permits:
            try:
                # Extract and clean data
                processed_permit = {
                    'permit_number': permit.get('permit_number', f"NJ-{datetime.now().strftime('%Y%m%d')}-{len(processed)}"),
                    'state': 'NJ',
                    'city': permit.get('municipality', 'Unknown'),
                    'zip_code': permit.get('zip_code', 'Unknown'),
                    'permit_type': permit.get('permit_type', 'Unknown'),
                    'issue_date': permit.get('issue_date'),
                    'estimated_value': float(permit.get('est_cost', 0)) if permit.get('est_cost') else 0,
                    'description': permit.get('description', ''),
                    'status': 'Active',
                    'source': 'NJ Open Data'
                }
                
                # Only include permits with valid ZIP codes
                if processed_permit['zip_code'] != 'Unknown' and len(processed_permit['zip_code']) == 5:
                    processed.append(processed_permit)
                    
            except Exception as e:
                print(f"⚠️ Error processing permit {permit.get('permit_number', 'unknown')}: {e}")
                continue
        
        print(f"✅ Processed {len(processed)} valid permits")
        return processed
    
    def load_to_database(self, permits):
        """Load permits into the database"""
        print("💾 Loading permits into database...")
        
        try:
            with self.engine.connect() as conn:
                # Clear existing permits from this source
                delete_query = text("DELETE FROM permits WHERE source = 'NJ Open Data'")
                conn.execute(delete_query)
                conn.commit()
                
                # Insert new permits
                for permit in permits:
                    insert_query = text("""
                        INSERT INTO permits (
                            permit_number, state, city, zip_code, permit_type,
                            issue_date, estimated_value, description, status, source
                        ) VALUES (
                            :permit_number, :state, :city, :zip_code, :permit_type,
                            :issue_date, :estimated_value, :description, :status, :source
                        )
                    """)
                    
                    conn.execute(insert_query, permit)
                
                conn.commit()
                print(f"✅ Successfully loaded {len(permits)} permits into database")
                
        except Exception as e:
            print(f"❌ Error loading to database: {e}")
            raise
    
    def run(self):
        """Run the complete ingestion process"""
        print("🚀 Starting NJ Permits Ingestion...")
        
        # Fetch permits
        permits = self.fetch_permits(limit=5000)
        if not permits:
            print("❌ No permits fetched. Exiting.")
            return
        
        # Process permits
        processed_permits = self.process_permits(permits)
        if not processed_permits:
            print("❌ No permits processed. Exiting.")
            return
        
        # Load to database
        self.load_to_database(processed_permits)
        
        print("🎉 NJ Permits Ingestion Complete!")

if __name__ == "__main__":
    ingest = NJPermitsIngestSimple()
    ingest.run()
