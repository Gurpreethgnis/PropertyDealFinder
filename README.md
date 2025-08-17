# 🏡 NJ/PA Real Estate Deal Finder

A locally hosted dashboard that helps identify real estate investment opportunities in New Jersey and Pennsylvania by analyzing multiple data sources.

## 🎯 Phase 1 Features

- **Permits Data**: NJ & Philly renovation/construction permits
- **Market Indices**: Zillow Research ZIP-level rent & value trends
- **Demographics**: Census ACS income/population shifts
- **Risk Assessment**: FEMA flood risk data
- **News Analysis**: Local development and real estate news feeds
- **Investment Scoring**: Multi-scenario deal evaluation system

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Run specific features:**
   ```bash
   npm run feature -- <feature-name>
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
