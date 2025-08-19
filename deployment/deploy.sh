#!/bin/bash

echo "🚀 Deploying PropertyFinder to properties.gursimanoor.com"

# Build the application
echo "📦 Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create production environment file
    echo "🔧 Creating production environment..."
    cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://properties.gursimanoor.com/api
NODE_ENV=production
EOF
    
    echo "📋 Next steps:"
    echo "1. Install Vercel CLI: npm install -g vercel"
    echo "2. Login to Vercel: vercel login"
    echo "3. Deploy: vercel --prod"
    echo "4. Add custom domain: vercel domains add properties.gursimanoor.com"
    
else
    echo "❌ Build failed!"
    exit 1
fi
