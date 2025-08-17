# 🏡 PropertyFinder - NJ/PA Real Estate Deal Finder

A comprehensive real estate investment dashboard that helps identify investment opportunities in New Jersey and Pennsylvania using public data sources.

## 🚀 **Live Demo**

**🌐 Production URL**: [https://properties.gursimanoor.com](https://properties.gursimanoor.com)

## ✨ **Features**

- **🔍 Deal Discovery**: Find high-potential investment areas
- **📊 Market Analytics**: Rent growth, property value trends, permit activity
- **🗺️ Geographic Insights**: ZIP-level market analysis
- **🔐 Secure Access**: JWT-based authentication system
- **📱 Responsive Design**: Works on desktop and mobile

## 🏗️ **Architecture**

- **Frontend**: Next.js 15 + React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL + PostGIS
- **Infrastructure**: Docker + Cloudflare Argo Tunnel
- **Authentication**: JWT tokens with secure routes

## 🚀 **Quick Start**

### **Prerequisites**
- Docker and Docker Compose
- Node.js 18+ and npm
- Cloudflare account (for production deployment)

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/Gurpreethgnis/PropertyDealFinder.git
cd PropertyDealFinder

# Start the development environment
docker-compose up -d

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev

# Access the application
# Frontend: http://localhost:4000
# Backend API: http://localhost:8000
```

### **Production Deployment**
```bash
# Deploy with custom ports
./deploy-custom-port.sh

# Start Argo Tunnel
./start-tunnel.bat
```

## 📁 **Project Structure**

```
PropertyFinder/
├── 📁 backend/                 # FastAPI backend
│   ├── 📁 ingest/             # Data ingestion scripts
│   ├── 📄 main.py             # Main API application
│   ├── 📄 auth.py             # Authentication logic
│   └── 📄 requirements.txt     # Python dependencies
├── 📁 components/              # React components
│   ├── 📄 DealsTable.tsx      # Main deals display
│   └── 📄 ProtectedRoute.tsx  # Authentication wrapper
├── 📁 pages/                   # Next.js pages
│   ├── 📄 index.tsx           # Home page
│   ├── 📄 deals.tsx           # Deals dashboard
│   └── 📄 login.tsx           # Login page
├── 📁 scripts/                 # Utility scripts
│   ├── 📄 deploy-custom-port.sh    # Production deployment
│   └── 📄 start-tunnel.bat        # Argo Tunnel starter
├── 📁 data/                    # Data storage
├── 📄 docker-compose.yml       # Development environment
├── 📄 docker-compose.production.yml  # Production environment
├── 📄 nginx.production.conf    # Production Nginx config
└── 📄 cloudflared-tunnel.yml  # Argo Tunnel configuration
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Frontend
NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api
NODE_ENV=production

# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/propertyfinder
JWT_SECRET=your-secret-key
```

### **Ports**
- **Frontend**: 4000 (dev), 8080 (prod)
- **Backend API**: 8000
- **Database**: 5432

## 📊 **Data Sources**

- **🏗️ NJ Construction Permits**: Public API for renovation activity
- **📈 Zillow Research**: ZIP-level rent and value indices
- **👥 Census ACS**: Income and population demographics
- **🗺️ PostGIS**: Geospatial analysis capabilities

## 🔐 **Authentication**

- **Login**: `admin@propertyfinder.com` / `admin123`
- **JWT tokens** with 30-minute expiration
- **Protected routes** for all dashboard pages

## 🚀 **Deployment**

### **Cloudflare Setup**
1. **DNS Record**: CNAME `properties` → `[TUNNEL_ID].cfargotunnel.com`
2. **SSL/TLS**: Full (strict) encryption mode
3. **Pages**: Frontend deployment with custom domain

### **Argo Tunnel**
- **Tunnel ID**: `766bafc4-59c3-40da-8c65-4a4d285f4c28`
- **Target**: `http://localhost:8080`
- **Domain**: `properties.gursimanoor.com`

## 🧪 **Testing**

```bash
# Test backend health
curl http://localhost:8080/health

# Test API endpoints
curl http://localhost:8080/api/health

# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertyfinder.com","password":"admin123"}'
```

## 🔧 **Management Commands**

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop all services
docker-compose -f docker-compose.production.yml down

# Update and redeploy
git pull origin master
./deploy-custom-port.sh
```

## 📈 **Roadmap**

### **Phase 1 (Current)**
- ✅ Core infrastructure and data ingestion
- ✅ Basic deals table and authentication
- ✅ Production deployment

### **Phase 2 (Next)**
- 🗺️ Interactive map view with heatmaps
- 📰 News sentiment analysis
- 🌊 Flood risk assessment
- 📊 Advanced analytics dashboard

### **Phase 3 (Future)**
- 🔗 MLS integration for live listings
- 🤖 Machine learning deal scoring
- 📱 Mobile app
- 🔔 Real-time notifications

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is proprietary software. All rights reserved.

## 📞 **Support**

For support or questions:
- **Email**: admin@propertyfinder.com
- **Documentation**: Check `CLOUDFLARE_DEPLOYMENT.md` for deployment help

---

**Built with ❤️ for real estate investors**
