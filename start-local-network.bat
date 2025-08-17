@echo off
echo 🌐 Starting PropertyFinder for Local Network Access
echo ==================================================

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%
echo 📍 Your local IP address: %LOCAL_IP%
echo.

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down 2>nul

REM Start the local network version
echo 🚀 Starting services for local network access...
docker-compose -f docker-compose.local-network.yml up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo 🔍 Checking service status...
docker-compose -f docker-compose.local-network.yml ps

echo.
echo ✅ PropertyFinder is now accessible on your local network!
echo.
echo 🌐 Access URLs:
echo    Frontend: http://%LOCAL_IP%:4000
echo    API:      http://%LOCAL_IP%:8000
echo    Database: %LOCAL_IP%:5432
echo.
echo 📱 Other devices on your network can access:
echo    http://%LOCAL_IP%:4000/deals
echo.
echo 🔧 To stop services: docker-compose -f docker-compose.local-network.yml down
echo 📊 To view logs: docker-compose -f docker-compose.local-network.yml logs -f
echo.
pause
