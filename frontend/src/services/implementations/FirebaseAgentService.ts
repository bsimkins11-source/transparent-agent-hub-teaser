import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logger } from '../../utils/logger';
import { Agent } from '../../types/agent';
import { IAgentService, CreateAgentRequest, UpdateAgentRequest, AgentStats } from '../interfaces/IAgentService';

export class FirebaseAgentService implements IAgentService {
  
  async createAgent(agentData: CreateAgentRequest): Promise<string> {
    try {
      logger.debug('Creating new agent', { name: agentData.name }, 'FirebaseAgentService');
      
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
      }, 'FirebaseAgentService');
      
      return docRef.id;
      
    } catch (error) {
      logger.error('Error creating agent', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async updateAgent(updateData: UpdateAgentRequest): Promise<void> {
    try {
      logger.debug('Updating agent', { id: updateData.id }, 'FirebaseAgentService');
      
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
      
      logger.info('Agent updated successfully', { id }, 'FirebaseAgentService');
      
    } catch (error) {
      logger.error('Error updating agent', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    try {
      logger.debug('Deleting agent', { id: agentId }, 'FirebaseAgentService');
      
      const agentRef = doc(db, 'agents', agentId);
      await deleteDoc(agentRef);
      
      logger.info('Agent deleted successfully', { id: agentId }, 'FirebaseAgentService');
      
    } catch (error) {
      logger.error('Error deleting agent', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    try {
      logger.debug('Fetching agent', { id: agentId }, 'FirebaseAgentService');
      
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      
      if (agentDoc.exists()) {
        const agentData = agentDoc.data() as Agent;
        return { ...agentData, id: agentDoc.id };
      }
      
      return null;
      
    } catch (error) {
      logger.error('Error fetching agent', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAllAgents(): Promise<Agent[]> {
    try {
      logger.debug('Fetching all agents', {}, 'FirebaseAgentService');
      
      const agentsQuery = query(collection(db, 'agents'), orderBy('name'));
      const querySnapshot = await getDocs(agentsQuery);
      
      const agents: Agent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Agent;
        agents.push({ ...data, id: doc.id });
      });
      
      logger.info(`Fetched ${agents.length} agents`, {}, 'FirebaseAgentService');
      return agents;
      
    } catch (error) {
      logger.error('Error fetching all agents', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAllAgentsForManagement(): Promise<Agent[]> {
    try {
      logger.debug('Fetching all agents for management', {}, 'FirebaseAgentService');
      
      const agentsQuery = query(collection(db, 'agents'), orderBy('name'));
      const querySnapshot = await getDocs(agentsQuery);
      
      const agents: Agent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Agent;
        agents.push({ ...data, id: doc.id });
      });
      
      logger.info(`Fetched ${agents.length} agents for management`, {}, 'FirebaseAgentService');
      return agents;
      
    } catch (error) {
      logger.error('Error fetching agents for management', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAgentStats(): Promise<AgentStats> {
    try {
      logger.debug('Fetching agent statistics', {}, 'FirebaseAgentService');
      
      const agents = await this.getAllAgents();
      
      const stats: AgentStats = {
        total: agents.length,
        byTier: {},
        byProvider: {},
        byCategory: {}
      };
      
      agents.forEach(agent => {
        // Count by tier
        stats.byTier[agent.tier] = (stats.byTier[agent.tier] || 0) + 1;
        
        // Count by provider
        stats.byProvider[agent.provider] = (stats.byProvider[agent.provider] || 0) + 1;
        
        // Count by category
        stats.byCategory[agent.category] = (stats.byCategory[agent.category] || 0) + 1;
      });
      
      logger.info('Agent statistics calculated', { total: stats.total }, 'FirebaseAgentService');
      return stats;
      
    } catch (error) {
      logger.error('Error calculating agent statistics', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async searchAgents(query: string): Promise<Agent[]> {
    try {
      logger.debug('Searching agents', { query }, 'FirebaseAgentService');
      
      const allAgents = await this.getAllAgents();
      const searchTerm = query.toLowerCase();
      
      return allAgents.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm) ||
        agent.description.toLowerCase().includes(searchTerm) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        agent.category.toLowerCase().includes(searchTerm) ||
        agent.provider.toLowerCase().includes(searchTerm)
      );
      
    } catch (error) {
      logger.error('Error searching agents', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAgentsByCategory(category: string): Promise<Agent[]> {
    try {
      logger.debug('Fetching agents by category', { category }, 'FirebaseAgentService');
      
      const allAgents = await this.getAllAgents();
      return allAgents.filter(agent => agent.category === category);
      
    } catch (error) {
      logger.error('Error fetching agents by category', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAgentsByProvider(provider: string): Promise<Agent[]> {
    try {
      logger.debug('Fetching agents by provider', { provider }, 'FirebaseAgentService');
      
      const allAgents = await this.getAllAgents();
      return allAgents.filter(agent => agent.provider === provider);
      
    } catch (error) {
      logger.error('Error fetching agents by provider', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async getAgentsByTier(tier: string): Promise<Agent[]> {
    try {
      logger.debug('Fetching agents by tier', { tier }, 'FirebaseAgentService');
      
      const allAgents = await this.getAllAgents();
      return allAgents.filter(agent => agent.tier === tier);
      
    } catch (error) {
      logger.error('Error fetching agents by tier', error, 'FirebaseAgentService');
      throw error;
    }
  }

  // Multi-tenancy support methods
  async getAgentsByTenant(tenantId: string): Promise<Agent[]> {
    try {
      logger.debug('Fetching agents by tenant', { tenantId }, 'FirebaseAgentService');
      
      // For now, return all agents - tenant filtering will be implemented in library service
      // This method will be more relevant when we have tenant-specific agent assignments
      return await this.getAllAgents();
      
    } catch (error) {
      logger.error('Error fetching agents by tenant', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async assignAgentToTenant(agentId: string, tenantId: string): Promise<void> {
    try {
      logger.debug('Assigning agent to tenant', { agentId, tenantId }, 'FirebaseAgentService');
      
      // This will be implemented when we add tenant-specific agent assignments
      // For now, this is a placeholder for the interface
      logger.info('Agent assigned to tenant', { agentId, tenantId }, 'FirebaseAgentService');
      
    } catch (error) {
      logger.error('Error assigning agent to tenant', error, 'FirebaseAgentService');
      throw error;
    }
  }

  async removeAgentFromTenant(agentId: string, tenantId: string): Promise<void> {
    try {
      logger.debug('Removing agent from tenant', { agentId, tenantId }, 'FirebaseAgentService');
      
      // This will be implemented when we add tenant-specific agent assignments
      // For now, this is a placeholder for the interface
      logger.info('Agent removed from tenant', { agentId, tenantId }, 'FirebaseAgentService');
      
    } catch (error) {
      logger.error('Error removing agent from tenant', error, 'FirebaseAgentService');
      throw error;
    }
  }
}
