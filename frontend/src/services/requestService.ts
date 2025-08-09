import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';
import { AgentRequest, AgentAssignment, ApprovalAction, ApprovalStats } from '../types/requests';

// Collections
const REQUESTS_COLLECTION = 'agentRequests';
const ASSIGNMENTS_COLLECTION = 'agentAssignments';
const APPROVAL_ACTIONS_COLLECTION = 'approvalActions';

/**
 * Submit a new agent request
 */
export const submitAgentRequest = async (requestData: Omit<AgentRequest, 'id' | 'requestedAt' | 'status'>): Promise<string> => {
  try {
    logger.debug('Submitting agent request', requestData, 'RequestService');
    
    const request: Omit<AgentRequest, 'id'> = {
      ...requestData,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), request);
    
    logger.info('Agent request submitted successfully', { requestId: docRef.id, agentId: requestData.agentId }, 'RequestService');
    return docRef.id;
    
  } catch (error) {
    logger.error('Error submitting agent request', error, 'RequestService');
    throw error;
  }
};

/**
 * Get pending requests for an admin level
 */
export const getPendingRequests = async (
  adminLevel: 'network_admin' | 'company_admin' | 'super_admin',
  organizationId?: string,
  networkId?: string
): Promise<AgentRequest[]> => {
  try {
    logger.debug('Fetching pending requests', { adminLevel, organizationId, networkId }, 'RequestService');
    
    let requestQuery = query(
      collection(db, REQUESTS_COLLECTION),
      where('status', '==', 'pending'),
      where('approvalLevel', '==', adminLevel),
      orderBy('requestedAt', 'asc')
    );

    // Add organization filter for company and network admins
    if (organizationId && adminLevel !== 'super_admin') {
      requestQuery = query(requestQuery, where('organizationId', '==', organizationId));
    }

    // Add network filter for network admins
    if (networkId && adminLevel === 'network_admin') {
      requestQuery = query(requestQuery, where('networkId', '==', networkId));
    }

    const snapshot = await getDocs(requestQuery);
    const requests: AgentRequest[] = [];

    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as AgentRequest);
    });

    logger.info(`Fetched ${requests.length} pending requests`, { adminLevel }, 'RequestService');
    return requests;
    
  } catch (error) {
    logger.error('Error fetching pending requests', error, 'RequestService');
    throw error;
  }
};

/**
 * Get user's requests (all statuses)
 */
export const getUserRequests = async (userId: string): Promise<AgentRequest[]> => {
  try {
    logger.debug('Fetching user requests', { userId }, 'RequestService');
    
    const requestQuery = query(
      collection(db, REQUESTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );

    const snapshot = await getDocs(requestQuery);
    const requests: AgentRequest[] = [];

    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as AgentRequest);
    });

    logger.info(`Fetched ${requests.length} requests for user`, { userId }, 'RequestService');
    return requests;
    
  } catch (error) {
    logger.error('Error fetching user requests', error, 'RequestService');
    throw error;
  }
};

/**
 * Approve an agent request
 */
export const approveAgentRequest = async (
  requestId: string,
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  reviewerRole: 'network_admin' | 'company_admin' | 'super_admin',
  notes?: string
): Promise<void> => {
  try {
    logger.debug('Approving agent request', { requestId, reviewerId }, 'RequestService');
    
    // Get the original request
    const requestDoc = await getDoc(doc(db, REQUESTS_COLLECTION, requestId));
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const request = requestDoc.data() as AgentRequest;
    
    // Update request status
    await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
      reviewerEmail,
      reviewerName
    });

    // Create agent assignment
    const assignment: Omit<AgentAssignment, 'id'> = {
      userId: request.userId,
      userEmail: request.userEmail,
      userName: request.userName,
      agentId: request.agentId,
      agentName: request.agentName,
      assignedBy: reviewerId,
      assignedByEmail: reviewerEmail,
      assignedByName: reviewerName,
      assignedAt: new Date().toISOString(),
      assignmentType: 'approved_request',
      organizationId: request.organizationId,
      networkId: request.networkId,
      assignmentReason: `Approved request: ${request.requestReason || 'No reason provided'}`,
      isActive: true
    };

    await addDoc(collection(db, ASSIGNMENTS_COLLECTION), assignment);

    // Log approval action
    const approvalAction: Omit<ApprovalAction, 'id'> = {
      requestId,
      action: 'approve',
      reviewerId,
      reviewerEmail,
      reviewerName,
      reviewerRole,
      actionAt: new Date().toISOString(),
      notes
    };

    await addDoc(collection(db, APPROVAL_ACTIONS_COLLECTION), approvalAction);
    
    logger.info('Agent request approved successfully', { requestId, agentId: request.agentId }, 'RequestService');
    
  } catch (error) {
    logger.error('Error approving agent request', error, 'RequestService');
    throw error;
  }
};

/**
 * Deny an agent request
 */
export const denyAgentRequest = async (
  requestId: string,
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  reviewerRole: 'network_admin' | 'company_admin' | 'super_admin',
  denyReason: string,
  adminContact?: { name: string; email: string; role: string }
): Promise<void> => {
  try {
    logger.debug('Denying agent request', { requestId, reviewerId }, 'RequestService');
    
    // Update request status
    await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
      status: 'denied',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
      reviewerEmail,
      reviewerName,
      denyReason,
      adminContact
    });

    // Log approval action
    const approvalAction: Omit<ApprovalAction, 'id'> = {
      requestId,
      action: 'deny',
      reviewerId,
      reviewerEmail,
      reviewerName,
      reviewerRole,
      actionAt: new Date().toISOString(),
      reason: denyReason
    };

    await addDoc(collection(db, APPROVAL_ACTIONS_COLLECTION), approvalAction);
    
    logger.info('Agent request denied', { requestId, reason: denyReason }, 'RequestService');
    
  } catch (error) {
    logger.error('Error denying agent request', error, 'RequestService');
    throw error;
  }
};

/**
 * Escalate an agent request to higher authority
 */
export const escalateAgentRequest = async (
  requestId: string,
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  reviewerRole: 'network_admin' | 'company_admin',
  escalationReason: string,
  escalateTo: 'company_admin' | 'super_admin'
): Promise<void> => {
  try {
    logger.debug('Escalating agent request', { requestId, reviewerId, escalateTo }, 'RequestService');
    
    // Update request status and approval level
    await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
      status: 'escalated',
      approvalLevel: escalateTo,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
      reviewerEmail,
      reviewerName
    });

    // Log approval action
    const approvalAction: Omit<ApprovalAction, 'id'> = {
      requestId,
      action: 'escalate',
      reviewerId,
      reviewerEmail,
      reviewerName,
      reviewerRole,
      actionAt: new Date().toISOString(),
      escalatedTo: escalateTo,
      escalationReason
    };

    await addDoc(collection(db, APPROVAL_ACTIONS_COLLECTION), approvalAction);
    
    logger.info('Agent request escalated', { requestId, escalateTo }, 'RequestService');
    
  } catch (error) {
    logger.error('Error escalating agent request', error, 'RequestService');
    throw error;
  }
};

/**
 * Direct agent assignment (by admin)
 */
export const directAgentAssignment = async (
  userId: string,
  userEmail: string,
  userName: string,
  agentId: string,
  agentName: string,
  assignedBy: string,
  assignedByEmail: string,
  assignedByName: string,
  organizationId: string,
  networkId?: string,
  assignmentReason?: string
): Promise<string> => {
  try {
    logger.debug('Creating direct agent assignment', { userId, agentId, assignedBy }, 'RequestService');
    
    const assignment: Omit<AgentAssignment, 'id'> = {
      userId,
      userEmail,
      userName,
      agentId,
      agentName,
      assignedBy,
      assignedByEmail,
      assignedByName,
      assignedAt: new Date().toISOString(),
      assignmentType: 'direct',
      organizationId,
      networkId,
      assignmentReason,
      isActive: true
    };

    const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), assignment);
    
    logger.info('Direct agent assignment created', { assignmentId: docRef.id, userId, agentId }, 'RequestService');
    return docRef.id;
    
  } catch (error) {
    logger.error('Error creating direct agent assignment', error, 'RequestService');
    throw error;
  }
};

/**
 * Get user's agent assignments
 */
export const getUserAssignments = async (userId: string): Promise<AgentAssignment[]> => {
  try {
    logger.debug('Fetching user assignments', { userId }, 'RequestService');
    
    const assignmentQuery = query(
      collection(db, ASSIGNMENTS_COLLECTION),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('assignedAt', 'desc')
    );

    const snapshot = await getDocs(assignmentQuery);
    const assignments: AgentAssignment[] = [];

    snapshot.forEach(doc => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      } as AgentAssignment);
    });

    logger.info(`Fetched ${assignments.length} assignments for user`, { userId }, 'RequestService');
    return assignments;
    
  } catch (error) {
    logger.error('Error fetching user assignments', error, 'RequestService');
    throw error;
  }
};

/**
 * Get approval statistics for an admin
 */
export const getApprovalStats = async (
  adminLevel: 'network_admin' | 'company_admin' | 'super_admin',
  organizationId?: string,
  networkId?: string
): Promise<ApprovalStats> => {
  try {
    logger.debug('Fetching approval statistics', { adminLevel, organizationId, networkId }, 'RequestService');
    
    // Build base query
    let baseQuery = collection(db, REQUESTS_COLLECTION);
    
    // Apply filters based on admin level
    let queryConstraints: any[] = [];
    
    if (adminLevel !== 'super_admin' && organizationId) {
      queryConstraints.push(where('organizationId', '==', organizationId));
    }
    
    if (adminLevel === 'network_admin' && networkId) {
      queryConstraints.push(where('networkId', '==', networkId));
    }

    const requestQuery = queryConstraints.length > 0 
      ? query(baseQuery, ...queryConstraints)
      : baseQuery;

    const snapshot = await getDocs(requestQuery);
    
    let pending = 0, approved = 0, denied = 0, escalated = 0;
    let totalResponseTime = 0, responseCount = 0;
    let oldestPending = 0;
    
    const now = new Date().getTime();
    
    snapshot.forEach(doc => {
      const request = doc.data() as AgentRequest;
      
      switch (request.status) {
        case 'pending':
          pending++;
          const daysPending = Math.floor((now - new Date(request.requestedAt).getTime()) / (1000 * 60 * 60 * 24));
          oldestPending = Math.max(oldestPending, daysPending);
          break;
        case 'approved':
          approved++;
          break;
        case 'denied':
          denied++;
          break;
        case 'escalated':
          escalated++;
          break;
      }
      
      // Calculate response time for completed requests
      if (request.reviewedAt && request.status !== 'pending') {
        const responseTime = (new Date(request.reviewedAt).getTime() - new Date(request.requestedAt).getTime()) / (1000 * 60 * 60);
        totalResponseTime += responseTime;
        responseCount++;
      }
    });
    
    const stats: ApprovalStats = {
      pending,
      approved,
      denied,
      escalated,
      totalRequests: pending + approved + denied + escalated,
      avgResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
      oldestPendingDays: oldestPending
    };
    
    logger.info('Approval statistics calculated', stats, 'RequestService');
    return stats;
    
  } catch (error) {
    logger.error('Error fetching approval statistics', error, 'RequestService');
    throw error;
  }
};

/**
 * Bulk approve requests
 */
export const bulkApproveRequests = async (
  requestIds: string[],
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  reviewerRole: 'network_admin' | 'company_admin' | 'super_admin'
): Promise<void> => {
  try {
    logger.debug('Bulk approving requests', { requestIds, reviewerId }, 'RequestService');
    
    const promises = requestIds.map(requestId => 
      approveAgentRequest(requestId, reviewerId, reviewerEmail, reviewerName, reviewerRole, 'Bulk approval')
    );
    
    await Promise.all(promises);
    
    logger.info(`Bulk approved ${requestIds.length} requests`, { reviewerId }, 'RequestService');
    
  } catch (error) {
    logger.error('Error in bulk approval', error, 'RequestService');
    throw error;
  }
};

/**
 * Bulk deny requests
 */
export const bulkDenyRequests = async (
  requestIds: string[],
  reviewerId: string,
  reviewerEmail: string,
  reviewerName: string,
  reviewerRole: 'network_admin' | 'company_admin' | 'super_admin',
  denyReason: string = 'Bulk denial'
): Promise<void> => {
  try {
    logger.debug('Bulk denying requests', { requestIds, reviewerId }, 'RequestService');
    
    const adminContact = {
      name: reviewerName,
      email: reviewerEmail,
      role: reviewerRole
    };
    
    const promises = requestIds.map(requestId => 
      denyAgentRequest(requestId, reviewerId, reviewerEmail, reviewerName, reviewerRole, denyReason, adminContact)
    );
    
    await Promise.all(promises);
    
    logger.info(`Bulk denied ${requestIds.length} requests`, { reviewerId }, 'RequestService');
    
  } catch (error) {
    logger.error('Error in bulk denial', error, 'RequestService');
    throw error;
  }
};

/**
 * Real-time listener for pending requests
 */
export const subscribeToPendingRequests = (
  adminLevel: 'network_admin' | 'company_admin' | 'super_admin',
  callback: (requests: AgentRequest[]) => void,
  organizationId?: string,
  networkId?: string
) => {
  try {
    logger.debug('Setting up real-time listener for pending requests', { adminLevel, organizationId, networkId }, 'RequestService');
    
    let requestQuery = query(
      collection(db, REQUESTS_COLLECTION),
      where('status', '==', 'pending'),
      where('approvalLevel', '==', adminLevel),
      orderBy('requestedAt', 'asc')
    );

    if (organizationId && adminLevel !== 'super_admin') {
      requestQuery = query(requestQuery, where('organizationId', '==', organizationId));
    }

    if (networkId && adminLevel === 'network_admin') {
      requestQuery = query(requestQuery, where('networkId', '==', networkId));
    }

    return onSnapshot(requestQuery, (snapshot) => {
      const requests: AgentRequest[] = [];
      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        } as AgentRequest);
      });
      
      logger.debug(`Real-time update: ${requests.length} pending requests`, { adminLevel }, 'RequestService');
      callback(requests);
    });
    
  } catch (error) {
    logger.error('Error setting up real-time listener', error, 'RequestService');
    throw error;
  }
};
