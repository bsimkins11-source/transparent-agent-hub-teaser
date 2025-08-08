# Transparent Agent Hub

A fully functional agent marketplace for transparent partners, built with modern web technologies and deployed on Google Cloud Platform.

## 🚀 Project Overview

This is a modular agent hub that allows users to discover, interact with, and manage AI agents. Built with React, Firebase, and Cloud Run, featuring a transparent design aesthetic inspired by modern marketplace UIs.

## 🏗️ Architecture

- **Frontend**: React with TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js/Express with Cloud Run
- **Database**: Firestore (Native mode)
- **Authentication**: Firebase Auth with custom claims
- **Deployment**: Firebase Hosting + Cloud Run
- **CI/CD**: GitHub Actions

## 📋 V1 Features

- ✅ Agent library with tile-based UI
- ✅ Individual agent pages with chat interfaces
- ✅ Multi-model agent support (OpenAI, Google, Anthropic)
- ✅ Role-based access control (admin/client)
- ✅ Firebase authentication
- ✅ Responsive, modern UI with transparent design
- ✅ Search and filtering capabilities
- ✅ Real-time chat interactions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Firebase Admin
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Firebase Hosting, Cloud Run
- **APIs**: OpenAI, Google Gemini, Anthropic Claude
- **UI/UX**: Framer Motion, Heroicons, React Hot Toast

## 📁 Project Structure

```
/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── types/      # TypeScript types
│   │   └── contexts/   # React contexts
│   └── public/         # Static assets
├── backend/           # Cloud Run API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── middleware/# Express middleware
│   │   ├── services/  # Business logic
│   │   └── models/    # Data models
├── firebase/          # Firebase configuration
├── scripts/           # Utility scripts
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- GCP project with Cloud Run enabled

### 1. Clone and Setup

```bash
git clone https://github.com/bsimkins11/transparent-agent-hub.git
cd transparent-agent-hub
```

### 2. Environment Configuration

Create environment files:

**Frontend (.env)**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-agent-hub-web-portal
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:8080
```

**Backend (.env)**
```bash
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
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/project/ai-agent-hub-web-portal)
2. Enable Authentication (Email/Password + Google)
3. Enable Firestore Database
4. Enable Hosting
5. Download service account key for backend

### 5. Run Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🚀 Deployment

### GitHub Actions (Recommended)

1. Fork this repository
2. Add the following secrets to your GitHub repository:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `API_URL`
   - `GCP_SA_KEY` (Base64 encoded service account key)
   - `GCP_PROJECT_ID`
   - `OPENAI_API_KEY`
   - `GOOGLE_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `FIREBASE_TOKEN`
   - `FRONTEND_URL`

3. Push to main branch to trigger deployment

### Manual Deployment

```bash
# Deploy Backend
cd backend
gcloud run deploy agent-backend --source . --region us-central1 --platform managed

# Deploy Frontend
cd frontend
npm run build
firebase deploy --only hosting
```

## 🧪 Development

### Adding New Agents

1. Create agent configuration in Firestore
2. Add agent logic in `backend/src/services/agentService.js`
3. Update agent configurations in the service

### Customizing UI

- Colors and branding: `frontend/tailwind.config.js`
- Components: `frontend/src/components/`
- Pages: `frontend/src/pages/`

### API Endpoints

- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents/:id/interact` - Interact with agent
- `GET /api/admin/*` - Admin endpoints (protected)

## 📝 Development Status

- [x] Project structure setup
- [x] Firebase configuration
- [x] Backend API development
- [x] Frontend UI development
- [x] Agent integrations
- [x] Authentication system
- [x] Admin panel (basic)
- [x] Deployment configuration
- [ ] Advanced admin features
- [ ] Analytics dashboard
- [ ] User management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by modern agent marketplaces
- Built with transparent design principles
- Powered by Google Cloud Platform
