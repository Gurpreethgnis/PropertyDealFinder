# Cloudflare Tunnel Configuration - PropertyFinder

## 🌐 **Service Information**
- **Domain**: properties.gursimanoor.com
- **Local Port**: 9968
- **Tunnel Name**: propertyfinder
- **Tunnel ID**: faef6594-a266-401d-9c9c-a2f4eb80b5dc

## 🔧 **How It Works**

### **Independent Tunnel Architecture**
Each service (Photos, Videos, Properties) has its own Cloudflare tunnel that runs independently. This means:
- ✅ Issues with one service don't affect the others
- ✅ Each tunnel can be started/stopped separately
- ✅ Each tunnel has its own configuration file
- ✅ Each tunnel runs in its own process

### **Tunnel Management**
The tunnels are managed from: `C:\ProgramData\cloudflared\`

**To manage tunnels:**
```bash
# Navigate to tunnel directory
cd "C:\ProgramData\cloudflared"

# Run the independent manager
manage-tunnels-independently.bat
```

**Quick Commands:**
```bash
# Start just Properties tunnel
start "Properties Tunnel" "C:\cloudflared\cloudflared.exe" tunnel --config "C:\ProgramData\cloudflared\propertyfinder-config.yml" run

# Stop just Properties tunnel
taskkill /f /fi "WINDOWTITLE eq Properties Tunnel*"
```

## 📁 **Configuration Files**

### **Main Tunnel Config**
- **Location**: `C:\ProgramData\cloudflared\propertyfinder-config.yml`
- **Purpose**: Routes properties.gursimanoor.com to localhost:9968

### **Environment Variables**
- **File**: `.env.local` (in frontend directory)
- **Purpose**: Tells Next.js about the external domain

## 🚀 **Starting the Service**

### **Development Mode**
```bash
cd "C:\Ideas\PropertyFinder\frontend"
npm run dev
```

### **Production Mode**
```bash
cd "C:\Ideas\PropertyFinder\frontend"
npm run build
npm start
```

## 🔍 **Troubleshooting**

### **502 Bad Gateway Error**
1. Check if PropertyFinder is running on port 9968
2. Verify tunnel is running: `C:\cloudflared\cloudflared.exe tunnel list`
3. Check tunnel configuration in `propertyfinder-config.yml`

### **Tunnel Not Connecting**
1. Ensure PropertyFinder service is running
2. Check if port 9968 is listening: `netstat -an | findstr "9968"`
3. Restart the tunnel using the manager script

### **DNS Issues**
- Verify CNAME record points to: `faef6594-a266-401d-9c9c-a2f4eb80b5dc.cfargotunnel.com`
- Check Cloudflare DNS settings for `properties.gursimanoor.com`

## 📋 **Team Development Notes**

### **When Making Changes**
1. **Edit code** in this directory
2. **Restart PropertyFinder service** if needed
3. **Tunnel automatically reconnects** - no manual restart required
4. **Other services (Photos, Videos) continue working** during updates

### **Environment Variables**
- `NEXT_PUBLIC_BASE_URL=https://properties.gursimanoor.com`
- `NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api`

### **Port Configuration**
- **Development**: Port 9968 (configured in package.json)
- **Tunnel**: Automatically routes external domain to localhost:9968

## 🌟 **Benefits of This Setup**

- **Isolation**: PropertyFinder issues don't affect Photos or Videos
- **Independent Management**: Start/stop without affecting other services
- **Easy Debugging**: Each service runs in its own process
- **Scalability**: Easy to add more services with their own tunnels

## 📞 **Support**

If you encounter issues:
1. Check this documentation first
2. Verify service is running on port 9968
3. Check tunnel status using the manager script
4. Contact the infrastructure team for tunnel configuration issues

---
*Last Updated: August 18, 2025*
*Tunnel Manager: C:\ProgramData\cloudflared\manage-tunnels-independently.bat*
