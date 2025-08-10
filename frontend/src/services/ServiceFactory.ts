import { IAgentRegistryService } from './interfaces/IAgentRegistryService';
import { EnhancedAgentRegistryService } from './implementations/EnhancedAgentRegistryService';
import { FirebasePOCAgentRegistryService } from './implementations/FirebasePOCAgentRegistryService';
import { IAgentService } from './interfaces/IAgentService';
import { FirebaseAgentService } from './implementations/FirebaseAgentService';
import { ILibraryService } from './interfaces/ILibraryService';
import { FirebaseLibraryService } from './implementations/FirebaseLibraryService';
import { IObservabilityService } from './interfaces/IObservabilityService';
import { FirebasePOCObservabilityService } from './implementations/FirebasePOCObservabilityService';
import { ISecurityConfigurationService } from './interfaces/ISecurityConfigurationService';
import { FirebasePOCSecurityConfigurationService } from './implementations/FirebasePOCSecurityConfigurationService';
import { IDataSecurityService } from './interfaces/IDataSecurityService';
import { DataSecurityService } from './implementations/DataSecurityService';
import { ITenantSecurityService } from './interfaces/ITenantSecurityService';
import { FirebasePOCTenantSecurityService } from './implementations/FirebasePOCTenantSecurityService';

// Enhanced configuration interface for better service management
export interface ServiceConfiguration {
  readonly environment: 'development' | 'staging' | 'production';
  readonly enableCaching: boolean;
  readonly enableMetrics: boolean;
  readonly enableAuditLogging: boolean;
  readonly cacheConfig: {
    readonly maxSize: number;
    readonly ttl: number;
    readonly cleanupInterval: number;
  };
  readonly performanceConfig: {
    readonly batchSize: number;
    readonly batchTimeout: number;
    readonly maxConcurrentRequests: number;
  };
  readonly securityConfig: {
    readonly enableEncryption: boolean;
    readonly enableAccessControl: boolean;
    readonly enableCompliance: boolean;
  };
}

// Default configuration for different environments
export const DEFAULT_CONFIGURATIONS: Record<string, ServiceConfiguration> = {
  development: {
    environment: 'development',
    enableCaching: true,
    enableMetrics: true,
    enableAuditLogging: true,
    cacheConfig: {
      maxSize: 100,
      ttl: 2 * 60 * 1000, // 2 minutes
      cleanupInterval: 30 * 1000 // 30 seconds
    },
    performanceConfig: {
      batchSize: 100,
      batchTimeout: 50,
      maxConcurrentRequests: 5
    },
    securityConfig: {
      enableEncryption: false,
      enableAccessControl: true,
      enableCompliance: true
    }
  },
  staging: {
    environment: 'staging',
    enableCaching: true,
    enableMetrics: true,
    enableAuditLogging: true,
    cacheConfig: {
      maxSize: 500,
      ttl: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000 // 1 minute
    },
    performanceConfig: {
      batchSize: 250,
      batchTimeout: 100,
      maxConcurrentRequests: 10
    },
    securityConfig: {
      enableEncryption: true,
      enableAccessControl: true,
      enableCompliance: true
    }
  },
  production: {
    environment: 'production',
    enableCaching: true,
    enableMetrics: true,
    enableAuditLogging: true,
    cacheConfig: {
      maxSize: 1000,
      ttl: 10 * 60 * 1000, // 10 minutes
      cleanupInterval: 2 * 60 * 1000 // 2 minutes
    },
    performanceConfig: {
      batchSize: 500,
      batchTimeout: 200,
      maxConcurrentRequests: 20
    },
    securityConfig: {
      enableEncryption: true,
      enableAccessControl: true,
      enableCompliance: true
    }
  }
};

// Enhanced service factory with better configuration management and dependency injection
export class EnhancedServiceFactory {
  private static instance: EnhancedServiceFactory;
  private readonly services = new Map<string, unknown>();
  private readonly configuration: ServiceConfiguration;

  private constructor(configuration?: Partial<ServiceConfiguration>) {
    // Determine environment from configuration or environment variables
    const env = configuration?.environment || 
                (import.meta.env?.MODE as keyof typeof DEFAULT_CONFIGURATIONS) || 
                'development';
    
    this.configuration = {
      ...DEFAULT_CONFIGURATIONS[env],
      ...configuration
    };

    console.log(`ServiceFactory initialized with ${env} configuration:`, this.configuration);
  }

  // Singleton pattern with configuration support
  public static getInstance(configuration?: Partial<ServiceConfiguration>): EnhancedServiceFactory {
    if (!EnhancedServiceFactory.instance) {
      EnhancedServiceFactory.instance = new EnhancedServiceFactory(configuration);
    }
    return EnhancedServiceFactory.instance;
  }

  // Get configuration for external use
  public getConfiguration(): Readonly<ServiceConfiguration> {
    return this.configuration;
  }

  // Enhanced agent registry service with configuration-based initialization
  public getAgentRegistryService(): IAgentRegistryService {
    const cacheKey = 'agentRegistryService';
    
    if (!this.services.has(cacheKey)) {
      let service: IAgentRegistryService;
      
      if (this.configuration.environment === 'production' || this.configuration.environment === 'staging') {
        // Use enhanced service for production and staging
        service = new EnhancedAgentRegistryService();
        console.log('Using EnhancedAgentRegistryService for', this.configuration.environment);
      } else {
        // Use POC service for development
        service = new FirebasePOCAgentRegistryService();
        console.log('Using FirebasePOCAgentRegistryService for development');
      }
      
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IAgentRegistryService;
  }

  // Enhanced agent service with better error handling
  public getAgentService(): IAgentService {
    const cacheKey = 'agentService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebaseAgentService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IAgentService;
  }

  // Enhanced library service
  public getLibraryService(): ILibraryService {
    const cacheKey = 'libraryService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebaseLibraryService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as ILibraryService;
  }

  // Enhanced observability service
  public getObservabilityService(): IObservabilityService {
    const cacheKey = 'observabilityService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebasePOCObservabilityService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IObservabilityService;
  }

  // Enhanced security configuration service
  public getSecurityConfigurationService(): ISecurityConfigurationService {
    const cacheKey = 'securityConfigurationService';
    
    if (!this.services.has(cacheKey)) {
      let service: ISecurityConfigurationService;
      
      if (this.configuration.securityConfig.enableEncryption) {
        service = new FirebasePOCSecurityConfigurationService();
      } else {
        service = new FirebasePOCSecurityConfigurationService();
      }
      
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as ISecurityConfigurationService;
  }

  // Enhanced data security service
  public getDataSecurityService(): IDataSecurityService {
    const cacheKey = 'dataSecurityService';
    
    if (!this.services.has(cacheKey)) {
      const service = new DataSecurityService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IDataSecurityService;
  }

  // Enhanced tenant security service
  public getTenantSecurityService(): ITenantSecurityService {
    const cacheKey = 'tenantSecurityService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebasePOCTenantSecurityService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as ITenantSecurityService;
  }

  // Method to clear all services (useful for testing or reconfiguration)
  public clearServices(): void {
    this.services.clear();
    console.log('All services cleared from factory');
  }

  // Method to get service status and health
  public getServiceHealth(): Record<string, { status: 'healthy' | 'unhealthy' | 'unknown'; lastCheck: Date }> {
    const health: Record<string, { status: 'healthy' | 'unhealthy' | 'unknown'; lastCheck: Date }> = {};
    
    for (const [serviceName, service] of this.services.entries()) {
      try {
        // Basic health check - could be enhanced with actual health checks
        if (service && typeof service === 'object') {
          health[serviceName] = {
            status: 'healthy',
            lastCheck: new Date()
          };
        } else {
          health[serviceName] = {
            status: 'unhealthy',
            lastCheck: new Date()
          };
        }
      } catch (error) {
        health[serviceName] = {
          status: 'unhealthy',
          lastCheck: new Date()
        };
      }
    }
    
    return health;
  }

  // Method to reconfigure services (useful for runtime configuration changes)
  public reconfigure(newConfiguration: Partial<ServiceConfiguration>): void {
    const oldConfig = { ...this.configuration };
    
    // Update configuration
    Object.assign(this.configuration, newConfiguration);
    
    // Clear services that might be affected by configuration changes
    if (newConfiguration.cacheConfig || newConfiguration.performanceConfig) {
      this.services.delete('agentRegistryService');
      console.log('Agent registry service cleared due to configuration change');
    }
    
    if (newConfiguration.securityConfig) {
      this.services.delete('securityConfigurationService');
      this.services.delete('dataSecurityService');
      this.services.delete('tenantSecurityService');
      console.log('Security services cleared due to configuration change');
    }
    
    console.log('Service factory reconfigured:', {
      from: oldConfig,
      to: this.configuration
    });
  }

  // Method to get service metrics
  public getServiceMetrics(): Record<string, unknown> {
    const metrics: Record<string, unknown> = {
      totalServices: this.services.size,
      configuration: this.configuration,
      health: this.getServiceHealth(),
      cacheStats: this.getCacheStats()
    };
    
    return metrics;
  }

  // Private method to get cache statistics
  private getCacheStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {};
    
    try {
      const agentRegistryService = this.services.get('agentRegistryService');
      if (agentRegistryService && 'getRegistryStats' in agentRegistryService) {
        // This would need to be implemented in the service to expose cache stats
        stats.agentRegistryCache = 'available';
      }
    } catch (error) {
      stats.agentRegistryCache = 'error';
    }
    
    return stats;
  }
}

// Legacy factory for backward compatibility
export class ServiceFactory {
  private static instance: ServiceFactory;
  private readonly services = new Map<string, unknown>();

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public getAgentRegistryService(): IAgentRegistryService {
    const cacheKey = 'agentRegistryService';
    
    if (!this.services.has(cacheKey)) {
      // Use enhanced service by default
      const service = new EnhancedAgentRegistryService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IAgentRegistryService;
  }

  public getAgentService(): IAgentService {
    const cacheKey = 'agentService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebaseAgentService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IAgentService;
  }

  public getLibraryService(): ILibraryService {
    const cacheKey = 'libraryService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebaseLibraryService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as ILibraryService;
  }

  public getObservabilityService(): IObservabilityService {
    const cacheKey = 'observabilityService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebasePOCObservabilityService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IObservabilityService;
  }

  public getSecurityConfigurationService(): ISecurityConfigurationService {
    const cacheKey = 'securityConfigurationService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebasePOCSecurityConfigurationService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as ISecurityConfigurationService;
  }

  public getDataSecurityService(): IDataSecurityService {
    const cacheKey = 'dataSecurityService';
    
    if (!this.services.has(cacheKey)) {
      const service = new DataSecurityService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as IDataSecurityService;
  }

  public getTenantSecurityService(): ITenantSecurityService {
    const cacheKey = 'tenantSecurityService';
    
    if (!this.services.has(cacheKey)) {
      const service = new FirebasePOCTenantSecurityService();
      this.services.set(cacheKey, service);
    }
    
    return this.services.get(cacheKey) as ITenantSecurityService;
  }
}

// Export both factories for different use cases
export { EnhancedServiceFactory as ServiceFactoryV2 };
export default ServiceFactory;
