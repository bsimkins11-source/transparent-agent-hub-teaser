import { Agent } from '../types/agent';
import { logger } from '../utils/logger';

// Import local agents data
import localAgentsData from '../data/agents.json';

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
