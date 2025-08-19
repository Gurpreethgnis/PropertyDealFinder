@echo off
echo 🏡 PropertyFinder Startup Script
echo ================================
echo.

echo Starting PropertyFinder services...
echo.

REM Change to the project root directory
cd /d "%~dp0.."

echo 1. Starting Docker services...
docker-compose -f deployment/docker-compose.production.yml up -d

echo.
echo 2. Waiting for services to start...
ping -n 16 127.0.0.1 >nul

echo.
echo 3. Starting Argo Tunnel...
echo IMPORTANT: A new window will open for the tunnel
echo Keep that window open to maintain the connection!
echo.
start scripts\start-tunnel-manual.bat

echo.
echo 4. Waiting for tunnel to connect...
ping -n 11 127.0.0.1 >nul

echo.
echo ✅ PropertyFinder is starting up!
echo.
echo 🌐 Access URLs:
echo    - Local Backend: http://localhost:8080
echo    - Production: https://properties.gursimanoor.com
echo.
echo 🔐 Login: admin@propertyfinder.com / admin123
echo.
echo Press any key to open the application...
pause >nul

start https://properties.gursimanoor.com

echo.
echo 🎉 PropertyFinder is now running!
echo.
echo To stop services:
echo    docker-compose -f deployment/docker-compose.production.yml down
echo.
echo REMEMBER: Keep the tunnel window open!
echo.
pause
