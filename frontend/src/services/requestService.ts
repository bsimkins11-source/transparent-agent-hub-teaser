import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';

export interface AgentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  agentId: string;
  agentName: string;
  organizationId: string;
  organizationName: string;
  networkId?: string;
  networkName?: string;
  status: 'pending' | 'approved' | 'denied' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestedAt: string;
  requestReason?: string;
  businessJustification?: string;
  expectedUsage?: string;
  userRole?: string;
  approvalLevel: 'super_admin' | 'company_admin' | 'network_admin';
  approvedBy?: string;
  approvedByEmail?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalReason?: string;
  deniedBy?: string;
  deniedByEmail?: string;
  deniedByName?: string;
  deniedAt?: string;
  denialReason?: string;
}

export interface ApprovalAction {
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: 'approved' | 'denied' | 'escalated';
  reason?: string;
  timestamp: string;
}

/**
 * Create a new agent access request
 */
export async function createAgentRequest(
  userId: string,
  userEmail: string,
  userName: string,
  agentId: string,
  agentName: string,
  organizationId: string,
  organizationName: string,
  networkId: string | undefined,
  networkName: string | undefined,
  approvalLevel: 'super_admin' | 'company_admin' | 'network_admin',
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  requestReason?: string,
  additionalInfo?: {
    businessJustification?: string;
    expectedUsage?: string;
    userRole?: string;
  }
): Promise<string> {
  try {
    logger.debug('Creating agent request', {
      userId,
      agentId,
      organizationId,
      networkId,
      approvalLevel
    }, 'RequestService');

    const requestData = {
      userId,
      userEmail,
      userName,
      agentId,
      agentName,
      organizationId,
      organizationName,
      networkId: networkId || null,
      networkName: networkName || null,
      status: 'pending' as const,
      priority,
      requestedAt: serverTimestamp(),
      requestReason: requestReason || '',
      businessJustification: additionalInfo?.businessJustification || '',
      expectedUsage: additionalInfo?.expectedUsage || '',
      userRole: additionalInfo?.userRole || 'user',
      approvalLevel,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'agentRequests'), requestData);
    
    logger.info('Agent request created successfully', {
      requestId: docRef.id,
      userId,
      agentId,
      approvalLevel
    }, 'RequestService');

    return docRef.id;
  } catch (error) {
    logger.error('Failed to create agent request', error, 'RequestService');
    throw new Error('Failed to create agent request');
  }
}

/**
 * Get agent requests for a specific approval level
 */
export async function getAgentRequests(
  approvalLevel: 'super_admin' | 'company_admin' | 'network_admin',
  organizationId?: string,
  networkId?: string
): Promise<AgentRequest[]> {
  try {
    logger.debug('Fetching agent requests', {
      approvalLevel,
      organizationId,
      networkId
    }, 'RequestService');

    let q = query(
      collection(db, 'agentRequests'),
      where('approvalLevel', '==', approvalLevel),
      orderBy('requestedAt', 'desc')
    );

    // Add organization filter for company and network admins
    if (approvalLevel === 'company_admin' && organizationId) {
      q = query(
        collection(db, 'agentRequests'),
        where('approvalLevel', '==', approvalLevel),
        where('organizationId', '==', organizationId),
        orderBy('requestedAt', 'desc')
      );
    }

    // Add network filter for network admins
    if (approvalLevel === 'network_admin' && organizationId && networkId) {
      q = query(
        collection(db, 'agentRequests'),
        where('approvalLevel', '==', approvalLevel),
        where('organizationId', '==', organizationId),
        where('networkId', '==', networkId),
        orderBy('requestedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const requests: AgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        agentId: data.agentId,
        agentName: data.agentName,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        networkId: data.networkId,
        networkName: data.networkName,
        status: data.status,
        priority: data.priority,
        requestedAt: data.requestedAt instanceof Timestamp 
          ? data.requestedAt.toDate().toISOString()
          : data.requestedAt,
        requestReason: data.requestReason,
        businessJustification: data.businessJustification,
        expectedUsage: data.expectedUsage,
        userRole: data.userRole,
        approvalLevel: data.approvalLevel,
        approvedBy: data.approvedBy,
        approvedByEmail: data.approvedByEmail,
        approvedByName: data.approvedByName,
        approvedAt: data.approvedAt instanceof Timestamp 
          ? data.approvedAt.toDate().toISOString()
          : data.approvedAt,
        approvalReason: data.approvalReason,
        deniedBy: data.deniedBy,
        deniedByEmail: data.deniedByEmail,
        deniedByName: data.deniedByName,
        deniedAt: data.deniedAt instanceof Timestamp 
          ? data.deniedAt.toDate().toISOString()
          : data.deniedAt,
        denialReason: data.denialReason
      });
    });

    logger.info('Agent requests fetched successfully', {
      count: requests.length,
      approvalLevel
    }, 'RequestService');

    return requests;
  } catch (error) {
    logger.error('Failed to fetch agent requests', error, 'RequestService');
    throw new Error('Failed to fetch agent requests');
  }
}

/**
 * Approve an agent request
 */
export async function approveAgentRequest(
  requestId: string,
  adminId: string,
  adminEmail: string,
  adminName: string,
  reason?: string
): Promise<void> {
  try {
    logger.debug('Approving agent request', {
      requestId,
      adminId,
      reason
    }, 'RequestService');

    const requestRef = doc(db, 'agentRequests', requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      approvedBy: adminId,
      approvedByEmail: adminEmail,
      approvedByName: adminName,
      approvedAt: serverTimestamp(),
      approvalReason: reason || 'Request approved by admin',
      updatedAt: serverTimestamp()
    });

    logger.info('Agent request approved successfully', {
      requestId,
      adminId
    }, 'RequestService');
  } catch (error) {
    logger.error('Failed to approve agent request', error, 'RequestService');
    throw new Error('Failed to approve agent request');
  }
}

/**
 * Deny an agent request
 */
export async function denyAgentRequest(
  requestId: string,
  adminId: string,
  adminEmail: string,
  adminName: string,
  reason?: string
): Promise<void> {
  try {
    logger.debug('Denying agent request', {
      requestId,
      adminId,
      reason
    }, 'RequestService');

    const requestRef = doc(db, 'agentRequests', requestId);
    await updateDoc(requestRef, {
      status: 'denied',
      deniedBy: adminId,
      deniedByEmail: adminEmail,
      deniedByName: adminName,
      deniedAt: serverTimestamp(),
      denialReason: reason || 'Request denied by admin',
      updatedAt: serverTimestamp()
    });

    logger.info('Agent request denied successfully', {
      requestId,
      adminId
    }, 'RequestService');
  } catch (error) {
    logger.error('Failed to deny agent request', error, 'RequestService');
    throw new Error('Failed to deny agent request');
  }
}

/**
 * Escalate an agent request to a higher approval level
 */
export async function escalateAgentRequest(
  requestId: string,
  newApprovalLevel: 'super_admin' | 'company_admin',
  adminId: string,
  adminEmail: string,
  adminName: string,
  reason?: string
): Promise<void> {
  try {
    logger.debug('Escalating agent request', {
      requestId,
      newApprovalLevel,
      adminId,
      reason
    }, 'RequestService');

    const requestRef = doc(db, 'agentRequests', requestId);
    await updateDoc(requestRef, {
      status: 'escalated',
      approvalLevel: newApprovalLevel,
      escalatedBy: adminId,
      escalatedByEmail: adminEmail,
      escalatedByName: adminName,
      escalatedAt: serverTimestamp(),
      escalationReason: reason || 'Request escalated for higher level approval',
      updatedAt: serverTimestamp()
    });

    logger.info('Agent request escalated successfully', {
      requestId,
      newApprovalLevel,
      adminId
    }, 'RequestService');
  } catch (error) {
    logger.error('Failed to escalate agent request', error, 'RequestService');
    throw new Error('Failed to escalate agent request');
  }
}

/**
 * Get requests for a specific user
 */
export async function getUserAgentRequests(userId: string): Promise<AgentRequest[]> {
  try {
    logger.debug('Fetching user agent requests', { userId }, 'RequestService');

    const q = query(
      collection(db, 'agentRequests'),
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: AgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        agentId: data.agentId,
        agentName: data.agentName,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        networkId: data.networkId,
        networkName: data.networkName,
        status: data.status,
        priority: data.priority,
        requestedAt: data.requestedAt instanceof Timestamp 
          ? data.requestedAt.toDate().toISOString()
          : data.requestedAt,
        requestReason: data.requestReason,
        businessJustification: data.businessJustification,
        expectedUsage: data.expectedUsage,
        userRole: data.userRole,
        approvalLevel: data.approvalLevel,
        approvedBy: data.approvedBy,
        approvedByEmail: data.approvedByEmail,
        approvedByName: data.approvedByName,
        approvedAt: data.approvedAt instanceof Timestamp 
          ? data.approvedAt.toDate().toISOString()
          : data.approvedAt,
        approvalReason: data.approvalReason,
        deniedBy: data.deniedBy,
        deniedByEmail: data.deniedByEmail,
        deniedByName: data.deniedByName,
        deniedAt: data.deniedAt instanceof Timestamp 
          ? data.deniedAt.toDate().toISOString()
          : data.deniedAt,
        denialReason: data.denialReason
      });
    });

    logger.info('User agent requests fetched successfully', {
      userId,
      count: requests.length
    }, 'RequestService');

    return requests;
  } catch (error) {
    logger.error('Failed to fetch user agent requests', error, 'RequestService');
    throw new Error('Failed to fetch user agent requests');
  }
}