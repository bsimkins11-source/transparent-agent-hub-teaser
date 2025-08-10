import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';
import { Agent } from '../types/agent';
import { fetchAgentsFromFirestore } from './firestore';
import { 
  getCompanyAvailableAgents, 
  getNetworkAvailableAgents,
  getCompanyAgentPermissions,
  getNetworkAgentPermissions
} from './hierarchicalPermissionService';

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
  userProfile: any
): Promise<AgentWithContext[]> => {
  try {
    logger.debug(`Fetching ${libraryType} library agents`, { userId: userProfile?.uid }, 'LibraryService');
    
    let agents: Agent[] = [];
    
    switch (libraryType) {
      case 'global':
        // Global library shows all public agents - the master catalog
        const globalData = await fetchAgentsFromFirestore({ visibility: 'public' });
        agents = globalData.agents || [];
        break;
        
      case 'company':
        // Company library shows agents granted to the company by Super Admin
        if (userProfile?.organizationId && userProfile.organizationId !== 'unassigned') {
          agents = await getCompanyAvailableAgents(userProfile.organizationId);
        }
        break;
        
      case 'network':
        // Network library shows agents granted to the network by Company Admin
        if (userProfile?.organizationId && userProfile?.networkId) {
          agents = await getNetworkAvailableAgents(userProfile.organizationId, userProfile.networkId);
        }
        break;
        
      case 'personal':
        // Personal library shows user's assigned agents
        if (userProfile?.uid) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userProfile.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const assignedAgentIds = userData.assignedAgents || [];
              
              // If no assigned agents, return empty array (not an error)
              if (assignedAgentIds.length === 0) {
                agents = [];
                break;
              }
              
                          // Get all agents from global collection and filter to assigned ones
            const globalData = await fetchAgentsFromFirestore({ visibility: 'public' });
            const allAgents = globalData.agents || [];
            
            // Filter to only assigned agents
            agents = allAgents.filter(agent => assignedAgentIds.includes(agent.id));
          } else {
            // User document doesn't exist yet - return empty array
            agents = [];
          }
        } catch (error) {
          logger.error('Error loading personal library', error, 'LibraryService');
          // Return empty array instead of throwing error
          agents = [];
        }
      } else {
        // No user profile - return empty array
        agents = [];
      }
      break;
    }
    
    // Get user's current library for context
    const userLibraryAgents = await getUserLibraryAgents(userProfile?.uid);
    
    // Add context to each agent
    const agentsWithContext: AgentWithContext[] = await Promise.all(
      agents.map(async (agent) => {
        const context = await getAgentContext(agent, userProfile, libraryType);
        return {
          ...agent,
          ...context,
          inUserLibrary: userLibraryAgents.includes(agent.id)
        };
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
 * Since agents are already filtered by hierarchy, we know they're available to the user
 */
const getAgentContext = async (
  agent: Agent,
  userProfile: any,
  currentLibrary: LibraryType
): Promise<Omit<AgentWithContext, keyof Agent | 'inUserLibrary'>> => {
  // Debug logging removed for production
  
  const context: Omit<AgentWithContext, keyof Agent | 'inUserLibrary'> = {
    availableIn: [],
    accessLevel: 'restricted',
    canAdd: false,
    canRequest: false,
    assignmentType: 'approval' // Default to approval
  };
  
  // For global library, free agents are always available to add
  if (currentLibrary === 'global' && (agent.metadata?.tier === 'free' || !agent.metadata?.tier)) {
    // Free agent in global library
    context.availableIn = ['global'];
    context.accessLevel = 'direct';
    context.canAdd = true;
    context.canRequest = false;
    context.assignmentType = 'free';
    context.grantedBy = 'super_admin';
    return context;
  }
  
  // For global library, premium agents require approval
  if (currentLibrary === 'global' && agent.metadata?.tier === 'premium') {
    // Premium agent in global library
    context.availableIn = ['global'];
    context.accessLevel = 'request';
    context.canAdd = false;
    context.canRequest = true;
    context.assignmentType = 'approval';
    context.grantedBy = 'super_admin';
    return context;
  }
  
  if (!userProfile || userProfile.organizationId === 'unassigned') {
    return context;
  }
  
  try {
    // Since the agent made it through our filters, it's available at some level
    // Check what levels it's available at and determine the most specific permission
    
    let finalAssignmentType: 'free' | 'direct' | 'approval' = 'approval';
    let grantedBy: 'super_admin' | 'company_admin' | 'network_admin' | undefined;
    
    // Check company-level access (granted by Super Admin)
    if (userProfile.organizationId) {
      const companyPermissions = await getCompanyAgentPermissions(userProfile.organizationId);
      const companyHasAccess = companyPermissions?.permissions[agent.id]?.granted;
      
      // Debug logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Agent ${agent.name} context check:`, {
          tier: agent.metadata?.tier,
          companyHasAccess,
          companyPermissions: companyPermissions?.permissions[agent.id]
        });
      }
      
      if (companyHasAccess) {
        context.availableIn.push('company');
        finalAssignmentType = companyPermissions.permissions[agent.id].assignmentType;
        grantedBy = 'super_admin';
        
        // Check network-level access (granted by Company Admin)
        if (userProfile.networkId) {
          const networkPermissions = await getNetworkAgentPermissions(userProfile.organizationId, userProfile.networkId);
          const networkHasAccess = networkPermissions?.permissions[agent.id]?.granted;
          
          if (networkHasAccess) {
            context.availableIn.push('network');
            // Network-level permissions override company-level
            finalAssignmentType = networkPermissions.permissions[agent.id].assignmentType;
            grantedBy = 'company_admin';
          }
        }
      } else {
        // No specific company permissions - check if this is a fallback free agent
        if (agent.metadata?.tier === 'free' || !agent.metadata?.tier) {
          context.availableIn.push('company');
          finalAssignmentType = 'free'; // Free agents can be added directly
          grantedBy = 'super_admin'; // Default to super admin grant
        }
      }
    }
    
    // Set the final context based on the most specific permission level
    context.assignmentType = finalAssignmentType;
    context.grantedBy = grantedBy;
    
    // Determine what actions the user can take
    switch (finalAssignmentType) {
      case 'free':
        // Free agents can be added directly by users
        context.accessLevel = 'direct';
        context.canAdd = true;
        context.canRequest = false;
        break;
        
      case 'direct':
        // Direct agents require admin assignment, users can request
        context.accessLevel = 'request';
        context.canAdd = false;
        context.canRequest = true;
        break;
        
      case 'approval':
        // Approval agents require admin approval, users can request
        context.accessLevel = 'request';
        context.canAdd = false;
        context.canRequest = true;
        break;
    }
    
    // Personal library is always direct access (already assigned)
    if (currentLibrary === 'personal') {
      context.accessLevel = 'direct';
      context.canAdd = false; // Already in library
      context.canRequest = false;
    }
    
  } catch (error) {
    logger.warn('Error getting agent context', { agentId: agent.id, error }, 'LibraryService');
  }
  
  return context;
};

/**
 * Get user's current library agent IDs
 */
const getUserLibraryAgents = async (userId?: string): Promise<string[]> => {
  if (!userId) return [];
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.assignedAgents || [];
    }
  } catch (error) {
    logger.warn('Error fetching user library agents', { userId, error }, 'LibraryService');
  }
  
  return [];
};

/**
 * Get library statistics
 */
export const getLibraryStats = async (
  libraryType: LibraryType,
  userProfile: any
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
 */
export const canAccessLibrary = (
  libraryType: LibraryType,
  userProfile: any
): boolean => {
  switch (libraryType) {
    case 'global':
      return true; // Everyone can view global library
      
    case 'company':
      return userProfile?.organizationId && userProfile.organizationId !== 'unassigned';
      
    case 'network':
      return userProfile?.organizationId && 
             userProfile.organizationId !== 'unassigned' && 
             userProfile?.networkId;
             
    case 'personal':
      return !!userProfile?.uid;
      
    default:
      return false;
  }
};

/**
 * Get library display information
 */
export const getLibraryInfo = (
  libraryType: LibraryType,
  userProfile: any
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
        description: 'Agents granted to your organization by Super Admin',
        icon: '🏢',
        breadcrumb: [userProfile?.organizationName || 'Company', 'Library']
      };
      
    case 'network':
      return {
        name: `${userProfile?.networkName || 'Network'} Library`,
        description: 'Agents granted to your network by Company Admin',
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
        description: 'AI agents assigned to you by administrators',
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
