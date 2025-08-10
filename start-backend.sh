#!/bin/bash

echo "🚀 Starting Transparent Agent Hub Backend..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of the project"
    echo "   Current directory: $(pwd)"
    echo "   Expected to find: backend/package.json"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp setup-and-run.js .env
    echo "⚠️  IMPORTANT: Please edit .env file with your API keys before starting the server"
    echo "   Required: GOOGLE_API_KEY for Gemini functionality"
    echo ""
    echo "   You can edit it now with: nano .env"
    echo "   Or continue and edit it later"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to edit .env first..."
fi

# Start the server
echo "🚀 Starting backend server..."
echo "   Server will be available at: http://localhost:8080"
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev
