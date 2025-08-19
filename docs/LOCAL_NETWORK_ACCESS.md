# 🌐 Local Network Access Guide

## 🚀 Quick Start

Your PropertyFinder application is now accessible on your local network!

### 📍 Your Local IP Address
**192.168.86.46**

### 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://192.168.86.46:4000 | Main application interface |
| **Deals Page** | http://192.168.86.46:4000/deals | Investment deals table |
| **API** | http://192.168.86.46:8000 | Backend API endpoints |
| **Database** | 192.168.86.46:5432 | PostgreSQL database |

## 📱 Access from Other Devices

Any device on your local network (same WiFi/LAN) can access:

- **Main App**: http://192.168.86.46:4000
- **Deals Table**: http://192.168.86.46:4000/deals
- **API Health**: http://192.168.86.46:8000/api/health

## 🔧 Management Commands

### Start Services
```bash
# Using the script
./start-local-network.sh

# Or manually
docker-compose -f docker-compose.local-network.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.local-network.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.local-network.yml logs -f

# Specific service
docker-compose -f docker-compose.local-network.yml logs -f api
docker-compose -f docker-compose.local-network.yml logs -f frontend
```

### Check Status
```bash
docker-compose -f docker-compose.local-network.yml ps
```

## 🔒 Security Notes

- **Local Network Only**: Services are only accessible from your local network
- **No External Access**: Your application is not accessible from the internet
- **Development Mode**: Frontend runs in development mode with hot reloading

## 🐛 Troubleshooting

### Can't Access from Other Devices?
1. Check if devices are on the same network
2. Verify Windows Firewall allows connections on ports 4000 and 8000
3. Ensure Docker is running

### Port Already in Use?
```bash
# Check what's using the ports
netstat -an | findstr :4000
netstat -an | findstr :8000

# Stop conflicting services or change ports in docker-compose.local-network.yml
```

### Database Connection Issues?
```bash
# Check database logs
docker-compose -f docker-compose.local-network.yml logs postgres

# Restart database
docker-compose -f docker-compose.local-network.yml restart postgres
```

## 🚀 Next Steps

1. **Test Local Access**: Open http://192.168.86.46:4000 in your browser
2. **Test Network Access**: Try accessing from your phone/tablet on the same WiFi
3. **Load Data**: Run the data ingestion script to populate the database
4. **Explore Features**: Navigate to the Deals page and test the API

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.local-network.yml logs -f`
2. Restart services: `docker-compose -f docker-compose.local-network.yml restart`
3. Check Docker status: `docker ps`
