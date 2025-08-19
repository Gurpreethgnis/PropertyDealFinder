# 🏡 PropertyFinder - NJ/PA Real Estate Deal Finder

A comprehensive real estate investment analysis platform that helps identify and score investment opportunities in New Jersey and Pennsylvania.

## 🚀 Features

### **Sprint 4 - Deal Scoring + Underwriting** ✅
- **S1, S2, S3 Scenario Scoring**: Conservative, Balanced, and Aggressive investment strategies
- **Underwriting Calculator**: NOI, Cap Rate, DSCR, Cash on Cash Return calculations
- **Risk Assessment**: Automated risk level identification with guardrail highlights

### **Sprint 3 - Risk & Buzz Layers** ✅
- **Flood Risk Analysis**: FEMA NFHL integration for flood hazard identification
- **News Pulse Feed**: Development/redevelopment buzz tracking
- **Interactive Map View**: Geographic visualization with Leaflet

### **Sprint 2 - Real Data Integration** ✅
- **NJ Construction Permits**: Socrata API integration
- **Zillow Research Indices**: ZHVI and ZORI data
- **Census ACS Data**: Income and population demographics

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL)
- **FastAPI**: Modern Python web framework
- **PostgreSQL + PostGIS**: Spatial database with real estate data
- **SQLAlchemy**: ORM for database operations
- **JWT Authentication**: Secure user management

### Frontend (Next.js + React)
- **Next.js 15**: React framework with SSR
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Leaflet**: Interactive maps

## 📁 Project Structure

```
PropertyFinder/
├── backend/                 # FastAPI backend
│   ├── api/                # API endpoints
│   │   ├── auth.py         # Authentication
│   │   ├── deals.py        # Deals & scoring
│   │   ├── news.py         # News pulse
│   │   └── underwrite.py   # Financial calculator
│   ├── models/             # Data models
│   ├── scoring/            # Scoring engine
│   ├── ingest/             # Data ingestion scripts
│   └── data/               # Database schemas
├── frontend/               # Next.js frontend
│   ├── components/         # React components
│   ├── pages/              # Next.js pages
│   └── styles/             # CSS styles
├── deployment/             # Docker & deployment configs
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 13+

### 1. Clone & Setup
```bash
git clone <repository-url>
cd PropertyFinder
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Database Setup
```bash
cd deployment
docker-compose -f docker-compose.local.yml up -d postgres
```

### 4. Environment Configuration
Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/propertyfinder_postgres_local
CENSUS_API_KEY=your_census_api_key
NEWS_API_KEY=your_news_api_key
```

### 5. Initialize Database
```bash
cd backend
python -c "from data.init_db import init_database; init_database()"
```

### 6. Run Data Ingestion
```bash
cd backend
python run_all_ingestion.py
```

### 7. Run Scoring Engine
```bash
cd backend
python run_scoring.py
```

### 8. Start Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### 9. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Deals & Scoring
- `GET /api/deals` - Get scored deals with filters
- `GET /api/deals?scenario=s1&min_score=70` - Filter by scenario and score

### Underwriting
- `POST /api/underwrite` - Calculate financial metrics

### News
- `GET /api/news` - Get news articles by county
- `GET /api/news/summary` - News activity summary

## 📊 Scoring Scenarios

### **S1 - Conservative Strategy**
- Focus: Stability and proven markets
- Weights: Permits (25%), Rent Growth (20%), Value Growth (20%), News (15%), Flood Risk (10%), Income (10%)

### **S2 - Balanced Strategy**
- Focus: Mix of growth and stability
- Weights: Permits (20%), Rent Growth (25%), Value Growth (25%), News (20%), Flood Risk (5%), Income (5%)

### **S3 - Aggressive Strategy**
- Focus: High growth potential
- Weights: Permits (15%), Rent Growth (30%), Value Growth (30%), News (25%), Flood Risk (0%), Income (0%)

## 🗺️ Map Features

- **ZIP Choropleth**: Visualize permits, rent growth, and flood risk
- **News Bubbles**: Overlay development buzz
- **Interactive Selection**: Click ZIP codes for detailed metrics

## 💰 Underwriting Calculator

### Inputs
- Purchase price, rehab costs, monthly rent
- Taxes, insurance, utilities, maintenance
- Property management fees, vacancy rates
- Loan terms, flip sale price

### Outputs
- NOI (Net Operating Income)
- Cap Rate
- DSCR (Debt Service Coverage Ratio)
- Cash on Cash Return
- Flip profit/ROI/margin
- Risk assessment with guardrails

## 🔧 Development

### Running Tests
```bash
cd backend
pytest
```

### Code Formatting
```bash
cd backend
black .
isort .
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend && uvicorn main:app --reload --port 8080

# Frontend
cd frontend && npm run dev

# Database
cd deployment && docker-compose -f docker-compose.local.yml up -d
```

### Production
```bash
cd deployment
./deploy-backend.sh
./deploy-frontend.sh
```

## 📈 Data Sources

- **NJ Construction Permits**: [Socrata API](https://data.nj.gov/resource/w9se-dmra.json)
- **Zillow Research**: [ZHVI](https://files.zillowstatic.com/research/public_csvs/zhvi/) & [ZORI](https://files.zillowstatic.com/research/public_csvs/zori/)
- **Census ACS**: [5-Year Estimates](https://api.census.gov/data/2022/acs/acs5)
- **FEMA NFHL**: [National Flood Hazard Layer](https://hazards.fema.gov/nfhl)
- **News APIs**: NewsAPI, GDELT 2.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or issues:
1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

**Built with ❤️ for real estate investors**
