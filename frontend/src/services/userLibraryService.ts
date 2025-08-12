// Local user library service
import { logger } from '../utils/logger';
import { Agent } from '../types/agent';

export interface UserLibraryEntry {
  agentId: string;
  agentName: string;
  addedAt: string;
  assignmentReason?: string;
  lastUsed?: string;
  usageCount: number;
}

export interface UserLibrary {
  userId: string;
  userEmail: string;
  agents: UserLibraryEntry[];
  updatedAt: string;
}

// Local storage for user libraries (in-memory for development)
const localUserLibraries: Map<string, UserLibrary> = new Map();

// Initialize with some default data for testing
const initializeDefaultLibraries = () => {
  const defaultLibrary: UserLibrary = {
    userId: 'local-user-1',
    userEmail: 'user@example.com',
    agents: [
      {
        agentId: 'gemini-chat-agent',
        agentName: 'Gemini Chat Agent',
        addedAt: new Date().toISOString(),
        assignmentReason: 'Added for testing',
        lastUsed: new Date().toISOString(),
        usageCount: 5
      }
    ],
    updatedAt: new Date().toISOString()
  };
  
  localUserLibraries.set('local-user-1', defaultLibrary);
  logger.info('Initialized default user library', undefined, 'UserLibraryService');
};

// Initialize default libraries
initializeDefaultLibraries();

export const getUserLibrary = async (userId: string): Promise<UserLibrary | null> => {
  try {
    logger.debug('Fetching user library', { userId }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      logger.info('User library not found, creating new one', { userId }, 'UserLibraryService');
      
      // Create new library for user
      const newLibrary: UserLibrary = {
        userId,
        userEmail: `${userId}@example.com`,
        agents: [],
        updatedAt: new Date().toISOString()
      };
      
      localUserLibraries.set(userId, newLibrary);
      return newLibrary;
    }
    
    logger.info('User library fetched successfully', { userId, agentCount: library.agents.length }, 'UserLibraryService');
    return library;
    
  } catch (error) {
    logger.error('Error fetching user library', error, 'UserLibraryService');
    throw error;
  }
};

export const addAgentToUserLibrary = async (
  userId: string,
  agentId: string,
  agentName: string,
  assignmentReason?: string
): Promise<void> => {
  try {
    logger.debug('Adding agent to user library', { userId, agentId, agentName }, 'UserLibraryService');
    
    let library = localUserLibraries.get(userId);
    if (!library) {
      // Create new library if it doesn't exist
      library = {
        userId,
        userEmail: `${userId}@example.com`,
        agents: [],
        updatedAt: new Date().toISOString()
      };
    }
    
    // Check if agent is already in library
    const existingAgent = library.agents.find(agent => agent.agentId === agentId);
    if (existingAgent) {
      throw new Error('Agent is already in user library');
    }
    
    // Add agent to library
    const newEntry: UserLibraryEntry = {
      agentId,
      agentName,
      addedAt: new Date().toISOString(),
      assignmentReason,
      usageCount: 0
    };
    
    library.agents.push(newEntry);
    library.updatedAt = new Date().toISOString();
    
    localUserLibraries.set(userId, library);
    
    logger.info('Agent added to user library successfully', { userId, agentId, agentName }, 'UserLibraryService');
    
  } catch (error) {
    logger.error('Error adding agent to user library', error, 'UserLibraryService');
    throw error;
  }
};

export const removeAgentFromUserLibrary = async (userId: string, agentId: string): Promise<void> => {
  try {
    logger.debug('Removing agent from user library', { userId, agentId }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      throw new Error('User library not found');
    }
    
    const agentIndex = library.agents.findIndex(agent => agent.agentId === agentId);
    if (agentIndex === -1) {
      throw new Error('Agent not found in user library');
    }
    
    // Remove agent from library
    library.agents.splice(agentIndex, 1);
    library.updatedAt = new Date().toISOString();
    
    localUserLibraries.set(userId, library);
    
    logger.info('Agent removed from user library successfully', { userId, agentId }, 'UserLibraryService');
    
  } catch (error) {
    logger.error('Error removing agent from user library', error, 'UserLibraryService');
    throw error;
  }
};

export const updateAgentUsage = async (userId: string, agentId: string): Promise<void> => {
  try {
    logger.debug('Updating agent usage', { userId, agentId }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      throw new Error('User library not found');
    }
    
    const agent = library.agents.find(a => a.agentId === agentId);
    if (!agent) {
      throw new Error('Agent not found in user library');
    }
    
    // Update usage statistics
    agent.lastUsed = new Date().toISOString();
    agent.usageCount += 1;
    library.updatedAt = new Date().toISOString();
    
    localUserLibraries.set(userId, library);
    
    logger.info('Agent usage updated successfully', { userId, agentId, usageCount: agent.usageCount }, 'UserLibraryService');
    
  } catch (error) {
    logger.error('Error updating agent usage', error, 'UserLibraryService');
    throw error;
  }
};

export const isAgentInUserLibrary = async (userId: string, agentId: string): Promise<boolean> => {
  try {
    logger.debug('Checking if agent is in user library', { userId, agentId }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      return false;
    }
    
    const isInLibrary = library.agents.some(agent => agent.agentId === agentId);
    
    logger.info('Agent library check completed', { userId, agentId, isInLibrary }, 'UserLibraryService');
    return isInLibrary;
    
  } catch (error) {
    logger.error('Error checking if agent is in user library', error, 'UserLibraryService');
    return false;
  }
};

export const getUserLibraryStats = async (userId: string): Promise<{
  totalAgents: number;
  recentlyAdded: number;
  mostUsed: UserLibraryEntry[];
  lastUpdated: string;
}> => {
  try {
    logger.debug('Fetching user library statistics', { userId }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      return {
        totalAgents: 0,
        recentlyAdded: 0,
        mostUsed: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalAgents: library.agents.length,
      recentlyAdded: library.agents.filter(agent => 
        new Date(agent.addedAt) > thirtyDaysAgo
      ).length,
      mostUsed: [...library.agents]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
      lastUpdated: library.updatedAt
    };
    
    logger.info('User library statistics calculated', { userId, totalAgents: stats.totalAgents }, 'UserLibraryService');
    return stats;
    
  } catch (error) {
    logger.error('Error calculating user library statistics', error, 'UserLibraryService');
    throw error;
  }
};

export const searchUserLibrary = async (userId: string, query: string): Promise<UserLibraryEntry[]> => {
  try {
    logger.debug('Searching user library', { userId, query }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      return [];
    }
    
    const searchTerm = query.toLowerCase();
    const results = library.agents.filter(agent => 
      agent.agentName.toLowerCase().includes(searchTerm) ||
      agent.assignmentReason?.toLowerCase().includes(searchTerm)
    );
    
    logger.info(`Found ${results.length} agents matching query`, { userId, query }, 'UserLibraryService');
    return results;
    
  } catch (error) {
    logger.error('Error searching user library', error, 'UserLibraryService');
    throw error;
  }
};

export const getAgentAssignmentReason = async (userId: string, agentId: string): Promise<string | null> => {
  try {
    logger.debug('Fetching agent assignment reason', { userId, agentId }, 'UserLibraryService');
    
    const library = localUserLibraries.get(userId);
    if (!library) {
      return null;
    }
    
    const agent = library.agents.find(a => a.agentId === agentId);
    if (!agent) {
      return null;
    }
    
    logger.info('Agent assignment reason fetched successfully', { userId, agentId }, 'UserLibraryService');
    return agent.assignmentReason || null;
    
  } catch (error) {
    logger.error('Error fetching agent assignment reason', error, 'UserLibraryService');
    return null;
  }
};
