#!/bin/bash

# Simple deployment script - deploy pre-built frontend to Cloud Run
echo "🚀 Deploying pre-built frontend to Cloud Run..."

# Set your project ID
PROJECT_ID=$(gcloud config get-value project)
echo "📋 Project ID: $PROJECT_ID"

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo "❌ Frontend not built. Building now..."
    cd frontend
    npm run build
    cd ..
fi

# Create a simple server.js in the dist directory
cat > frontend/dist/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

console.log('🚀 Starting server...');
console.log('📁 Current directory:', __dirname);

// Serve static files
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});
EOF

# Create package.json for the dist directory
cat > frontend/dist/package.json << 'EOF'
{
  "name": "transparent-ai-frontend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}
EOF

# Create a simple Dockerfile for the dist directory
cat > frontend/dist/Dockerfile << 'EOF'
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy built files
COPY . .

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
EOF

# Build and deploy using gcloud directly
echo "🔨 Building and deploying with gcloud..."

# Build the container image
gcloud builds submit frontend/dist --tag gcr.io/$PROJECT_ID/transparent-ai-frontend

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Deploying to Cloud Run..."
    
    # Deploy to Cloud Run
    gcloud run deploy transparent-ai-frontend \
        --image gcr.io/$PROJECT_ID/transparent-ai-frontend \
        --region us-central1 \
        --platform managed \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        
        # Get the service URL
        SERVICE_URL=$(gcloud run services describe transparent-ai-frontend --region=us-central1 --format="value(status.url)")
        echo "🌐 Service URL: $SERVICE_URL"
        
        # Test the deployment
        echo "🧪 Testing deployment..."
        curl -s "$SERVICE_URL/health" | jq . || echo "Health check endpoint available at: $SERVICE_URL/health"
        
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
    
else
    echo "❌ Build failed!"
    exit 1
fi
