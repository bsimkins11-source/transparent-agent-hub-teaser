import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';
import { Agent } from '../types/agent';

export interface CreateAgentRequest {
  name: string;
  description: string;
  provider: 'openai' | 'google' | 'anthropic';
  route: string;
  category: string;
  tags: string[];
  tier: 'free' | 'premium' | 'enterprise';
  visibility: 'public' | 'private';
  allowedRoles: string[];
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  id: string;
}

/**
 * Create a new agent in the master library
 */
export const createAgent = async (agentData: CreateAgentRequest): Promise<string> => {
  try {
    logger.debug('Creating new agent', { name: agentData.name }, 'AgentManagement');
    
    const newAgent = {
      ...agentData,
      metadata: {
        tags: agentData.tags,
        category: agentData.category,
        tier: agentData.tier,
        permissionType: agentData.tier === 'free' ? 'direct' : 'approval'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'agents'), newAgent);
    
    logger.info('Agent created successfully', { 
      id: docRef.id, 
      name: agentData.name 
    }, 'AgentManagement');
    
    return docRef.id;
    
  } catch (error) {
    logger.error('Error creating agent', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Update an existing agent
 */
export const updateAgent = async (updateData: UpdateAgentRequest): Promise<void> => {
  try {
    logger.debug('Updating agent', { id: updateData.id }, 'AgentManagement');
    
    const { id, ...dataToUpdate } = updateData;
    const agentRef = doc(db, 'agents', id);
    
    const updatePayload: Partial<UpdateAgentRequest> & { updatedAt: string; metadata?: any } = {
      ...dataToUpdate,
      updatedAt: new Date().toISOString()
    };
    
    // Update metadata if relevant fields are provided
    if (updateData.tags || updateData.category || updateData.tier) {
      const currentDoc = await getDoc(agentRef);
      const currentData = currentDoc.data();
      
      updatePayload.metadata = {
        ...currentData?.metadata,
        ...(updateData.tags && { tags: updateData.tags }),
        ...(updateData.category && { category: updateData.category }),
        ...(updateData.tier && { 
          tier: updateData.tier,
          permissionType: updateData.tier === 'free' ? 'direct' : 'approval'
        })
      };
    }
    
    await updateDoc(agentRef, updatePayload);
    
    logger.info('Agent updated successfully', { id }, 'AgentManagement');
    
  } catch (error) {
    logger.error('Error updating agent', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Delete an agent from the master library
 */
export const deleteAgent = async (agentId: string): Promise<void> => {
  try {
    logger.debug('Deleting agent', { id: agentId }, 'AgentManagement');
    
    const agentRef = doc(db, 'agents', agentId);
    await deleteDoc(agentRef);
    
    logger.info('Agent deleted successfully', { id: agentId }, 'AgentManagement');
    
  } catch (error) {
    logger.error('Error deleting agent', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Get all agents with management details
 */
export const getAllAgentsForManagement = async (): Promise<Agent[]> => {
  try {
    logger.debug('Fetching all agents for management', {}, 'AgentManagement');
    
    const q = query(collection(db, 'agents'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const agents: Agent[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      agents.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        provider: data.provider,
        route: data.route,
        metadata: {
          tags: data.metadata?.tags || [],
          category: data.metadata?.category || 'General',
          tier: data.metadata?.tier || 'free',
          permissionType: data.metadata?.permissionType || 'direct'
        },
        visibility: data.visibility || 'public',
        allowedRoles: data.allowedRoles || ['user'],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    
    logger.info(`Fetched ${agents.length} agents for management`, {}, 'AgentManagement');
    return agents;
    
  } catch (error) {
    logger.error('Error fetching agents for management', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Get agent statistics
 */
export const getAgentStats = async (): Promise<{
  total: number;
  byTier: Record<string, number>;
  byProvider: Record<string, number>;
  byCategory: Record<string, number>;
}> => {
  try {
    const agents = await getAllAgentsForManagement();
    
    const stats = {
      total: agents.length,
      byTier: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };
    
    agents.forEach(agent => {
      // Count by tier
      const tier = agent.metadata.tier || 'free';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
      
      // Count by provider
      stats.byProvider[agent.provider] = (stats.byProvider[agent.provider] || 0) + 1;
      
      // Count by category
      const category = agent.metadata.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });
    
    return stats;
    
  } catch (error) {
    logger.error('Error getting agent stats', error, 'AgentManagement');
    throw error;
  }
};
