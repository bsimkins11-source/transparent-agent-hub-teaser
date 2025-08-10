#!/bin/bash

echo "🎯 Deploying to PRODUCTION (Primary Environment)..."
echo ""

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging all changes..."
    git add .
    
    echo "💬 Enter commit message:"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Production Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git commit -m "$commit_message"
    echo "✅ Changes committed"
else
    echo "✅ No changes to commit"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ GitHub push successful"
else
    echo "❌ GitHub push failed"
    exit 1
fi

# Build the frontend
echo ""
echo "📦 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
cd ..

# Deploy to Production
echo ""
echo "🚀 Deploying to Firebase production..."
firebase use ai-agent-hub-web-portal-79fb0
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
