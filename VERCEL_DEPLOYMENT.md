# 🚀 Vercel Deployment Guide

## Quick Start

### Option 1: Use the Script (Recommended)
```bash
# Full initialization with checks
npm run vercel:init

# Quick initialization
npm run vercel:quick

# Or just run the script directly
./vercel-init.sh
```

### Option 2: Manual Steps
```bash
# 1. Initialize Git (if not already done)
git init

# 2. Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/transparent-agent-hub.git

# 3. Install frontend dependencies
cd frontend && npm install

# 4. Test build
npm run build

# 5. Go to vercel.com and import your repository
```

## 🎯 Vercel Configuration

**Root Directory**: `frontend`  
**Build Command**: `npm run build`  
**Output Directory**: `dist`  
**Framework**: Vite (auto-detected)

## 📋 What the Script Does

✅ **Git Setup**: Initializes Git repository if needed  
✅ **Dependencies**: Installs frontend npm packages  
✅ **Build Test**: Verifies the app builds successfully  
✅ **Firebase Check**: Ensures no Firebase errors  
✅ **Configuration**: Creates/verifies vercel.json  
✅ **Checklist**: Generates deployment checklist  

## 🔗 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `transparent-agent-hub` repository
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

## 🎉 After Deployment

Your app will be live at: `https://your-project.vercel.app`

Every push to `main` branch triggers automatic deployment!

## 🐛 Troubleshooting

- **Build fails**: Check Vercel build logs
- **Firebase errors**: Should be completely suppressed
- **Missing files**: Run `npm run vercel:init` to verify setup

## 📱 Features Ready

- ✅ Super Admin Dashboard
- ✅ Coca-Cola Library with branding
- ✅ Company Libraries
- ✅ Agent Management
- ✅ Responsive Design
- ✅ No Firebase dependencies
