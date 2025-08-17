# 🏡 NJ/PA Real Estate Deal Finder

A locally hosted dashboard that helps identify real estate investment opportunities in New Jersey and Pennsylvania by analyzing multiple data sources.

## 🚀 Sprint 1 Status: COMPLETE ✅

**Port 4000** • **Docker Infrastructure** • **Real Data Integration**

### 🎯 Sprint 1 Features (COMPLETE)

- **✅ Core Stack**: Postgres + PostGIS, FastAPI, Next.js on port 4000
- **✅ Database Schema**: Properties, permits, market metrics with PostGIS
- **✅ Data Ingestion**: NJ permits, Zillow indices, Census ACS
- **✅ API Endpoint**: `/api/deals` with ZIP-level metrics
- **✅ Deals Table**: Sortable by rent growth, permit count, value growth

## 🚀 Quick Start (Sprint 1)

1. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

2. **Start the full stack:**
   ```bash
   docker-compose up
   ```

3. **Open the application:**
   - Frontend: http://localhost:4000/deals
   - API: http://localhost:8000
   - Database: localhost:5432

4. **Run data ingestion (optional):**
   ```bash
   python scripts/sprint1-setup.py
   ```

## 📁 Project Structure

```
PropertyFinder/
├── components/          # React components
├── pages/              # Next.js pages
├── lib/                # Utility functions & data sources
├── scripts/            # Feature scripts & automation
├── screenshots/        # UI screenshots for testing
├── data/               # Local data storage
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## 🔧 Feature Development

We work sprint by sprint, adding one piece at a time:

1. **Permits Ingest** → Pull NJ/Philly permit data
2. **Zillow Indices** → Market trend analysis
3. **Flood Risk Flag** → FEMA data integration
4. **News Pulse** → Local development news
5. **Investment Scoring** → Multi-scenario evaluation
6. **Dashboard UI** → Visual analytics interface

## 🎨 UI Components

- **Deals Table**: Ranked areas/properties with scores
- **Map View**: Heatmaps of rent growth, permit activity, news buzz
- **Underwrite Form**: Quick calculator (Cap Rate, DSCR, Flip spread)

## 📊 Data Sources

- Public permits databases
- Zillow Research APIs
- Census ACS data
- FEMA flood maps
- Local news feeds
- Property tax rolls

## 🚀 Deployment

This project is designed for local hosting initially, with future plans for cloud deployment once MLS integration is added in Phase 2.

## 📝 Development Notes

- Built with Next.js + React + TypeScript
- Uses Tailwind CSS for styling
- Leaflet for interactive maps
- Recharts for data visualization
- Feature-based development approach with Git version control
