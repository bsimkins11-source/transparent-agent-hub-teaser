#!/bin/bash

# Transparent Agent Hub Teaser Page Deployment Script
# This script deploys the teaser page to the dedicated repository

set -e

echo "🚀 Starting Transparent Agent Hub Teaser Page Deployment..."

# Check if we're on the teaser-page branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "teaser-page" ]; then
    echo "❌ Error: Must be on 'teaser-page' branch to deploy"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please run: git checkout teaser-page"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "🚀 Deploy teaser page - Phase 1 MVP complete

✅ Hero section with 'The Future of Transparent Marketing' tagline
✅ What Is the Transparent AI Agent Hub section
✅ How It Works - 3-step process explanation
✅ 6 Agent Categories with descriptions and timelines
✅ Enhanced demo section with 5 agent showcases
✅ Coming Soon roadmap to 2026
✅ Email capture form for early access
✅ Responsive design across all devices
✅ Vercel deployment configuration

Phase 1 MVP Status: COMPLETE 🎉"

# Push to teaser repository
echo "🚀 Pushing to teaser repository..."
git push teaser teaser-page:main

echo "✅ Deployment complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Import the repository: https://github.com/bsimkins11-source/transparent-agent-hub-teaser"
echo "3. Vercel will automatically detect the frontend configuration"
echo "4. Deploy to get your live teaser page URL"
echo ""
echo "🎯 Your teaser page is now ready for Vercel deployment!"
