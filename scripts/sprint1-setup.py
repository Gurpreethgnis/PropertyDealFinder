#!/usr/bin/env python3
"""
Sprint 1 Setup Script
Runs all data ingestion jobs to populate the database with initial data.
"""

import os
import sys
import time
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.append(str(backend_path))

def run_ingestion_job(module_name, class_name):
    """Run a specific ingestion job"""
    print(f"\n🚀 Running {module_name}...")
    try:
        # Import and run the ingestion job
        module = __import__(f"ingest.{module_name}", fromlist=[class_name])
        job_class = getattr(module, class_name)
        job = job_class()
        job.run()
        print(f"✅ {module_name} completed successfully!")
        return True
    except Exception as e:
        print(f"❌ {module_name} failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🏗️ PropertyFinder Sprint 1 Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('docker-compose.yml'):
        print("❌ Error: docker-compose.yml not found. Please run this script from the project root.")
        sys.exit(1)
    
    print("\n📋 This script will:")
    print("1. Run NJ Permits ingestion")
    print("2. Run Zillow ZIP-level indices ingestion")
    print("3. Run Census ACS ingestion")
    print("4. Verify database population")
    
    # Wait for user confirmation
    input("\nPress Enter to continue or Ctrl+C to cancel...")
    
    # Run ingestion jobs
    jobs = [
        ("nj_permits", "NJPermitsIngest"),
        ("zillow_zip", "ZillowZipIngest"),
        ("acs", "CensusACSIngest")
    ]
    
    successful_jobs = 0
    total_jobs = len(jobs)
    
    for module_name, class_name in jobs:
        if run_ingestion_job(module_name, class_name):
            successful_jobs += 1
        time.sleep(1)  # Brief pause between jobs
    
    # Summary
    print(f"\n📊 Setup Summary:")
    print(f"✅ Successful: {successful_jobs}/{total_jobs}")
    print(f"❌ Failed: {total_jobs - successful_jobs}/{total_jobs}")
    
    if successful_jobs == total_jobs:
        print("\n🎉 All ingestion jobs completed successfully!")
        print("\n🚀 Next steps:")
        print("1. Start the services: docker-compose up")
        print("2. Open http://localhost:4000/deals in your browser")
        print("3. Verify the deals table shows populated data")
    else:
        print(f"\n⚠️ {total_jobs - successful_jobs} job(s) failed. Check the logs above.")
        print("You may need to:")
        print("- Check database connection")
        print("- Verify API keys are set")
        print("- Check network connectivity")
    
    print(f"\n📁 Data files created in: {backend_path}/data/")
    print("🔍 Check the logs above for any specific error messages.")

if __name__ == "__main__":
    main()
