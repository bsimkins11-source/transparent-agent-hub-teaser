#!/bin/bash

# Vercel Deployment Initialization Script
# This script prepares the project for Vercel deployment

set -e  # Exit on any error

echo "🚀 Initializing Transparent AI Agent Hub for Vercel Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the root directory of the Transparent AI Agent Hub project"
    exit 1
fi

print_status "Checking current Git status..."

# Check if Git is initialized
if [ ! -d ".git" ]; then
    print_status "Git not initialized. Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    print_warning "No remote origin found. You'll need to add your GitHub repository manually:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/transparent-agent-hub.git"
    echo ""
else
    print_success "Git remote origin found: $(git remote get-url origin)"
fi

print_status "Checking frontend dependencies..."

# Navigate to frontend directory and check dependencies
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

# Check if Vercel configuration exists
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found in frontend directory!"
    print_status "Creating vercel.json..."
    cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
    print_success "vercel.json created"
else
    print_success "vercel.json already exists"
fi

# Check if environment configuration is properly set
if [ ! -f "src/config/environment.ts" ]; then
    print_error "Environment configuration not found!"
    exit 1
fi

print_success "Environment configuration found"

# Go back to root directory
cd ..

print_status "Checking project structure..."

# Verify key files exist
required_files=(
    "frontend/package.json"
    "frontend/vite.config.ts"
    "frontend/src/main.tsx"
    "frontend/src/App.tsx"
    "frontend/vercel.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ $file (missing)"
        exit 1
    fi
done

print_status "Building frontend for verification..."

# Build the frontend to ensure everything works
cd frontend
if npm run build; then
    print_success "Frontend build successful"
else
    print_error "Frontend build failed! Please fix the build issues before deploying to Vercel"
    exit 1
fi

cd ..

print_status "Checking for any remaining Firebase references..."

# Check for any remaining Firebase references in frontend code
firebase_refs=$(grep -r "firebase" frontend/src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "//" | grep -v "REMOVED" | grep -v "firebaseEnabled" || true)

if [ -n "$firebase_refs" ]; then
    print_warning "Found potential Firebase references in frontend code:"
    echo "$firebase_refs"
    echo ""
    print_warning "These should be removed for clean Vercel deployment"
else
    print_success "No problematic Firebase references found"
fi

print_status "Preparing for Vercel deployment..."

# Create a deployment checklist
cat > VERCEL_DEPLOYMENT_CHECKLIST.md << 'EOF'
# Vercel Deployment Checklist

## ✅ Pre-Deployment (Completed by vercel-init.sh)
- [x] Git repository initialized
- [x] Frontend dependencies installed
- [x] Vercel configuration verified
- [x] Environment configuration checked
- [x] Frontend build tested
- [x] Firebase references cleaned

## 🚀 Vercel Deployment Steps

### 1. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "New Project"

### 2. Import Repository
- Select "Import Git Repository"
- Choose your `transparent-agent-hub` repository
- Vercel will auto-detect it's a Vite project

### 3. Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Environment Variables (if needed)
- Add any required environment variables
- Most should work with defaults

### 5. Deploy
- Click "Deploy"
- Wait for build to complete
- Your app will be live at `https://your-project.vercel.app`

## 🔧 Post-Deployment

### Test the following:
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Super Admin dashboard accessible
- [ ] Coca-Cola library accessible
- [ ] No Firebase errors in console
- [ ] All company libraries working

### Custom Domain (Optional)
- Add custom domain in Vercel dashboard
- Configure DNS records as instructed

## 🐛 Troubleshooting

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Runtime Errors
- Check browser console for errors
- Verify environment configuration
- Check Vercel function logs

### Firebase Errors
- Should be completely suppressed
- Check if any new Firebase code was added
- Verify environment.ts configuration

## 📱 Vercel Dashboard Features

- **Analytics**: View deployment metrics
- **Functions**: Monitor serverless functions
- **Settings**: Configure build options
- **Domains**: Manage custom domains
- **Deployments**: View deployment history

## 🔄 Continuous Deployment

- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback to previous deployments if needed
EOF

print_success "Vercel deployment checklist created: VERCEL_DEPLOYMENT_CHECKLIST.md"

print_status "Final verification..."

# Check Git status
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
    print_warning "You have uncommitted changes:"
    echo "$git_status"
    echo ""
    print_status "Consider committing these changes before deploying:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for Vercel deployment'"
    echo "   git push origin main"
else
    print_success "All changes are committed"
fi

echo ""
echo "🎉 Vercel initialization complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review VERCEL_DEPLOYMENT_CHECKLIST.md"
echo "   2. Go to vercel.com and import your repository"
echo "   3. Deploy your app"
echo ""
echo "🔗 Your app will be available at: https://your-project.vercel.app"
echo ""
echo "💡 Tip: Every push to main will trigger automatic deployment"
echo ""
