// Local request service
import { logger } from '../utils/logger';

export interface AgentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  agentId: string;
  agentName: string;
  requestType: 'access' | 'upgrade' | 'custom';
  status: 'pending' | 'approved' | 'rejected';
  requestReason: string;
  businessJustification?: string;
  expectedUsage?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerEmail?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Local storage for agent requests (in-memory for development)
const localAgentRequests: Map<string, AgentRequest> = new Map();

export const createAgentRequest = async (
  requestData: Omit<AgentRequest, 'id' | 'status' | 'submittedAt' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    logger.debug('Creating agent request', { userId: requestData.userId, agentId: requestData.agentId }, 'RequestService');
    
    const requestId = `req-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newRequest: AgentRequest = {
      ...requestData,
      id: requestId,
      status: 'pending',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };
    
    localAgentRequests.set(requestId, newRequest);
    
    logger.info('Agent request created successfully', { id: requestId, userId: requestData.userId }, 'RequestService');
    return requestId;
    
  } catch (error) {
    logger.error('Error creating agent request', error, 'RequestService');
    throw error;
  }
};

export const getAgentRequest = async (requestId: string): Promise<AgentRequest | null> => {
  try {
    logger.debug('Fetching agent request', { id: requestId }, 'RequestService');
    
    const request = localAgentRequests.get(requestId);
    if (!request) {
      logger.info('Agent request not found', { id: requestId }, 'RequestService');
      return null;
    }
    
    logger.info('Agent request fetched successfully', { id: requestId }, 'RequestService');
    return request;
    
  } catch (error) {
    logger.error('Error fetching agent request', error, 'RequestService');
    throw error;
  }
};

export const getUserAgentRequests = async (userId: string): Promise<AgentRequest[]> => {
  try {
    logger.debug('Fetching user agent requests', { userId }, 'RequestService');
    
    const requests = Array.from(localAgentRequests.values());
    const userRequests = requests.filter(request => request.userId === userId);
    
    logger.info(`Found ${userRequests.length} requests for user`, { userId }, 'RequestService');
    return userRequests;
    
  } catch (error) {
    logger.error('Error fetching user agent requests', error, 'RequestService');
    throw error;
  }
};

export const getAllAgentRequests = async (): Promise<AgentRequest[]> => {
  try {
    logger.debug('Fetching all agent requests', undefined, 'RequestService');
    
    const requests = Array.from(localAgentRequests.values());
    
    logger.info(`Fetched ${requests.length} agent requests`, undefined, 'RequestService');
    return requests;
    
  } catch (error) {
    logger.error('Error fetching all agent requests', error, 'RequestService');
    throw error;
  }
};

export const getAgentRequestsByStatus = async (status: AgentRequest['status']): Promise<AgentRequest[]> => {
  try {
    logger.debug('Fetching agent requests by status', { status }, 'RequestService');
    
    const requests = Array.from(localAgentRequests.values());
    const filteredRequests = requests.filter(request => request.status === status);
    
    logger.info(`Found ${filteredRequests.length} requests with status ${status}`, undefined, 'RequestService');
    return filteredRequests;
    
  } catch (error) {
    logger.error('Error fetching agent requests by status', error, 'RequestService');
    throw error;
  }
};

export const updateAgentRequestStatus = async (
  requestId: string,
  status: AgentRequest['status'],
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  reviewNotes?: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    logger.debug('Updating agent request status', { id: requestId, status }, 'RequestService');
    
    const request = localAgentRequests.get(requestId);
    if (!request) {
      throw new Error(`Agent request with id ${requestId} not found`);
    }
    
    const updatedRequest: AgentRequest = {
      ...request,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
      reviewerEmail,
      reviewerName,
      reviewNotes,
      rejectionReason,
      updatedAt: new Date().toISOString()
    };
    
    localAgentRequests.set(requestId, updatedRequest);
    
    logger.info('Agent request status updated successfully', { id: requestId, status }, 'RequestService');
    
  } catch (error) {
    logger.error('Error updating agent request status', error, 'RequestService');
    throw error;
  }
};

export const deleteAgentRequest = async (requestId: string): Promise<void> => {
  try {
    logger.debug('Deleting agent request', { id: requestId }, 'RequestService');
    
    const deleted = localAgentRequests.delete(requestId);
    if (!deleted) {
      throw new Error(`Agent request with id ${requestId} not found`);
    }
    
    logger.info('Agent request deleted successfully', { id: requestId }, 'RequestService');
    
  } catch (error) {
    logger.error('Error deleting agent request', error, 'RequestService');
    throw error;
  }
};

export const getAgentRequestStatistics = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: { [type: string]: number };
  byPriority: { [priority: string]: number };
}> => {
  try {
    logger.debug('Fetching agent request statistics', undefined, 'RequestService');
    
    const requests = Array.from(localAgentRequests.values());
    
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      byType: {} as { [type: string]: number },
      byPriority: {} as { [priority: string]: number }
    };
    
    requests.forEach(request => {
      // Count by type
      stats.byType[request.requestType] = (stats.byType[request.requestType] || 0) + 1;
      
      // Count by priority
      stats.byPriority[request.priority] = (stats.byPriority[request.priority] || 0) + 1;
    });
    
    logger.info('Agent request statistics calculated', { total: stats.total }, 'RequestService');
    return stats;
    
  } catch (error) {
    logger.error('Error calculating agent request statistics', error, 'RequestService');
    throw error;
  }
};

export const searchAgentRequests = async (query: string): Promise<AgentRequest[]> => {
  try {
    logger.debug('Searching agent requests', { query }, 'RequestService');
    
    const requests = Array.from(localAgentRequests.values());
    const searchTerm = query.toLowerCase();
    
    const results = requests.filter(request => 
      request.userName.toLowerCase().includes(searchTerm) ||
      request.agentName.toLowerCase().includes(searchTerm) ||
      request.requestReason.toLowerCase().includes(searchTerm) ||
      request.businessJustification?.toLowerCase().includes(searchTerm) ||
      request.expectedUsage?.toLowerCase().includes(searchTerm)
    );
    
    logger.info(`Found ${results.length} requests matching query`, { query }, 'RequestService');
    return results;
    
  } catch (error) {
    logger.error('Error searching agent requests', error, 'RequestService');
    throw error;
  }
};