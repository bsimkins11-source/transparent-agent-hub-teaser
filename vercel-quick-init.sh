#!/bin/bash

# Quick Vercel Initialization Script
echo "🚀 Quick Vercel Init for Transparent AI Agent Hub..."

# Check if Git exists and initialize if needed
[ ! -d ".git" ] && git init && echo "✅ Git initialized"

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Add your GitHub remote: git remote add origin https://github.com/YOUR_USERNAME/transparent-agent-hub.git"
fi

# Install frontend dependencies
cd frontend
[ ! -d "node_modules" ] && npm install && echo "✅ Dependencies installed"

# Test build
echo "🔨 Testing build..."
if npm run build; then
    echo "✅ Build successful - Ready for Vercel!"
else
    echo "❌ Build failed - Fix issues before deploying"
    exit 1
fi

cd ..

echo ""
echo "🎯 Next: Go to vercel.com and import your repository!"
echo "📁 Root Directory: frontend"
echo "🔨 Build Command: npm run build"
echo "📦 Output Directory: dist"
