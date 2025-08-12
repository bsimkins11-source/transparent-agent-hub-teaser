// Service Factory for managing service implementations
// This factory allows easy switching between different service providers

import { IAgentService } from './interfaces/IAgentService';
import { ILibraryService } from './interfaces/ILibraryService';
import { IAgentRegistryService } from './interfaces/IAgentRegistryService';
import { IObservabilityService } from './interfaces/IObservabilityService';
import { ISecurityConfigurationService } from './interfaces/ISecurityConfigurationService';
import { ITenantSecurityService } from './interfaces/ITenantSecurityService';

// Import local service implementations
import { localAgentService } from './localAgentService';
import { libraryService } from './libraryService';

// Mock implementations for development
class MockAgentRegistryService implements IAgentRegistryService {
  async registerAgent(agentData: any): Promise<string> {
    console.log('Mock: Registering agent', agentData);
    return 'mock-agent-id';
  }
  
  async getAgent(agentId: string): Promise<any> {
    console.log('Mock: Getting agent', agentId);
    return { id: agentId, name: 'Mock Agent' };
  }
  
  async updateAgent(agentId: string, updates: any): Promise<void> {
    console.log('Mock: Updating agent', agentId, updates);
  }
  
  async deleteAgent(agentId: string): Promise<void> {
    console.log('Mock: Deleting agent', agentId);
  }
  
  async listAgents(): Promise<any[]> {
    console.log('Mock: Listing agents');
    return [];
  }
}

class MockObservabilityService implements IObservabilityService {
  async logEvent(event: string, data: any): Promise<void> {
    console.log('Mock: Logging event', event, data);
  }
  
  async logError(error: Error, context: any): Promise<void> {
    console.log('Mock: Logging error', error, context);
  }
  
  async trackMetric(name: string, value: number): Promise<void> {
    console.log('Mock: Tracking metric', name, value);
  }
}

class MockSecurityConfigurationService implements ISecurityConfigurationService {
  async getSecurityConfig(): Promise<any> {
    console.log('Mock: Getting security config');
    return { enabled: true, level: 'basic' };
  }
  
  async updateSecurityConfig(config: any): Promise<void> {
    console.log('Mock: Updating security config', config);
  }
}

class MockTenantSecurityService implements ITenantSecurityService {
  async getTenantPermissions(tenantId: string): Promise<any> {
    console.log('Mock: Getting tenant permissions', tenantId);
    return { canAccess: true };
  }
  
  async updateTenantPermissions(tenantId: string, permissions: any): Promise<void> {
    console.log('Mock: Updating tenant permissions', tenantId, permissions);
  }
}

class ServiceFactory {
  private agentService: IAgentService;
  private libraryService: ILibraryService;
  private agentRegistryService: IAgentRegistryService;
  private observabilityService: IObservabilityService;
  private securityConfigurationService: ISecurityConfigurationService;
  private tenantSecurityService: ITenantSecurityService;

  constructor() {
    console.log('🔧 Initializing Service Factory with local services');
    
    // Initialize with local services
    this.agentService = localAgentService;
    this.libraryService = libraryService;
    this.agentRegistryService = new MockAgentRegistryService();
    this.observabilityService = new MockObservabilityService();
    this.securityConfigurationService = new MockSecurityConfigurationService();
    this.tenantSecurityService = new MockTenantSecurityService();
  }

  // Agent Service
  getAgentService(): IAgentService {
    return this.agentService;
  }

  // Library Service
  getLibraryService(): ILibraryService {
    return this.libraryService;
  }

  // Agent Registry Service
  getAgentRegistryService(): IAgentRegistryService {
    return this.agentRegistryService;
  }

  // Observability Service
  getObservabilityService(): IObservabilityService {
    return this.observabilityService;
  }

  // Security Configuration Service
  getSecurityConfigurationService(): ISecurityConfigurationService {
    return this.securityConfigurationService;
  }

  // Tenant Security Service
  getTenantSecurityService(): ITenantSecurityService {
    return this.tenantSecurityService;
  }

  // Service provider information
  getCurrentProvider(): string {
    return 'local';
  }

  isLocal(): boolean {
    return true;
  }

  isCloudRun(): boolean {
    return false;
  }

  // Service health check
  async healthCheck(): Promise<{ status: string; services: { [key: string]: string } }> {
    return {
      status: 'healthy',
      services: {
        agentService: 'local',
        libraryService: 'local',
        agentRegistryService: 'mock',
        observabilityService: 'mock',
        securityConfigurationService: 'mock',
        tenantSecurityService: 'mock'
      }
    };
  }
}

// Export singleton instance
export const serviceFactory = new ServiceFactory();

// Export initialization function
export const initializeServices = (): void => {
  console.log('🚀 Services initialized with local implementations');
};

// Export individual services for backward compatibility
export const getAgentService = () => serviceFactory.getAgentService();
export const getLibraryService = () => serviceFactory.getLibraryService();
export const getAgentRegistryService = () => serviceFactory.getAgentRegistryService();
export const getObservabilityService = () => serviceFactory.getObservabilityService();
export const getSecurityConfigurationService = () => serviceFactory.getSecurityConfigurationService();
export const getTenantSecurityService = () => serviceFactory.getTenantSecurityService();
