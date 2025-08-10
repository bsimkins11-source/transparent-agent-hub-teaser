#!/bin/bash

# Production Deployment Script for Agent Hub Backend
# This script deploys the backend to Google Cloud Run

set -e

echo "🚀 Starting production deployment..."

# Configuration
PROJECT_ID="ai-agent-hub-web-portal-79fb0"
SERVICE_NAME="agent-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "You are not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Check if project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_warning "Current project is $CURRENT_PROJECT, switching to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi

# Enable required APIs
print_status "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push Docker image
print_status "Building and pushing Docker image..."
gcloud builds submit --tag $IMAGE_NAME

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
    --set-env-vars NODE_ENV=production \
    --set-env-vars FIREBASE_PROJECT_ID=$PROJECT_ID \
    --set-env-vars FRONTEND_URL=https://ai-agent-hub-web-portal-79fb0.web.app

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

print_status "Deployment completed successfully!"
echo ""
echo "🌐 Service URL: $SERVICE_URL"
echo "📊 Health Check: $SERVICE_URL/health"
echo "🔧 API Base: $SERVICE_URL/api"
echo ""

# Update frontend environment
print_status "Updating frontend environment configuration..."
cd ../frontend

# Create production environment file
cat > .env.production << EOF
# Production Environment Variables
VITE_API_URL=$SERVICE_URL
VITE_FIREBASE_API_KEY=AIzaSyAf2KwetCFEARZiaBP_QW07JVT1_tfZ_IY
VITE_FIREBASE_AUTH_DOMAIN=ai-agent-hub-web-portal-79fb0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-agent-hub-web-portal-79fb0
VITE_FIREBASE_STORAGE_BUCKET=ai-agent-hub-web-portal-79fb0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=72861076114
VITE_FIREBASE_APP_ID=1:72861076114:web:1ea856ad05ef5f0eeef44b
VITE_FIREBASE_MEASUREMENT_ID=G-JHLXTCXEDR
EOF

print_status "Frontend environment updated. Now rebuild and redeploy the frontend."
echo ""
echo "📋 Next steps:"
echo "1. Rebuild frontend: cd frontend && npm run build"
echo "2. Deploy frontend to Firebase: firebase deploy --only hosting"
echo "3. Test the remove functionality at: https://ai-agent-hub-web-portal-79fb0.web.app/my-agents"
echo ""

print_status "Production backend deployment completed! 🎉"
