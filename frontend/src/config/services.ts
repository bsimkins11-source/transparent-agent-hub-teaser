export type ServiceProvider = 'firebase' | 'cloudrun';

export interface ServiceConfig {
  provider: ServiceProvider;
  baseUrl?: string; // For Cloud Run
  apiKey?: string;  // For Cloud Run
}

// Environment-based configuration
export const getServiceConfig = (): ServiceConfig => {
  const provider = (import.meta.env.VITE_SERVICE_PROVIDER as ServiceProvider) || 'firebase';
  const baseUrl = import.meta.env.VITE_CLOUD_RUN_BASE_URL;
  const apiKey = import.meta.env.VITE_CLOUD_RUN_API_KEY;

  return {
    provider,
    baseUrl,
    apiKey
  };
};

// Service provider constants
export const SERVICE_PROVIDERS = {
  FIREBASE: 'firebase' as const,
  CLOUD_RUN: 'cloudrun' as const,
} as const;

// Default configuration
export const DEFAULT_SERVICE_CONFIG: ServiceConfig = {
  provider: 'firebase'
};
