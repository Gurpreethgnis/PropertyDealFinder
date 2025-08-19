# Local Development Guide

This guide will help you run PropertyFinder locally on your machine.

## Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start

### Windows
```bash
# Run the startup script
scripts\start-local-dev.bat
```

### Linux/Mac
```bash
# Make script executable (first time only)
chmod +x scripts/start-local-dev.sh

# Run the startup script
./scripts/start-local-dev.sh
```

## What Gets Started

1. **PostgreSQL Database** (port 5432)
   - Database: `propertyfinder`
   - Username: `propertyfinder`
   - Password: `propertyfinder123`

2. **Backend API** (port 8080)
   - FastAPI application
   - API documentation: http://localhost:8080/api/docs
   - Health check: http://localhost:8080/health

3. **Frontend** (port 9968)
   - Next.js application
   - URL: http://localhost:9968

## Manual Setup (Alternative)

If you prefer to start services manually:

### 1. Start Database and Backend
```bash
cd deployment
docker-compose -f docker-compose.local.yml up -d
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:9968
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api/docs
- **Database**: localhost:5432

## Login Credentials

- **Email**: admin@propertyfinder.com
- **Password**: admin123

## Development Workflow

1. **Backend Changes**: The backend code is mounted as a volume, so changes are reflected immediately
2. **Frontend Changes**: Next.js hot reload will automatically refresh the browser
3. **Database Changes**: Use the `deployment/init.sql` file to modify the schema

## Useful Commands

### View Logs
```bash
# All services
docker-compose -f deployment/docker-compose.local.yml logs -f

# Specific service
docker-compose -f deployment/docker-compose.local.yml logs -f api
```

### Stop Services
```bash
docker-compose -f deployment/docker-compose.local.yml down
```

### Restart Services
```bash
docker-compose -f deployment/docker-compose.local.yml restart
```

### Reset Database
```bash
docker-compose -f deployment/docker-compose.local.yml down -v
docker-compose -f deployment/docker-compose.local.yml up -d
```

## Troubleshooting

### Port Already in Use
If you get port conflicts:
1. Check what's using the port: `netstat -ano | findstr :8080` (Windows) or `lsof -i :8080` (Mac/Linux)
2. Stop the conflicting service or modify the ports in `docker-compose.local.yml`

### Database Connection Issues
1. Ensure Docker is running
2. Check if PostgreSQL container is healthy: `docker ps`
3. View container logs: `docker-compose -f deployment/docker-compose.local.yml logs postgres`

### Frontend Not Loading
1. Check if Node.js is installed: `node --version`
2. Ensure you're in the frontend directory: `cd frontend`
3. Install dependencies: `npm install`

## File Structure

```
PropertyFinder/
├── backend/                 # FastAPI backend
│   ├── api/                # API routes
│   ├── models/             # Data models
│   ├── ingest/             # Data ingestion scripts
│   └── main.py             # Main application
├── frontend/               # Next.js frontend
├── deployment/             # Docker and deployment configs
│   ├── docker-compose.local.yml
│   └── init.sql
└── scripts/                # Startup scripts
    ├── start-local-dev.bat
    └── start-local-dev.sh
```

## Next Steps

Once you have the application running locally:

1. **Explore the API**: Visit http://localhost:8080/api/docs
2. **Test the Frontend**: Navigate through the application at http://localhost:9968
3. **Modify Code**: Make changes and see them reflected immediately
4. **Add Features**: Extend the application with new functionality

## Need Help?

- Check the logs for error messages
- Ensure all prerequisites are installed
- Verify Docker containers are running: `docker ps`
- Check the main README.md for additional information
