// Production Configuration for Agent Hub Backend
module.exports = {
  // Server Configuration
  port: process.env.PORT || 8080,
  nodeEnv: 'production',
  
  // CORS Configuration
  cors: {
    origin: [
      'https://ai-agent-hub-web-portal-79fb0.web.app',
      'https://ai-agent-hub-web-portal-79fb0.firebaseapp.com'
    ],
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Security
  security: {
    helmet: true,
    compression: true,
    trustProxy: true
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableDebug: false,
    enableErrorReporting: true
  },
  
  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'ai-agent-hub-web-portal-79fb0'
  },
  
  // API Keys (set these in environment variables)
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY
  },
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'https://ai-agent-hub-web-portal-79fb0.web.app'
};
