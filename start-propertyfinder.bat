@echo off
echo 🏡 PropertyFinder Startup Script
echo ================================
echo.

echo Starting PropertyFinder services...
echo.

echo 1. Starting Docker services...
docker-compose -f docker-compose.production.yml up -d

echo.
echo 2. Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo 3. Starting Argo Tunnel...
echo IMPORTANT: A new window will open for the tunnel
echo Keep that window open to maintain the connection!
echo.
start start-tunnel-manual.bat

echo.
echo 4. Waiting for tunnel to connect...
timeout /t 10 /nobreak >nul

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
echo    docker-compose -f docker-compose.production.yml down
echo.
echo REMEMBER: Keep the tunnel window open!
echo.
pause
