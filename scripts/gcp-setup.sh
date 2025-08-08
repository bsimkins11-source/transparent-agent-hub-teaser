#!/bin/bash

echo "🔧 Setting up GCP for Transparent Agent Hub deployment..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Please authenticate with gcloud:"
    gcloud auth login
fi

# Set project
PROJECT_ID="ai-agent-hub-web-portal"
echo "📁 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable cloudrun.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create service account for GitHub Actions
echo "👤 Creating service account for GitHub Actions..."
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for GitHub Actions deployment"

# Get the service account email
SA_EMAIL="github-actions@$PROJECT_ID.iam.gserviceaccount.com"

# Grant necessary permissions
echo "🔑 Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/firebase.admin"

# Create and download service account key
echo "📄 Creating service account key..."
gcloud iam service-accounts keys create ~/github-actions-key.json \
    --iam-account=$SA_EMAIL

echo ""
echo "✅ GCP setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the service account key content:"
echo "   cat ~/github-actions-key.json"
echo ""
echo "2. Add the following secrets to your GitHub repository:"
echo "   - GCP_SA_KEY: (Base64 encode the service account key)"
echo "   - GCP_PROJECT_ID: $PROJECT_ID"
echo ""
echo "3. For Firebase token, run:"
echo "   firebase login:ci"
echo ""
echo "4. Add other API keys as GitHub secrets:"
echo "   - FIREBASE_API_KEY"
echo "   - OPENAI_API_KEY"
echo "   - GOOGLE_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo ""
echo "🔗 GitHub repository: https://github.com/bsimkins11/transparent-agent-hub"
