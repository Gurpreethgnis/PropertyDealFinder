#!/usr/bin/env python3
"""
Master script to run all data ingestion jobs.
"""

import asyncio
import logging
from datetime import datetime

# Import ingestion modules
from nj_permits import main as nj_permits_main
from zillow_zip import main as zillow_main
from acs import main as acs_main
# Sprint 3 additions
from flood_nfhl import main as flood_risk_main
from news import main as news_main

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def run_all_ingestion():
    """Run all ingestion jobs sequentially."""
    start_time = datetime.now()
    logger.info("🚀 Starting comprehensive data ingestion pipeline")
    
    results = {}
    
    try:
        # Sprint 2: Core market data
        logger.info("📊 Phase 1: Core Market Data")
        
        logger.info("🏗️  Running NJ Permits ingestion...")
        try:
            await nj_permits_main()
            results["nj_permits"] = "✅ Success"
        except Exception as e:
            logger.error(f"❌ NJ Permits failed: {e}")
            results["nj_permits"] = f"❌ Failed: {str(e)}"
        
        logger.info("💰 Running Zillow Research Indices ingestion...")
        try:
            await zillow_main()
            results["zillow_indices"] = "✅ Success"
        except Exception as e:
            logger.error(f"❌ Zillow indices failed: {e}")
            results["zillow_indices"] = f"❌ Failed: {str(e)}"
        
        logger.info("👥 Running Census ACS data ingestion...")
        try:
            await acs_main()
            results["census_acs"] = "✅ Success"
        except Exception as e:
            logger.error(f"❌ Census ACS failed: {e}")
            results["census_acs"] = f"❌ Failed: {str(e)}"
        
        # Sprint 3: Risk & Buzz layers
        logger.info("🌊 Phase 2: Risk & Buzz Layers")
        
        logger.info("⚠️  Running Flood Risk (FEMA NFHL) ingestion...")
        try:
            await flood_risk_main()
            results["flood_risk"] = "✅ Success"
        except Exception as e:
            logger.error(f"❌ Flood risk failed: {e}")
            results["flood_risk"] = f"❌ Failed: {str(e)}"
        
        logger.info("📰 Running News Pulse ingestion...")
        try:
            await news_main()
            results["news_pulse"] = "✅ Success"
        except Exception as e:
            logger.error(f"❌ News pulse failed: {e}")
            results["news_pulse"] = f"❌ Failed: {str(e)}"
        
        # Calculate completion time
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Print summary
        logger.info("🎯 Ingestion Pipeline Complete!")
        logger.info("=" * 50)
        logger.info("📋 RESULTS SUMMARY:")
        
        for job, result in results.items():
            logger.info(f"  {job.replace('_', ' ').title()}: {result}")
        
        logger.info("=" * 50)
        logger.info(f"⏱️  Total Duration: {duration}")
        logger.info(f"🏁 Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Success rate
        success_count = sum(1 for result in results.values() if result.startswith("✅"))
        total_count = len(results)
        success_rate = (success_count / total_count) * 100
        
        logger.info(f"📊 Success Rate: {success_count}/{total_count} ({success_rate:.1f}%)")
        
        if success_rate >= 80:
            logger.info("🎉 Excellent! Most ingestion jobs completed successfully.")
        elif success_rate >= 60:
            logger.info("👍 Good! Majority of ingestion jobs completed successfully.")
        else:
            logger.warning("⚠️  Several ingestion jobs failed. Check logs for details.")
        
        return results
        
    except Exception as e:
        logger.error(f"💥 Fatal error in ingestion pipeline: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(run_all_ingestion())
    except KeyboardInterrupt:
        logger.info("🛑 Ingestion pipeline interrupted by user")
    except Exception as e:
        logger.error(f"💥 Ingestion pipeline failed: {e}")
        exit(1)
