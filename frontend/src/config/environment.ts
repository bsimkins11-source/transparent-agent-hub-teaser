export interface EnvironmentConfig {
  projectId: string;
  environment: 'staging' | 'production';
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
  if (hostname.includes('vercel.app') || hostname.includes('localhost')) {
    console.log('🔧 Using VERCEL/DEVELOPMENT configuration');
    return {
      projectId: 'transparent-ai-hub-vercel',
      environment: 'production',
      features: {
        enableAnalytics: false, // Disable for demo
        enableErrorReporting: true, // Enable for debugging
        enableDebugLogging: true // Enable verbose logging for demo
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
        enableDebugLogging: true // Enable verbose logging in staging
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
