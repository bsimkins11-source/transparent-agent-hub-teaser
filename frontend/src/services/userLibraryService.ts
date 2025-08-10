import { doc, updateDoc, getDoc, setDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';

// Interfaces for type safety
interface AgentAssignmentData {
  userId: string;
  userEmail: string;
  userName: string;
  agentId: string;
  agentName: string;
  assignedBy: string;
  assignedByEmail: string;
  assignedByName: string;
  organizationId: string;
  organizationName: string;
  assignmentType: 'direct';
  status: 'active';
  assignmentReason: string;
  createdAt: string;
  updatedAt: string;
  networkId?: string;
  networkName?: string;
}

interface UserProfileData {
  email: string;
  displayName: string;
  organizationId: string;
  organizationName: string;
  assignedAgents?: string[];
  createdAt?: string;
  updatedAt: string;
  networkId?: string;
  networkName?: string;
  role?: 'user' | 'company_admin' | 'network_admin' | 'super_admin';
}

/**
 * Create a direct agent assignment record
 */
async function directAgentAssignment(
  userId: string,
  userEmail: string,
  userName: string,
  agentId: string,
  agentName: string,
  assignedBy: string,
  assignedByEmail: string,
  assignedByName: string,
  organizationId: string,
  organizationName: string,
  networkId?: string,
  networkName?: string,
  assignmentReason?: string
) {
  try {
    logger.debug('Creating direct agent assignment', { userId, agentId }, 'UserLibraryService');
    
    const assignmentData: AgentAssignmentData = {
      userId,
      userEmail,
      userName,
      agentId,
      agentName,
      assignedBy,
      assignedByEmail,
      assignedByName,
      organizationId,
      organizationName,
      assignmentType: 'direct',
      status: 'active',
      assignmentReason: assignmentReason || 'Direct assignment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Only include network fields if they have values
    if (networkId) {
      assignmentData.networkId = networkId;
    }
    if (networkName) {
      assignmentData.networkName = networkName;
    }

    await addDoc(collection(db, 'agentAssignments'), assignmentData);
    logger.info('Direct agent assignment created', { userId, agentId }, 'UserLibraryService');
    
  } catch (error) {
    logger.error('Error creating direct agent assignment', error, 'UserLibraryService');
    throw error;
  }
}

/**
 * Add an agent to user's library
 */
export const addAgentToUserLibrary = async (
  userId: string,
  userEmail: string,
  userName: string,
  agentId: string,
  agentName: string,
  organizationId: string,
  organizationName: string,
  networkId?: string,
  networkName?: string,
  assignmentReason?: string
): Promise<void> => {
  try {
    logger.debug('Starting addAgentToUserLibrary', { userId, agentId, agentName }, 'UserLibraryService');
    console.log('🚀 addAgentToUserLibrary called with:', {
      userId,
      agentId,
      agentName,
      organizationId,
      organizationName,
      networkId,
      networkName,
      assignmentReason
    });
    
    // Create a direct assignment record
    try {
      console.log('📝 Creating direct assignment record...');
      await directAgentAssignment(
        userId,
        userEmail,
        userName,
        agentId,
        agentName,
        userId, // Self-assignment for free agents
        userEmail,
        userName,
        organizationId,
        organizationName,
        networkId,
        networkName,
        assignmentReason || 'Self-assigned free agent'
      );
      console.log('✅ Direct assignment record created successfully');
      logger.debug('Direct assignment created', { userId, agentId }, 'UserLibraryService');
    } catch (assignmentError) {
      console.warn('⚠️ Failed to create assignment record, continuing with user profile update:', assignmentError);
      logger.warn('Failed to create assignment record, continuing with user profile update', assignmentError, 'UserLibraryService');
      // Continue with the user profile update even if assignment record fails
    }

    // Update user profile with assigned agent
    console.log('👤 Updating user profile with agent...');
    logger.debug('Updating user profile with agent', { userId, agentId }, 'UserLibraryService');
    const userDocRef = doc(db, 'users', userId);
    
    // Check if user document exists first
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.log('📄 User document does not exist, creating it...');
      logger.debug('User document does not exist, creating it', { userId }, 'UserLibraryService');
      // Create the user document first
      const newUserData: UserProfileData = {
        email: userEmail,
        displayName: userName,
        organizationId: organizationId,
        organizationName: organizationName,
        assignedAgents: [agentId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Only include network fields if they have values (Firestore doesn't allow undefined)
      if (networkId) {
        newUserData.networkId = networkId;
      }
      if (networkName) {
        newUserData.networkName = networkName;
      }
      
      console.log('📄 Creating new user document with data:', newUserData);
      await setDoc(userDocRef, newUserData);
      console.log('✅ User document created successfully');
      logger.info('User document created with agent', { userId, agentId }, 'UserLibraryService');
    } else {
      console.log('📄 User document exists, updating assignedAgents array...');
      logger.debug('User document exists, updating', { userId }, 'UserLibraryService');
      
      const currentData = userDoc.data();
      const currentAssignedAgents = currentData.assignedAgents || [];
      console.log('📄 Current assigned agents:', currentAssignedAgents);
      
      if (currentAssignedAgents.includes(agentId)) {
        console.log('⚠️ Agent already in user library, skipping update');
        logger.warn('Agent already in user library', { userId, agentId }, 'UserLibraryService');
        return; // Agent already assigned
      }
      
      await updateDoc(userDocRef, {
        assignedAgents: arrayUnion(agentId),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ User profile updated successfully');
      logger.info('User profile updated with agent', { userId, agentId }, 'UserLibraryService');
    }
    
    console.log('🎉 Agent added to user library successfully!');
    logger.info('Agent added to user library successfully', { userId, agentId, agentName }, 'UserLibraryService');
    
  } catch (error) {
    console.error('❌ Error in addAgentToUserLibrary:', error);
    logger.error('Error adding agent to user library', error, 'UserLibraryService');
    throw error;
  }
};

/**
 * Remove an agent from user's library
 */
export const removeAgentFromUserLibrary = async (
  userId: string,
  agentId: string
): Promise<void> => {
  try {
    logger.debug('Removing agent from user library', { userId, agentId }, 'UserLibraryService');
    
    // Update user profile
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      assignedAgents: arrayRemove(agentId),
      updatedAt: new Date().toISOString()
    });
    
    // Deactivate the assignment record
    const assignmentsQuery = query(
      collection(db, 'agentAssignments'),
      where('userId', '==', userId),
      where('agentId', '==', agentId)
    );
    const assignmentDocs = await getDocs(assignmentsQuery);
    
    for (const assignmentDoc of assignmentDocs.docs) {
      await updateDoc(assignmentDoc.ref, {
        status: 'inactive',
        deactivatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    logger.info('Agent removed from user library successfully', { userId, agentId }, 'UserLibraryService');
    
  } catch (error) {
    logger.error('Error removing agent from user library', error, 'UserLibraryService');
    throw error;
  }
};

/**
 * Get user's assigned agents
 */
export const getUserAssignedAgents = async (userId: string): Promise<string[]> => {
  try {
    logger.debug('Fetching user assigned agents', { userId }, 'UserLibraryService');
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      logger.warn('User document not found', { userId }, 'UserLibraryService');
      return [];
    }
    
    const userData = userDoc.data();
    const assignedAgents = userData.assignedAgents || [];
    
    logger.info(`Fetched ${assignedAgents.length} assigned agents for user`, { userId }, 'UserLibraryService');
    return assignedAgents;
    
  } catch (error) {
    logger.error('Error fetching user assigned agents', error, 'UserLibraryService');
    throw error;
  }
};

/**
 * Check if user has access to an agent
 */
export const userHasAgentAccess = async (userId: string, agentId: string): Promise<boolean> => {
  try {
    const assignedAgents = await getUserAssignedAgents(userId);
    return assignedAgents.includes(agentId);
  } catch (error) {
    logger.error('Error checking user agent access', error, 'UserLibraryService');
    return false;
  }
};

/**
 * Create or update user profile in Firestore
 */
export const createOrUpdateUserProfile = async (
  userId: string,
  userEmail: string,
  userName: string,
  organizationId: string,
  organizationName: string,
  role: 'user' | 'company_admin' | 'network_admin' | 'super_admin',
  networkId?: string,
  networkName?: string
): Promise<void> => {
  try {
    logger.debug('Creating/updating user profile', { userId, userEmail }, 'UserLibraryService');
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    const userData: UserProfileData = {
      email: userEmail,
      displayName: userName,
      organizationId,
      organizationName,
      role,
      updatedAt: new Date().toISOString()
    };
    
    // Only include network fields if they have values (Firestore doesn't allow undefined)
    if (networkId) {
      userData.networkId = networkId;
    }
    if (networkName) {
      userData.networkName = networkName;
    }
    
    if (!userDoc.exists()) {
      // Create new user profile
      await setDoc(userDocRef, {
        ...userData,
        assignedAgents: [],
        createdAt: new Date().toISOString()
      });
      logger.info('User profile created', { userId }, 'UserLibraryService');
    } else {
      // Update existing profile
      await updateDoc(userDocRef, userData);
      logger.info('User profile updated', { userId }, 'UserLibraryService');
    }
    
  } catch (error) {
    logger.error('Error creating/updating user profile', error, 'UserLibraryService');
    throw error;
  }
};
