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

export interface NewAgentRequest {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  agentName: string;
  agentDescription: string;
  useCase: string;
  businessJustification: string;
  expectedUsage: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  targetUsers: string;
  libraryType: 'personal' | 'global' | 'company' | 'network';
  organizationId?: string; // company ID
  networkId?: string; // network ID
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'implemented';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  adminContactEmail: string;
  adminContactName: string;
  adminContactTitle: string;
}

/**
 * Create a new agent request record in the database
 */
export async function createNewAgentRequest(requestData: Omit<NewAgentRequest, 'id' | 'requestedAt'>): Promise<string> {
  try {
    logger.debug('Creating new agent request', {
      userId: requestData.userId,
      agentName: requestData.agentName,
      libraryType: requestData.libraryType
    }, 'NewAgentRequestService');

    const requestRecord = {
      ...requestData,
      requestedAt: serverTimestamp(),
      status: 'pending' as const
    };

    const docRef = await addDoc(collection(db, 'newAgentRequests'), requestRecord);
    
    logger.info('New agent request created successfully', {
      requestId: docRef.id,
      agentName: requestData.agentName
    }, 'NewAgentRequestService');

    return docRef.id;
  } catch (error) {
    logger.error('Failed to create new agent request', { error, requestData }, 'NewAgentRequestService');
    throw error;
  }
}

/**
 * Get all new agent requests for a specific organization
 */
export async function getOrganizationNewAgentRequests(organizationId: string): Promise<NewAgentRequest[]> {
  try {
    const q = query(
      collection(db, 'newAgentRequests'),
      where('organizationId', '==', organizationId),
      orderBy('requestedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: NewAgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt
      } as NewAgentRequest);
    });

    return requests;
  } catch (error) {
    logger.error('Failed to get organization new agent requests', { error, organizationId }, 'NewAgentRequestService');
    throw error;
  }
}

/**
 * Get all new agent requests for a specific network
 */
export async function getNetworkNewAgentRequests(organizationId: string, networkId: string): Promise<NewAgentRequest[]> {
  try {
    const q = query(
      collection(db, 'newAgentRequests'),
      where('organizationId', '==', organizationId),
      where('networkId', '==', networkId),
      orderBy('requestedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: NewAgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt
      } as NewAgentRequest);
    });

    return requests;
  } catch (error) {
    logger.error('Failed to get network new agent requests', { error, organizationId, networkId }, 'NewAgentRequestService');
    throw error;
  }
}

/**
 * Get all new agent requests for global library
 */
export async function getGlobalNewAgentRequests(): Promise<NewAgentRequest[]> {
  try {
    const q = query(
      collection(db, 'newAgentRequests'),
      where('libraryType', '==', 'global'),
      orderBy('requestedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: NewAgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt
      } as NewAgentRequest);
    });

    return requests;
  } catch (error) {
    logger.error('Failed to get global new agent requests', { error }, 'NewAgentRequestService');
    throw error;
  }
}

/**
 * Update the status of a new agent request
 */
export async function updateNewAgentRequestStatus(
  requestId: string, 
  status: NewAgentRequest['status'],
  adminId: string,
  adminEmail: string,
  adminName: string,
  reviewNotes?: string
): Promise<void> {
  try {
    const requestRef = doc(db, 'newAgentRequests', requestId);
    
    const updateData: Partial<NewAgentRequest> = {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
      reviewNotes: reviewNotes || ''
    };

    await updateDoc(requestRef, updateData);
    
    logger.info('New agent request status updated', {
      requestId,
      status,
      adminId
    }, 'NewAgentRequestService');
  } catch (error) {
    logger.error('Failed to update new agent request status', { error, requestId, status }, 'NewAgentRequestService');
    throw error;
  }
}

/**
 * Get new agent requests by status
 */
export async function getNewAgentRequestsByStatus(
  status: NewAgentRequest['status'],
  organizationId?: string,
  networkId?: string
): Promise<NewAgentRequest[]> {
  try {
    let q;
    
    if (organizationId && networkId) {
      q = query(
        collection(db, 'newAgentRequests'),
        where('organizationId', '==', organizationId),
        where('networkId', '==', networkId),
        where('status', '==', status),
        orderBy('requestedAt', 'desc')
      );
    } else if (organizationId) {
      q = query(
        collection(db, 'newAgentRequests'),
        where('organizationId', '==', organizationId),
        where('status', '==', status),
        orderBy('requestedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'newAgentRequests'),
        where('status', '==', status),
        orderBy('requestedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const requests: NewAgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt
      } as NewAgentRequest);
    });

    return requests;
  } catch (error) {
    logger.error('Failed to get new agent requests by status', { error, status, organizationId, networkId }, 'NewAgentRequestService');
    throw error;
  }
}

/**
 * Get new agent requests for a specific user
 */
export async function getUserNewAgentRequests(userId: string): Promise<NewAgentRequest[]> {
  try {
    const q = query(
      collection(db, 'newAgentRequests'),
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: NewAgentRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : data.requestedAt,
        reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : data.reviewedAt
      } as NewAgentRequest);
    });

    return requests;
  } catch (error) {
    logger.error('Failed to get user new agent requests', { error, userId }, 'NewAgentRequestService');
    throw error;
  }
}
