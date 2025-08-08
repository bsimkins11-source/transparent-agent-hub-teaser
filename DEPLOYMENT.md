# 🚀 Deployment Guide - Transparent Agent Hub

This guide will help you set up automated deployment from GitHub to GCP using GitHub Actions.

## 📋 Prerequisites

1. **GCP Project**: You need a GCP project with billing enabled
2. **Firebase Project**: A Firebase project for hosting and authentication
3. **API Keys**: OpenAI, Google, and Anthropic API keys
4. **GitHub Repository**: Your code is already pushed to GitHub

## 🔧 Step 1: GCP Project Setup

### Option A: Use Existing Project
If you want to use an existing GCP project:

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Select your project (e.g., `ai-pdf-assistant-467120`)
3. Enable billing if not already enabled
4. Enable these APIs manually:
   - Cloud Run API
   - Firestore API
   - Firebase API
   - Cloud Build API

### Option B: Create New Project
```bash
# Create new project
gcloud projects create your-project-id --name="Transparent Agent Hub"

# Set as default
gcloud config set project your-project-id

# Enable APIs
gcloud services enable cloudrun.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 🔥 Step 2: Firebase Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create/Select Project**: Use the same project ID as your GCP project
3. **Enable Services**:
   - Authentication (Email/Password + Google)
   - Firestore Database
   - Hosting

4. **Get Firebase Config**:
   - Go to Project Settings
   - Copy the config values for your environment variables

## 🔑 Step 3: Service Account Setup

1. **Create Service Account**:
```bash
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Service Account"
```

2. **Grant Permissions**:
```bash
# Get your project ID
PROJECT_ID=$(gcloud config get-value project)
SA_EMAIL="github-actions@$PROJECT_ID.iam.gserviceaccount.com"

# Grant permissions
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
```

3. **Create Service Account Key**:
```bash
gcloud iam service-accounts keys create ~/github-actions-key.json \
    --iam-account=$SA_EMAIL
```

4. **Base64 Encode the Key**:
```bash
base64 -i ~/github-actions-key.json
```

## 🔐 Step 4: GitHub Secrets Setup

Go to your GitHub repository: https://github.com/bsimkins11/transparent-agent-hub

1. **Navigate to Settings → Secrets and variables → Actions**
2. **Add the following secrets**:

### Required Secrets:
```
GCP_SA_KEY=<base64-encoded-service-account-key>
GCP_PROJECT_ID=<your-gcp-project-id>
FIREBASE_API_KEY=<firebase-api-key>
FIREBASE_AUTH_DOMAIN=<your-project.firebaseapp.com>
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_STORAGE_BUCKET=<your-project.appspot.com>
FIREBASE_MESSAGING_SENDER_ID=<messaging-sender-id>
FIREBASE_APP_ID=<firebase-app-id>
OPENAI_API_KEY=<your-openai-api-key>
GOOGLE_API_KEY=<your-google-api-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
API_URL=<your-backend-url>
FRONTEND_URL=<your-frontend-url>
```

### Firebase Token:
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login and get token
firebase login:ci
```

Add the token as `FIREBASE_TOKEN` secret.

## 🚀 Step 5: Update Configuration

Update your project configuration files with the correct project ID:

### Backend (.env)
```bash
PORT=8080
NODE_ENV=development
FIREBASE_PROJECT_ID=<your-project-id>
OPENAI_API_KEY=<your-openai-api-key>
GOOGLE_API_KEY=<your-google-api-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
FRONTEND_URL=<your-frontend-url>
```

### Frontend (.env)
```bash
VITE_FIREBASE_API_KEY=<firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project.firebaseapp.com>
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project.appspot.com>
VITE_FIREBASE_MESSAGING_SENDER_ID=<messaging-sender-id>
VITE_FIREBASE_APP_ID=<firebase-app-id>
VITE_API_URL=<your-backend-url>
```

## 🔄 Step 6: Test Deployment

1. **Push to GitHub**:
```bash
git add .
git commit -m "Update project configuration"
git push origin main
```

2. **Check GitHub Actions**:
- Go to your repository
- Click on "Actions" tab
- Watch the deployment workflow

## 🧪 Step 7: Local Development

For local development, create `.env` files in both `frontend/` and `backend/` directories with the same values as above.

### Run Locally:
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🔍 Troubleshooting

### Common Issues:

1. **Permission Denied**: Make sure your service account has the right permissions
2. **API Not Enabled**: Enable required APIs in GCP Console
3. **Firebase Token Expired**: Regenerate with `firebase login:ci`
4. **Environment Variables**: Double-check all secrets are set correctly

### Manual Deployment (Fallback):

If GitHub Actions fails, you can deploy manually:

```bash
# Deploy Backend
cd backend
gcloud run deploy agent-backend --source . --region us-central1 --platform managed

# Deploy Frontend
cd frontend
npm run build
firebase deploy --only hosting
```

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Ensure your GCP project has billing enabled
4. Make sure all required APIs are enabled

## 🎉 Success!

Once deployed, your Transparent Agent Hub will be available at:
- **Frontend**: https://your-project-id.web.app
- **Backend**: https://agent-backend-xxxxx-uc.a.run.app

The deployment will automatically trigger on every push to the `main` branch!
