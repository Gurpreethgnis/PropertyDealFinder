#!/bin/bash

echo "🚀 Deploying PropertyFinder Frontend to Cloudflare Pages"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the PropertyFinder root directory."
    exit 1
fi

# Update environment for production
echo "🔧 Updating environment for production..."
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production..."
    cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api
NODE_ENV=production
NEXT_PUBLIC_PORT=4000
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create _redirects file for Cloudflare Pages
    echo "📝 Creating Cloudflare Pages configuration..."
    cat > out/_redirects << EOF
/api/* https://properties.gursimanoor.com/api/:splat 200
/* /index.html 200
EOF
    
    # Create _headers file for security headers
    cat > out/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
EOF
    
    echo "📁 Build output created in 'out/' directory"
    echo ""
    echo "🎉 Frontend build completed!"
    echo ""
    echo "📋 Next steps for Cloudflare Pages deployment:"
    echo "1. Go to Cloudflare Dashboard > Pages"
    echo "2. Create a new project"
    echo "3. Connect your GitHub repository"
    echo "4. Set build settings:"
    echo "   - Build command: npm run build"
    echo "   - Build output directory: out"
    echo "   - Root directory: / (leave empty)"
    echo "5. Set environment variables:"
    echo "   - NODE_ENV: production"
    echo "   - NEXT_PUBLIC_API_URL: https://properties.gursimanoor.com/api"
    echo "6. Deploy!"
    echo ""
    echo "🔧 Manual deployment:"
    echo "   - Upload the 'out/' directory contents to your web server"
    echo "   - Or use Cloudflare Pages CLI: wrangler pages publish out"
    
else
    echo "❌ Build failed!"
    exit 1
fi
