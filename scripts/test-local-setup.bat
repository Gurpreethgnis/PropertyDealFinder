@echo off
echo 🧪 Testing PropertyFinder Local Setup
echo =====================================
echo.

echo Checking prerequisites...
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it
    pause
    exit /b 1
) else (
    echo ✅ Docker is available
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is available
)

echo.
echo Testing database connection...
echo.

REM Test if PostgreSQL is running
docker exec propertyfinder_postgres_local pg_isready -U propertyfinder >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running
    echo Please start the services first: scripts\start-local-dev.bat
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL is running
)

echo.
echo Testing backend API...
echo.

REM Test backend health endpoint
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend API is not responding
    echo Please check the backend logs
    pause
    exit /b 1
) else (
    echo ✅ Backend API is responding
)

echo.
echo Testing frontend...
echo.

REM Test frontend
curl -s http://localhost:9968 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend is not responding
    echo Please check the frontend logs
    pause
    exit /b 1
) else (
    echo ✅ Frontend is responding
)

echo.
echo 🎉 All tests passed! PropertyFinder is running correctly.
echo.
echo 🌐 Access URLs:
echo    - Frontend: http://localhost:9968
echo    - Backend: http://localhost:8080
echo    - API Docs: http://localhost:8080/api/docs
echo.
pause
