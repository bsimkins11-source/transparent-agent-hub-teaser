import { Agent } from '../types/agent';
import { logger } from '../utils/logger';

// Import local agents data
import localAgentsData from '../data/agents.json';
// Import fake agents data
import fakeAgentsData from '../data/fakeAgents.json';

/**
 * Service for loading agent data from local sources
 * This is primarily for testing and development purposes
 */
export class AgentDataService {
  
  /**
   * Load agents from local JSON data
   */
  static async loadLocalAgents(): Promise<Agent[]> {
    try {
      logger.info('Loading local agents data', { count: localAgentsData.length }, 'AgentDataService');
      
      // Transform the local data to match the Agent interface
      const agents: Agent[] = localAgentsData.map((agentData: any) => ({
        id: agentData.id,
        name: agentData.name,
        description: agentData.description,
        provider: agentData.provider,
        route: agentData.route,
        icon: agentData.icon,
        metadata: {
          tags: agentData.metadata.tags || [],
          category: agentData.metadata.category || 'General',
          tier: agentData.metadata.tier || 'free',
          permissionType: agentData.metadata.permissionType || 'direct',
          version: agentData.metadata.version,
          promptTemplateId: agentData.metadata.promptTemplateId,
          executionTarget: agentData.metadata.executionTarget,
          testConfig: agentData.metadata.testConfig,
          changelog: agentData.metadata.changelog || []
        },
        visibility: agentData.visibility,
        allowedClients: agentData.allowedClients || [],
        allowedRoles: agentData.allowedRoles || [],
        createdAt: agentData.createdAt || new Date().toISOString(),
        updatedAt: agentData.updatedAt || new Date().toISOString(),
        status: agentData.status || 'approved',
        submitterId: agentData.submitterId,
        submitterEmail: agentData.submitterEmail,
        submitterName: agentData.submitterName,
        submissionDate: agentData.submissionDate,
        reviewedBy: agentData.reviewedBy,
        reviewerEmail: agentData.reviewerEmail,
        reviewerName: agentData.reviewerName,
        approvalDate: agentData.approvalDate,
        rejectionReason: agentData.rejectionReason,
        auditTrail: agentData.auditTrail || [],
        organizationId: agentData.organizationId,
        organizationName: agentData.organizationName,
        networkId: agentData.networkId,
        networkName: agentData.networkName
      }));
      
      logger.info('Successfully loaded local agents', { 
        count: agents.length,
        agentNames: agents.map(a => a.name)
      }, 'AgentDataService');
      
      return agents;
      
    } catch (error) {
      logger.error('Error loading local agents', error, 'AgentDataService');
      throw error;
    }
  }

  /**
   * Load fake agents for demonstration purposes
   */
  static async loadFakeAgents(): Promise<Agent[]> {
    try {
      logger.info('Loading fake agents data', { count: fakeAgentsData.length }, 'AgentDataService');
      
      // Transform the fake data to match the Agent interface
      const fakeAgents: Agent[] = fakeAgentsData.map((agentData: any) => ({
        id: agentData.id,
        name: agentData.name,
        description: agentData.description,
        provider: agentData.provider,
        route: `/fake/${agentData.id}`,
        icon: agentData.icon,
        metadata: {
          tags: agentData.metadata.tags || [],
          category: agentData.metadata.category || 'General',
          tier: agentData.metadata.tier || 'free',
          permissionType: 'direct',
          version: '1.0.0',
          promptTemplateId: `fake-${agentData.id}`,
          executionTarget: 'local',
          testConfig: {},
          changelog: []
        },
        visibility: 'public',
        allowedClients: [],
        allowedRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'approved',
        submitterId: 'fake-system',
        submitterEmail: 'fake@example.com',
        submitterName: 'Fake System',
        submissionDate: new Date().toISOString(),
        reviewedBy: 'fake-system',
        reviewerEmail: 'fake@example.com',
        reviewerName: 'Fake System',
        approvalDate: new Date().toISOString(),
        rejectionReason: '',
        auditTrail: [],
        organizationId: '',
        organizationName: '',
        networkId: '',
        networkName: ''
      }));
      
      logger.info('Successfully loaded fake agents', { 
        count: fakeAgents.length,
        agentNames: fakeAgents.map(a => a.name)
      }, 'AgentDataService');
      
      return fakeAgents;
      
    } catch (error) {
      logger.error('Error loading fake agents', error, 'AgentDataService');
      return [];
    }
  }

  /**
   * Load all agents (local + fake) for the global library
   */
  static async loadAllAgents(): Promise<Agent[]> {
    try {
      const [localAgents, fakeAgents] = await Promise.all([
        this.loadLocalAgents(),
        this.loadFakeAgents()
      ]);
      
      const allAgents = [...localAgents, ...fakeAgents];
      
      logger.info('Successfully loaded all agents', { 
        totalCount: allAgents.length,
        localCount: localAgents.length,
        fakeCount: fakeAgents.length
      }, 'AgentDataService');
      
      return allAgents;
      
    } catch (error) {
      logger.error('Error loading all agents', error, 'AgentDataService');
      // Fallback to just local agents if fake agents fail to load
      return await this.loadLocalAgents();
    }
  }
  
  /**
   * Get a specific agent by ID from local data
   */
  static async getLocalAgentById(id: string): Promise<Agent | null> {
    try {
      const agents = await this.loadLocalAgents();
      const agent = agents.find(a => a.id === id);
      
      if (agent) {
        logger.info('Found local agent', { id, name: agent.name }, 'AgentDataService');
        return agent;
      } else {
        logger.warn('Local agent not found', { id }, 'AgentDataService');
        return null;
      }
      
    } catch (error) {
      logger.error('Error getting local agent by ID', error, 'AgentDataService');
      throw error;
    }
  }
  
  /**
   * Get agents by category from local data
   */
  static async getLocalAgentsByCategory(category: string): Promise<Agent[]> {
    try {
      const agents = await this.loadLocalAgents();
      const filteredAgents = agents.filter(a => 
        a.metadata.category.toLowerCase() === category.toLowerCase()
      );
      
      logger.info('Filtered local agents by category', { 
        category, 
        count: filteredAgents.length 
      }, 'AgentDataService');
      
      return filteredAgents;
      
    } catch (error) {
      logger.error('Error filtering local agents by category', error, 'AgentDataService');
      throw error;
    }
  }
  
  /**
   * Get agents by provider from local data
   */
  static async getLocalAgentsByProvider(provider: string): Promise<Agent[]> {
    try {
      const agents = await this.loadLocalAgents();
      const filteredAgents = agents.filter(a => 
        a.provider.toLowerCase() === provider.toLowerCase()
      );
      
      logger.info('Filtered local agents by provider', { 
        provider, 
        count: filteredAgents.length 
      }, 'AgentDataService');
      
      return filteredAgents;
      
    } catch (error) {
      logger.error('Error filtering local agents by provider', error, 'AgentDataService');
      throw error;
    }
  }
  
  /**
   * Check if local agents are available
   */
  static hasLocalAgents(): boolean {
    return localAgentsData && localAgentsData.length > 0;
  }
  
  /**
   * Get local agents count
   */
  static getLocalAgentsCount(): number {
    return localAgentsData ? localAgentsData.length : 0;
  }
}
