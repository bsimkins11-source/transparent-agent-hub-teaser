import { doc, updateDoc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';
import { directAgentAssignment } from './requestService';

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
  networkId?: string,
  assignmentReason?: string
): Promise<void> => {
  try {
    logger.debug('Adding agent to user library', { userId, agentId }, 'UserLibraryService');
    
    // Create a direct assignment record
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
      networkId,
      assignmentReason || 'Self-assigned free agent'
    );

    // Update user profile with assigned agent
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      assignedAgents: arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });
    
    logger.info('Agent added to user library successfully', { userId, agentId, agentName }, 'UserLibraryService');
    
  } catch (error) {
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
    
    // TODO: Also deactivate the assignment record
    
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
  networkId?: string,
  networkName?: string
): Promise<void> => {
  try {
    logger.debug('Creating/updating user profile', { userId, userEmail }, 'UserLibraryService');
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    const userData = {
      email: userEmail,
      displayName: userName,
      organizationId,
      organizationName,
      networkId,
      networkName,
      updatedAt: new Date().toISOString()
    };
    
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
