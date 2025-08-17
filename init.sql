-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create properties table
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

-- Create permits table
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

-- Create market_metrics table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties(zip_code);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_geometry ON properties USING GIST(geometry);

CREATE INDEX IF NOT EXISTS idx_permits_zip ON permits(zip_code);
CREATE INDEX IF NOT EXISTS idx_permits_state ON permits(state);
CREATE INDEX IF NOT EXISTS idx_permits_date ON permits(issue_date);
CREATE INDEX IF NOT EXISTS idx_permits_geometry ON permits USING GIST(geometry);

CREATE INDEX IF NOT EXISTS idx_market_metrics_zip ON market_metrics(zip_code);
CREATE INDEX IF NOT EXISTS idx_market_metrics_state ON market_metrics(state);
CREATE INDEX IF NOT EXISTS idx_market_metrics_date ON market_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_market_metrics_type ON market_metrics(metric_type);

-- Insert some initial NJ/PA ZIP codes with coordinates
INSERT INTO properties (zip_code, city, state, county, geometry) VALUES
('07302', 'Jersey City', 'NJ', 'Hudson', ST_SetSRID(ST_MakePoint(-74.0431, 40.7178), 4326)),
('07102', 'Newark', 'NJ', 'Essex', ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)),
('08540', 'Princeton', 'NJ', 'Mercer', ST_SetSRID(ST_MakePoint(-74.6672, 40.3573), 4326)),
('19123', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1652, 39.9526), 4326)),
('19147', 'Philadelphia', 'PA', 'Philadelphia', ST_SetSRID(ST_MakePoint(-75.1600, 39.9300), 4326))
ON CONFLICT DO NOTHING;
