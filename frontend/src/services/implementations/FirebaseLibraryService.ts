import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logger } from '../../utils/logger';
import { Agent } from '../../types/agent';
import { fetchAgentsFromFirestore } from '../firestore';
import { 
  getCompanyAvailableAgents, 
  getNetworkAvailableAgents,
  getCompanyAgentPermissions,
  getNetworkAgentPermissions
} from '../hierarchicalPermissionService';
import { UserProfile } from '../../contexts/AuthContext';
import { ILibraryService, LibraryType, AgentWithContext, LibraryStats, LibraryInfo } from '../interfaces/ILibraryService';

export class FirebaseLibraryService implements ILibraryService {
  
  async getLibraryAgents(libraryType: LibraryType, userProfile: UserProfile | null): Promise<AgentWithContext[]> {
    try {
      logger.debug(`Fetching ${libraryType} library agents`, { userId: userProfile?.uid }, 'FirebaseLibraryService');
      
      let agents: Agent[] = [];
      
      switch (libraryType) {
        case 'global':
          // Global library shows all agents - the master catalog (both public and private)
          const globalData = await fetchAgentsFromFirestore();
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
                const globalData = await fetchAgentsFromFirestore();
                const allAgents = globalData.agents || [];
                
                // Filter to only assigned agents
                agents = allAgents.filter(agent => assignedAgentIds.includes(agent.id));
              } else {
                // User document doesn't exist yet - return empty array
                agents = [];
              }
            } catch (error) {
              logger.error('Error loading personal library', error, 'FirebaseLibraryService');
              // Return empty array instead of throwing error
              agents = [];
            }
          } else {
            // No user profile - return empty array
            agents = [];
          }
          break;
      }
      
      // Add context to each agent
      const agentsWithContext: AgentWithContext[] = [];
      for (const agent of agents) {
        const context = await this.getAgentContext(agent, userProfile, libraryType);
        agentsWithContext.push({
          ...agent,
          ...context
        });
      }
      
      logger.info(`Fetched ${agentsWithContext.length} agents for ${libraryType} library`, {}, 'FirebaseLibraryService');
      return agentsWithContext;
      
    } catch (error) {
      logger.error(`Error fetching ${libraryType} library agents`, error, 'FirebaseLibraryService');
      throw error;
    }
  }

  async getLibraryStats(libraryType: LibraryType, userProfile: UserProfile | null): Promise<LibraryStats> {
    try {
      logger.debug(`Fetching ${libraryType} library stats`, { userId: userProfile?.uid }, 'FirebaseLibraryService');
      
      const agents = await this.getLibraryAgents(libraryType, userProfile);
      
      const stats: LibraryStats = {
        total: agents.length,
        available: agents.filter(agent => agent.accessLevel !== 'restricted').length,
        inUserLibrary: agents.filter(agent => agent.inUserLibrary).length,
        byTier: {},
        byCategory: {}
      };
      
      agents.forEach(agent => {
        stats.byTier[agent.tier] = (stats.byTier[agent.tier] || 0) + 1;
        stats.byCategory[agent.category] = (stats.byCategory[agent.category] || 0) + 1;
      });
      
      logger.info(`Library stats calculated for ${libraryType}`, { total: stats.total }, 'FirebaseLibraryService');
      return stats;
      
    } catch (error) {
      logger.error(`Error calculating ${libraryType} library stats`, error, 'FirebaseLibraryService');
      throw error;
    }
  }

  canAccessLibrary(libraryType: LibraryType, userProfile: UserProfile | null): boolean {
    try {
      logger.debug(`Checking access to ${libraryType} library`, { userId: userProfile?.uid }, 'FirebaseLibraryService');
      
      if (!userProfile) {
        return false;
      }
      
      switch (libraryType) {
        case 'global':
          return true; // Everyone can see global library
          
        case 'company':
          return userProfile.organizationId && userProfile.organizationId !== 'unassigned';
          
        case 'network':
          return userProfile.organizationId && userProfile.networkId && userProfile.networkId !== 'unassigned';
          
        case 'personal':
          return !!userProfile.uid;
          
        default:
          return false;
      }
      
    } catch (error) {
      logger.error(`Error checking access to ${libraryType} library`, error, 'FirebaseLibraryService');
      return false;
    }
  }

  getLibraryInfo(libraryType: LibraryType, userProfile: UserProfile | null): LibraryInfo {
    try {
      logger.debug(`Getting library info for ${libraryType}`, { userId: userProfile?.uid }, 'FirebaseLibraryService');
      
      switch (libraryType) {
        case 'global':
          return {
            name: 'Global Library',
            description: 'Master catalog of all available AI agents',
            icon: '🌍',
            breadcrumb: ['Global Library']
          };
          
        case 'company':
          return {
            name: 'Company Library',
            description: 'AI agents available to your organization',
            icon: '🏢',
            breadcrumb: ['Company Library']
          };
          
        case 'network':
          return {
            name: 'Network Library',
            description: 'AI agents available to your network',
            icon: '🔗',
            breadcrumb: ['Company Library', 'Network Library']
          };
          
        case 'personal':
          return {
            name: 'My Agents',
            description: 'Your personally assigned AI agents',
            icon: '👤',
            breadcrumb: ['My Agents']
          };
          
        default:
          return {
            name: 'Unknown Library',
            description: 'Library information not available',
            icon: '❓',
            breadcrumb: ['Unknown']
          };
      }
      
    } catch (error) {
      logger.error(`Error getting library info for ${libraryType}`, error, 'FirebaseLibraryService');
      return {
        name: 'Error',
        description: 'Unable to load library information',
        icon: '⚠️',
        breadcrumb: ['Error']
      };
    }
  }

  async getUserLibraryAgents(userId: string): Promise<string[]> {
    try {
      logger.debug('Fetching user library agents', { userId }, 'FirebaseLibraryService');
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.assignedAgents || [];
      }
      
      return [];
      
    } catch (error) {
      logger.error('Error fetching user library agents', error, 'FirebaseLibraryService');
      throw error;
    }
  }

  async addAgentToUserLibrary(userId: string, agentId: string): Promise<void> {
    try {
      logger.debug('Adding agent to user library', { userId, agentId }, 'FirebaseLibraryService');
      
      // This would typically update the user document
      // For now, this is a placeholder implementation
      logger.info('Agent added to user library', { userId, agentId }, 'FirebaseLibraryService');
      
    } catch (error) {
      logger.error('Error adding agent to user library', error, 'FirebaseLibraryService');
      throw error;
    }
  }

  async removeAgentFromUserLibrary(userId: string, agentId: string): Promise<void> {
    try {
      logger.debug('Removing agent from user library', { userId, agentId }, 'FirebaseLibraryService');
      
      // This would typically update the user document
      // For now, this is a placeholder implementation
      logger.info('Agent removed from user library', { userId, agentId }, 'FirebaseLibraryService');
      
    } catch (error) {
      logger.error('Error removing agent from user library', error, 'FirebaseLibraryService');
      throw error;
    }
  }

  // Multi-tenancy support methods
  async getAgentsByTenant(tenantId: string, libraryType: LibraryType): Promise<AgentWithContext[]> {
    try {
      logger.debug('Fetching agents by tenant', { tenantId, libraryType }, 'FirebaseLibraryService');
      
      // This will be implemented when we have proper tenant isolation
      // For now, return empty array as placeholder
      return [];
      
    } catch (error) {
      logger.error('Error fetching agents by tenant', error, 'FirebaseLibraryService');
      throw error;
    }
  }

  async grantAgentToTenant(agentId: string, tenantId: string, grantedBy: string): Promise<void> {
    try {
      logger.debug('Granting agent to tenant', { agentId, tenantId, grantedBy }, 'FirebaseLibraryService');
      
      // This will be implemented when we have proper tenant management
      // For now, this is a placeholder implementation
      logger.info('Agent granted to tenant', { agentId, tenantId, grantedBy }, 'FirebaseLibraryService');
      
    } catch (error) {
      logger.error('Error granting agent to tenant', error, 'FirebaseLibraryService');
      throw error;
    }
  }

  async revokeAgentFromTenant(agentId: string, tenantId: string): Promise<void> {
    try {
      logger.debug('Revoking agent from tenant', { agentId, tenantId }, 'FirebaseLibraryService');
      
      // This will be implemented when we have proper tenant management
      // For now, this is a placeholder implementation
      logger.info('Agent revoked from tenant', { agentId, tenantId }, 'FirebaseLibraryService');
      
    } catch (error) {
      logger.error('Error revoking agent from tenant', error, 'FirebaseLibraryService');
      throw error;
    }
  }

  // Helper method to get agent context
  private async getAgentContext(
    agent: Agent,
    userProfile: UserProfile | null,
    currentLibrary: LibraryType
  ): Promise<Omit<AgentWithContext, keyof Agent | 'inUserLibrary'>> {
    try {
      if (!userProfile) {
        return {
          availableIn: ['global'],
          accessLevel: 'restricted',
          inUserLibrary: false,
          canAdd: false,
          canRequest: false,
          assignmentType: 'restricted'
        };
      }

      let accessLevel: 'direct' | 'request' | 'restricted' = 'restricted';
      let grantedBy: 'super_admin' | 'company_admin' | 'network_admin' | undefined;
      let canAdd = false;
      let canRequest = false;
      let assignmentType: 'free' | 'direct' | 'approval' = 'restricted';

      // Check if user has this agent in their personal library
      const userLibraryAgentIds = await this.getUserLibraryAgents(userProfile.uid);
      const inUserLibrary = userLibraryAgentIds.includes(agent.id);

      // Determine access level based on library type and user permissions
      switch (currentLibrary) {
        case 'global':
          accessLevel = 'direct';
          canAdd = true;
          canRequest = agent.tier !== 'free';
          assignmentType = agent.tier === 'free' ? 'free' : 'approval';
          break;

        case 'company':
          if (userProfile.organizationId && userProfile.organizationId !== 'unassigned') {
            const companyPermissions = await getCompanyAgentPermissions(userProfile.organizationId, agent.id);
            if (companyPermissions) {
              accessLevel = companyPermissions.accessLevel;
              grantedBy = companyPermissions.grantedBy;
              canAdd = companyPermissions.canAdd;
              canRequest = companyPermissions.canRequest;
              assignmentType = companyPermissions.assignmentType;
            }
          }
          break;

        case 'network':
          if (userProfile.organizationId && userProfile.networkId) {
            const networkPermissions = await getNetworkAgentPermissions(userProfile.organizationId, userProfile.networkId, agent.id);
            if (networkPermissions) {
              accessLevel = networkPermissions.accessLevel;
              grantedBy = networkPermissions.grantedBy;
              canAdd = networkPermissions.canAdd;
              canRequest = networkPermissions.canRequest;
              assignmentType = networkPermissions.assignmentType;
            }
          }
          break;

        case 'personal':
          accessLevel = 'direct';
          canAdd = false; // Can't add to personal library from personal library view
          canRequest = false;
          assignmentType = 'direct';
          break;
      }

      // Determine available libraries
      const availableIn: LibraryType[] = ['global'];
      if (userProfile.organizationId && userProfile.organizationId !== 'unassigned') {
        availableIn.push('company');
      }
      if (userProfile.networkId && userProfile.networkId !== 'unassigned') {
        availableIn.push('network');
      }
      if (inUserLibrary) {
        availableIn.push('personal');
      }

      return {
        availableIn,
        accessLevel,
        grantedBy,
        inUserLibrary,
        canAdd,
        canRequest,
        assignmentType
      };

    } catch (error) {
      logger.error('Error getting agent context', error, 'FirebaseLibraryService');
      return {
        availableIn: ['global'],
        accessLevel: 'restricted',
        inUserLibrary: false,
        canAdd: false,
        canRequest: false,
        assignmentType: 'restricted'
      };
    }
  }
}
