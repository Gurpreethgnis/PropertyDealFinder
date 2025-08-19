#!/usr/bin/env python3
"""
Run the scoring engine to populate deal_scores table
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from scoring.engine import score_all_deals
from dotenv import load_dotenv

async def main():
    """Main function to run scoring"""
    load_dotenv()
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ Error: DATABASE_URL environment variable not set")
        print("Please set DATABASE_URL in your .env file")
        return
    
    print("🚀 Starting Deal Scoring Engine...")
    print(f"📊 Database: {database_url.split('@')[1] if '@' in database_url else database_url}")
    
    try:
        # Run scoring
        result = await score_all_deals(database_url)
        
        if result['status'] == 'success':
            print(f"✅ Scoring completed successfully!")
            print(f"📈 Total deals scored: {result['total_deals_scored']}")
            print(f"🎯 Scenarios: {', '.join(result['scenarios'])}")
            print(f"💬 {result['message']}")
        else:
            print(f"❌ Scoring failed: {result['message']}")
            
    except Exception as e:
        print(f"❌ Error running scoring engine: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
