# 🚀 Staging Environment Setup Guide

## Overview
This guide sets up a **production-grade staging environment** for the Transparent AI Agent Hub using a separate GCP project and Firebase instance.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   PRODUCTION    │    │     STAGING     │
│                 │    │                 │
│ GCP Project:    │    │ GCP Project:    │
│ ai-agent-hub-   │    │ transparent-ai- │
│ web-portal-79fb0│    │ staging         │
│                 │    │                 │
│ Firebase:       │    │ Firebase:       │
│ - Hosting       │    │ - Hosting       │
│ - Firestore     │    │ - Firestore     │
│ - Auth          │    │ - Auth          │
│ - Functions     │    │ - Functions     │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Deploy to Staging
```bash
./deploy-staging.sh
```

### 2. Seed Test Data
```bash
node scripts/seed-staging-data.js
```

### 3. Access Staging
- **URL**: https://transparent-ai-staging.web.app
- **Console**: https://console.firebase.google.com/project/transparent-ai-staging

## ⚙️ Configuration

### Environment Variables
Copy and configure staging environment variables:
```bash
cd frontend
cp env.staging.template .env.staging
# Edit .env.staging with your staging Firebase values
```

### Required Firebase Values
Get these from your staging Firebase project console:
- `VITE_FIREBASE_API_KEY_STAGING`
- `VITE_FIREBASE_SENDER_ID_STAGING`
- `VITE_FIREBASE_APP_ID_STAGING`

## 🔄 Deployment Workflow

### Staging Deployment
```bash
# Deploy to staging
./deploy-staging.sh

# Switch to staging project
firebase use transparent-ai-staging

# View staging
firebase open --project transparent-ai-staging
```

### Production Deployment
```bash
# Deploy to production
./deploy-production.sh

# Switch to production project
firebase use ai-agent-hub-web-portal-79fb0

# View production
firebase open --project ai-agent-hub-web-portal-79fb0
```

## 🧪 Testing in Staging

### Test Accounts
- **User**: test.user@staging.com
- **Admin**: test.admin@staging.com

### Test Data
- **Agents**: Gemini Chat Agent, Test Premium Agent
- **Organizations**: Test Organization
- **Permissions**: Full test hierarchy

## 🔒 Security & Isolation

### What's Isolated
- ✅ **Databases**: Separate Firestore instances
- ✅ **Authentication**: Separate user bases
- ✅ **Hosting**: Separate domains
- ✅ **Functions**: Separate deployments
- ✅ **IAM**: Separate permissions

### What's Shared
- ❌ **Code**: Same codebase, different configs
- ❌ **Secrets**: Different API keys per environment

## 📊 Monitoring & Debugging

### Staging Features
- **Debug Logging**: Enabled by default
- **Error Reporting**: Enhanced for development
- **Analytics**: Disabled to avoid noise

### Production Features
- **Debug Logging**: Disabled for performance
- **Error Reporting**: Production monitoring
- **Analytics**: Full tracking enabled

## 🚨 Troubleshooting

### Common Issues

#### "Not authenticated to staging project"
```bash
firebase login
firebase use transparent-ai-staging
```

#### Build fails with missing environment variables
```bash
cd frontend
cp env.staging.template .env.staging
# Edit .env.staging with your values
```

#### Staging shows production data
- Check that you're using the staging Firebase config
- Verify `VITE_ENVIRONMENT=staging` in build
- Clear browser cache and hard refresh

### Debug Commands
```bash
# Check current Firebase project
firebase projects:list

# Check staging project status
firebase projects:list | grep transparent-ai-staging

# View staging logs
firebase functions:log --project transparent-ai-staging
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Staging
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: ./deploy-staging.sh
```

### Branch Strategy
- `main` → Production deployment
- `staging` → Staging deployment
- `feature/*` → Feature development

## 💰 Cost Management

### Staging Costs
- **Firebase Hosting**: Free tier (10GB storage, 10GB/month transfer)
- **Firestore**: Free tier (1GB storage, 50K reads/day, 20K writes/day)
- **Functions**: Free tier (2M invocations/month)
- **Auth**: Free tier (10K users)

### Cost Optimization
- **Auto-cleanup**: Staging data cleanup scripts
- **Usage monitoring**: Set up billing alerts
- **Resource limits**: Configure quotas for staging

## 📚 Additional Resources

- [Firebase Project Management](https://firebase.google.com/docs/projects/learn-more)
- [GCP Project Best Practices](https://cloud.google.com/architecture/best-practices-for-organizing-cloud-resources)
- [Environment Configuration](https://vitejs.dev/guide/env-and-mode.html)

## 🆘 Support

For staging environment issues:
1. Check this documentation
2. Review Firebase console logs
3. Check environment variable configuration
4. Verify project isolation
