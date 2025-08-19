"""
News API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from models import NewsArticle, NewsResponse, get_db
from auth import get_current_approved_user

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("", response_model=NewsResponse)
async def get_news(
    county: Optional[str] = Query(None, description="County name to filter by"),
    days: int = Query(14, description="Number of days to look back", ge=1, le=365),
    limit: int = Query(50, description="Maximum number of articles to return", ge=1, le=250),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_approved_user)
):
    """Get news articles filtered by county and time period."""
    try:
        # Build the base query
        query = """
        SELECT 
            na.id,
            na.title,
            na.source,
            na.url,
            na.published_at,
            na.city,
            na.state,
            na.county,
            na.zip_code,
            na.keywords,
            na.sentiment_score,
            na.relevance_score
        FROM news_articles na
        WHERE na.published_at >= CURRENT_DATE - INTERVAL ':days days'
        """
        
        params = {"days": days}
        
        # Add county filter if specified
        if county:
            query += " AND LOWER(na.county) = LOWER(:county)"
            params["county"] = county
        
        # Add ordering and limit
        query += """
        ORDER BY na.relevance_score DESC, na.published_at DESC
        LIMIT :limit
        """
        params["limit"] = limit
        
        # Execute query
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        # Convert to response model
        articles = []
        for row in rows:
            article = NewsArticle(
                id=row.id,
                title=row.title,
                source=row.source,
                url=row.url,
                published_at=row.published_at,
                city=row.city,
                state=row.state,
                county=row.county,
                zip_code=row.zip_code,
                keywords=row.keywords,
                sentiment_score=float(row.sentiment_score) if row.sentiment_score else None,
                relevance_score=row.relevance_score
            )
            articles.append(article)
        
        return NewsResponse(
            articles=articles,
            total=len(articles),
            county=county,
            days=days
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/summary", response_model=dict)
async def get_news_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_approved_user)
):
    """Get a summary of news activity across different areas."""
    try:
        # Get news count by county for last 30 days
        query = """
        SELECT 
            na.county,
            na.state,
            COUNT(*) as article_count,
            AVG(na.sentiment_score) as avg_sentiment,
            AVG(na.relevance_score) as avg_relevance
        FROM news_articles na
        WHERE na.published_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY na.county, na.state
        ORDER BY article_count DESC
        LIMIT 20
        """
        
        result = db.execute(text(query))
        rows = result.fetchall()
        
        summary = {
            "counties": [
                {
                    "county": row.county,
                    "state": row.state,
                    "article_count": row.article_count,
                    "avg_sentiment": float(row.avg_sentiment) if row.avg_sentiment else 0,
                    "avg_relevance": float(row.avg_relevance) if row.avg_relevance else 0
                }
                for row in rows
            ],
            "total_articles": sum(row.article_count for row in rows),
            "period_days": 30
        }
        
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
