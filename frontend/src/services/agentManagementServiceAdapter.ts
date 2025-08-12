import { serviceFactory } from './ServiceFactory';
import { IAgentService, CreateAgentRequest, UpdateAgentRequest, AgentStats } from './interfaces/IAgentService';
import { logger } from '../utils/logger';

/**
 * Agent Management Service Adapter
 * 
 * This adapter provides the same interface as the old agentManagementService.ts
 * but uses the new service factory for easy migration between different backends.
 * 
 * Usage:
 * - For POC: Uses local services (fast development)
 * - For Production: Can easily switch to Cloud Run (scalable)
 */

// Get the appropriate service implementation
const getAgentService = (): IAgentService => {
  return serviceFactory.getAgentService();
};

/**
 * Create a new agent in the master library
 */
export const createAgent = async (agentData: CreateAgentRequest): Promise<string> => {
  try {
    logger.debug('Creating new agent via service factory', { 
      name: agentData.name,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.createAgent(agentData);
    
  } catch (error) {
    logger.error('Error creating agent via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Update an existing agent
 */
export const updateAgent = async (updateData: UpdateAgentRequest): Promise<void> => {
  try {
    logger.debug('Updating agent via service factory', { 
      id: updateData.id,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    await agentService.updateAgent(updateData);
    
  } catch (error) {
    logger.error('Error updating agent via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Delete an agent from the master library
 */
export const deleteAgent = async (agentId: string): Promise<void> => {
  try {
    logger.debug('Deleting agent via service factory', { 
      id: agentId,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    await agentService.deleteAgent(agentId);
    
  } catch (error) {
    logger.error('Error deleting agent via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Get a single agent by ID
 */
export const getAgent = async (agentId: string) => {
  try {
    logger.debug('Getting agent via service factory', { 
      id: agentId,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.getAgent(agentId);
    
  } catch (error) {
    logger.error('Error getting agent via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Get all agents for management purposes
 */
export const getAllAgentsForManagement = async () => {
  try {
    logger.debug('Getting all agents for management via service factory', { 
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.getAllAgentsForManagement();
    
  } catch (error) {
    logger.error('Error getting agents for management via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Get agent statistics
 */
export const getAgentStats = async (): Promise<AgentStats> => {
  try {
    logger.debug('Getting agent stats via service factory', { 
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.getAgentStats();
    
  } catch (error) {
    logger.error('Error getting agent stats via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Search agents
 */
export const searchAgents = async (query: string) => {
  try {
    logger.debug('Searching agents via service factory', { 
      query,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.searchAgents(query);
    
  } catch (error) {
    logger.error('Error searching agents via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Get agents by category
 */
export const getAgentsByCategory = async (category: string) => {
  try {
    logger.debug('Getting agents by category via service factory', { 
      category,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.getAgentsByCategory(category);
    
  } catch (error) {
    logger.error('Error getting agents by category via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Get agents by provider
 */
export const getAgentsByProvider = async (provider: string) => {
  try {
    logger.debug('Getting agents by provider via service factory', { 
      provider,
      serviceProvider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.getAgentsByProvider(provider);
    
  } catch (error) {
    logger.error('Error getting agents by provider via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

/**
 * Get agents by tier
 */
export const getAgentsByTier = async (tier: string) => {
  try {
    logger.debug('Getting agents by tier via service factory', { 
      tier,
      provider: serviceFactory.getCurrentProvider()
    }, 'AgentManagementAdapter');
    
    const agentService = getAgentService();
    return await agentService.getAgentsByTier(tier);
    
  } catch (error) {
    logger.error('Error getting agents by tier via service factory', error, 'AgentManagementAdapter');
    throw error;
  }
};

// Export the interfaces for backward compatibility
export type { CreateAgentRequest, UpdateAgentRequest, AgentStats } from './interfaces/IAgentService';
