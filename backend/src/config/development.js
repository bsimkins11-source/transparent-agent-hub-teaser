// Development Configuration for Agent Hub Backend
module.exports = {
  // Server Configuration
  port: process.env.PORT || 8080,
  nodeEnv: 'development',
  
  // CORS Configuration - Allow localhost for development
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    credentials: true
  },
  
  // Rate Limiting - More lenient for development
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Security
  security: {
    helmet: true,
    compression: true,
    trustProxy: false
  },
  
  // Logging - More verbose for development
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
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};
