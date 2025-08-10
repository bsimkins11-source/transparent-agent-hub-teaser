#!/bin/bash

# Staging Backend Deployment Script
# This deploys the backend to a staging Cloud Run service

set -e

# Configuration
PROJECT_ID="transparent-ai-staging"
SERVICE_NAME="agent-backend-staging"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

print_status() {
    echo "📋 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

print_warning() {
    echo "⚠️  $1"
}

echo "🚀 Deploying Backend to STAGING Environment"
echo "============================================="
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Check if gcloud is authenticated
print_status "Checking gcloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated to gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set the project
print_status "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
print_status "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker for gcloud
print_status "Configuring Docker for gcloud..."
gcloud auth configure-docker

# Build and push Docker image
print_status "Building and pushing Docker image..."
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Deploy to Cloud Run
print_status "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars="NODE_ENV=staging,FRONTEND_URL=https://transparent-ai-staging.web.app"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

print_success "Staging backend deployed successfully!"
echo ""
echo "🌐 Service URL: $SERVICE_URL"
echo "🔍 View service: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo ""

# Test the deployment
print_status "Testing staging deployment..."
if curl -s "$SERVICE_URL/health" | grep -q "healthy"; then
    print_success "Health check passed!"
else
    print_warning "Health check failed - service may still be starting up"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update frontend staging environment with: $SERVICE_URL"
echo "2. Rebuild and deploy staging frontend"
echo "3. Test staging environment"
echo ""
echo "🔄 To switch back to production:"
echo "   gcloud config set project ai-agent-hub-web-portal-79fb0"
