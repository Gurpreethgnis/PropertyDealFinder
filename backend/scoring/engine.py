"""
Deal Scoring Engine for Sprint 4
Implements S1, S2, S3 scoring scenarios
"""

import json
from typing import Dict, Any, List
from datetime import datetime
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

class DealScoringEngine:
    """Scoring engine for real estate deals based on different scenarios"""
    
    def __init__(self):
        self.scenario_weights = {
            'S1': {  # Conservative - Focus on stability and proven markets
                'permit_count': 0.25,
                'rent_growth': 0.20,
                'value_growth': 0.20,
                'news_count': 0.15,
                'flood_flag': 0.10,
                'income': 0.10
            },
            'S2': {  # Balanced - Mix of growth and stability
                'permit_count': 0.20,
                'rent_growth': 0.25,
                'value_growth': 0.25,
                'news_count': 0.20,
                'flood_flag': 0.05,
                'income': 0.05
            },
            'S3': {  # Aggressive - Focus on high growth potential
                'permit_count': 0.15,
                'rent_growth': 0.30,
                'value_growth': 0.30,
                'news_count': 0.25,
                'flood_flag': 0.00,
                'income': 0.00
            }
        }
    
    def calculate_score(self, metrics: Dict[str, Any], scenario: str) -> int:
        """
        Calculate score (0-100) for a deal based on scenario and metrics
        
        Args:
            metrics: Dictionary containing deal metrics
            scenario: 'S1', 'S2', or 'S3'
        
        Returns:
            Integer score from 0-100
        """
        if scenario not in self.scenario_weights:
            raise ValueError(f"Invalid scenario: {scenario}")
        
        weights = self.scenario_weights[scenario]
        total_score = 0
        
        # Score each metric based on weights
        for metric, weight in weights.items():
            if metric in metrics:
                metric_score = self._score_metric(metric, metrics[metric], scenario)
                total_score += metric_score * weight
        
        # Ensure score is between 0-100
        return max(0, min(100, int(total_score)))
    
    def _score_metric(self, metric: str, value: Any, scenario: str) -> float:
        """Score individual metric based on scenario requirements"""
        
        if value is None:
            return 0
        
        if metric == 'permit_count':
            return self._score_permits(value, scenario)
        elif metric == 'rent_growth':
            return self._score_rent_growth(value, scenario)
        elif metric == 'value_growth':
            return self._score_value_growth(value, scenario)
        elif metric == 'news_count':
            return self._score_news_count(value, scenario)
        elif metric == 'flood_flag':
            return self._score_flood_flag(value, scenario)
        elif metric == 'income':
            return self._score_income(value, scenario)
        else:
            return 0
    
    def _score_permits(self, count: int, scenario: str) -> float:
        """Score permit count (higher is better)"""
        if scenario == 'S1':  # Conservative - prefer moderate activity
            if count >= 50: return 100
            elif count >= 30: return 80
            elif count >= 20: return 60
            elif count >= 10: return 40
            else: return 20
        elif scenario == 'S2':  # Balanced
            if count >= 60: return 100
            elif count >= 40: return 80
            elif count >= 25: return 60
            elif count >= 15: return 40
            else: return 20
        else:  # S3 - Aggressive - prefer high activity
            if count >= 80: return 100
            elif count >= 50: return 80
            elif count >= 30: return 60
            elif count >= 15: return 40
            else: return 20
    
    def _score_rent_growth(self, growth: float, scenario: str) -> float:
        """Score rent growth (higher is better)"""
        if scenario == 'S1':  # Conservative - prefer stable growth
            if growth >= 8: return 100
            elif growth >= 6: return 80
            elif growth >= 4: return 60
            elif growth >= 2: return 40
            else: return 20
        elif scenario == 'S2':  # Balanced
            if growth >= 10: return 100
            elif growth >= 7: return 80
            elif growth >= 5: return 60
            elif growth >= 3: return 40
            else: return 20
        else:  # S3 - Aggressive - prefer high growth
            if growth >= 15: return 100
            elif growth >= 10: return 80
            elif growth >= 7: return 60
            elif growth >= 4: return 40
            else: return 20
    
    def _score_value_growth(self, growth: float, scenario: str) -> float:
        """Score value growth (higher is better)"""
        if scenario == 'S1':  # Conservative - prefer stable growth
            if growth >= 10: return 100
            elif growth >= 7: return 80
            elif growth >= 5: return 60
            elif growth >= 3: return 40
            else: return 20
        elif scenario == 'S2':  # Balanced
            if growth >= 12: return 100
            elif growth >= 9: return 80
            elif growth >= 6: return 60
            elif growth >= 4: return 40
            else: return 20
        else:  # S3 - Aggressive - prefer high growth
            if growth >= 18: return 100
            elif growth >= 12: return 80
            elif growth >= 8: return 60
            elif growth >= 5: return 40
            else: return 20
    
    def _score_news_count(self, count: int, scenario: str) -> float:
        """Score news count (higher is better)"""
        if scenario == 'S1':  # Conservative - prefer moderate buzz
            if count >= 20: return 100
            elif count >= 15: return 80
            elif count >= 10: return 60
            elif count >= 5: return 40
            else: return 20
        elif scenario == 'S2':  # Balanced
            if count >= 25: return 100
            elif count >= 18: return 80
            elif count >= 12: return 60
            elif count >= 6: return 40
            else: return 20
        else:  # S3 - Aggressive - prefer high buzz
            if count >= 30: return 100
            elif count >= 20: return 80
            elif count >= 15: return 60
            elif count >= 8: return 40
            else: return 20
    
    def _score_flood_flag(self, flag: bool, scenario: str) -> float:
        """Score flood risk (false is better)"""
        if scenario == 'S1':  # Conservative - heavily penalize flood risk
            return 0 if flag else 100
        elif scenario == 'S2':  # Balanced - moderately penalize flood risk
            return 20 if flag else 100
        else:  # S3 - Aggressive - ignore flood risk
            return 100
    
    def _score_income(self, income: int, scenario: str) -> float:
        """Score income (higher is better)"""
        if scenario == 'S1':  # Conservative - prefer higher income areas
            if income >= 80000: return 100
            elif income >= 60000: return 80
            elif income >= 45000: return 60
            elif income >= 35000: return 40
            else: return 20
        elif scenario == 'S2':  # Balanced
            if income >= 70000: return 100
            elif income >= 55000: return 80
            elif income >= 40000: return 60
            elif income >= 30000: return 40
            else: return 20
        else:  # S3 - Aggressive - ignore income
            return 100

async def score_all_deals(database_url: str) -> Dict[str, Any]:
    """
    Score all deals in the database for all scenarios
    
    Args:
        database_url: PostgreSQL connection string
    
    Returns:
        Dictionary with scoring results summary
    """
    engine = DealScoringEngine()
    
    try:
        # Connect to database
        conn = await asyncpg.connect(database_url)
        
        # Get all deals with metrics
        query = """
        SELECT DISTINCT 
            p.zip_code,
            p.city,
            p.state,
            COALESCE(mm.rent_index, 0) as rent_index,
            COALESCE(mm.home_value_index, 0) as home_value_index,
            COALESCE(permit_counts.count, 0) as permit_count,
            COALESCE(mm.income, 0) as income,
            COALESCE(mm.population, 0) as population,
            COALESCE(mm.rent_growth, 0) as rent_growth,
            COALESCE(mm.value_growth, 0) as value_growth,
            COALESCE(flood_risk.in_fema_special_flood_hazard_area, false) as flood_flag,
            COALESCE(news_counts.count, 0) as news_count
        FROM permits p
        LEFT JOIN market_metrics mm ON p.zip_code = mm.geo_id
        LEFT JOIN (
            SELECT zip_code, COUNT(*) as count
            FROM permits 
            WHERE issue_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY zip_code
        ) permit_counts ON p.zip_code = permit_counts.zip_code
        LEFT JOIN (
            SELECT zip_code, COUNT(*) as count
            FROM news_articles 
            WHERE published_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY zip_code
        ) news_counts ON p.zip_code = news_counts.zip_code
        LEFT JOIN flood_risk ON p.zip_code = flood_risk.zip_code
        WHERE p.zip_code IS NOT NULL
        """
        
        rows = await conn.fetch(query)
        
        # Score each deal for all scenarios
        scored_deals = []
        for row in rows:
            metrics = {
                'permit_count': row['permit_count'],
                'rent_growth': row['rent_growth'],
                'value_growth': row['value_growth'],
                'news_count': row['news_count'],
                'flood_flag': row['flood_flag'],
                'income': row['income']
            }
            
            # Score for each scenario
            for scenario in ['S1', 'S2', 'S3']:
                score = engine.calculate_score(metrics, scenario)
                
                scored_deals.append({
                    'zip_code': row['zip_code'],
                    'city': row['city'],
                    'state': row['state'],
                    'scenario': scenario,
                    'score': score,
                    'metrics': metrics
                })
        
        # Upsert scores into database
        await _upsert_scores(conn, scored_deals)
        
        await conn.close()
        
        return {
            'status': 'success',
            'total_deals_scored': len(scored_deals),
            'scenarios': ['S1', 'S2', 'S3'],
            'message': f'Successfully scored {len(scored_deals)} deals for all scenarios'
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Error scoring deals: {str(e)}'
        }

async def _upsert_scores(conn: asyncpg.Connection, scored_deals: List[Dict[str, Any]]):
    """Upsert scored deals into the deal_scores table"""
    
    # Clear existing scores
    await conn.execute("DELETE FROM deal_scores")
    
    # Insert new scores
    for deal in scored_deals:
        await conn.execute("""
            INSERT INTO deal_scores (zip_code, city, state, scenario, score, metrics)
            VALUES ($1, $2, $3, $4, $5, $6)
        """, 
        deal['zip_code'], 
        deal['city'], 
        deal['state'], 
        deal['scenario'], 
        deal['score'], 
        json.dumps(deal['metrics'])
        )

if __name__ == "__main__":
    import asyncio
    
    async def main():
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("Error: DATABASE_URL environment variable not set")
            return
        
        result = await score_all_deals(database_url)
        print(json.dumps(result, indent=2))
    
    asyncio.run(main())
