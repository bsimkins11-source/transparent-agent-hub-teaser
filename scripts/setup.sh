#!/bin/bash

echo "🚀 Setting up Transparent Agent Hub..."

# Create environment files
echo "📝 Creating environment files..."

# Frontend .env
cat > frontend/.env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-agent-hub-web-portal
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:8080
EOF

# Backend .env
cat > backend/.env << EOF
# Server Configuration
PORT=8080
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=ai-agent-hub-web-portal

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF

echo "✅ Environment files created!"

# Install dependencies
echo "📦 Installing dependencies..."

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..

echo "✅ Dependencies installed!"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Firebase project at: https://console.firebase.google.com/project/ai-agent-hub-web-portal"
echo "2. Update environment files with your API keys"
echo "3. Run 'npm run dev' in the frontend directory"
echo "4. Run 'npm run dev' in the backend directory"
echo ""
echo "Happy coding! 🚀"
