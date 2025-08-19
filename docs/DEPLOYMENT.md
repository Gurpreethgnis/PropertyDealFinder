# 🚀 PropertyFinder Deployment Guide

Complete guide to deploy PropertyFinder to production using Cloudflare and Argo Tunnels.

## 🎯 **Deployment Overview**

This guide will help you deploy PropertyFinder to `properties.gursimanoor.com` with:
- **Backend API**: FastAPI + PostgreSQL running on custom ports
- **Frontend**: Next.js app deployed to Cloudflare Pages
- **Infrastructure**: Argo Tunnel for secure, private access
- **SSL/TLS**: Automatic HTTPS via Cloudflare

## 🔧 **Prerequisites**

1. **Cloudflare Account** with `gursimanoor.com` domain
2. **Docker** installed and running
3. **Node.js 18+** and npm
4. **Git** repository access

## 🐳 **Step 1: Deploy Backend to Production**

### **1.1 Run Production Deployment Script**

```bash
# Make script executable
chmod +x deploy-custom-port.sh

# Deploy backend with custom ports
./deploy-custom-port.sh
```

This script will:
- ✅ Generate secure passwords automatically
- ✅ Deploy PostgreSQL, FastAPI, and Nginx
- ✅ Configure services on custom ports (8080, 8000, 5432)
- ✅ Build frontend for Cloudflare Pages
- ✅ Push code to GitHub

### **1.2 Verify Backend is Running**

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/health
```

## 🌐 **Step 2: Configure Cloudflare DNS**

### **2.1 DNS Record Setup**

In Cloudflare Dashboard > DNS, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | properties | `766bafc4-59c3-40da-8c65-4a4d285f4c28.cfargotunnel.com` | ✅ Proxied |

**Note**: The DNS record is automatically created when you set up the Argo Tunnel.

### **2.2 SSL/TLS Settings**

1. Go to **SSL/TLS** > **Overview**
2. Set **Encryption mode** to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **HSTS** (recommended)

## 🚇 **Step 3: Set Up Argo Tunnel**

### **3.1 Start the Tunnel**

```bash
# Windows
start start-tunnel.bat

# Or manually:
cloudflared tunnel run --config cloudflared-tunnel.yml propertyfinder
```

### **3.2 Verify Tunnel Connection**

```bash
# Check tunnel status
cloudflared tunnel list

# View tunnel info
cloudflared tunnel info 766bafc4-59c3-40da-8c65-4a4d285f4c28
```

## 📱 **Step 4: Deploy Frontend to Cloudflare Pages**

### **4.1 Create Pages Project**

1. Go to **Cloudflare Dashboard** > **Pages**
2. **Create a new project**
3. **Connect your GitHub repository**: `Gurpreethgnis/PropertyDealFinder`

### **4.2 Configure Build Settings**

- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/` (leave empty)

### **4.3 Set Environment Variables**

- `NODE_ENV`: `production`
- `NEXT_PUBLIC_API_URL`: `https://properties.gursimanoor.com/api`

### **4.4 Add Custom Domain**

1. In your Pages project, go to **Custom domains**
2. Add `properties.gursimanoor.com`
3. Cloudflare will automatically configure SSL

## 🧪 **Step 5: Testing**

### **5.1 Test Backend via Tunnel**

```bash
# Test health endpoint
curl https://properties.gursimanoor.com/health

# Test API endpoint
curl https://properties.gursimanoor.com/api/health

# Test authentication
curl -X POST https://properties.gursimanoor.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertyfinder.com","password":"admin123"}'
```

### **5.2 Test Frontend**

1. Visit `https://properties.gursimanoor.com`
2. Test login with credentials
3. Verify deals table loads correctly
4. Test from different devices/networks

## 🔧 **Step 6: Management & Maintenance**

### **6.1 Service Management**

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop all services
docker-compose -f docker-compose.production.yml down
```

### **6.2 Updates & Redeployment**

```bash
# Pull latest code
git pull origin master

# Redeploy
./deploy-custom-port.sh

# Restart tunnel if needed
# (Stop and restart start-tunnel.bat)
```

### **6.3 Tunnel Management**

```bash
# List all tunnels
cloudflared tunnel list

# View tunnel info
cloudflared tunnel info propertyfinder

# Delete tunnel (if needed)
cloudflared tunnel delete propertyfinder
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Tunnel not connecting**: Check if tunnel is running and credentials are correct
2. **DNS not resolving**: Verify CNAME record in Cloudflare
3. **SSL errors**: Check SSL/TLS settings in Cloudflare
4. **Backend not responding**: Check Docker services and port configuration

### **Debug Commands**

```bash
# Check backend logs
docker-compose -f docker-compose.production.yml logs -f api

# Test tunnel connection
cloudflared tunnel info 766bafc4-59c3-40da-8c65-4a4d285f4c28

# Verify DNS resolution
nslookup properties.gursimanoor.com

# Check local services
curl http://localhost:8080/health
```

## 🎉 **Success!**

Your PropertyFinder is now live at `https://properties.gursimanoor.com` with:
- ✅ **Secure backend API** with JWT authentication
- ✅ **Professional frontend** on Cloudflare Pages
- ✅ **SSL/TLS encryption** via Cloudflare
- ✅ **Private access** via Argo Tunnel
- ✅ **Global CDN** for fast loading

## 📞 **Support**

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.production.yml logs -f`
2. Verify Cloudflare settings
3. Test endpoints individually
4. Check tunnel connection status

---

**Remember**: Keep your credentials secure and only share them with approved users! 🔐
