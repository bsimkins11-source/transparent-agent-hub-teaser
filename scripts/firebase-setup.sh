#!/bin/bash

echo "🔥 Setting up Firebase for Transparent Agent Hub..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Initialize Firebase in the project
echo "📁 Initializing Firebase project..."
cd firebase

# Create .firebaserc file
cat > .firebaserc << EOF
{
  "projects": {
    "default": "ai-agent-hub-web-portal"
  }
}
EOF

echo "✅ Firebase configuration created!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/ai-agent-hub-web-portal"
echo "2. Enable Authentication (Email/Password + Google)"
echo "3. Enable Firestore Database"
echo "4. Enable Hosting"
echo "5. Get your Firebase config values for environment variables"
echo ""
echo "🔗 Firebase Console: https://console.firebase.google.com/project/ai-agent-hub-web-portal"
