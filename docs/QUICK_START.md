# 🚀 PropertyFinder Quick Start

**Get PropertyFinder running in 5 minutes!**

## ⚡ **Super Quick Start**

### **1. Start Everything (Windows)**
```bash
# Double-click this file:
start-propertyfinder.bat
```

**That's it!** The script will:
- ✅ Start all Docker services
- ✅ Launch Argo Tunnel
- ✅ Open your browser to the app

## 🌐 **Access Your App**

- **🌍 Production**: https://properties.gursimanoor.com
- **🏠 Local**: http://localhost:8080
- **🔐 Login**: `admin@propertyfinder.com` / `admin123`

## 🔧 **Manual Start (if needed)**

### **Option 1: Production (Recommended)**
```bash
# Deploy backend
./scripts/deploy-custom-port.sh

# Start tunnel
./scripts/start-tunnel.bat
```

### **Option 2: Development**
```bash
# Start services
docker-compose up -d

# Start frontend
npm run dev
```

## 🚨 **Troubleshooting**

### **If nothing works:**
1. **Check Docker**: Is Docker Desktop running?
2. **Check ports**: Are 8080, 8000, 5432 free?
3. **Restart**: Run `docker-compose down` then restart

### **Quick fixes:**
```bash
# Restart everything
docker-compose -f docker-compose.production.yml down
./scripts/start-propertyfinder.bat

# Check status
docker-compose -f docker-compose.production.yml ps
```

## 📱 **What You'll See**

- **📊 Deals Table**: Investment opportunities ranked by score
- **🔍 Sorting**: By rent growth, permit activity, value trends
- **🗺️ Map View**: Geographic visualization (coming soon)
- **📈 Analytics**: Market trends and insights

## 🎯 **Next Steps**

1. **Explore the dashboard**
2. **Test the sorting features**
3. **Check out the deals table**
4. **Ready for Phase 2 development!**

---

**Need help? Check `DEPLOYMENT.md` or `DEVELOPMENT.md`** 📚
