"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DealMetrics(BaseModel):
    """Metrics for property deals in a specific area."""
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
    # Sprint 3 additions
    flood_flag: Optional[bool] = None
    news_count: Optional[int] = None
    # Sprint 4 additions
    s1_score: Optional[int] = None
    s2_score: Optional[int] = None
    s3_score: Optional[int] = None
    best_score: Optional[int] = None
    best_scenario: Optional[str] = None


class DealsResponse(BaseModel):
    """Response model for deals endpoint."""
    deals: List[DealMetrics]
    total: int
    state: Optional[str] = None

# Sprint 3: New models for flood risk and news
class FloodRisk(BaseModel):
    zip_code: str
    city: Optional[str] = None
    state: Optional[str] = None
    in_fema_special_flood_hazard_area: bool
    zone: Optional[str] = None
    risk_level: Optional[str] = None
    last_checked: Optional[datetime] = None

class NewsArticle(BaseModel):
    id: int
    title: str
    source: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    city: Optional[str] = None
    state: Optional[str] = None
    county: Optional[str] = None
    zip_code: Optional[str] = None
    keywords: Optional[List[str]] = None
    sentiment_score: Optional[float] = None
    relevance_score: Optional[int] = None

class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    total: int
    county: Optional[str] = None
    days: Optional[int] = None
