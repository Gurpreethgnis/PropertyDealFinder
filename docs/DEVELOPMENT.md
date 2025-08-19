# 🛠️ PropertyFinder Development Guide

Complete guide for developers working on PropertyFinder.

## 🚀 **Getting Started**

### **Prerequisites**
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.8+ (for backend development)
- Git

### **Setup Development Environment**
```bash
# Clone repository
git clone https://github.com/Gurpreethgnis/PropertyDealFinder.git
cd PropertyDealFinder

# Copy environment template
cp env.template .env

# Start development services
docker-compose up -d

# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

## 🏗️ **Project Structure**

```
PropertyFinder/
├── 📁 backend/                 # FastAPI backend
│   ├── 📁 ingest/             # Data ingestion scripts
│   ├── 📄 main.py             # Main API application
│   ├── 📄 auth.py             # Authentication logic
│   ├── 📄 models.py           # Database models
│   └── 📄 requirements.txt    # Python dependencies
├── 📁 components/              # React components
│   ├── 📄 DealsTable.tsx      # Main deals display
│   ├── 📄 ProtectedRoute.tsx  # Authentication wrapper
│   └── 📄 Layout.tsx          # Page layout component
├── 📁 pages/                   # Next.js pages
│   ├── 📄 index.tsx           # Home page
│   ├── 📄 deals.tsx           # Deals dashboard
│   ├── 📄 login.tsx           # Login page
│   └── 📄 _app.tsx            # App wrapper
├── 📁 scripts/                 # Utility scripts
│   ├── 📄 deploy-custom-port.sh    # Production deployment
│   ├── 📄 start-tunnel.bat        # Argo Tunnel starter
│   └── 📄 start-propertyfinder.bat # Complete startup
├── 📁 data/                    # Data storage
├── 📁 types/                   # TypeScript definitions
├── 📄 docker-compose.yml       # Development environment
├── 📄 docker-compose.production.yml  # Production environment
├── 📄 nginx.production.conf    # Production Nginx config
└── 📄 cloudflared-tunnel.yml  # Argo Tunnel configuration
```

## 🔧 **Development Workflow**

### **1. Local Development**
```bash
# Start backend services
docker-compose up -d

# Start frontend (in new terminal)
npm run dev

# Access application
# Frontend: http://localhost:4000
# Backend: http://localhost:8000
# Database: localhost:5432
```

### **2. Database Development**
```bash
# Connect to database
docker exec -it propertyfinder_postgres_1 psql -U propertyfinder -d propertyfinder

# View tables
\dt

# Run migrations (if any)
# (Currently using init.sql for schema)
```

### **3. Backend Development**
```bash
# View backend logs
docker-compose logs -f api

# Restart backend
docker-compose restart api

# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:8000/api/deals
```

### **4. Frontend Development**
```bash
# Install new dependencies
npm install package-name

# Build for production
npm run build

# Test production build
npm start
```

## 🧪 **Testing**

### **Backend Testing**
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test API health
curl http://localhost:8000/api/health

# Test deals endpoint
curl http://localhost:8000/api/deals

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertyfinder.com","password":"admin123"}'
```

### **Frontend Testing**
```bash
# Run tests (if configured)
npm test

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npx eslint . --ext .ts,.tsx
```

## 🚀 **Deployment**

### **Development to Production**
```bash
# Deploy to production
./scripts/deploy-custom-port.sh

# Start Argo Tunnel
./scripts/start-tunnel.bat

# Verify deployment
curl https://properties.gursimanoor.com/health
```

### **Production Management**
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop services
docker-compose -f docker-compose.production.yml down
```

## 📊 **Data Development**

### **Adding New Data Sources**
1. **Create ingestion script** in `backend/ingest/`
2. **Add data model** in `backend/models.py`
3. **Update API endpoints** in `backend/main.py`
4. **Add frontend display** in components
5. **Test with mock data** first

### **Example: Adding Flood Risk Data**
```python
# backend/ingest/flood_risk.py
import requests
from backend.models import FloodRisk

def fetch_flood_risk_data():
    # FEMA API integration
    # Process and store data
    pass
```

## 🔐 **Authentication Development**

### **JWT Token Management**
- **Expiration**: 30 minutes
- **Refresh**: Not implemented (future enhancement)
- **Storage**: Local storage (consider httpOnly cookies)

### **Adding New Protected Routes**
```typescript
// In pages/new-feature.tsx
import ProtectedRoute from '../components/ProtectedRoute';

export default function NewFeature() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

## 🗺️ **Map Development (Future)**

### **Leaflet Integration**
```bash
# Install Leaflet
npm install leaflet react-leaflet

# Add types
npm install --save-dev @types/leaflet
```

### **Map Component Structure**
```typescript
// components/PropertyMap.tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export default function PropertyMap({ properties }) {
  return (
    <MapContainer center={[40.7128, -74.0060]} zoom={10}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {properties.map(prop => (
        <Marker key={prop.id} position={[prop.lat, prop.lng]} />
      ))}
    </MapContainer>
  );
}
```

## 🔧 **Configuration Management**

### **Environment Variables**
```bash
# Development (.env)
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development

# Production (auto-generated)
NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api
NODE_ENV=production
```

### **Docker Configuration**
- **Development**: `docker-compose.yml` (port 4000, 8000, 5432)
- **Production**: `docker-compose.production.yml` (port 8080, 8000, 5432)

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Port conflicts**: Check if ports 4000, 8000, 5432 are available
2. **Docker issues**: Restart Docker Desktop
3. **Database connection**: Check PostgreSQL container status
4. **Frontend build errors**: Clear node_modules and reinstall

### **Debug Commands**
```bash
# Check Docker status
docker ps

# Check container logs
docker-compose logs -f

# Check network
docker network ls

# Check volumes
docker volume ls
```

## 📝 **Code Standards**

### **TypeScript**
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type

### **React/Next.js**
- Use functional components with hooks
- Implement proper error boundaries
- Follow Next.js best practices

### **Python/FastAPI**
- Use type hints
- Follow PEP 8 style guide
- Implement proper error handling

## 🚀 **Next Steps**

### **Immediate (Next 2 weeks)**
1. **Map View**: Implement Leaflet integration
2. **Data Validation**: Add input validation
3. **Error Handling**: Improve error messages

### **Short Term (1-2 months)**
1. **News Integration**: Local development news
2. **Flood Risk**: FEMA data integration
3. **Advanced Analytics**: Trend analysis

### **Long Term (3-6 months)**
1. **MLS Integration**: Live listing data
2. **Machine Learning**: Deal scoring algorithms
3. **Mobile App**: React Native version

---

**Happy coding! 🏡✨**
