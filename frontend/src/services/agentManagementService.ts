// Local agent management service
import { Agent } from '../types/agent';
import { logger } from '../utils/logger';

// Local storage for agents (in-memory for development)
const localAgents: Map<string, Agent> = new Map();

// Initialize with some default agents
const initializeDefaultAgents = () => {
  const defaultAgents: Agent[] = [
    {
      id: 'gemini-chat-agent',
      name: 'Gemini Chat Agent',
      description: 'Google Gemini AI chat assistant for conversations and assistance',
      provider: 'google',
      route: '/api/gemini',
      metadata: {
        tags: ['chat', 'ai', 'google', 'conversation'],
        category: 'Productivity',
        tier: 'free',
        permissionType: 'direct'
      },
      visibility: 'public',
      allowedRoles: ['user'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'imagen-agent',
      name: 'Imagen Agent',
      description: 'Google Imagen AI for image generation and creative tasks',
      provider: 'google',
      route: '/api/imagen',
      metadata: {
        tags: ['image', 'generation', 'ai', 'google', 'creative'],
        category: 'Creative',
        tier: 'premium',
        permissionType: 'approval'
      },
      visibility: 'public',
      allowedRoles: ['user'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  defaultAgents.forEach(agent => {
    localAgents.set(agent.id, agent);
  });

  logger.info(`Initialized ${defaultAgents.length} default agents`, undefined, 'AgentManagementService');
};

// Initialize default agents
initializeDefaultAgents();

export const createAgent = async (agentData: Partial<Agent>): Promise<string> => {
  try {
    logger.debug('Creating new agent', { name: agentData.name }, 'AgentManagementService');
    
    const agentId = `agent-${Date.now()}`;
    const newAgent: Agent = {
      id: agentId,
      name: agentData.name || 'Unnamed Agent',
      description: agentData.description || 'No description provided',
      provider: agentData.provider || 'unknown',
      route: agentData.route || `/api/${agentId}`,
      metadata: {
        tags: agentData.metadata?.tags || [],
        category: agentData.metadata?.category || 'General',
        tier: agentData.metadata?.tier || 'free',
        permissionType: agentData.metadata?.permissionType || 'direct'
      },
      visibility: agentData.visibility || 'public',
      allowedRoles: agentData.allowedRoles || ['user'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localAgents.set(agentId, newAgent);
    
    logger.info('Agent created successfully', { id: agentId, name: newAgent.name }, 'AgentManagementService');
    return agentId;
    
  } catch (error) {
    logger.error('Error creating agent', error, 'AgentManagementService');
    throw error;
  }
};

export const updateAgent = async (id: string, updateData: Partial<Agent>): Promise<void> => {
  try {
    logger.debug('Updating agent', { id }, 'AgentManagementService');
    
    const existingAgent = localAgents.get(id);
    if (!existingAgent) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    const updatedAgent: Agent = {
      ...existingAgent,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localAgents.set(id, updatedAgent);
    
    logger.info('Agent updated successfully', { id }, 'AgentManagementService');
    
  } catch (error) {
    logger.error('Error updating agent', error, 'AgentManagementService');
    throw error;
  }
};

export const deleteAgent = async (id: string): Promise<void> => {
  try {
    logger.debug('Deleting agent', { id }, 'AgentManagementService');
    
    const deleted = localAgents.delete(id);
    if (!deleted) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    logger.info('Agent deleted successfully', { id }, 'AgentManagementService');
    
  } catch (error) {
    logger.error('Error deleting agent', error, 'AgentManagementService');
    throw error;
  }
};

export const getAgent = async (id: string): Promise<Agent | null> => {
  try {
    logger.debug('Fetching agent', { id }, 'AgentManagementService');
    
    const agent = localAgents.get(id);
    if (!agent) {
      logger.info('Agent not found', { id }, 'AgentManagementService');
      return null;
    }
    
    logger.info('Agent fetched successfully', { id, name: agent.name }, 'AgentManagementService');
    return agent;
    
  } catch (error) {
    logger.error('Error fetching agent', error, 'AgentManagementService');
    throw error;
  }
};

export const getAllAgents = async (): Promise<Agent[]> => {
  try {
    logger.debug('Fetching all agents', undefined, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    
    logger.info(`Fetched ${agents.length} agents`, undefined, 'AgentManagementService');
    return agents;
    
  } catch (error) {
    logger.error('Error fetching all agents', error, 'AgentManagementService');
    throw error;
  }
};

export const getAllAgentsForManagement = async (): Promise<Agent[]> => {
  try {
    logger.debug('Fetching all agents for management', undefined, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    
    logger.info(`Fetched ${agents.length} agents for management`, undefined, 'AgentManagementService');
    return agents;
    
  } catch (error) {
    logger.error('Error fetching agents for management', error, 'AgentManagementService');
    throw error;
  }
};

export const getAgentStatistics = async (): Promise<{
  total: number;
  byProvider: { [provider: string]: number };
  byTier: { [tier: string]: number };
  byCategory: { [category: string]: number };
}> => {
  try {
    logger.debug('Fetching agent statistics', undefined, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    
    const stats = {
      total: agents.length,
      byProvider: {} as { [provider: string]: number },
      byTier: {} as { [tier: string]: number },
      byCategory: {} as { [category: string]: number }
    };
    
    agents.forEach(agent => {
      // Count by provider
      stats.byProvider[agent.provider] = (stats.byProvider[agent.provider] || 0) + 1;
      
      // Count by tier
      const tier = agent.metadata?.tier || 'unknown';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
      
      // Count by category
      const category = agent.metadata?.category || 'unknown';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });
    
    logger.info('Agent statistics calculated', { total: stats.total }, 'AgentManagementService');
    return stats;
    
  } catch (error) {
    logger.error('Error calculating agent statistics', error, 'AgentManagementService');
    throw error;
  }
};

export const searchAgents = async (query: string): Promise<Agent[]> => {
  try {
    logger.debug('Searching agents', { query }, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    const searchTerm = query.toLowerCase();
    
    const results = agents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.description.toLowerCase().includes(searchTerm) ||
      agent.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      agent.metadata?.category?.toLowerCase().includes(searchTerm) ||
      agent.provider.toLowerCase().includes(searchTerm)
    );
    
    logger.info(`Found ${results.length} agents matching query`, { query }, 'AgentManagementService');
    return results;
    
  } catch (error) {
    logger.error('Error searching agents', error, 'AgentManagementService');
    throw error;
  }
};

export const getAgentsByCategory = async (category: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching agents by category', { category }, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    const results = agents.filter(agent => 
      agent.metadata?.category?.toLowerCase() === category.toLowerCase()
    );
    
    logger.info(`Found ${results.length} agents in category`, { category }, 'AgentManagementService');
    return results;
    
  } catch (error) {
    logger.error('Error fetching agents by category', error, 'AgentManagementService');
    throw error;
  }
};

export const getAgentsByProvider = async (provider: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching agents by provider', { provider }, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    const results = agents.filter(agent => 
      agent.provider.toLowerCase() === provider.toLowerCase()
    );
    
    logger.info(`Found ${results.length} agents from provider`, { provider }, 'AgentManagementService');
    return results;
    
  } catch (error) {
    logger.error('Error fetching agents by provider', error, 'AgentManagementService');
    throw error;
  }
};

export const getAgentsByTier = async (tier: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching agents by tier', { tier }, 'AgentManagementService');
    
    const agents = Array.from(localAgents.values());
    const results = agents.filter(agent => 
      agent.metadata?.tier?.toLowerCase() === tier.toLowerCase()
    );
    
    logger.info(`Found ${results.length} agents in tier`, { tier }, 'AgentManagementService');
    return results;
    
  } catch (error) {
    logger.error('Error fetching agents by tier', error, 'AgentManagementService');
    throw error;
  }
};

export const assignAgentToTenant = async (agentId: string, tenantId: string): Promise<void> => {
  try {
    logger.debug('Assigning agent to tenant', { agentId, tenantId }, 'AgentManagementService');
    
    // For local development, just log the assignment
    logger.info('Agent assigned to tenant', { agentId, tenantId }, 'AgentManagementService');
    
  } catch (error) {
    logger.error('Error assigning agent to tenant', error, 'AgentManagementService');
    throw error;
  }
};

export const removeAgentFromTenant = async (agentId: string, tenantId: string): Promise<void> => {
  try {
    logger.debug('Removing agent from tenant', { agentId, tenantId }, 'AgentManagementService');
    
    // For local development, just log the removal
    logger.info('Agent removed from tenant', { agentId, tenantId }, 'AgentManagementService');
    
  } catch (error) {
    logger.error('Error removing agent from tenant', error, 'AgentManagementService');
    throw error;
  }
};
