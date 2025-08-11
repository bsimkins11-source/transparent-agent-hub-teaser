#!/bin/bash

echo "🚀 Deploying Frontend to Cloud Run (Simple Method)"

# Set variables
PROJECT_ID="ai-agent-hub-web-portal-79fb0"
SERVICE_NAME="transparent-ai-frontend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "📦 Building and pushing Docker image using Cloud Build..."

# Build and push using Cloud Build (same as backend)
cd frontend
gcloud builds submit --tag $IMAGE_NAME

echo "☁️ Deploying to Cloud Run..."

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production"

echo "✅ Frontend deployed to Cloud Run!"
echo "🌐 Your new frontend URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format="value(status.url)"

echo ""
echo "🔥 No more Firebase caching issues!"
echo "📝 Changes will be immediate on next deployment"
