#!/bin/bash

# Deploy directly to Cloud Run - bypassing Firebase hosting
echo "🚀 Deploying directly to Cloud Run..."

# Set your project ID
PROJECT_ID=$(gcloud config get-value project)
echo "📋 Project ID: $PROJECT_ID"

# Build and deploy using Cloud Build
echo "🔨 Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml

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
