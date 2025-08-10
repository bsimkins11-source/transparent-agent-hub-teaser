import { IAgentService } from './interfaces/IAgentService';
import { ILibraryService } from './interfaces/ILibraryService';
import { IAgentRegistryService } from './interfaces/IAgentRegistryService';
import { IObservabilityService, IPOCObservabilityService } from './interfaces/IObservabilityService';
import { ITenantSecurityService, IPOCTenantSecurityService } from './interfaces/ITenantSecurityService';
import { IDataSecurityService } from './interfaces/IDataSecurityService';
import { FirebaseAgentService } from './implementations/FirebaseAgentService';
import { FirebaseLibraryService } from './implementations/FirebaseLibraryService';
import { FirebasePOCObservabilityService } from './implementations/FirebasePOCObservabilityService';
import { FirebasePOCAgentRegistryService } from './implementations/FirebasePOCAgentRegistryService';
import { FirebasePOCTenantSecurityService } from './implementations/FirebasePOCTenantSecurityService';
import { DataSecurityService } from './implementations/DataSecurityService';
import { ServiceProvider, ServiceConfig, getServiceConfig } from '../config/services';

class ServiceFactory {
  private static instance: ServiceFactory;
  private config: ServiceConfig = { provider: 'firebase' };

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public configure(config: ServiceConfig): void {
    this.config = config;
    console.log(`ServiceFactory: Configured to use ${config.provider}`);
  }

  // Core Services (Existing)
  public getAgentService(): IAgentService {
    switch (this.config.provider) {
      case 'firebase':
        return new FirebaseAgentService();
      case 'cloudrun':
        // TODO: Implement Cloud Run version
        throw new Error('Cloud Run agent service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  public getLibraryService(): ILibraryService {
    switch (this.config.provider) {
      case 'firebase':
        return new FirebaseLibraryService();
      case 'cloudrun':
        // TODO: Implement Cloud Run version
        throw new Error('Cloud Run library service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  // Enterprise Services (New)
  public getAgentRegistryService(): IAgentRegistryService {
    switch (this.config.provider) {
      case 'firebase':
        return new FirebasePOCAgentRegistryService(); // Use POC implementation
      case 'cloudrun':
        // TODO: Implement Cloud Run Agent Registry Service
        throw new Error('Cloud Run agent registry service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  public getObservabilityService(): IObservabilityService {
    switch (this.config.provider) {
      case 'firebase':
        // TODO: Implement Firebase Observability Service
        throw new Error('Firebase observability service not yet implemented');
      case 'cloudrun':
        // TODO: Implement Cloud Run Observability Service
        throw new Error('Cloud Run observability service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  public getTenantSecurityService(): ITenantSecurityService {
    switch (this.config.provider) {
      case 'firebase':
        // TODO: Implement Firebase Tenant Security Service
        throw new Error('Firebase tenant security service not yet implemented');
      case 'cloudrun':
        // TODO: Implement Cloud Run Tenant Security Service
        throw new Error('Cloud Run tenant security service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  // POC-Ready Services (Simplified versions for rapid development)
  public getPOCObservabilityService(): IPOCObservabilityService {
    switch (this.config.provider) {
      case 'firebase':
        return new FirebasePOCObservabilityService();
      case 'cloudrun':
        // TODO: Implement Cloud Run POC Observability Service
        throw new Error('Cloud Run POC observability service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  public getPOCTenantSecurityService(): IPOCTenantSecurityService {
    switch (this.config.provider) {
      case 'firebase':
        return new FirebasePOCTenantSecurityService(); // Implemented
      case 'cloudrun':
        // TODO: Implement Cloud Run POC Tenant Security Service
        throw new Error('Cloud Run POC tenant security service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  public getDataSecurityService(): IDataSecurityService {
    switch (this.config.provider) {
      case 'firebase':
        return new DataSecurityService();
      case 'cloudrun':
        // TODO: Implement Cloud Run Data Security Service
        throw new Error('Cloud Run data security service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  public getPOCAgentRegistryService(): IAgentRegistryService {
    switch (this.config.provider) {
      case 'firebase':
        return new FirebasePOCAgentRegistryService(); // Implemented
      case 'cloudrun':
        // TODO: Implement Cloud Run POC Agent Registry Service
        throw new Error('Cloud Run POC agent registry service not yet implemented');
      default:
        throw new Error(`Unknown service provider: ${this.config.provider}`);
    }
  }

  // Utility Methods
  public getCurrentProvider(): ServiceProvider {
    return this.config.provider;
  }

  public isCloudRun(): boolean {
    return this.config.provider === 'cloudrun';
  }

  public isFirebase(): boolean {
    return this.config.provider === 'firebase';
  }

  // Service Health Check
  public async checkServiceHealth(): Promise<ServiceHealthStatus> {
    const health: ServiceHealthStatus = {
      provider: this.config.provider,
      services: {},
      overall: 'healthy',
      timestamp: new Date()
    };

    try {
      // Check core services
      const agentService = this.getAgentService();
      const libraryService = this.getLibraryService();
      
      health.services.agentService = 'available';
      health.services.libraryService = 'available';
    } catch (error) {
      health.services.agentService = 'error';
      health.services.libraryService = 'error';
      health.overall = 'degraded';
    }

    return health;
  }
}

// Service Health Status Interface
export interface ServiceHealthStatus {
  provider: ServiceProvider;
  services: Record<string, 'available' | 'error' | 'unavailable'>;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Environment-based configuration
export const initializeServices = (): void => {
  const config = getServiceConfig();
  serviceFactory.configure(config);
};
