"""
News Ingestion Script (Sprint 3)
Pulls development/redevelopment news from various sources
"""

import asyncio
import asyncpg
import aiohttp
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/propertyfinder")

# News API configuration
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
GDELT_API_KEY = os.getenv("GDELT_API_KEY", "")

# Target locations and keywords for development news
TARGET_LOCATIONS = [
    "New Jersey", "Pennsylvania", "Philadelphia", "Newark", "Jersey City",
    "Princeton", "Hoboken", "Camden", "Cherry Hill", "King of Prussia"
]

DEVELOPMENT_KEYWORDS = [
    "rezoning", "transit", "stadium", "redevelopment", "Amazon", "warehouse",
    "development", "construction", "infrastructure", "mixed-use", "luxury",
    "affordable housing", "waterfront", "expansion", "revitalization"
]

async def get_database_connection():
    """Get database connection."""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        logger.info("Connected to database")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

async def fetch_news_from_newsapi(session: aiohttp.ClientSession, location: str, keywords: List[str]) -> List[Dict[str, Any]]:
    """
    Fetch news from NewsAPI (Option B - simpler approach).
    In production, you might use GDELT 2.0 API for more comprehensive coverage.
    """
    try:
        if not NEWS_API_KEY:
            logger.warning("No NewsAPI key provided, using mock data")
            return await generate_mock_news(location, keywords)
        
        # Build query
        query_terms = [location] + keywords[:5]  # Limit keywords to avoid overly complex queries
        query = " AND ".join(query_terms)
        
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "apiKey": NEWS_API_KEY,
            "language": "en",
            "sortBy": "relevancy",
            "pageSize": 50,
            "from": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        }
        
        async with session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()
                articles = data.get("articles", [])
                
                processed_articles = []
                for article in articles:
                    processed_article = {
                        "title": article.get("title", ""),
                        "source": article.get("source", {}).get("name", ""),
                        "url": article.get("url", ""),
                        "published_at": article.get("publishedAt", ""),
                        "content": article.get("content", ""),
                        "keywords": extract_keywords(article.get("title", "") + " " + article.get("content", ""), keywords)
                    }
                    processed_articles.append(processed_article)
                
                logger.info(f"Fetched {len(processed_articles)} articles for {location}")
                return processed_articles
            else:
                logger.warning(f"NewsAPI request failed with status {response.status}")
                return await generate_mock_news(location, keywords)
                
    except Exception as e:
        logger.error(f"Error fetching news from NewsAPI: {e}")
        return await generate_mock_news(location, keywords)

async def generate_mock_news(location: str, keywords: List[str]) -> List[Dict[str, Any]]:
    """Generate mock news data for development purposes."""
    mock_articles = []
    
    # Generate location-specific mock articles
    location_keywords = {
        "New Jersey": ["Jersey", "NJ", "Hudson", "Essex", "Mercer"],
        "Pennsylvania": ["Pennsylvania", "PA", "Philadelphia", "Delaware", "Montgomery"],
        "Philadelphia": ["Philadelphia", "Philly", "PA"],
        "Newark": ["Newark", "NJ", "Essex"],
        "Jersey City": ["Jersey City", "JC", "Hudson", "NJ"],
        "Princeton": ["Princeton", "NJ", "Mercer"],
        "Hoboken": ["Hoboken", "NJ", "Hudson"],
        "Camden": ["Camden", "NJ", "Camden County"],
        "Cherry Hill": ["Cherry Hill", "NJ", "Camden County"],
        "King of Prussia": ["King of Prussia", "KOP", "PA", "Montgomery"]
    }
    
    # Generate articles for each location
    for loc, loc_keywords in location_keywords.items():
        if location.lower() in loc.lower() or any(k.lower() in location.lower() for k in loc_keywords):
            for i in range(3):  # Generate 3 articles per location
                article = {
                    "title": f"Development Update in {loc}: {keywords[i % len(keywords)].title()} Project",
                    "source": f"{loc} News",
                    "url": f"https://example.com/{loc.lower().replace(' ', '-')}-news-{i+1}",
                    "published_at": (datetime.now() - timedelta(days=i+1)).isoformat(),
                    "content": f"Major {keywords[i % len(keywords)]} development planned for {loc} area.",
                    "keywords": [keywords[i % len(keywords)], loc]
                }
                mock_articles.append(article)
    
    return mock_articles

def extract_keywords(text: str, target_keywords: List[str]) -> List[str]:
    """Extract relevant keywords from text."""
    text_lower = text.lower()
    found_keywords = []
    
    for keyword in target_keywords:
        if keyword.lower() in text_lower:
            found_keywords.append(keyword)
    
    return found_keywords

def calculate_sentiment_score(title: str, content: str) -> float:
    """Calculate a simple sentiment score based on positive/negative words."""
    positive_words = ["approved", "expansion", "development", "growth", "investment", "luxury", "modern"]
    negative_words = ["rejected", "opposition", "controversy", "delay", "cancelled", "problem"]
    
    text = (title + " " + content).lower()
    
    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    
    if positive_count == 0 and negative_count == 0:
        return 0.0
    
    return (positive_count - negative_count) / (positive_count + negative_count)

def calculate_relevance_score(keywords: List[str], location_match: bool) -> int:
    """Calculate relevance score (1-5) based on keywords and location match."""
    score = 1
    
    # Base score for having keywords
    if keywords:
        score += min(len(keywords), 2)
    
    # Bonus for location match
    if location_match:
        score += 1
    
    # Bonus for development-related keywords
    dev_keywords = ["development", "redevelopment", "construction", "rezoning"]
    if any(k in keywords for k in dev_keywords):
        score += 1
    
    return min(score, 5)

async def upsert_news_article(conn: asyncpg.Connection, article: Dict[str, Any]):
    """Upsert news article into the database."""
    try:
        # Parse published date
        try:
            published_at = datetime.fromisoformat(article["published_at"].replace("Z", "+00:00"))
        except:
            published_at = datetime.now()
        
        # Calculate scores
        sentiment_score = calculate_sentiment_score(article["title"], article.get("content", ""))
        relevance_score = calculate_relevance_score(article.get("keywords", []), True)
        
        # Extract location info from title/content
        location_info = extract_location_info(article["title"] + " " + article.get("content", ""))
        
        query = """
        INSERT INTO news_articles (
            title, source, url, published_at, city, state, county, zip_code,
            keywords, sentiment_score, relevance_score, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (title, source) DO UPDATE SET
            url = EXCLUDED.url,
            published_at = EXCLUDED.published_at,
            keywords = EXCLUDED.keywords,
            sentiment_score = EXCLUDED.sentiment_score,
            relevance_score = EXCLUDED.relevance_score
        """
        
        await conn.execute(
            query,
            article["title"],
            article["source"],
            article["url"],
            published_at,
            location_info.get("city"),
            location_info.get("state"),
            location_info.get("county"),
            location_info.get("zip_code"),
            article.get("keywords", []),
            sentiment_score,
            relevance_score,
            datetime.now()
        )
        
        logger.info(f"Upserted news article: {article['title'][:50]}...")
        
    except Exception as e:
        logger.error(f"Error upserting news article: {e}")
        raise

def extract_location_info(text: str) -> Dict[str, Optional[str]]:
    """Extract city, state, county from text."""
    # Simple location extraction - in production you'd use more sophisticated NLP
    location_info = {
        "city": None,
        "state": None,
        "county": None,
        "zip_code": None
    }
    
    # Extract state
    if "NJ" in text or "New Jersey" in text:
        location_info["state"] = "NJ"
    elif "PA" in text or "Pennsylvania" in text:
        location_info["state"] = "PA"
    
    # Extract city (simplified)
    cities = ["Newark", "Jersey City", "Princeton", "Hoboken", "Camden", 
              "Cherry Hill", "King of Prussia", "Philadelphia", "Wayne", "Bryn Mawr"]
    
    for city in cities:
        if city in text:
            location_info["city"] = city
            break
    
    # Extract county (simplified)
    counties = ["Hudson", "Essex", "Mercer", "Camden", "Montgomery", "Delaware", "Philadelphia"]
    
    for county in counties:
        if county in text:
            location_info["county"] = county
            break
    
    return location_info

async def process_news_for_location(session: aiohttp.ClientSession, conn: asyncpg.Connection, location: str):
    """Process news for a specific location."""
    try:
        logger.info(f"Processing news for {location}")
        
        # Fetch news articles
        articles = await fetch_news_from_newsapi(session, location, DEVELOPMENT_KEYWORDS)
        
        if not articles:
            logger.warning(f"No articles found for {location}")
            return 0
        
        # Upsert articles
        processed_count = 0
        for article in articles:
            try:
                await upsert_news_article(conn, article)
                processed_count += 1
            except Exception as e:
                logger.error(f"Error processing article: {e}")
                continue
        
        logger.info(f"Processed {processed_count} articles for {location}")
        return processed_count
        
    except Exception as e:
        logger.error(f"Error processing news for {location}: {e}")
        return 0

async def main():
    """Main function to run news ingestion."""
    logger.info("Starting news ingestion")
    
    try:
        # Get database connection
        conn = await get_database_connection()
        
        # Create aiohttp session
        async with aiohttp.ClientSession() as session:
            total_processed = 0
            
            # Process news for each target location
            for location in TARGET_LOCATIONS:
                try:
                    processed = await process_news_for_location(session, conn, location)
                    total_processed += processed
                    
                    # Small delay between locations
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error processing location {location}: {e}")
                    continue
            
            # Get summary
            summary_query = """
            SELECT 
                COUNT(*) as total_articles,
                COUNT(CASE WHEN published_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_articles,
                AVG(sentiment_score) as avg_sentiment,
                AVG(relevance_score) as avg_relevance
            FROM news_articles
            """
            
            summary = await conn.fetchrow(summary_query)
            
            logger.info("News ingestion completed successfully")
            logger.info(f"Total articles processed: {total_processed}")
            logger.info(f"Total articles in database: {summary['total_articles']}")
            logger.info(f"Recent articles (7 days): {summary['recent_articles']}")
            logger.info(f"Average sentiment: {summary['avg_sentiment']:.2f}")
            logger.info(f"Average relevance: {summary['avg_relevance']:.2f}")
        
    except Exception as e:
        logger.error(f"News ingestion failed: {e}")
        raise
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
