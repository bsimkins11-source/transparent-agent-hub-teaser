#!/bin/bash

echo "🚀 Deploying to PRODUCTION environment..."
echo "Project: ai-agent-hub-web-portal-79fb0"
echo ""

# Switch to production project
echo "🔄 Switching to production project..."
firebase use ai-agent-hub-web-portal-79fb0

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
cd ..

# Deploy to production
echo "🚀 Deploying to Firebase production..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production deployment successful!"
    echo "🌐 Production URL: https://ai-agent-hub-web-portal-79fb0.web.app"
    echo ""
    echo "🔍 To view production:"
    echo "   firebase open --project ai-agent-hub-web-portal-79fb0"
else
    echo "❌ Production deployment failed!"
    exit 1
fi
