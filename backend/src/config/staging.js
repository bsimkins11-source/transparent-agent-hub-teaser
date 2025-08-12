// Staging Configuration for Agent Hub Backend
module.exports = {
  // Server Configuration
  port: process.env.PORT || 8080,
  nodeEnv: 'staging',
  
  // CORS Configuration
  cors: {
    origin: [
      'https://transparent-ai-staging.web.app',
      'https://transparent-ai-staging.firebaseapp.com',
      'http://localhost:3000',
      'http://localhost:5173' // Vite dev server
    ],
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for staging
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
    level: process.env.LOG_LEVEL || 'debug',
    enableDebug: true,
    enableErrorReporting: true
  },
  
  // Firebase removed - using local services,
  
  // API Keys (set these in environment variables)
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY
  },
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'https://transparent-ai-staging.web.app'
};
