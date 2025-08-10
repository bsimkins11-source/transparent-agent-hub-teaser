import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';
import { Agent, AgentSubmission, AgentReview, AuditEntry } from '../types/agent';

export interface CreateAgentRequest {
  name: string;
  description: string;
  provider: 'openai' | 'google' | 'anthropic';
  route: string;
  category: string;
  tags: string[];
  tier: 'free' | 'premium' | 'enterprise';
  visibility: 'global' | 'private' | 'company' | 'network';
  allowedRoles: string[];
  allowedClients?: string[];
  version?: string;
  promptTemplateId?: string;
  executionTarget?: 'vertex' | 'openai' | 'cloud-run';
  testConfig?: any;
  changelog?: string[];
  organizationId?: string;
  networkId?: string;
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

/**
 * Submit a new agent for review (creates with pending status)
 */
export const submitAgentForReview = async (
  agentData: AgentSubmission, 
  submitterId: string,
  submitterEmail: string,
  submitterName: string
): Promise<string> => {
  try {
    logger.debug('Submitting agent for review', { name: agentData.name }, 'AgentManagement');
    
    const newAgent: Partial<Agent> = {
      ...agentData,
      metadata: {
        tags: agentData.tags,
        category: agentData.category,
        tier: agentData.tier,
        permissionType: agentData.tier === 'free' ? 'direct' : 'approval',
        version: agentData.version || '1.0.0',
        promptTemplateId: agentData.promptTemplateId,
        executionTarget: agentData.executionTarget,
        testConfig: agentData.testConfig,
        changelog: agentData.changelog || ['Initial submission']
      },
      status: 'pending',
      submitterId,
      submitterEmail,
      submitterName,
      submissionDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: [{
        action: 'submitted',
        timestamp: new Date().toISOString(),
        userId: submitterId,
        userEmail: submitterEmail,
        userName: submitterName,
        details: 'Agent submitted for review'
      }]
    };
    
    const docRef = await addDoc(collection(db, 'agents'), newAgent);
    
    logger.info('Agent submitted for review successfully', { 
      id: docRef.id, 
      name: agentData.name 
    }, 'AgentManagement');
    
    return docRef.id;
    
  } catch (error) {
    logger.error('Error submitting agent for review', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Review and approve/reject an agent
 */
export const reviewAgent = async (
  reviewData: AgentReview,
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string
): Promise<void> => {
  try {
    logger.debug('Reviewing agent', { agentId: reviewData.agentId, action: reviewData.action }, 'AgentManagement');
    
    const agentRef = doc(db, 'agents', reviewData.agentId);
    const agentDoc = await getDoc(agentRef);
    
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    const agent = agentDoc.data() as Agent;
    const now = new Date().toISOString();
    
    let updatePayload: Partial<Agent> = {
      updatedAt: now,
      reviewedBy: reviewerId,
      reviewerEmail,
      reviewerName
    };
    
    const auditEntry: AuditEntry = {
      action: reviewData.action === 'approve' ? 'approved' : 'rejected',
      timestamp: now,
      userId: reviewerId,
      userEmail: reviewerEmail,
      userName: reviewerName,
      details: reviewData.comments || `Agent ${reviewData.action}d`,
      metadata: {
        previousStatus: agent.status,
        action: reviewData.action,
        comments: reviewData.comments
      }
    };
    
    if (reviewData.action === 'approve') {
      updatePayload = {
        ...updatePayload,
        status: 'approved',
        approvalDate: now,
        visibility: reviewData.visibility || agent.visibility,
        allowedClients: reviewData.allowedClients || agent.allowedClients
      };
    } else if (reviewData.action === 'reject') {
      updatePayload = {
        ...updatePayload,
        status: 'rejected',
        rejectionReason: reviewData.rejectionReason || 'No reason provided'
      };
    }
    
    // Update audit trail
    updatePayload.auditTrail = [...(agent.auditTrail || []), auditEntry];
    
    await updateDoc(agentRef, updatePayload);
    
    logger.info('Agent review completed', { 
      agentId: reviewData.agentId, 
      action: reviewData.action 
    }, 'AgentManagement');
    
  } catch (error) {
    logger.error('Error reviewing agent', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Get agents by status for review dashboard
 */
export const getAgentsByStatus = async (status: Agent['status']): Promise<Agent[]> => {
  try {
    logger.debug('Getting agents by status', { status }, 'AgentManagement');
    
    const q = query(
      collection(db, 'agents'),
      where('status', '==', status),
      orderBy('submissionDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const agents: Agent[] = [];
    
    querySnapshot.forEach((doc) => {
      agents.push({ id: doc.id, ...doc.data() } as Agent);
    });
    
    return agents;
    
  } catch (error) {
    logger.error('Error getting agents by status', error, 'AgentManagement');
    throw error;
  }
};

/**
 * Get pending agents for review
 */
export const getPendingAgents = async (): Promise<Agent[]> => {
  return getAgentsByStatus('pending');
};

/**
 * Get approved agents for marketplace
 */
export const getApprovedAgents = async (): Promise<Agent[]> => {
  return getAgentsByStatus('approved');
};

/**
 * Update agent status
 */
export const updateAgentStatus = async (
  agentId: string, 
  status: Agent['status'],
  userId: string,
  userEmail: string,
  userName: string,
  details?: string
): Promise<void> => {
  try {
    logger.debug('Updating agent status', { agentId, status }, 'AgentManagement');
    
    const agentRef = doc(db, 'agents', agentId);
    const agentDoc = await getDoc(agentRef);
    
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    const agent = agentDoc.data() as Agent;
    const now = new Date().toISOString();
    
    const auditEntry: AuditEntry = {
      action: status === 'approved' ? 'approved' : 
              status === 'rejected' ? 'rejected' : 
              status === 'deprecated' ? 'deprecated' : 'updated',
      timestamp: now,
      userId,
      userEmail,
      userName,
      details: details || `Status changed to ${status}`,
      metadata: {
        previousStatus: agent.status,
        newStatus: status
      }
    };
    
    const updatePayload: Partial<Agent> = {
      status,
      updatedAt: now,
      auditTrail: [...(agent.auditTrail || []), auditEntry]
    };
    
    if (status === 'approved') {
      updatePayload.approvalDate = now;
    } else if (status === 'rejected') {
      updatePayload.rejectionReason = details || 'No reason provided';
    }
    
    await updateDoc(agentRef, updatePayload);
    
    logger.info('Agent status updated', { agentId, status }, 'AgentManagement');
    
  } catch (error) {
    logger.error('Error updating agent status', error, 'AgentManagement');
    throw error;
  }
};
