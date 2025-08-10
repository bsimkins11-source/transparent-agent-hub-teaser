#!/bin/bash

# Frontend Deployment Script
# Run this to deploy frontend changes directly to Firebase

echo "🚀 Deploying frontend to Firebase..."

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Frontend deployment complete!"
echo "🌐 Your site is live at: https://ai-agent-hub-web-portal-79fb0.web.app"
