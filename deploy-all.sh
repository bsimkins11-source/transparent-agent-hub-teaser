#!/bin/bash

echo "🚀 Deploying to ALL environments..."
echo "🎯 Primary focus: PRODUCTION"
echo "🔄 Staging: Background mirror (keeps updated)"
echo ""

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging all changes..."
    git add .
    
    echo "💬 Enter commit message:"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
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

# Deploy to Production (Primary Focus)
echo ""
echo "🎯 Deploying to PRODUCTION (Primary Environment)..."
firebase use ai-agent-hub-web-portal-79fb0
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Production deployment successful!"
    echo "🌐 Production URL: https://ai-agent-hub-web-portal-79fb0.web.app"
else
    echo "❌ Production deployment failed!"
    exit 1
fi

# Deploy to Staging (Background Mirror)
echo ""
echo "🔄 Deploying to STAGING (Background Mirror)..."
firebase use transparent-ai-staging
firebase deploy --config firebase.staging.json --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Staging deployment successful!"
    echo "🌐 Staging URL: https://transparent-ai-staging.web.app"
else
    echo "⚠️  Staging deployment failed (non-critical)"
    echo "   Production is working - staging can be fixed later"
fi

echo ""
echo "🎉 Deployment Summary:"
echo "   ✅ GitHub: Updated"
echo "   🎯 Production: https://ai-agent-hub-web-portal-79fb0.web.app (Primary)"
echo "   🔄 Staging: https://transparent-ai-staging.web.app (Background Mirror)"
echo ""
echo "🔍 To view deployments:"
echo "   - Production: firebase open --project ai-agent-hub-web-portal-79fb0"
echo "   - Staging: firebase open --project transparent-ai-staging"
echo ""
echo "💡 Staging is now a background mirror that stays updated automatically."
echo "   Focus on production - staging will be ready when you need it."
