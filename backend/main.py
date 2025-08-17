from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from auth import authenticate_user, create_access_token, get_current_approved_user, User, Token
import datetime

# Load environment variables
load_dotenv()

app = FastAPI(title="PropertyFinder API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://propertyfinder:propertyfinder123@localhost:5432/propertyfinder")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class DealMetrics(BaseModel):
    zip_code: str
    city: str
    state: str
    rent_index: Optional[float] = None
    home_value_index: Optional[float] = None
    permit_count: int
    income: Optional[float] = None
    population: Optional[int] = None
    rent_growth: Optional[float] = None
    value_growth: Optional[float] = None

class DealsResponse(BaseModel):
    deals: List[DealMetrics]
    total: int
    state: Optional[str] = None

# Authentication endpoints
@app.post("/api/auth/login", response_model=Token)
async def login(user: User):
    """Authenticate user and return JWT token"""
    authenticated_user = authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = datetime.timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": authenticated_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_current_user_info(current_user = Depends(get_current_approved_user)):
    """Get current user information"""
    return {
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_approved": current_user.is_approved
    }

# Protected endpoints
@app.get("/api/deals", response_model=DealsResponse)
async def get_deals(
    state: Optional[str] = None,
    sort_by: str = "rent_growth",
    limit: int = 100,
    db = Depends(get_db),
    current_user = Depends(get_current_approved_user)  # Require authentication
):
    """
    Get ZIP-level metrics for investment analysis.
    Returns rent index, home value index, permit count, income, and population.
    """
    try:
        # Build the query
        query = """
        WITH zip_metrics AS (
            SELECT 
                p.zip_code,
                p.city,
                p.state,
                -- Latest rent index (ZORI)
                (SELECT mm.metric_value 
                 FROM market_metrics mm 
                 WHERE mm.zip_code = p.zip_code 
                 AND mm.metric_type = 'zillow_zori' 
                 ORDER BY mm.metric_date DESC 
                 LIMIT 1) as rent_index,
                -- Latest home value index (ZHVI)
                (SELECT mm.metric_value 
                 FROM market_metrics mm 
                 WHERE mm.zip_code = p.zip_code 
                 AND mm.metric_type = 'zillow_zhvi' 
                 ORDER BY mm.metric_date DESC 
                 LIMIT 1) as home_value_index,
                -- Permit count for past 12 months
                (SELECT COUNT(*) 
                 FROM permits perm 
                 WHERE perm.zip_code = p.zip_code 
                 AND perm.issue_date >= CURRENT_DATE - INTERVAL '12 months') as permit_count,
                -- Latest income data
                (SELECT mm.metric_value 
                 FROM market_metrics mm 
                 WHERE mm.zip_code = p.zip_code 
                 AND mm.metric_type = 'census_income' 
                 ORDER BY mm.metric_date DESC 
                 LIMIT 1) as income,
                -- Latest population data
                (SELECT mm.metric_value 
                 FROM market_metrics mm 
                 WHERE mm.zip_code = p.zip_code 
                 AND mm.metric_type = 'census_population' 
                 ORDER BY mm.metric_date DESC 
                 LIMIT 1) as population,
                -- Rent growth (12-month change)
                (SELECT 
                    CASE 
                        WHEN COUNT(*) >= 2 THEN
                            ((MAX(mm.metric_value) - MIN(mm.metric_value)) / MIN(mm.metric_value)) * 100
                        ELSE NULL
                    END
                 FROM market_metrics mm 
                 WHERE mm.zip_code = p.zip_code 
                 AND mm.metric_type = 'zillow_zori' 
                 AND mm.metric_date >= CURRENT_DATE - INTERVAL '12 months') as rent_growth,
                -- Value growth (12-month change)
                (SELECT 
                    CASE 
                        WHEN COUNT(*) >= 2 THEN
                            ((MAX(mm.metric_value) - MIN(mm.metric_value)) / MIN(mm.metric_value)) * 100
                        ELSE NULL
                    END
                 FROM market_metrics mm 
                 WHERE mm.zip_code = p.zip_code 
                 AND mm.metric_type = 'zillow_zhvi' 
                 AND mm.metric_date >= CURRENT_DATE - INTERVAL '12 months') as value_growth
            FROM properties p
            WHERE 1=1
        """
        
        params = {}
        if state:
            query += " AND p.state = :state"
            params['state'] = state.upper()
        
        query += """
        )
        SELECT * FROM zip_metrics
        """
        
        # Add sorting
        if sort_by == "rent_growth":
            query += " ORDER BY rent_growth DESC NULLS LAST"
        elif sort_by == "permit_count":
            query += " ORDER BY permit_count DESC"
        elif sort_by == "rent_index":
            query += " ORDER BY rent_index DESC NULLS LAST"
        elif sort_by == "value_growth":
            query += " ORDER BY value_growth DESC NULLS LAST"
        else:
            query += " ORDER BY rent_growth DESC NULLS LAST"
        
        query += " LIMIT :limit"
        params['limit'] = limit
        
        # Execute query
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        # Convert to Pydantic models
        deals = []
        for row in rows:
            deal = DealMetrics(
                zip_code=row.zip_code,
                city=row.city,
                state=row.state,
                rent_index=row.rent_index,
                home_value_index=row.home_value_index,
                permit_count=row.permit_count,
                income=row.income,
                population=row.population,
                rent_growth=row.rent_growth,
                value_growth=row.value_growth
            )
            deals.append(deal)
        
        return DealsResponse(
            deals=deals,
            total=len(deals),
            state=state
        )
        
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
