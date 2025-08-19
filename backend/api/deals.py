"""
Deals API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from models import DealMetrics, DealsResponse, get_db
from auth import get_current_approved_user

router = APIRouter(prefix="/api/deals", tags=["deals"])


@router.get("", response_model=DealsResponse)
async def get_deals(
    state: Optional[str] = None,
    scenario: Optional[str] = None,
    min_score: Optional[int] = None,
    sort_by: str = "score",
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_approved_user)
):
    """Get property deals with metrics."""
    try:
        # Build the base query with Sprint 3 additions
        query = """
        WITH zip_metrics AS (
            SELECT 
                p.zip_code,
                p.city,
                p.state,
                COUNT(perm.id) as permit_count,
                AVG(mm_rent.metric_value) as rent_index,
                AVG(mm_home.metric_value) as home_value_index,
                AVG(mm_income.metric_value) as income,
                AVG(mm_pop.metric_value) as population,
                -- Sprint 3: Flood risk flag
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM flood_risk fr 
                        WHERE fr.zip_code = p.zip_code 
                        AND fr.in_fema_special_flood_hazard_area = true
                    ) THEN true 
                    ELSE false 
                END as flood_flag,
                -- Sprint 3: News count (last 30 days)
                COALESCE((
                    SELECT COUNT(*) 
                    FROM news_articles na 
                    WHERE na.zip_code = p.zip_code 
                    AND na.published_at >= CURRENT_DATE - INTERVAL '30 days'
                ), 0) as news_count
            FROM properties p
            LEFT JOIN permits perm ON p.zip_code = perm.zip_code
            LEFT JOIN market_metrics mm_rent ON p.zip_code = mm_rent.zip_code 
                AND mm_rent.metric_type = 'zillow_zori'
            LEFT JOIN market_metrics mm_home ON p.zip_code = mm_rent.zip_code 
                AND mm_home.metric_type = 'zillow_zhvi'
            LEFT JOIN market_metrics mm_income ON p.zip_code = mm_rent.zip_code 
                AND mm_income.metric_type = 'census_income'
            LEFT JOIN market_metrics mm_pop ON p.zip_code = mm_rent.zip_code 
                AND mm_pop.metric_type = 'census_population'
        """
        
        if state:
            query += f" WHERE p.state = '{state}'"
        
        # Add scenario filtering
        if scenario and scenario.upper() in ['S1', 'S2', 'S3']:
            query += f" AND EXISTS (SELECT 1 FROM deal_scores ds WHERE ds.zip_code = p.zip_code AND ds.scenario = '{scenario.upper()}')"
        
        query += """
            GROUP BY p.zip_code, p.city, p.state
        ),
        growth_metrics AS (
            SELECT 
                zip_code,
                rent_index,
                home_value_index,
                LAG(rent_index) OVER (PARTITION BY zip_code ORDER BY zip_code) as prev_rent,
                LAG(home_value_index) OVER (PARTITION BY zip_code ORDER BY zip_code) as prev_home
            FROM zip_metrics
        )
        SELECT 
            zm.zip_code,
            zm.city,
            zm.state,
            zm.permit_count,
            zm.rent_index,
            zm.home_value_index,
            zm.income,
            zm.population,
            zm.flood_flag,
            zm.news_count,
            CASE 
                WHEN gm.prev_rent > 0 THEN ((zm.rent_index - gm.prev_rent) / gm.prev_rent) * 100
                ELSE NULL 
            END as rent_growth,
            CASE 
                WHEN gm.prev_home > 0 THEN ((zm.home_value_index - gm.prev_home) / gm.prev_home) * 100
                ELSE NULL 
            END as value_growth
        FROM zip_metrics zm
        LEFT JOIN growth_metrics gm ON zm.zip_code = gm.zip_code
        """
        
        # Add sorting
        if sort_by == "score":
            if scenario and scenario.upper() in ['S1', 'S2', 'S3']:
                query += f" ORDER BY (SELECT score FROM deal_scores ds WHERE ds.zip_code = zm.zip_code AND ds.scenario = '{scenario.upper()}') DESC NULLS LAST"
            else:
                query += " ORDER BY GREATEST(COALESCE((SELECT score FROM deal_scores ds WHERE ds.zip_code = zm.zip_code AND ds.scenario = 'S1'), 0), COALESCE((SELECT score FROM deal_scores ds WHERE ds.zip_code = zm.zip_code AND ds.scenario = 'S2'), 0), COALESCE((SELECT score FROM deal_scores ds WHERE ds.zip_code = zm.zip_code AND ds.scenario = 'S3'), 0)) DESC"
        elif sort_by == "rent_growth":
            query += " ORDER BY rent_growth DESC NULLS LAST"
        elif sort_by == "value_growth":
            query += " ORDER BY value_growth DESC NULLS LAST"
        elif sort_by == "permit_count":
            query += " ORDER BY permit_count DESC"
        elif sort_by == "income":
            query += " ORDER BY income DESC NULLS LAST"
        elif sort_by == "news_count":
            query += " ORDER BY news_count DESC NULLS LAST"
        elif sort_by == "flood_flag":
            query += " ORDER BY flood_flag DESC NULLS LAST"
        else:
            query += " ORDER BY rent_growth DESC NULLS LAST"
        
        # Add limit
        query += f" LIMIT {limit}"
        
        # Execute query
        result = db.execute(text(query))
        rows = result.fetchall()
        
        # Apply min_score filter if specified
        if min_score is not None:
            filtered_rows = []
            for row in rows:
                # Get the best score for this ZIP code
                best_score = 0
                if scenario and scenario.upper() in ['S1', 'S2', 'S3']:
                    # Get score for specific scenario
                    score_query = text("""
                        SELECT score FROM deal_scores 
                        WHERE zip_code = :zip_code AND scenario = :scenario
                    """)
                    score_result = db.execute(score_query, {"zip_code": row.zip_code, "scenario": scenario.upper()})
                    score_row = score_result.fetchone()
                    if score_row and score_row.score >= min_score:
                        filtered_rows.append(row)
                else:
                    # Get best score across all scenarios
                    score_query = text("""
                        SELECT MAX(score) as best_score FROM deal_scores 
                        WHERE zip_code = :zip_code
                    """)
                    score_result = db.execute(score_query, {"zip_code": row.zip_code})
                    score_row = score_result.fetchone()
                    if score_row and score_row.best_score >= min_score:
                        filtered_rows.append(row)
            
            rows = filtered_rows
        
        # Convert to response model
        deals = []
        for row in rows:
            # Convert Decimal values to proper types
            def safe_convert(value, target_type):
                if value is None:
                    return None
                try:
                    if target_type == int:
                        return int(float(value))
                    elif target_type == float:
                        return float(value)
                    else:
                        return value
                except (ValueError, TypeError):
                    return None
            
            # Get scoring data for this ZIP code
            s1_score = None
            s2_score = None
            s3_score = None
            best_score = None
            best_scenario = None
            
            if scenario and scenario.upper() in ['S1', 'S2', 'S3']:
                # Get score for specific scenario
                score_query = text("""
                    SELECT score FROM deal_scores 
                    WHERE zip_code = :zip_code AND scenario = :scenario
                """)
                score_result = db.execute(score_query, {"zip_code": row.zip_code, "scenario": scenario.upper()})
                score_row = score_result.fetchone()
                if score_row:
                    best_score = score_row.score
                    best_scenario = scenario.upper()
            else:
                # Get scores for all scenarios
                score_query = text("""
                    SELECT scenario, score FROM deal_scores 
                    WHERE zip_code = :zip_code
                    ORDER BY score DESC
                """)
                score_result = db.execute(score_query, {"zip_code": row.zip_code})
                score_rows = score_result.fetchall()
                
                for score_row in score_rows:
                    if score_row.scenario == 'S1':
                        s1_score = score_row.score
                    elif score_row.scenario == 'S2':
                        s2_score = score_row.score
                    elif score_row.scenario == 'S3':
                        s3_score = score_row.score
                
                if score_rows:
                    best_score = score_rows[0].score
                    best_scenario = score_rows[0].scenario
            
            deal = DealMetrics(
                zip_code=row.zip_code,
                city=row.city,
                state=row.state,
                permit_count=safe_convert(row.permit_count, int),
                rent_index=safe_convert(row.rent_index, float),
                home_value_index=safe_convert(row.home_value_index, float),
                income=safe_convert(row.income, float),
                population=safe_convert(row.population, int),
                rent_growth=safe_convert(row.rent_growth, float),
                value_growth=safe_convert(row.value_growth, float),
                # Sprint 3 additions
                flood_flag=row.flood_flag,
                news_count=safe_convert(row.news_count, int),
                # Sprint 4 additions
                s1_score=s1_score,
                s2_score=s2_score,
                s3_score=s3_score,
                best_score=best_score,
                best_scenario=best_scenario
            )
            deals.append(deal)
        
        return DealsResponse(
            deals=deals,
            total=len(deals),
            state=state
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
