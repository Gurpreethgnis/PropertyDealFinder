#!/bin/bash

echo "🏡 PropertyFinder Local Development"
echo "==================================="
echo

echo "Starting PropertyFinder services locally..."
echo

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "1. Starting PostgreSQL and Backend API..."
docker-compose -f deployment/docker-compose.local.yml up -d

echo
echo "2. Waiting for services to start..."
sleep 10

echo
echo "3. Starting Frontend..."
echo "Starting frontend in background. Check http://localhost:9968"
cd frontend && npm run dev &

echo
echo "✅ PropertyFinder is starting up locally!"
echo
echo "🌐 Access URLs:"
echo "   - Backend API: http://localhost:8080"
echo "   - Frontend: http://localhost:9968"
echo "   - API Docs: http://localhost:8080/api/docs"
echo
echo "🔐 Login: admin@propertyfinder.com / admin123"
echo
echo "📊 Database: localhost:5432 (propertyfinder/propertyfinder123)"
echo
echo "🎉 PropertyFinder is now running locally!"
echo
echo "To stop services:"
echo "   docker-compose -f deployment/docker-compose.local.yml down"
echo
echo "To view logs:"
echo "   docker-compose -f deployment/docker-compose.local.yml logs -f"
echo
echo "Frontend is running in background. Open http://localhost:9968 in your browser."
