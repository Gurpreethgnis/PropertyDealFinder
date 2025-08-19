#!/usr/bin/env python3
"""
NJ Permits Ingestion Job (Mock Data)
Generates realistic mock permit data for demonstration.
"""

import os
import sys
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

class NJPermitsIngestMock:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")
        self.engine = create_engine(self.database_url)
        
        # NJ cities and ZIP codes for realistic data
        self.nj_locations = [
            ('Jersey City', '07302'), ('Newark', '07102'), ('Princeton', '08540'),
            ('Hoboken', '07030'), ('Union City', '07032'), ('West New York', '07087'),
            ('Weehawken', '07093'), ('Kearny', '07047'), ('North Bergen', '07052'),
            ('Nutley', '07055'), ('Secaucus', '07086'), ('Union', '07088'),
            ('Westfield', '07090'), ('West Orange', '07092'), ('Whippany', '07094'),
            ('Woodbridge', '07095'), ('Belleville', '07109')
        ]
        
        # Common permit types
        self.permit_types = [
            'Building Permit', 'Electrical Permit', 'Plumbing Permit', 'HVAC Permit',
            'Roofing Permit', 'Demolition Permit', 'Renovation Permit', 'Addition Permit',
            'Foundation Permit', 'Interior Remodeling Permit'
        ]
        
    def generate_mock_permits(self, count=5000):
        """Generate realistic mock permit data"""
        print(f"🎭 Generating {count} mock NJ permits...")
        
        permits = []
        base_date = datetime.now()
        
        for i in range(count):
            # Random location
            city, zip_code = random.choice(self.nj_locations)
            
            # Random date within last 12 months
            days_ago = random.randint(0, 365)
            issue_date = base_date - timedelta(days=days_ago)
            
            # Random permit type
            permit_type = random.choice(self.permit_types)
            
            # Realistic estimated value based on permit type
            if 'Building' in permit_type or 'Addition' in permit_type:
                estimated_value = random.randint(50000, 500000)
            elif 'Renovation' in permit_type or 'Remodeling' in permit_type:
                estimated_value = random.randint(15000, 100000)
            elif 'Electrical' in permit_type or 'Plumbing' in permit_type:
                estimated_value = random.randint(5000, 25000)
            else:
                estimated_value = random.randint(1000, 50000)
            
            permit = {
                'permit_number': f"NJ-{issue_date.strftime('%Y%m%d')}-{i:04d}",
                'state': 'NJ',
                'city': city,
                'zip_code': zip_code,
                'permit_type': permit_type,
                'issue_date': issue_date.strftime('%Y-%m-%d'),
                'estimated_value': estimated_value,
                'description': f"{permit_type} for property in {city}",
                'status': 'Active',
                'source': 'NJ Open Data (Mock)'
            }
            
            permits.append(permit)
        
        print(f"✅ Generated {len(permits)} mock permits")
        return permits
    
    def load_to_database(self, permits):
        """Load permits into the database"""
        print("💾 Loading permits into database...")
        
        try:
            with self.engine.connect() as conn:
                # Clear existing permits from this source
                delete_query = text("DELETE FROM permits WHERE source = 'NJ Open Data (Mock)'")
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
        print("🚀 Starting NJ Permits Ingestion (Mock)...")
        
        # Generate mock permits
        permits = self.generate_mock_permits(count=5000)
        if not permits:
            print("❌ No permits generated. Exiting.")
            return
        
        # Load to database
        self.load_to_database(permits)
        
        print("🎉 NJ Permits Ingestion Complete!")

if __name__ == "__main__":
    ingest = NJPermitsIngestMock()
    ingest.run()
