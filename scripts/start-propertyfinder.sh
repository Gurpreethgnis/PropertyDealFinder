#!/bin/bash

echo "🏡 PropertyFinder Startup Script"
echo "================================"
echo ""

echo "Starting PropertyFinder services..."
echo ""

echo "1. Starting Docker services..."
docker-compose -f deployment/docker-compose.production.yml up -d

echo ""
echo "2. Waiting for services to start..."
sleep 15

echo ""
echo "3. Starting Argo Tunnel..."
echo "IMPORTANT: A new window will open for the tunnel"
echo "Keep that window open to maintain the connection!"
echo ""

# For Windows, we'll use the .bat file
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start scripts/start-tunnel-manual.bat
else
    echo "Please start the tunnel manually: scripts/start-tunnel-manual.bat"
fi

echo ""
echo "4. Waiting for tunnel to connect..."
sleep 10

echo ""
echo "✅ PropertyFinder is starting up!"
echo ""
echo "🌐 Access URLs:"
echo "   - Local Backend: http://localhost:8080"
echo "   - Production: https://properties.gursimanoor.com"
echo ""
echo "🔐 Login: admin@propertyfinder.com / admin123"
echo ""
echo "Press any key to open the application..."
read -n 1

# Open the application in default browser
if command -v start >/dev/null 2>&1; then
    start https://properties.gursimanoor.com
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open https://properties.gursimanoor.com
elif command -v open >/dev/null 2>&1; then
    open https://properties.gursimanoor.com
fi

echo ""
echo "🎉 PropertyFinder is now running!"
echo ""
echo "To stop services:"
echo "   docker-compose -f deployment/docker-compose.production.yml down"
echo ""
echo "REMEMBER: Keep the tunnel window open!"
echo ""
read -n 1
