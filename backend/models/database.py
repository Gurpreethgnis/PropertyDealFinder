"""
Database connection and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")

# Debug: Print the actual DATABASE_URL being used
print(f"🔍 Using DATABASE_URL: {DATABASE_URL}")

# Force localhost if it's trying to use "postgres" as host
if "postgres://" in DATABASE_URL or "postgresql://postgres@" in DATABASE_URL:
    print("⚠️ Detected 'postgres' host, forcing to localhost")
    DATABASE_URL = "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder"
    print(f"✅ Forced DATABASE_URL to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
