export interface EnvironmentConfig {
  projectId: string;
  environment: 'staging' | 'production' | 'vercel';
  features: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enableDebugLogging: boolean;
    firebaseEnabled: boolean;
  };
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const hostname = window.location.hostname;
  console.log('🌍 Detecting environment from hostname:', hostname);
  
  // Detect environment from hostname
  if (hostname.includes('vercel.app') || hostname.includes('localhost')) {
    console.log('🔧 Using VERCEL/DEVELOPMENT configuration');
    return {
      projectId: 'transparent-ai-hub-vercel',
      environment: 'vercel',
      features: {
        enableAnalytics: false, // Disable for demo
        enableErrorReporting: true, // Enable for debugging
        enableDebugLogging: true, // Enable verbose logging for demo
        firebaseEnabled: false // Firebase disabled for Vercel
      }
    };
  } else if (hostname.includes('transparent-ai-staging') || hostname.includes('staging')) {
    console.log('🔧 Using STAGING configuration');
    return {
      projectId: 'transparent-ai-staging',
      environment: 'staging',
      features: {
        enableAnalytics: false, // Disable in staging
        enableErrorReporting: true, // Enable for debugging
        enableDebugLogging: true, // Enable verbose logging in staging
        firebaseEnabled: false // Firebase disabled for staging
      }
    };
  }
  
  // Production configuration
  console.log('🔧 Using PRODUCTION configuration');
  
  return {
    projectId: 'transparent-ai-hub',
    environment: 'production',
    features: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enableDebugLogging: false,
      firebaseEnabled: false // Firebase disabled for production
    }
  };
};

export const isStaging = (): boolean => {
  return getEnvironmentConfig().environment === 'staging';
};

export const isProduction = (): boolean => {
  return getEnvironmentConfig().environment === 'production';
};

export const isVercel = (): boolean => {
  return getEnvironmentConfig().environment === 'vercel';
};

export const isFirebaseEnabled = (): boolean => {
  return getEnvironmentConfig().features.firebaseEnabled;
};

// Global error handler to catch any Firebase-related errors
export const setupGlobalErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Prevent Firebase modules from loading
    (window as any).firebase = undefined;
    (window as any).firebaseApp = undefined;
    
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && event.error.message.includes('firebase')) {
        console.warn('🚫 Firebase error caught and suppressed:', event.error.message);
        event.preventDefault();
        return false;
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('firebase')) {
        console.warn('🚫 Firebase promise rejection caught and suppressed:', event.reason.message);
        event.preventDefault();
        return false;
      }
    });
  }
};
