export interface EnvironmentConfig {
  projectId: string;
  environment: 'staging' | 'production';
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enableDebugLogging: boolean;
  };
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const hostname = window.location.hostname;
  console.log('🌍 Detecting environment from hostname:', hostname);
  
  // Detect environment from hostname
  if (hostname.includes('transparent-ai-staging') || hostname.includes('staging')) {
    console.log('🔧 Using STAGING configuration');
    return {
      projectId: 'transparent-ai-staging',
      environment: 'staging',
      firebaseConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY_STAGING || '',
        authDomain: 'transparent-ai-staging.firebaseapp.com',
        projectId: 'transparent-ai-staging',
        storageBucket: 'transparent-ai-staging.appspot.com',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_STAGING || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID_STAGING || ''
      },
      features: {
        enableAnalytics: false, // Disable in staging
        enableErrorReporting: true, // Enable for debugging
        enableDebugLogging: true // Enable verbose logging in staging
      }
    };
  }
  
  // Production configuration - use environment variables from .env file
  console.log('🔧 Using PRODUCTION configuration');
  console.log('🔑 Environment variables:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'
  });
  
  return {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ai-agent-hub-web-portal-79fb0',
    environment: 'production',
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAf2KwetCFEARZiaBP_QW07JVT1_tfZ_IY',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ai-agent-hub-web-portal-79fb0.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ai-agent-hub-web-portal-79fb0',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ai-agent-hub-web-portal-79fb0.firebasestorage.app',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '72861076114',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:72861076114:web:1ea856ad05ef5f0eeef44b'
    },
    features: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enableDebugLogging: false
    }
  };
};

export const isStaging = (): boolean => {
  return getEnvironmentConfig().environment === 'staging';
};

export const isProduction = (): boolean => {
  return getEnvironmentConfig().environment === 'production';
};
