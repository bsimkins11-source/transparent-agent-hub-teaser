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
  
  // Detect environment from hostname
  if (hostname.includes('transparent-ai-staging') || hostname.includes('staging')) {
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
  
  // Production configuration
  return {
    projectId: 'ai-agent-hub-web-portal-79fb0',
    environment: 'production',
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: 'ai-agent-hub-web-portal-79fb0.firebaseapp.com',
      projectId: 'ai-agent-hub-web-portal-79fb0',
      storageBucket: 'ai-agent-hub-web-portal-79fb0.appspot.com',
              messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
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
