#!/bin/bash

echo "🌐 Starting PropertyFinder for Local Network Access"
echo "=================================================="

# Get local IP address
LOCAL_IP=$(ipconfig | grep "IPv4" | head -1 | awk '{print $NF}')
echo "📍 Your local IP address: $LOCAL_IP"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start the local network version
echo "🚀 Starting services for local network access..."
docker-compose -f docker-compose.local-network.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.local-network.yml ps

echo ""
echo "✅ PropertyFinder is now accessible on your local network!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$LOCAL_IP:4000"
echo "   API:      http://$LOCAL_IP:8000"
echo "   Database: $LOCAL_IP:5432"
echo ""
echo "📱 Other devices on your network can access:"
echo "   http://$LOCAL_IP:4000/deals"
echo ""
echo "🔧 To stop services: docker-compose -f docker-compose.local-network.yml down"
echo "📊 To view logs: docker-compose -f docker-compose.local-network.yml logs -f"
