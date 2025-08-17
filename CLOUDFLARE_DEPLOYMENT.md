# 🚀 Cloudflare Deployment Guide for PropertyFinder

This guide will help you deploy your PropertyFinder application to `properties.gursimanoor.com` using Cloudflare.

## 🎯 **Deployment Overview**

We'll deploy:
- **Backend API**: FastAPI + PostgreSQL on your server with Cloudflare proxy
- **Frontend**: Next.js app on Cloudflare Pages
- **Domain**: `properties.gursimanoor.com` with SSL/TLS

## 🔧 **Prerequisites**

1. **Cloudflare Account** with `gursimanoor.com` domain
2. **VPS/Server** with Docker installed
3. **GitHub Repository** with your PropertyFinder code
4. **Domain Access**: Ability to modify DNS records

## 🐳 **Step 1: Deploy Backend to Your Server**

### 1.1 Update Production Environment

Edit `env.production` with secure values:
```bash
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api
NODE_ENV=production
NEXT_PUBLIC_PORT=4000

# Database (use strong passwords!)
DATABASE_URL=postgresql://propertyfinder:YOUR_STRONG_PASSWORD@localhost:5432/propertyfinder
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_CHANGE_THIS
```

### 1.2 Deploy Backend Services

```bash
# Make script executable
chmod +x deploy-backend.sh

# Deploy backend
./deploy-backend.sh
```

### 1.3 Verify Backend is Running

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Test API endpoints
curl http://localhost/health
curl http://localhost/api/health
```

## 🌐 **Step 2: Configure Cloudflare DNS**

### 2.1 Add DNS Records

In Cloudflare Dashboard > DNS:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | properties | YOUR_SERVER_IP | Proxied ✅ |
| CNAME | www.properties | properties.gursimanoor.com | Proxied ✅ |

### 2.2 SSL/TLS Settings

1. Go to **SSL/TLS** > **Overview**
2. Set **Encryption mode** to **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **HSTS** (optional but recommended)

## 📱 **Step 3: Deploy Frontend to Cloudflare Pages**

### 3.1 Build Frontend

```bash
# Make script executable
chmod +x deploy-frontend.sh

# Build for production
./deploy-frontend.sh
```

### 3.2 Cloudflare Pages Setup

1. **Go to Cloudflare Dashboard** > **Pages**
2. **Create a new project**
3. **Connect your GitHub repository**
4. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (leave empty)
5. **Set environment variables**:
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_API_URL`: `https://properties.gursimanoor.com/api`
6. **Deploy!**

### 3.3 Custom Domain Setup

1. In your Pages project, go to **Custom domains**
2. Add `properties.gursimanoor.com`
3. Cloudflare will automatically configure SSL

## 🔒 **Step 4: Security Configuration**

### 4.1 Cloudflare Security Settings

1. **Security** > **WAF**: Enable managed rules
2. **Security** > **DDoS Protection**: Enable
3. **Security** > **Bot Management**: Enable (if available)
4. **Security** > **Rate Limiting**: Configure as needed

### 4.2 Environment Variables

Ensure these are set securely:
- `POSTGRES_PASSWORD`: Strong database password
- `JWT_SECRET`: Unique, random JWT signing key
- `NEXT_PUBLIC_API_URL`: Production API URL

## 🧪 **Step 5: Testing**

### 5.1 Test Backend API

```bash
# Test from your server
curl https://properties.gursimanoor.com/api/health

# Test authentication
curl -X POST https://properties.gursimanoor.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertyfinder.com","password":"admin123"}'
```

### 5.2 Test Frontend

1. Visit `https://properties.gursimanoor.com`
2. Test login with your credentials
3. Verify deals table loads correctly
4. Test from different devices/networks

## 🔧 **Step 6: Monitoring & Maintenance**

### 6.1 Health Checks

```bash
# Check backend status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f api
```

### 6.2 Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

## 🚨 **Troubleshooting**

### Common Issues

1. **API 403/500 errors**: Check backend logs and database connection
2. **Frontend not loading**: Verify Cloudflare Pages deployment
3. **SSL issues**: Check Cloudflare SSL/TLS settings
4. **CORS errors**: Verify API CORS configuration

### Debug Commands

```bash
# Check backend logs
docker-compose -f docker-compose.production.yml logs -f

# Test database connection
docker-compose -f docker-compose.production.yml exec postgres psql -U propertyfinder -d propertyfinder -c "SELECT 1"

# Check nginx configuration
docker-compose -f docker-compose.production.yml exec nginx nginx -t
```

## 🎉 **Success!**

Your PropertyFinder is now live at `https://properties.gursimanoor.com` with:
- ✅ **Secure backend API** with JWT authentication
- ✅ **Professional frontend** on Cloudflare Pages
- ✅ **SSL/TLS encryption** via Cloudflare
- ✅ **Global CDN** for fast loading
- ✅ **DDoS protection** and security features

## 📞 **Support**

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.production.yml logs -f`
2. Verify Cloudflare settings
3. Test endpoints individually
4. Check server resources (CPU, memory, disk)

---

**Remember**: Keep your credentials secure and only share them with approved users! 🔐
