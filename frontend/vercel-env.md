# Vercel Environment Variables Setup

## Required Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

### API Configuration
```
VITE_API_URL=https://your-backend-url.vercel.app
```

### Feature Flags
```
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_LOGGING=true
```

### Build Configuration
```
VITE_APP_NAME="Transparent AI Agent Hub"
VITE_APP_VERSION="1.0.0"
```

## Optional: Remove Backend Dependencies

If you want to run completely frontend-only (recommended for demo):

1. Set `VITE_API_URL=` (empty)
2. The app will use local mock data instead of API calls
3. All functionality will work with local storage

## Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy!
