// Local new agent request service
import { logger } from '../utils/logger';

export interface NewAgentRequest {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  tags: string[];
  tier: 'free' | 'premium' | 'enterprise';
  submitterId: string;
  submitterEmail: string;
  submitterName: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  reviewDate?: string;
  reviewerId?: string;
  reviewerEmail?: string;
  reviewerName?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Local storage for agent requests (in-memory for development)
const localAgentRequests: Map<string, NewAgentRequest> = new Map();

export const submitNewAgentRequest = async (
  requestData: Omit<NewAgentRequest, 'id' | 'status' | 'submissionDate' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    logger.debug('Submitting new agent request', { name: requestData.name }, 'NewAgentRequestService');
    
    const requestId = `request-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newRequest: NewAgentRequest = {
      ...requestData,
      id: requestId,
      status: 'pending',
      submissionDate: now,
      createdAt: now,
      updatedAt: now
    };
    
    localAgentRequests.set(requestId, newRequest);
    
    logger.info('New agent request submitted successfully', { id: requestId, name: requestData.name }, 'NewAgentRequestService');
    return requestId;
    
  } catch (error) {
    logger.error('Error submitting new agent request', error, 'NewAgentRequestService');
    throw error;
  }
};

export const getNewAgentRequest = async (requestId: string): Promise<NewAgentRequest | null> => {
  try {
    logger.debug('Fetching new agent request', { id: requestId }, 'NewAgentRequestService');
    
    const request = localAgentRequests.get(requestId);
    if (!request) {
      logger.info('New agent request not found', { id: requestId }, 'NewAgentRequestService');
      return null;
    }
    
    logger.info('New agent request fetched successfully', { id: requestId }, 'NewAgentRequestService');
    return request;
    
  } catch (error) {
    logger.error('Error fetching new agent request', error, 'NewAgentRequestService');
    throw error;
  }
};

export const getAllNewAgentRequests = async (): Promise<NewAgentRequest[]> => {
  try {
    logger.debug('Fetching all new agent requests', undefined, 'NewAgentRequestService');
    
    const requests = Array.from(localAgentRequests.values());
    
    logger.info(`Fetched ${requests.length} new agent requests`, undefined, 'NewAgentRequestService');
    return requests;
    
  } catch (error) {
    logger.error('Error fetching all new agent requests', error, 'NewAgentRequestService');
    throw error;
  }
};

export const getNewAgentRequestsByStatus = async (status: NewAgentRequest['status']): Promise<NewAgentRequest[]> => {
  try {
    logger.debug('Fetching new agent requests by status', { status }, 'NewAgentRequestService');
    
    const requests = Array.from(localAgentRequests.values());
    const filteredRequests = requests.filter(request => request.status === status);
    
    logger.info(`Found ${filteredRequests.length} requests with status ${status}`, undefined, 'NewAgentRequestService');
    return filteredRequests;
    
  } catch (error) {
    logger.error('Error fetching new agent requests by status', error, 'NewAgentRequestService');
    throw error;
  }
};

export const updateNewAgentRequestStatus = async (
  requestId: string,
  status: NewAgentRequest['status'],
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    logger.debug('Updating new agent request status', { id: requestId, status }, 'NewAgentRequestService');
    
    const request = localAgentRequests.get(requestId);
    if (!request) {
      throw new Error(`New agent request with id ${requestId} not found`);
    }
    
    const updatedRequest: NewAgentRequest = {
      ...request,
      status,
      reviewDate: new Date().toISOString(),
      reviewerId,
      reviewerEmail,
      reviewerName,
      rejectionReason,
      updatedAt: new Date().toISOString()
    };
    
    localAgentRequests.set(requestId, updatedRequest);
    
    logger.info('New agent request status updated successfully', { id: requestId, status }, 'NewAgentRequestService');
    
  } catch (error) {
    logger.error('Error updating new agent request status', error, 'NewAgentRequestService');
    throw error;
  }
};

export const deleteNewAgentRequest = async (requestId: string): Promise<void> => {
  try {
    logger.debug('Deleting new agent request', { id: requestId }, 'NewAgentRequestService');
    
    const deleted = localAgentRequests.delete(requestId);
    if (!deleted) {
      throw new Error(`New agent request with id ${requestId} not found`);
    }
    
    logger.info('New agent request deleted successfully', { id: requestId }, 'NewAgentRequestService');
    
  } catch (error) {
    logger.error('Error deleting new agent request', error, 'NewAgentRequestService');
    throw error;
  }
};

export const getNewAgentRequestStatistics = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byTier: { [tier: string]: number };
  byCategory: { [category: string]: number };
}> => {
  try {
    logger.debug('Fetching new agent request statistics', undefined, 'NewAgentRequestService');
    
    const requests = Array.from(localAgentRequests.values());
    
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      byTier: {} as { [tier: string]: number },
      byCategory: {} as { [category: string]: number }
    };
    
    requests.forEach(request => {
      // Count by tier
      stats.byTier[request.tier] = (stats.byTier[request.tier] || 0) + 1;
      
      // Count by category
      stats.byCategory[request.category] = (stats.byCategory[request.category] || 0) + 1;
    });
    
    logger.info('New agent request statistics calculated', { total: stats.total }, 'NewAgentRequestService');
    return stats;
    
  } catch (error) {
    logger.error('Error calculating new agent request statistics', error, 'NewAgentRequestService');
    throw error;
  }
};
