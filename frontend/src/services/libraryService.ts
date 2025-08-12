import { logger } from '../utils/logger';
import { Agent } from '../types/agent';
// REMOVED ALL FIREBASE IMPORTS - system now works locally
import { UserProfile } from '../contexts/AuthContext';
// Use local agent service instead of Firebase
import { getAllLocalAgents, getDemoUserLibrary } from './localAgentService';

export type LibraryType = 'global' | 'company' | 'network' | 'personal';

export interface AgentWithContext extends Agent {
  availableIn: LibraryType[];
  accessLevel: 'direct' | 'request' | 'restricted';
  grantedBy?: 'super_admin' | 'company_admin' | 'network_admin';
  inUserLibrary: boolean;
  canAdd: boolean;
  canRequest: boolean;
  assignmentType?: 'free' | 'direct' | 'approval';
}

export interface LibraryStats {
  total: number;
  available: number;
  inUserLibrary: number;
  byTier: { [tier: string]: number };
  byCategory: { [category: string]: number };
}

/**
 * Get agents for a specific library level with context
 * Users can only see agents that have been granted down the hierarchy by admins
 */
export const getLibraryAgents = async (
  libraryType: LibraryType,
  userProfile: UserProfile | null
): Promise<AgentWithContext[]> => {
  try {
    console.log('🚀 getLibraryAgents called with:', { libraryType, userId: userProfile?.uid });
    logger.debug(`Fetching ${libraryType} library agents`, { userId: userProfile?.uid }, 'LibraryService');
    
    let agents: Agent[] = [];
    
    switch (libraryType) {
      case 'global':
        // Global library shows all agents - the master catalog (both public and private)
        console.log('🌍 Loading global library agents');
        try {
          // REMOVED FIREBASE - load from local data only
          console.log('📡 Loading agents from local data...');
          const { getAllLocalAgents } = await import('./localAgentService');
          agents = await getAllLocalAgents();
          console.log('🌍 All agents loaded (local):', agents.length, 'agents');
          
          // Sort agents to prioritize Gemini and Imagen agents first, then other Google agents
          agents.sort((a, b) => {
            // First priority: Gemini and Imagen agents
            const aIsGeminiOrImagen = a.id === 'gemini-chat-agent' || a.id === 'imagen-agent';
            const bIsGeminiOrImagen = b.id === 'gemini-chat-agent' || b.id === 'imagen-agent';
            
            if (aIsGeminiOrImagen && !bIsGeminiOrImagen) return -1;
            if (!aIsGeminiOrImagen && bIsGeminiOrImagen) return 1;
            
            // Second priority: Other Google agents
            if (aIsGeminiOrImagen === bIsGeminiOrImagen) {
              const aIsGoogle = a.provider.toLowerCase() === 'google';
              const bIsGoogle = b.provider.toLowerCase() === 'google';
              
              if (aIsGoogle && !bIsGoogle) return -1;
              if (!aIsGoogle && bIsGoogle) return 1;
            }
            
            // Maintain original order for everything else
            return 0;
          });
          
          console.log('🔍 Agents sorted with Google agents prioritized');
        } catch (error) {
          console.error('❌ Error loading agents from local data:', error);
          logger.warn('Error loading agents from local data', error, 'LibraryService');
          agents = [];
        }
        break;
        
      case 'company':
        // Company library shows agents granted to the company by Super Admin
        if (userProfile?.organizationId && userProfile.organizationId !== 'unassigned') {
          try {
            // REMOVED FIREBASE - load from local data
            console.log('📭 Loading company agents from local data');
            const { getAllLocalAgents } = await import('./localAgentService');
            const allAgents = await getAllLocalAgents();
            
            // OVERRIDE: Force Coca-Cola agents for testing
            console.log('🔍 Company library filtering - OVERRIDING for Coca-Cola');
            agents = allAgents.filter(agent => 
              agent.organizationId === 'coca-cola' || 
              agent.allowedClients.includes('coca-cola')
            );
            console.log(`✅ FORCED: Loaded ${agents.length} Coca-Cola company agents:`, agents.map(a => a.name));
          } catch (error) {
            console.log('📭 No company agents found, loading demo company agents');
            const { getAllLocalAgents } = await import('./localAgentService');
            agents = await getAllLocalAgents();
          }
        }
        break;
        
      case 'network':
        // Network library shows agents granted to the network by Company Admin
        if (userProfile?.organizationId && userProfile?.networkId) {
          try {
            // REMOVED FIREBASE - load from local data
            console.log('📭 Loading network agents from local data');
            const { getAllLocalAgents } = await import('./localAgentService');
            agents = await getAllLocalAgents();
            console.log('✅ Loaded network agents from local data');
          } catch (error) {
            console.log('📭 No network agents found, loading demo network agents');
            const { getAllLocalAgents } = await import('./localAgentService');
            agents = await getAllLocalAgents();
          }
        }
        break;
        
      case 'personal':
        // Personal library shows agents the user has added to their library
        if (userProfile?.uid) {
          try {
            // REMOVED FIREBASE - load from local data
            console.log('📭 Loading personal agents from local data');
            
            // Get user's current library first
            const userLibraryAgents = await getUserLibraryAgents(userProfile.uid);
            console.log('👤 User library agents:', userLibraryAgents);
            
            if (userLibraryAgents.length > 0) {
              // Load all agents and filter to only show those in user's library
              const { getAllLocalAgents } = await import('./localAgentService');
              const allAgents = await getAllLocalAgents();
              
              // Filter to only agents in user's library
              agents = allAgents.filter(agent => userLibraryAgents.includes(agent.id));
              console.log(`✅ Loaded ${agents.length} personal agents from user library`);
            } else {
              // No agents in library yet
              agents = [];
              console.log('📭 No agents in user library yet');
            }
          } catch (error) {
            console.log('📭 No personal agents found, starting with empty library');
            agents = [];
          }
        }
        break;
        
      default:
        console.log('❌ Unknown library type:', libraryType);
        agents = [];
    }
    
    if (agents.length === 0) {
      console.log('📭 No agents found for library type:', libraryType);
      return [];
    }
    
    // Get user's current library
    const userLibraryAgents = await getUserLibraryAgents(userProfile?.uid);
    
    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('LibraryService Debug:', {
        libraryType,
        userId: userProfile?.uid,
        userLibraryAgents,
        totalAgents: agents.length,
        agentIds: agents.map(a => a.id),
        hasGemini: userLibraryAgents.includes('gemini-chat-agent'),
        hasImagen: userLibraryAgents.includes('imagen-agent')
      });
    }
    
    // Add context to each agent
    const agentsWithContext: AgentWithContext[] = await Promise.all(
      agents.map(async (agent) => {
        const context = await getAgentContext(agent, userProfile, libraryType);
        const inUserLibrary = userLibraryAgents.includes(agent.id);
        
        // Debug logging for specific agents
        if (process.env.NODE_ENV === 'development' && (agent.name.includes('Gemini') || agent.name.includes('Imagen'))) {
          console.log(`Agent Debug - ${agent.name}:`, {
            agentId: agent.id,
            inUserLibrary,
            userLibraryAgents,
            includes: userLibraryAgents.includes(agent.id),
            context: context,
            libraryType: libraryType
          });
        }
        
        // For personal library, override context for agents already in user's library
        if (libraryType === 'personal' && inUserLibrary) {
          console.log(`🔒 Overriding context for ${agent.name} (already in user library):`, {
            before: { ...context },
            after: {
              accessLevel: 'direct',
              canAdd: false,
              canRequest: false,
              availableIn: ['personal']
            }
          });
          context.accessLevel = 'direct';
          context.canAdd = false; // Already added
          context.canRequest = false; // No need to request
          context.availableIn = ['personal'];
        }
        
        // For any library, if agent is already in user's library, override canAdd
        if (inUserLibrary) {
          console.log(`🔒 Agent ${agent.name} is already in user library - setting canAdd=false`);
          context.canAdd = false;
          context.canRequest = false;
        }
        
        const finalAgent = {
          ...agent,
          ...context,
          inUserLibrary
        };
        
        // Debug logging for final agent state
        if (process.env.NODE_ENV === 'development' && (agent.name.includes('Gemini') || agent.name.includes('Imagen'))) {
          console.log(`Final Agent State - ${agent.name}:`, {
            agentId: finalAgent.id,
            inUserLibrary: finalAgent.inUserLibrary,
            canAdd: finalAgent.canAdd,
            canRequest: finalAgent.canRequest,
            accessLevel: finalAgent.accessLevel,
            libraryType,
            userLibraryAgents
          });
        }
        
        return finalAgent;
      })
    );
    
    logger.info(`Fetched ${agentsWithContext.length} ${libraryType} library agents`, { userId: userProfile?.uid }, 'LibraryService');
    return agentsWithContext;
    
  } catch (error) {
    logger.error(`Error fetching ${libraryType} library agents`, error, 'LibraryService');
    throw error;
  }
};

/**
 * Get context for an agent (availability, access level, etc.)
 * Implements proper permission system: free agents are directly addable, premium require approval
 */
const getAgentContext = async (
  agent: Agent,
  userProfile: UserProfile | null,
  currentLibrary: LibraryType
): Promise<Omit<AgentWithContext, keyof Agent | 'inUserLibrary'>> => {
  // Debug logging for development
  console.log(`🔍 Getting context for agent: ${agent.name} (${agent.id})`, {
    currentLibrary,
    userProfile: userProfile ? {
      uid: userProfile.uid,
      organizationId: userProfile.organizationId,
      networkId: userProfile.networkId,
      role: userProfile.role
    } : null,
    agentTier: agent.metadata?.tier,
    agentPermissionType: agent.metadata?.permissionType
  });
  
  const context: Omit<AgentWithContext, keyof Agent | 'inUserLibrary'> = {
    availableIn: [],
    accessLevel: 'restricted',
    canAdd: false,
    canRequest: false,
    assignmentType: 'approval' // Default to approval
  };
  
  // Determine agent permissions based on tier and library type
  const agentTier = agent.metadata?.tier || 'free';
  const isFreeAgent = agentTier === 'free';
  const isPremiumAgent = agentTier === 'premium' || agentTier === 'enterprise';
  
  // Global Library: All agents are available
  if (currentLibrary === 'global') {
    context.availableIn = ['global'];
    
    if (isFreeAgent) {
      // Free agents can be added directly
      context.accessLevel = 'direct';
      context.canAdd = true;
      context.canRequest = false;
      context.assignmentType = 'direct';
      console.log(`✅ ${agent.name} is free agent - directly addable in global library`);
    } else if (isPremiumAgent) {
      // Premium agents require approval
      context.accessLevel = 'request';
      context.canAdd = false;
      context.canRequest = true;
      context.assignmentType = 'approval';
      console.log(`⚠️ ${agent.name} is premium agent - requires approval in global library`);
    }
    
    context.grantedBy = 'super_admin';
    return context;
  }
  
  // Company Library: Available to users with organization
  if (currentLibrary === 'company' && userProfile?.organizationId && userProfile.organizationId !== 'unassigned') {
    context.availableIn = ['company'];
    
    if (isFreeAgent) {
      // Free agents can be added directly
      context.accessLevel = 'direct';
      context.canAdd = true;
      context.canRequest = false;
      context.assignmentType = 'direct';
      console.log(`✅ ${agent.name} is free agent - directly addable in company library`);
    } else if (isPremiumAgent) {
      // Premium agents require approval
      context.accessLevel = 'request';
      context.canAdd = false;
      context.canRequest = true;
      context.assignmentType = 'approval';
      console.log(`⚠️ ${agent.name} is premium agent - requires approval in company library`);
    }
    
    context.grantedBy = 'super_admin';
    return context;
  }
  
  // Network Library: Available to users with network access
  if (currentLibrary === 'network' && userProfile?.organizationId && userProfile?.networkId) {
    context.availableIn = ['network'];
    
    if (isFreeAgent) {
      // Free agents can be added directly
      context.accessLevel = 'direct';
      context.canAdd = true;
      context.canRequest = false;
      context.assignmentType = 'direct';
      console.log(`✅ ${agent.name} is free agent - directly addable in network library`);
    } else if (isPremiumAgent) {
      // Premium agents require approval
      context.accessLevel = 'request';
      context.canAdd = false;
      context.canRequest = true;
      context.assignmentType = 'approval';
      console.log(`⚠️ ${agent.name} is premium agent - requires approval in network library`);
    }
    
    context.grantedBy = 'company_admin';
    return context;
  }
  
  // Personal Library: Only shows agents the user has added
  if (currentLibrary === 'personal') {
    // Personal library context is handled separately in the main function
    // based on whether the agent is actually in the user's library
    context.availableIn = ['personal'];
    context.accessLevel = 'direct';
    context.canAdd = false; // Can't add new agents from personal library view
    context.canRequest = false;
    context.assignmentType = 'direct';
    context.grantedBy = 'user';
    console.log(`👤 ${agent.name} in personal library context`);
    return context;
  }
  
  // Default: Restricted access
  console.log(`❌ ${agent.name} has restricted access in ${currentLibrary} library`);
  return context;
};

/**
 * Get user's current library agent IDs
 * REMOVED FIREBASE - now uses localStorage for local management
 */
const getUserLibraryAgents = async (userId?: string): Promise<string[]> => {
  if (!userId) {
    console.log('❌ getUserLibraryAgents: No userId provided');
    return [];
  }
  
  try {
    // REMOVED FIREBASE - use localStorage instead
    console.log(`🔧 getUserLibraryAgents: Using localStorage for user ${userId}`);
    
    // Get user library from localStorage
    const userLibraryKey = `userLibrary_${userId}`;
    const storedLibrary = localStorage.getItem(userLibraryKey);
    
    console.log(`🔍 localStorage key: ${userLibraryKey}`);
    console.log(`🔍 storedLibrary exists: ${!!storedLibrary}`);
    
    if (storedLibrary) {
      try {
        const libraryData = JSON.parse(storedLibrary);
        console.log('📚 Loaded user library from localStorage:', libraryData);
        const agents = libraryData.agents || [];
        console.log(`📋 Returning ${agents.length} agents:`, agents);
        return agents;
      } catch (parseError) {
        console.error('❌ Error parsing stored library:', parseError);
        console.log('🔄 Creating new demo library due to parse error');
        return await ensureDemoLibrary(userId);
      }
    } else {
      console.log('📭 No stored library found for user, ensuring demo library exists');
      
      // Use the ensure function for better reliability
      return await ensureDemoLibrary(userId);
    }
    
  } catch (error) {
    logger.warn('Error fetching user library agents', { userId, error }, 'LibraryService');
    console.log('🔄 Falling back to demo library due to error');
    return await ensureDemoLibrary(userId);
  }
};

/**
 * Add agent to user's local library
 */
export const addAgentToLocalLibrary = async (userId: string, agentId: string): Promise<boolean> => {
  try {
    console.log(`🔧 Adding agent ${agentId} to local library for user ${userId}`);
    
    const userLibraryKey = `userLibrary_${userId}`;
    const storedLibrary = localStorage.getItem(userLibraryKey);
    
    let libraryData = storedLibrary ? JSON.parse(storedLibrary) : { agents: [], updatedAt: new Date().toISOString() };
    
    // Check if agent is already in library
    if (libraryData.agents.includes(agentId)) {
      console.log(`✅ Agent ${agentId} already in library`);
      return true;
    }
    
    // Add agent to library
    libraryData.agents.push(agentId);
    libraryData.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem(userLibraryKey, JSON.stringify(libraryData));
    
    console.log(`✅ Agent ${agentId} added to local library successfully`);
    console.log(`📚 Library now contains ${libraryData.agents.length} agents`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error adding agent to local library:', error);
    return false;
  }
};

/**
 * Remove agent from user's local library
 */
export const removeAgentFromLocalLibrary = async (userId: string, agentId: string): Promise<boolean> => {
  try {
    console.log(`🔧 Removing agent ${agentId} from local library for user ${userId}`);
    
    const userLibraryKey = `userLibrary_${userId}`;
    const storedLibrary = localStorage.getItem(userLibraryKey);
    
    if (!storedLibrary) {
      console.log('📭 No library found for user');
      return false;
    }
    
    let libraryData = JSON.parse(storedLibrary);
    
    // Remove agent from library
    const initialLength = libraryData.agents.length;
    libraryData.agents = libraryData.agents.filter((id: string) => id !== agentId);
    libraryData.updatedAt = new Date().toISOString();
    
    if (libraryData.agents.length === initialLength) {
      console.log(`⚠️ Agent ${agentId} was not in library`);
      return false;
    }
    
    // Save to localStorage
    localStorage.setItem(userLibraryKey, JSON.stringify(libraryData));
    
    console.log(`✅ Agent ${agentId} removed from local library successfully`);
    console.log(`📚 Library now contains ${libraryData.agents.length} agents`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error removing agent from local library:', error);
    return false;
  }
};

/**
 * Request access to a premium agent
 */
export const requestAgentAccess = async (userId: string, agentId: string, agentName: string): Promise<boolean> => {
  try {
    console.log(`🔧 Requesting access to premium agent ${agentId} for user ${userId}`);
    
    const requestsKey = `agentRequests_${userId}`;
    const storedRequests = localStorage.getItem(requestsKey);
    
    let requestsData = storedRequests ? JSON.parse(storedRequests) : { requests: [], updatedAt: new Date().toISOString() };
    
    // Check if request already exists
    const existingRequest = requestsData.requests.find((req: any) => req.agentId === agentId);
    if (existingRequest) {
      console.log(`⚠️ Request for ${agentName} already exists`);
      return false;
    }
    
    // Add new request
    const newRequest = {
      id: `req_${Date.now()}`,
      agentId,
      agentName,
      userId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      type: 'premium_agent_access'
    };
    
    requestsData.requests.push(newRequest);
    requestsData.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem(requestsKey, JSON.stringify(requestsData));
    
    console.log(`✅ Access request for ${agentName} submitted successfully`);
    console.log(`📋 Total requests: ${requestsData.requests.length}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error requesting agent access:', error);
    return false;
  }
};

/**
 * Get user's pending agent requests
 */
export const getUserAgentRequests = async (userId: string): Promise<any[]> => {
  try {
    const requestsKey = `agentRequests_${userId}`;
    const storedRequests = localStorage.getItem(requestsKey);
    
    if (!storedRequests) {
      return [];
    }
    
    const requestsData = JSON.parse(storedRequests);
    return requestsData.requests || [];
    
  } catch (error) {
    console.error('❌ Error getting user agent requests:', error);
    return [];
  }
};

/**
 * Get library statistics
 */
export const getLibraryStats = async (
  libraryType: LibraryType,
  userProfile: UserProfile | null
): Promise<LibraryStats> => {
  try {
    const agents = await getLibraryAgents(libraryType, userProfile);
    
    const stats: LibraryStats = {
      total: agents.length,
      available: agents.filter(a => a.canAdd || a.canRequest).length,
      inUserLibrary: agents.filter(a => a.inUserLibrary).length,
      byTier: {},
      byCategory: {}
    };
    
    agents.forEach(agent => {
      // Count by tier
      const tier = agent.metadata.tier || 'free';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
      
      // Count by category
      const category = agent.metadata.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });
    
    return stats;
    
  } catch (error) {
    logger.error(`Error getting ${libraryType} library stats`, error, 'LibraryService');
    return {
      total: 0,
      available: 0,
      inUserLibrary: 0,
      byTier: {},
      byCategory: {}
    };
  }
};

/**
 * Check if user can access a specific library
 * REMOVED FIREBASE PERMISSIONS - all libraries are now accessible
 */
export const canAccessLibrary = (
  libraryType: LibraryType,
  userProfile: UserProfile | null
): boolean => {
  // Since we're no longer using Firebase, all libraries are accessible to any authenticated user
  if (!userProfile?.uid) {
    return false; // Still require authentication
  }
  
  // All authenticated users can access all libraries
  return true;
};

/**
 * Get library display information
 */
export const getLibraryInfo = (
  libraryType: LibraryType,
  userProfile: UserProfile | null
): {
  name: string;
  description: string;
  icon: string;
  breadcrumb: string[];
} => {
  switch (libraryType) {
    case 'global':
      return {
        name: 'Global Agent Library',
        description: 'All available agents in the system - the master catalog',
        icon: '🌐',
        breadcrumb: ['Global Library']
      };
      
    case 'company':
      return {
        name: `${userProfile?.organizationName || 'Company'} Library`,
        description: 'AI agents available to your organization',
        icon: '🏢',
        breadcrumb: [userProfile?.organizationName || 'Company', 'Library']
      };
      
    case 'network':
      return {
        name: `${userProfile?.networkName || 'Network'} Library`,
        description: 'AI agents available to your network',
        icon: '🌐',
        breadcrumb: [
          userProfile?.organizationName || 'Company',
          userProfile?.networkName || 'Network',
          'Library'
        ]
      };
      
    case 'personal':
      return {
        name: 'My Agent Library',
        description: 'Your personal collection of AI agents',
        icon: '👤',
        breadcrumb: ['My Library']
      };
      
    default:
      return {
        name: 'Agent Library',
        description: 'AI Agent Library',
        icon: '📚',
        breadcrumb: ['Library']
      };
  }
};

/**
 * Get demo user library (for testing)
 */
export const getDemoUserLibrary = (userId: string): string[] => {
  // Return the important agents for demo purposes
  return ['gemini-chat-agent', 'imagen-agent'];
};

/**
 * Ensure demo library exists for user
 */
export const ensureDemoLibrary = async (userId: string): Promise<string[]> => {
  try {
    console.log(`🔧 Ensuring demo library exists for user ${userId}`);
    
    const userLibraryKey = `userLibrary_${userId}`;
    const storedLibrary = localStorage.getItem(userLibraryKey);
    
    if (storedLibrary) {
      try {
        const libraryData = JSON.parse(storedLibrary);
        console.log('📚 Existing library found:', libraryData);
        return libraryData.agents || [];
      } catch (parseError) {
        console.error('❌ Error parsing existing library, creating new demo library');
      }
    }
    
    // Create demo library
    const demoLibrary = getDemoUserLibrary(userId);
    const demoLibraryData = {
      agents: demoLibrary,
      updatedAt: new Date().toISOString(),
      isDemo: true,
      created: new Date().toISOString()
    };
    
    localStorage.setItem(userLibraryKey, JSON.stringify(demoLibraryData));
    console.log(`✅ Demo library created with ${demoLibrary.length} agents:`, demoLibrary);
    
    return demoLibrary;
    
  } catch (error) {
    console.error('❌ Error ensuring demo library:', error);
    return [];
  }
};

/**
 * Reset user library to demo state
 */
export const resetUserLibraryToDemo = async (userId: string): Promise<boolean> => {
  try {
    console.log(`🔧 Resetting user library to demo state for user ${userId}`);
    
    const userLibraryKey = `userLibrary_${userId}`;
    const demoLibrary = getDemoUserLibrary(userId);
    
    const demoLibraryData = {
      agents: demoLibrary,
      updatedAt: new Date().toISOString(),
      isDemo: true,
      resetAt: new Date().toISOString()
    };
    
    localStorage.setItem(userLibraryKey, JSON.stringify(demoLibraryData));
    
    console.log(`✅ User library reset to demo state with ${demoLibrary.length} agents`);
    return true;
    
  } catch (error) {
    console.error('❌ Error resetting user library:', error);
    return false;
  }
};

/**
 * Clear user library completely
 */
export const clearUserLibrary = async (userId: string): Promise<boolean> => {
  try {
    console.log(`🔧 Clearing user library for user ${userId}`);
    
    const userLibraryKey = `userLibrary_${userId}`;
    localStorage.removeItem(userLibraryKey);
    
    console.log('✅ User library cleared');
    return true;
    
  } catch (error) {
    console.error('❌ Error clearing user library:', error);
    return false;
  }
};

/**
 * Force reset user library to demo state (can be called from browser console)
 */
export const forceResetToDemo = async (userId: string): Promise<boolean> => {
  try {
    console.log(`🔧 Force resetting user library to demo state for user ${userId}`);
    
    // Clear existing library
    await clearUserLibrary(userId);
    
    // Create fresh demo library
    const demoLibrary = await ensureDemoLibrary(userId);
    
    console.log(`✅ User library force reset to demo state with ${demoLibrary.length} agents`);
    return true;
    
  } catch (error) {
    console.error('❌ Error force resetting user library:', error);
    return false;
  }
};

// Make functions available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).AgentLibraryDebug = {
    ensureDemoLibrary,
    resetUserLibraryToDemo,
    clearUserLibrary,
    forceResetToDemo,
    getDemoUserLibrary
  };
}
