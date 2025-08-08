# 🚀 Setup Guide - ai-agent-hub-web-portal-79fb0

This guide is specifically for your Firebase project: `ai-agent-hub-web-portal-79fb0`

## 📋 Step 1: Firebase Configuration

### 1.1 Get Firebase Config
1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/ai-agent-hub-web-portal-79fb0/overview)
2. Click on the gear icon (⚙️) next to "Project Overview"
3. Select "Project settings"
4. Scroll down to "Your apps" section
5. Click "Add app" → "Web app" (</>)
6. Register app with name "Transparent Agent Hub"
7. Copy the config values

### 1.2 Enable Firebase Services
In your Firebase project, enable these services:

1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)

3. **Hosting**:
   - Go to Hosting
   - Click "Get started"
   - Follow the setup instructions

## 🔧 Step 2: Environment Variables

Create these `.env` files with your Firebase config values:

### Frontend (.env)
```bash
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=ai-agent-hub-web-portal-79fb0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-agent-hub-web-portal-79fb0
VITE_FIREBASE_STORAGE_BUCKET=ai-agent-hub-web-portal-79fb0.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:8080
```

### Backend (.env)
```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=ai-agent-hub-web-portal-79fb0

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🔑 Step 3: GCP Setup (Manual)

Since we have permission issues with gcloud CLI, let's set up GCP manually:

### 3.1 Enable APIs via Web Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `ai-agent-hub-web-portal-79fb0`
3. Enable these APIs:
   - Cloud Run API
   - Cloud Build API
   - Firestore API (should already be enabled via Firebase)

### 3.2 Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `github-actions`
4. Description: `Service account for GitHub Actions deployment`
5. Click "Create and Continue"
6. Grant these roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin
   - Firebase Admin
7. Click "Done"

### 3.3 Create Service Account Key
1. Click on the `github-actions` service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Download the key file
6. Base64 encode it:
   ```bash
   base64 -i path/to/downloaded/key.json
   ```

## 🔐 Step 4: GitHub Secrets

Go to: https://github.com/bsimkins11/transparent-agent-hub/settings/secrets/actions

Add these secrets:

### Required Secrets:
```
GCP_SA_KEY=<base64-encoded-service-account-key>
GCP_PROJECT_ID=ai-agent-hub-web-portal-79fb0
FIREBASE_API_KEY=<from-firebase-console>
FIREBASE_AUTH_DOMAIN=ai-agent-hub-web-portal-79fb0.firebaseapp.com
FIREBASE_PROJECT_ID=ai-agent-hub-web-portal-79fb0
FIREBASE_STORAGE_BUCKET=ai-agent-hub-web-portal-79fb0.appspot.com
FIREBASE_MESSAGING_SENDER_ID=<from-firebase-console>
FIREBASE_APP_ID=<from-firebase-console>
OPENAI_API_KEY=<your-openai-api-key>
GOOGLE_API_KEY=<your-google-api-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
API_URL=https://agent-backend-xxxxx-uc.a.run.app
FRONTEND_URL=https://ai-agent-hub-web-portal-79fb0.web.app
```

### Firebase Token:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and get token
firebase login:ci
```

Add the token as `FIREBASE_TOKEN` secret.

## 🚀 Step 5: Test Local Development

### 5.1 Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5.2 Run Locally
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 🔄 Step 6: Deploy

### 6.1 Push to GitHub
```bash
git add .
git commit -m "Update configuration for ai-agent-hub-web-portal-79fb0"
git push origin main
```

### 6.2 Check Deployment
- Go to your GitHub repository
- Click "Actions" tab
- Watch the deployment workflow

## 🎉 Success URLs

Once deployed, your app will be available at:
- **Frontend**: https://ai-agent-hub-web-portal-79fb0.web.app
- **Backend**: https://agent-backend-xxxxx-uc.a.run.app

## 🔍 Troubleshooting

### Common Issues:
1. **Permission Denied**: Make sure you're the owner of the Firebase project
2. **API Not Enabled**: Enable APIs in Google Cloud Console
3. **Environment Variables**: Double-check all values match Firebase config
4. **Service Account**: Ensure the service account has the right permissions

### Manual Deployment (if GitHub Actions fails):
```bash
# Deploy Backend
cd backend
gcloud run deploy agent-backend --source . --region us-central1 --platform managed

# Deploy Frontend
cd frontend
npm run build
firebase deploy --only hosting
```

## 📞 Next Steps

1. **Get Firebase Config**: Follow Step 1.1 to get your config values
2. **Set Environment Variables**: Create the .env files
3. **Enable GCP APIs**: Use the web console
4. **Add GitHub Secrets**: Copy the values from Firebase
5. **Test Locally**: Run the development servers
6. **Deploy**: Push to GitHub and watch the magic happen!

Your project is ready to go! 🚀
