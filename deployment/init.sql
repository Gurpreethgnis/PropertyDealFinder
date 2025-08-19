-- =============================================================================
-- PropertyFinder Database Initialization Script
-- =============================================================================
-- This script sets up the database schema and initial data for the PropertyFinder
-- application. It creates tables for properties, permits, and market metrics.

-- Enable PostGIS extension for spatial data support
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- TABLE DEFINITIONS
-- =============================================================================

-- Properties table - stores geographic and administrative information
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    geometry GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permits table - stores building permit information
CREATE TABLE IF NOT EXISTS permits (
    id SERIAL PRIMARY KEY,
    permit_number VARCHAR(100) UNIQUE,
    state VARCHAR(2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    permit_type VARCHAR(100),
    issue_date DATE,
    estimated_value DECIMAL(15,2),
    description TEXT,
    status VARCHAR(50),
    source VARCHAR(100),
    geometry GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market metrics table - stores various market indicators
CREATE TABLE IF NOT EXISTS market_metrics (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL,
    state VARCHAR(2) NOT NULL,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'zillow_zhvi', 'zillow_zori', 'census_income', 'census_population'
    metric_value DECIMAL(15,2),
    metric_unit VARCHAR(20), -- 'dollars', 'percentage', 'count'
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(zip_code, metric_date, metric_type)
);

-- ========================================
-- SPRINT 3: FLOOD RISK & NEWS ARTICLES
-- ========================================

-- Flood Risk Table (FEMA NFHL data)
CREATE TABLE IF NOT EXISTS flood_risk (
    id SERIAL PRIMARY KEY,
    zip_code VARCHAR(10) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    in_fema_special_flood_hazard_area BOOLEAN DEFAULT FALSE,
    zone VARCHAR(10), -- FEMA flood zone (A, AE, X, etc.)
    risk_level VARCHAR(20), -- HIGH, MODERATE, LOW
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News Articles Table (development/redevelopment buzz)
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    source VARCHAR(200),
    url TEXT,
    published_at TIMESTAMP,
    city VARCHAR(100),
    state VARCHAR(2),
    county VARCHAR(100),
    zip_code VARCHAR(10),
    keywords TEXT[], -- Array of relevant keywords
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    relevance_score INTEGER DEFAULT 1, -- 1-5 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties(zip_code);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_geometry ON properties USING GIST(geometry);

-- Permits table indexes
CREATE INDEX IF NOT EXISTS idx_permits_zip ON permits(zip_code);
CREATE INDEX IF NOT EXISTS idx_permits_state ON permits(state);
CREATE INDEX IF NOT EXISTS idx_permits_date ON permits(issue_date);
CREATE INDEX IF NOT EXISTS idx_permits_geometry ON permits USING GIST(geometry);

-- Market metrics table indexes
CREATE INDEX IF NOT EXISTS idx_market_metrics_zip ON market_metrics(zip_code);
CREATE INDEX IF NOT EXISTS idx_market_metrics_state ON market_metrics(state);
CREATE INDEX IF NOT EXISTS idx_market_metrics_date ON market_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_market_metrics_type ON market_metrics(metric_type);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flood_risk_zip ON flood_risk(zip_code);
CREATE INDEX IF NOT EXISTS idx_flood_risk_state ON flood_risk(state);
CREATE INDEX IF NOT EXISTS idx_flood_risk_hazard ON flood_risk(in_fema_special_flood_hazard_area);

CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_location ON news_articles(city, state, county);
CREATE INDEX IF NOT EXISTS idx_news_articles_zip ON news_articles(zip_code);
CREATE INDEX IF NOT EXISTS idx_news_articles_keywords ON news_articles USING GIN(keywords);

-- =============================================================================
-- INITIAL DATA INSERTION
-- =============================================================================

-- Insert initial NJ/PA ZIP codes with coordinates
-- Note: Using representative coordinates for each city, not individual ZIP centroids
INSERT INTO properties (zip_code, city, state, county, geometry) VALUES
-- New Jersey ZIPs
('07302', 'Jersey City', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0431, 40.7178), 4326)),
('07102', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('08540', 'Princeton', 'NJ', 'Mercer', ST_SetSRID(ST_MakePoint(-74.6672, 40.3573), 4326)),
('07030', 'Hoboken', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0324, 40.7440), 4326)),
('07032', 'Union City', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0232, 40.7795), 4326)),
('07087', 'West New York', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0081, 40.7879), 4326)),
('07093', 'Weehawken', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0168, 40.7739), 4326)),
('07047', 'Kearny', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.1454, 40.7684), 4326)),
('07052', 'North Bergen', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0121, 40.8048), 4326)),
('07055', 'Nutley', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1599, 40.8223), 4326)),
('07086', 'Secaucus', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0557, 40.7895), 4326)),
('07088', 'Union', 'NJ', 'Union', ST_SetSRID(ST_MakePoint(-74.2632, 40.6595), 4326)),
('07090', 'Westfield', 'NJ', 'Union', ST_SetSRID(ST_MakePoint(-74.3474, 40.6589), 4326)),
('07092', 'West Orange', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.2393, 40.7987), 4326)),
('07094', 'Whippany', 'NJ', 'Morris', ST_SetSRID(ST_MakePoint(-74.5754, 40.8223), 4326)),
('07095', 'Woodbridge', 'NJ', 'Middlesex', ST_SetSRID(ST_MakePoint(-74.2846, 40.5605), 4326)),
('07103', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07104', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07105', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07106', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07107', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07108', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07109', 'Belleville', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1501, 40.7937), 4326)),
('07110', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07111', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07112', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('07114', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),

-- Pennsylvania ZIPs
('19123', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19147', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1600, 39.9300), 4326)),
('19102', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19103', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19104', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19106', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19107', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19109', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19111', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19112', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19114', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19115', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19116', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19118', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19119', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19120', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19121', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19122', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19124', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19125', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326))
ON CONFLICT DO NOTHING;

-- Sample flood risk data (mock data for development)
INSERT INTO flood_risk (zip_code, city, state, in_fema_special_flood_hazard_area, zone, risk_level) VALUES
('07302', 'Jersey City', 'NJ', TRUE, 'AE', 'HIGH'),
('07302', 'Jersey City', 'NJ', FALSE, 'X', 'LOW'),
('08540', 'Princeton', 'NJ', FALSE, 'X', 'LOW'),
('08540', 'Princeton', 'NJ', TRUE, 'A', 'HIGH'),
('19102', 'Philadelphia', 'PA', TRUE, 'AE', 'HIGH'),
('19102', 'Philadelphia', 'PA', FALSE, 'X', 'LOW'),
('19147', 'Philadelphia', 'PA', TRUE, 'A', 'HIGH'),
('19147', 'Philadelphia', 'PA', FALSE, 'X', 'LOW'),
('07030', 'Hoboken', 'NJ', TRUE, 'AE', 'HIGH'),
('07030', 'Hoboken', 'NJ', FALSE, 'X', 'LOW'),
('07087', 'Union City', 'NJ', FALSE, 'X', 'LOW'),
('07087', 'Union City', 'NJ', TRUE, 'A', 'HIGH'),
('08002', 'Cherry Hill', 'NJ', FALSE, 'X', 'LOW'),
('08002', 'Cherry Hill', 'NJ', TRUE, 'AE', 'HIGH'),
('19020', 'Bryn Mawr', 'PA', FALSE, 'X', 'LOW'),
('19020', 'Bryn Mawr', 'PA', TRUE, 'A', 'HIGH'),
('19087', 'Wayne', 'PA', FALSE, 'X', 'LOW'),
('19087', 'Wayne', 'PA', TRUE, 'A', 'HIGH'),
('19406', 'King of Prussia', 'PA', FALSE, 'X', 'LOW'),
('19406', 'King of Prussia', 'PA', TRUE, 'A', 'HIGH');

-- Sample news articles (mock data for development)
INSERT INTO news_articles (title, source, url, published_at, city, state, county, zip_code, keywords, sentiment_score, relevance_score) VALUES
('Major Transit Hub Planned for Newark Penn Station Area', 'NJ.com', 'https://example.com/transit-hub', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Newark', 'NJ', 'Essex', '07102', ARRAY['transit', 'redevelopment', 'infrastructure'], 0.8, 5),
('Amazon Warehouse Expansion in Philadelphia Port Area', 'Philly.com', 'https://example.com/amazon-warehouse', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Philadelphia', 'PA', 'Philadelphia', '19148', ARRAY['amazon', 'warehouse', 'logistics'], 0.6, 4),
('Jersey City Waterfront Redevelopment Project Approved', 'Hudson Reporter', 'https://example.com/jc-waterfront', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Jersey City', 'NJ', 'Hudson', '07302', ARRAY['waterfront', 'redevelopment', 'luxury'], 0.9, 5),
('New Stadium Complex Proposed for Camden Waterfront', 'Courier Post', 'https://example.com/camden-stadium', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Camden', 'NJ', 'Camden', '08102', ARRAY['stadium', 'entertainment', 'waterfront'], 0.7, 4),
('Princeton University Expansion Plans Revealed', 'Princeton Packet', 'https://example.com/princeton-expansion', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Princeton', 'NJ', 'Mercer', '08540', ARRAY['university', 'expansion', 'education'], 0.5, 3),
('Hoboken Transit-Oriented Development Breaks Ground', 'Hoboken Patch', 'https://example.com/hoboken-tod', CURRENT_TIMESTAMP - INTERVAL '6 days', 'Hoboken', 'NJ', 'Hudson', '07030', ARRAY['transit', 'development', 'mixed-use'], 0.8, 4),
('Cherry Hill Mall Redevelopment Gets Green Light', 'South Jersey Times', 'https://example.com/cherry-hill-mall', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Cherry Hill', 'NJ', 'Camden', '08002', ARRAY['mall', 'redevelopment', 'retail'], 0.6, 3),
('King of Prussia Mall Expansion Announced', 'Main Line Today', 'https://example.com/kop-expansion', CURRENT_TIMESTAMP - INTERVAL '8 days', 'King of Prussia', 'PA', 'Montgomery', '19406', ARRAY['mall', 'expansion', 'retail'], 0.7, 4),
('Wayne Business District Revitalization Plan', 'Main Line Media News', 'https://example.com/wayne-revitalization', CURRENT_TIMESTAMP - INTERVAL '9 days', 'Wayne', 'PA', 'Delaware', '19087', ARRAY['revitalization', 'business', 'downtown'], 0.8, 3),
('Bryn Mawr College Campus Expansion', 'Main Line Today', 'https://example.com/bryn-mawr-expansion', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Bryn Mawr', 'PA', 'Delaware', '19020', ARRAY['college', 'expansion', 'education'], 0.6, 3),
('Union City Affordable Housing Initiative', 'Hudson Reporter', 'https://example.com/union-city-housing', CURRENT_TIMESTAMP - INTERVAL '11 days', 'Union City', 'NJ', 'Hudson', '07087', ARRAY['affordable housing', 'development', 'community'], 0.9, 4),
('Philadelphia Navy Yard Tech Hub Expansion', 'Technical.ly', 'https://example.com/navy-yard-tech', CURRENT_TIMESTAMP - INTERVAL '12 days', 'Philadelphia', 'PA', 'Philadelphia', '19112', ARRAY['tech', 'innovation', 'navy yard'], 0.8, 5),
('Newark Airport Area Logistics Development', 'NJBIZ', 'https://example.com/newark-logistics', CURRENT_TIMESTAMP - INTERVAL '13 days', 'Newark', 'NJ', 'Essex', '07114', ARRAY['logistics', 'airport', 'development'], 0.7, 4),
('Camden Waterfront Park Redevelopment', 'Courier Post', 'https://example.com/camden-park', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Camden', 'NJ', 'Camden', '08103', ARRAY['park', 'waterfront', 'recreation'], 0.8, 3);

-- =============================================================================
-- SCRIPT COMPLETION
-- =============================================================================
-- Database initialization complete.
-- The PropertyFinder application is now ready to use.
