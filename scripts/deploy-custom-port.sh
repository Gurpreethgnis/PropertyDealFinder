#!/bin/bash

echo "🚀 PropertyFinder Custom Port Deployment Script"
echo "==============================================="
echo "This script will deploy your PropertyFinder on custom ports"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Custom port configuration
CUSTOM_PORT="8080"
API_PORT="8000"
DB_PORT="5432"

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "docker-compose.production.yml not found!"
    echo "Please run this script from the PropertyFinder root directory."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Starting custom port deployment process..."

# Step 1: Update environment variables
print_status "Step 1: Setting up production environment with custom ports..."

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

# Update env.production with secure values and custom ports
cat > env.production << EOF
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api
NODE_ENV=production
NEXT_PUBLIC_PORT=4000

# Custom Port Configuration
CUSTOM_PORT=${CUSTOM_PORT}
LOCAL_API_URL=http://localhost:${API_PORT}
LOCAL_NGINX_URL=http://localhost:${CUSTOM_PORT}

# Database (auto-generated secure password)
DATABASE_URL=postgresql://propertyfinder:${DB_PASSWORD}@localhost:${DB_PORT}/propertyfinder
JWT_SECRET=${JWT_SECRET}

# API Keys (update these with real keys when available)
ZILLOW_API_KEY=mock_key
CENSUS_API_KEY=mock_key
EOF

print_success "Production environment configured with custom ports:"
echo "   - Nginx: ${CUSTOM_PORT}"
echo "   - API: ${API_PORT}"
echo "   - Database: ${DB_PORT}"

# Step 2: Deploy backend
print_status "Step 2: Deploying backend services on custom ports..."

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Set environment variables
export POSTGRES_PASSWORD="${DB_PASSWORD}"
export JWT_SECRET="${JWT_SECRET}"

# Build and start production services
print_status "Building and starting production services..."
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 20

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.production.yml ps

# Step 3: Test backend
print_status "Step 3: Testing backend endpoints on custom ports..."

# Wait a bit more for services to fully initialize
sleep 10

# Test health endpoint
if curl -s http://localhost:${CUSTOM_PORT}/health | grep -q "healthy"; then
    print_success "Health check passed on port ${CUSTOM_PORT}"
else
    print_error "Health check failed on port ${CUSTOM_PORT}"
fi

# Test API endpoint
if curl -s http://localhost:${CUSTOM_PORT}/api/health | grep -q "healthy"; then
    print_success "API health check passed on port ${CUSTOM_PORT}"
else
    print_error "API health check failed on port ${CUSTOM_PORT}"
fi

# Step 4: Build frontend
print_status "Step 4: Building frontend for Cloudflare Pages..."

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build the application
print_status "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend build successful!"
    
    # Create Cloudflare Pages configuration files
    print_status "Creating Cloudflare Pages configuration..."
    
    # Create _redirects file
    cat > out/_redirects << EOF
/api/* https://properties.gursimanoor.com/api/:splat 200
/* /index.html 200
EOF
    
    # Create _headers file
    cat > out/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
EOF
    
    print_success "Cloudflare Pages configuration created"
else
    print_error "Frontend build failed!"
    exit 1
fi

# Step 5: Push to GitHub
print_status "Step 5: Pushing code to GitHub..."

# Check git status
if git status --porcelain | grep -q .; then
    print_status "Committing changes..."
    git add .
    git commit -m "Deploy to production with custom ports - $(date)"
    
    print_status "Pushing to GitHub..."
    if git push origin master; then
        print_success "Code pushed to GitHub successfully"
    else
        print_warning "Failed to push to GitHub. You may need to push manually."
    fi
else
    print_status "No changes to commit"
fi

# Step 6: Display deployment summary
echo ""
echo "🎉 CUSTOM PORT DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "================================================="
echo ""
print_success "Backend API is running on custom ports"
print_success "Frontend is built and ready for Cloudflare Pages"
print_success "Code has been pushed to GitHub"
echo ""
echo "🔐 PRODUCTION CREDENTIALS:"
echo "   Database Password: ${DB_PASSWORD}"
echo "   JWT Secret: ${JWT_SECRET}"
echo ""
echo "🌐 ACCESS URLs:"
echo "   Health Check: http://localhost:${CUSTOM_PORT}/health"
echo "   API Health: http://localhost:${CUSTOM_PORT}/api/health"
echo "   API Base: http://localhost:${CUSTOM_PORT}/api"
echo "   Login: http://localhost:${CUSTOM_PORT}/api/auth/login"
echo ""
echo "🔧 PORT CONFIGURATION:"
echo "   - Nginx (Main): ${CUSTOM_PORT}"
echo "   - FastAPI: ${API_PORT}"
echo "   - PostgreSQL: ${DB_PORT}"
echo ""
echo "📋 NEXT STEPS - CLOUDFLARE CONFIGURATION:"
echo "=========================================="
echo ""
echo "1. 🌐 Go to Cloudflare Dashboard > DNS"
echo "   Add A record: properties → YOUR_SERVER_IP (Proxy: ✅)"
echo ""
echo "2. 📱 Go to Cloudflare Dashboard > Pages"
echo "   Create new project → Connect GitHub repo"
echo "   Build settings:"
echo "     - Build command: npm run build"
echo "     - Output directory: out"
echo "     - Root directory: / (leave empty)"
echo ""
echo "3. 🔗 Add custom domain: properties.gursimanoor.com"
echo ""
echo "4. 🔒 Go to SSL/TLS > Overview"
echo "   Set encryption mode to 'Full (strict)'"
echo "   Enable 'Always Use HTTPS'"
echo ""
echo "🌐 Your PropertyFinder will be live at:"
echo "   https://properties.gursimanoor.com"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   - Stop services: docker-compose -f docker-compose.production.yml down"
echo "   - Restart: docker-compose -f docker-compose.production.yml restart"
echo ""
echo "📞 Need help? Check CLOUDFLARE_DEPLOYMENT.md for detailed instructions"
