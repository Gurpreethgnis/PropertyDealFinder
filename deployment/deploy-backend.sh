#!/bin/bash

echo "🚀 Deploying PropertyFinder Backend to Production"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Error: docker-compose.production.yml not found!"
    echo "Please run this script from the PropertyFinder root directory."
    exit 1
fi

# Set production environment variables
export POSTGRES_PASSWORD="your-super-secure-production-password"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

echo "🔧 Setting up production environment..."
echo "📝 Please update the following in env.production:"
echo "   - POSTGRES_PASSWORD: Set a strong password"
echo "   - JWT_SECRET: Set a unique secret key"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Build and start production services
echo "🏗️ Building and starting production services..."
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Test the API
echo "🧪 Testing API endpoints..."
sleep 5

# Test health endpoint
if curl -s http://localhost/health | grep -q "healthy"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi

# Test API endpoint
if curl -s http://localhost/api/health | grep -q "healthy"; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
fi

echo ""
echo "🎉 Backend deployment completed!"
echo ""
echo "🌐 Your API is now accessible at:"
echo "   - Local: http://localhost/api"
echo "   - Health: http://localhost/health"
echo ""
echo "📋 Next steps:"
echo "1. Configure Cloudflare DNS to point properties.gursimanoor.com to your server"
echo "2. Set up Cloudflare SSL/TLS (Full or Full (strict) recommended)"
echo "3. Deploy frontend to Cloudflare Pages"
echo "4. Update frontend environment to use https://properties.gursimanoor.com/api"
echo ""
echo "🔧 Management commands:"
echo "   - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   - Stop services: docker-compose -f docker-compose.production.yml down"
echo "   - Restart: docker-compose -f docker-compose.production.yml restart"
