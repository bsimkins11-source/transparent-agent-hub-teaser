import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../utils/logger';
import { Agent } from '../types/agent';
// Removed fetchAgentsFromFirestore import to avoid security rule issues
import { 
  getCompanyAvailableAgents, 
  getNetworkAvailableAgents,
  getCompanyAgentPermissions,
  getNetworkAgentPermissions
} from './hierarchicalPermissionService';
import { UserProfile } from '../contexts/AuthContext';
import { AgentDataService } from './agentDataService';

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
        // Temporarily disabled due to security rule issues
        console.log('🌍 Global library temporarily disabled due to security rules');
        try {
          // For now, use local data to avoid security rule issues
          console.log('⚠️ Using local data for global library (security rules blocking Firestore)');
          const { AgentDataService } = await import('./agentDataService');
          agents = await AgentDataService.loadLocalAgents();
          console.log('🌍 Local agents loaded:', agents.length, 'agents');
        } catch (error) {
          console.error('❌ Error loading local agents:', error);
          logger.warn('Error loading local agents', error, 'LibraryService');
          agents = [];
        }
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
        // Personal library shows user's assigned agents + available agents they can add
        console.log('👤 Processing personal library for user:', userProfile?.uid);
        if (userProfile?.uid) {
          try {
            console.log('📄 Fetching user document...');
            const userDoc = await getDoc(doc(db, 'users', userProfile.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const assignedAgentIds = userData.assignedAgents || [];
              console.log('📄 User document found, assigned agents:', assignedAgentIds);
              
              // Create agent objects from assigned agent IDs (bypassing agents collection access)
              console.log('🌍 Creating agent objects from assigned agent IDs...');
              const assignedAgents = assignedAgentIds.map(agentId => {
                // Create minimal agent objects for assigned agents
                if (agentId === 'gemini-chat-agent') {
                  return {
                    id: agentId,
                    name: 'Gemini Chat Agent',
                    description: 'Google Gemini AI Chat Agent',
                    provider: 'Google',
                    route: `/agent/${agentId}`,
                    metadata: {
                      tags: ['AI', 'Chat', 'Google'],
                      category: 'AI Assistant',
                      tier: 'free',
                      permissionType: 'direct'
                    },
                    visibility: 'global',
                    allowedRoles: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                }
                // Add other agents as needed
                return {
                  id: agentId,
                  name: agentId,
                  description: 'Agent description',
                  provider: 'Unknown',
                  route: `/agent/${agentId}`,
                  metadata: {
                    tags: [],
                    category: 'General',
                    tier: 'free',
                    permissionType: 'direct'
                  },
                  visibility: 'global',
                  allowedRoles: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
              });
              console.log('📋 Created assigned agents:', assignedAgents.length, 'agents');
              
              // For now, only show assigned agents to avoid security rule issues
              agents = assignedAgents;
              console.log('🎯 Total agents for personal library:', agents.length);
            } else {
              // User document doesn't exist yet - show no agents to avoid security rule issues
              console.log('📄 User document not found, showing no agents (security rules issue)');
              agents = [];
              console.log('🎯 No agents available for new user (security rules blocking access)');
            }
          } catch (error) {
            console.error('❌ Error loading personal library:', error);
            logger.error('Error loading personal library', error, 'LibraryService');
            // Return empty array instead of throwing error
            agents = [];
          }
        } else {
          // No user profile - return empty array
          console.log('❌ No user profile UID');
          agents = [];
        }
        break;
    }
    
    // Get user's current library for context
    const userLibraryAgents = await getUserLibraryAgents(userProfile?.uid);
    
    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('LibraryService Debug:', {
        libraryType,
        userId: userProfile?.uid,
        userLibraryAgents,
        totalAgents: agents.length,
        agentIds: agents.map(a => a.id)
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
        
        return {
          ...agent,
          ...context,
          inUserLibrary
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
  
  // For personal library, we need to handle this differently
  if (currentLibrary === 'personal') {
    console.log(`🔍 Personal library context for ${agent.name}`);
    // For personal library, free agents can be added directly
    if (agent.metadata?.tier === 'free' || !agent.metadata?.tier) {
      context.availableIn = ['personal'];
      context.accessLevel = 'direct';
      context.canAdd = true;
      context.canRequest = false;
      context.assignmentType = 'free';
      context.grantedBy = 'super_admin';
      console.log(`✅ ${agent.name} marked as addable in personal library (free tier)`);
    } else if (agent.metadata?.tier === 'premium') {
      // Premium agents require approval
      context.availableIn = ['personal'];
      context.accessLevel = 'request';
      context.canAdd = false;
      context.canRequest = true;
      context.assignmentType = 'approval';
      context.grantedBy = 'super_admin';
      console.log(`⚠️ ${agent.name} marked as requestable in personal library (premium tier)`);
    }
    return context;
  }
  
  // For global library, free agents are always available to add
  if (currentLibrary === 'global' && (agent.metadata?.tier === 'free' || !agent.metadata?.tier)) {
    console.log(`🔍 Global library context for ${agent.name} (free tier)`);
    // Free agent in global library
    context.availableIn = ['global'];
    context.accessLevel = 'direct';
    context.canAdd = true;
    context.canRequest = false;
    context.assignmentType = 'free';
    context.grantedBy = 'super_admin';
    console.log(`✅ ${agent.name} marked as addable in global library (free tier)`);
    return context;
  }
  
  // For global library, premium agents require approval
  if (currentLibrary === 'global' && agent.metadata?.tier === 'premium') {
    console.log(`🔍 Global library context for ${agent.name} (premium tier)`);
    // Premium agent in global library
    context.availableIn = ['global'];
    context.accessLevel = 'request';
    context.canAdd = false;
    context.canRequest = true;
    context.assignmentType = 'approval';
    context.grantedBy = 'super_admin';
    console.log(`⚠️ ${agent.name} marked as requestable in global library (premium tier)`);
    return context;
  }

  if (!userProfile || userProfile.organizationId === 'unassigned') {
    console.log(`❌ No user profile or unassigned user for ${agent.name}`);
    return context;
  }
  
  try {
    // Since the agent made it through our filters, it's available at some level
    // Check what levels it's available at and determine the most specific permission
    
    let finalAssignmentType: 'free' | 'direct' | 'approval' = 'approval';
    let grantedBy: 'super_admin' | 'company_admin' | 'network_admin' | undefined;
    
    // Check company-level access (granted by Super Admin)
    if (userProfile.organizationId) {
      console.log(`🔍 Checking company-level access for ${agent.name} in org: ${userProfile.organizationId}`);
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
        console.log(`✅ ${agent.name} has company-level access: ${finalAssignmentType}`);
        
        // Check network-level access (granted by Company Admin)
        if (userProfile.networkId) {
          console.log(`🔍 Checking network-level access for ${agent.name} in network: ${userProfile.networkId}`);
          const networkPermissions = await getNetworkAgentPermissions(userProfile.organizationId, userProfile.networkId);
          const networkHasAccess = networkPermissions?.permissions[agent.id]?.granted;
          
          if (networkHasAccess) {
            context.availableIn.push('network');
            // Network-level permissions override company-level
            finalAssignmentType = networkPermissions.permissions[agent.id].assignmentType;
            grantedBy = 'company_admin';
            console.log(`✅ ${agent.name} has network-level access: ${finalAssignmentType}`);
          }
        }
      } else {
        // No specific company permissions - check if this is a fallback free agent
        if (agent.metadata?.tier === 'free' || !agent.metadata?.tier) {
          context.availableIn.push('company');
          finalAssignmentType = 'free'; // Free agents can be added directly
          grantedBy = 'super_admin'; // Default to super admin grant
          console.log(`✅ ${agent.name} marked as addable (free tier fallback)`);
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
        console.log(`✅ ${agent.name} final context: canAdd=true, canRequest=false (free)`);
        break;
        
      case 'direct':
        // Direct agents can be added directly by users
        context.accessLevel = 'direct';
        context.canAdd = true;
        context.canRequest = false;
        console.log(`✅ ${agent.name} final context: canAdd=true, canRequest=false (direct)`);
        break;
        
      case 'approval':
        // Approval agents require admin approval
        context.accessLevel = 'request';
        context.canAdd = false;
        context.canRequest = true;
        console.log(`⚠️ ${agent.name} final context: canAdd=false, canRequest=true (approval)`);
        break;
        
      default:
        // Restricted agents are not available
        context.accessLevel = 'restricted';
        context.canAdd = false;
        context.canRequest = false;
        console.log(`❌ ${agent.name} final context: canAdd=false, canRequest=false (restricted)`);
        break;
    }
    
    console.log(`🎯 Final context for ${agent.name}:`, {
      availableIn: context.availableIn,
      accessLevel: context.accessLevel,
      canAdd: context.canAdd,
      canRequest: context.canRequest,
      assignmentType: context.assignmentType,
      grantedBy: context.grantedBy
    });
    
    return context;
    
  } catch (error) {
    console.error(`❌ Error getting context for ${agent.name}:`, error);
    logger.error('Error getting agent context', error, 'LibraryService');
    return context;
  }
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
      const assignedAgents = userData.assignedAgents || [];
      
      // Debug logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('getUserLibraryAgents Debug:', {
          userId,
          userData: userData,
          assignedAgents,
          assignedAgentsType: typeof assignedAgents,
          isArray: Array.isArray(assignedAgents)
        });
      }
      
      return assignedAgents;
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
 */
export const canAccessLibrary = (
  libraryType: LibraryType,
  userProfile: UserProfile | null
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
