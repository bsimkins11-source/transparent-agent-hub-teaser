import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addAgentToUserLibrary, removeAgentFromUserLibrary } from './userLibraryService';
import { createAgentRequest, approveAgentRequest, denyAgentRequest } from './requestService';
import toast from 'react-hot-toast';

export interface CompanyUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'network_admin' | 'company_admin';
  networkId?: string;
  networkName?: string;
  status: 'active' | 'suspended' | 'pending';
  organizationId: string;
  organizationName: string;
  createdAt: string;
  lastActive?: string;
  agentLibraryCount: number;
}

export interface UserAgentLibrary {
  userId: string;
  userEmail: string;
  userName: string;
  agents: Array<{
    agentId: string;
    agentName: string;
    addedAt: string;
    addedBy: string;
    source: 'company' | 'network' | 'direct';
  }>;
  totalAgents: number;
  lastUpdated: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  organizationId: string;
  organizationName: string;
  networkId?: string;
  networkName?: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface UserAgentRequest {
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
  status: 'pending' | 'approved' | 'denied';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestReason?: string;
  businessJustification?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  processedByName?: string;
  denialReason?: string;
}

/**
 * Add a new user to the company portal
 * This creates a user account and initializes their dedicated agent library
 */
export const addUserToCompany = async (
  companyId: string,
  companyName: string,
  userData: {
    email: string;
    displayName: string;
    role: 'user' | 'network_admin' | 'company_admin';
    networkId?: string;
    networkName?: string;
  },
  addedBy: string,
  addedByName: string
): Promise<string> => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists in the system');
    }

    // Create user document
    const userRef = await addDoc(collection(db, 'companyUsers'), {
      ...userData,
      organizationId: companyId,
      organizationName: companyName,
      status: 'pending',
      createdAt: serverTimestamp(),
      agentLibraryCount: 0
    });

    // Initialize user's dedicated agent library
    await initializeUserAgentLibrary(userRef.id, userData.email, userData.displayName, companyId, companyName);

    // Create user invitation
    await createUserInvitation(
      companyId,
      companyName,
      userData.email,
      addedBy,
      addedByName,
      userData.networkId,
      userData.networkName
    );

    toast.success(`User ${userData.displayName} added to company portal successfully`);
    return userRef.id;

  } catch (error) {
    console.error('Error adding user to company:', error);
    toast.error(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Remove a user from the company portal
 * This removes their access and cleans up their data
 */
export const removeUserFromCompany = async (
  companyId: string,
  userId: string,
  removedBy: string,
  removedByName: string,
  reason?: string
): Promise<void> => {
  try {
    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user status to suspended
    await updateDoc(doc(db, 'companyUsers', userId), {
      status: 'suspended',
      suspendedAt: serverTimestamp(),
      suspendedBy: removedBy,
      suspendedByName: removedByName,
      suspensionReason: reason || 'Removed by company admin'
    });

    // Archive user's agent library (don't delete, just mark as archived)
    await updateDoc(doc(db, 'userAgentLibraries', userId), {
      archived: true,
      archivedAt: serverTimestamp(),
      archivedBy: removedBy,
      archivedByName: removedByName
    });

    toast.success(`User ${user.displayName} removed from company portal`);
  } catch (error) {
    console.error('Error removing user from company:', error);
    toast.error(`Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Initialize a user's dedicated agent library
 * Every new user gets their own agent library
 */
export const initializeUserAgentLibrary = async (
  userId: string,
  userEmail: string,
  userName: string,
  organizationId: string,
  organizationName: string
): Promise<void> => {
  try {
    const libraryRef = doc(db, 'userAgentLibraries', userId);
    
    await setDoc(libraryRef, {
      userId,
      userEmail,
      userName,
      organizationId,
      organizationName,
      agents: [],
      totalAgents: 0,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      archived: false
    });

    console.log(`Initialized agent library for user ${userName}`);
  } catch (error) {
    console.error('Error initializing user agent library:', error);
    throw error;
  }
};

/**
 * Get a user's agent library
 */
export const getUserAgentLibrary = async (userId: string): Promise<UserAgentLibrary | null> => {
  try {
    const libraryDoc = await getDoc(doc(db, 'userAgentLibraries', userId));
    if (libraryDoc.exists()) {
      return libraryDoc.data() as UserAgentLibrary;
    }
    return null;
  } catch (error) {
    console.error('Error getting user agent library:', error);
    return null;
  }
};

/**
 * Add an agent to a user's library from the company agent library
 */
export const addAgentToUserLibraryFromCompany = async (
  userId: string,
  agentId: string,
  agentName: string,
  companyId: string,
  companyName: string,
  addedBy: string,
  addedByName: string,
  source: 'company' | 'network' | 'direct' = 'company'
): Promise<void> => {
  try {
    // Add to user's library
    await addAgentToUserLibrary(
      userId,
      '', // userEmail - will be filled by the service
      '', // userName - will be filled by the service
      agentId,
      agentName,
      companyId,
      companyName,
      undefined, // networkId
      undefined, // networkName
      `Added from company library by ${addedByName}`
    );

    // Update the user's library document
    const libraryRef = doc(db, 'userAgentLibraries', userId);
    const libraryDoc = await getDoc(libraryRef);
    
    if (libraryDoc.exists()) {
      const library = libraryDoc.data() as UserAgentLibrary;
      const newAgent = {
        agentId,
        agentName,
        addedAt: new Date().toISOString(),
        addedBy,
        source
      };

      await updateDoc(libraryRef, {
        agents: [...library.agents, newAgent],
        totalAgents: library.totalAgents + 1,
        lastUpdated: serverTimestamp()
      });
    }

    toast.success(`Agent ${agentName} added to user's library`);
  } catch (error) {
    console.error('Error adding agent to user library:', error);
    toast.error(`Failed to add agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Handle agent requests that require approval
 * Requests go to company admin if no network, network admin if network exists
 */
export const handleAgentRequest = async (
  userId: string,
  userEmail: string,
  userName: string,
  agentId: string,
  agentName: string,
  companyId: string,
  companyName: string,
  networkId?: string,
  networkName?: string,
  requestReason?: string,
  businessJustification?: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<string> => {
  try {
    // Determine approval level based on user's context
    let approvalLevel: 'network_admin' | 'company_admin' | 'super_admin' = 'company_admin';
    
    if (networkId && networkName) {
      // User is in a network, request goes to network admin first
      approvalLevel = 'network_admin';
    } else {
      // User is company-wide, request goes to company admin
      approvalLevel = 'company_admin';
    }

    // Create the agent request
    const requestId = await createAgentRequest(
      agentId,
      agentName,
      userId,
      userEmail,
      userName,
      companyId,
      companyName,
      networkId,
      networkName,
      approvalLevel,
      priority,
      requestReason || `User requesting access to ${agentName}`,
      {
        businessJustification: businessJustification || `Access requested for ${agentName} to enhance productivity`,
        expectedUsage: 'Regular use for business tasks',
        userRole: 'user'
      }
    );

    toast.success(`Access request submitted for ${agentName}! Your administrator will review it.`);
    return requestId;

  } catch (error) {
    console.error('Failed to create agent request:', error);
    toast.error('Failed to submit access request. Please try again.');
    throw error;
  }
};

/**
 * Get all users in a company
 */
export const getCompanyUsers = async (companyId: string): Promise<CompanyUser[]> => {
  try {
    const usersQuery = query(
      collection(db, 'companyUsers'),
      where('organizationId', '==', companyId)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users: CompanyUser[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      } as CompanyUser);
    });

    return users;
  } catch (error) {
    console.error('Error getting company users:', error);
    return [];
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<CompanyUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'companyUsers', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as CompanyUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<CompanyUser | null> => {
  try {
    const usersQuery = query(
      collection(db, 'companyUsers'),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CompanyUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

/**
 * Create a user invitation
 */
export const createUserInvitation = async (
  companyId: string,
  companyName: string,
  email: string,
  invitedBy: string,
  invitedByName: string,
  networkId?: string,
  networkName?: string
): Promise<string> => {
  try {
    const invitationRef = await addDoc(collection(db, 'userInvitations'), {
      email,
      invitedBy,
      invitedByName,
      organizationId: companyId,
      organizationName: companyName,
      networkId,
      networkName,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: serverTimestamp()
    });

    // In a real app, you would send an email invitation here
    console.log(`Created invitation for ${email} in ${companyName}`);
    
    return invitationRef.id;
  } catch (error) {
    console.error('Error creating user invitation:', error);
    throw error;
  }
};

/**
 * Get pending agent requests for a company
 */
export const getCompanyPendingRequests = async (companyId: string): Promise<UserAgentRequest[]> => {
  try {
    const requestsQuery = query(
      collection(db, 'agentRequests'),
      where('organizationId', '==', companyId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(requestsQuery);
    const requests: UserAgentRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      } as UserAgentRequest);
    });

    return requests;
  } catch (error) {
    console.error('Error getting company pending requests:', error);
    return [];
  }
};

/**
 * Approve an agent request
 */
export const approveUserAgentRequest = async (
  requestId: string,
  approvedBy: string,
  approvedByName: string,
  reason?: string
): Promise<void> => {
  try {
    // Approve the request
    await approveAgentRequest(
      requestId,
      approvedBy,
      approvedByName,
      reason || 'Request approved by company admin'
    );

    // Get the request details to add agent to user's library
    const requestDoc = await getDoc(doc(db, 'agentRequests', requestId));
    if (requestDoc.exists()) {
      const request = requestDoc.data() as UserAgentRequest;
      
      // Add agent to user's library
      await addAgentToUserLibraryFromCompany(
        request.userId,
        request.agentId,
        request.agentName,
        request.organizationId,
        request.organizationName,
        approvedBy,
        approvedByName,
        'company'
      );
    }

    toast.success('Request approved successfully');
  } catch (error) {
    console.error('Error approving request:', error);
    toast.error('Failed to approve request');
    throw error;
  }
};

/**
 * Deny an agent request
 */
export const denyUserAgentRequest = async (
  requestId: string,
  deniedBy: string,
  deniedByName: string,
  reason: string
): Promise<void> => {
  try {
    await denyAgentRequest(
      requestId,
      deniedBy,
      deniedByName,
      reason
    );

    toast.success('Request denied');
  } catch (error) {
    console.error('Error denying request:', error);
    toast.error('Failed to deny request');
    throw error;
  }
};
