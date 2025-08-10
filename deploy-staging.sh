#!/bin/bash

echo "🚀 Deploying to STAGING environment..."
echo "Project: transparent-ai-staging"
echo ""

# Check if we're authenticated to staging project
echo "🔐 Checking authentication..."
firebase projects:list | grep -q "transparent-ai-staging"
if [ $? -ne 0 ]; then
    echo "❌ Not authenticated to staging project. Please run:"
    echo "   firebase login"
    echo "   firebase use transparent-ai-staging"
    exit 1
fi

# Switch to staging project
echo "🔄 Switching to staging project..."
firebase use transparent-ai-staging

# Build the frontend with staging environment
echo "📦 Building frontend for staging..."
cd frontend

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    echo "⚠️  .env.staging not found. Creating from template..."
    cp env.staging.template .env.staging
    echo "📝 Please edit .env.staging with your staging Firebase values"
    echo "   Then run this script again."
    exit 1
fi

# Build with staging environment
export VITE_ENVIRONMENT=staging
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
cd ..

# Deploy to staging
echo "🚀 Deploying to Firebase staging..."
firebase deploy --config firebase.staging.json

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Staging deployment successful!"
    echo "🌐 Staging URL: https://transparent-ai-staging.web.app"
    echo ""
    echo "🔍 To view staging:"
    echo "   firebase open --project transparent-ai-staging"
    echo ""
    echo "🌱 To seed staging data:"
    echo "   node scripts/seed-staging-data.js"
    echo ""
    echo "🔄 To switch back to production:"
    echo "   firebase use ai-agent-hub-web-portal-79fb0"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update .env.staging with your staging Firebase values"
    echo "   2. Run: node scripts/seed-staging-data.js"
    echo "   3. Test the staging environment"
else
    echo "❌ Staging deployment failed!"
    exit 1
fi
