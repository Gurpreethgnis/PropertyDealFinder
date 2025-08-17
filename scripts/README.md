# 📁 Scripts Directory

This directory contains utility scripts for PropertyFinder deployment and management.

## 🚀 **Deployment Scripts**

### **deploy-custom-port.sh**
Main production deployment script that:
- Sets up production environment with custom ports
- Deploys Docker services (PostgreSQL, FastAPI, Nginx)
- Builds frontend for Cloudflare Pages
- Generates secure credentials automatically

**Usage:**
```bash
chmod +x deploy-custom-port.sh
./deploy-custom-port.sh
```

### **start-tunnel.bat**
Windows batch file to start the Argo Tunnel for production access.

**Usage:**
```bash
start start-tunnel.bat
```

## 🏠 **Startup Scripts**

### **start-propertyfinder.bat**
Complete startup script for Windows that:
- Starts all Docker services
- Launches Argo Tunnel
- Opens the application in browser

**Usage:**
```bash
start start-propertyfinder.bat
```

## 🔧 **Management Commands**

### **Service Management**
```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart services
docker-compose -f docker-compose.production.yml restart
```

### **Tunnel Management**
```bash
# List tunnels
cloudflared tunnel list

# Start tunnel
cloudflared tunnel run --config cloudflared-tunnel.yml propertyfinder

# View tunnel info
cloudflared tunnel info 766bafc4-59c3-40da-8c65-4a4d285f4c28
```

## 📝 **Script Descriptions**

| Script | Purpose | Platform |
|--------|---------|----------|
| `deploy-custom-port.sh` | Production deployment | Linux/Mac |
| `start-tunnel.bat` | Start Argo Tunnel | Windows |
| `start-propertyfinder.bat` | Complete startup | Windows |

## 🚨 **Troubleshooting**

If scripts fail:
1. Check if Docker is running
2. Verify cloudflared is installed
3. Ensure you're in the project root directory
4. Check file permissions (Linux/Mac)

## 📞 **Support**

For script issues, check:
- Docker service status
- Tunnel connection status
- Service logs
- File permissions
