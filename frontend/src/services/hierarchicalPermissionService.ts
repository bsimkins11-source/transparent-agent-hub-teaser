// Local hierarchical permission service
import { logger } from '../utils/logger';
import { Agent } from '../types/agent';

export interface AgentPermission {
  agentId: string;
  agentName: string;
  granted: boolean;
  assignmentType: 'free' | 'direct' | 'approval';
  grantedBy: string; // Admin who granted it
  grantedAt: string; // ISO timestamp
  tier: 'free' | 'premium' | 'enterprise';
}

export interface CompanyAgentPermissions {
  companyId: string;
  companyName: string;
  permissions: { [agentId: string]: AgentPermission };
  updatedAt: string;
  updatedBy: string;
}

export interface NetworkAgentPermissions {
  companyId: string;
  networkId: string;
  networkName: string;
  permissions: { [agentId: string]: AgentPermission };
  updatedAt: string;
  updatedBy: string;
}

// Local storage for permissions (in-memory for development)
const localCompanyPermissions: Map<string, CompanyAgentPermissions> = new Map();
const localNetworkPermissions: Map<string, NetworkAgentPermissions> = new Map();
const localGlobalSettings: Map<string, any> = new Map();

/**
 * Get agents available to a company (granted by Super Admin)
 */
export const getCompanyAvailableAgents = async (companyId: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching company available agents', { companyId }, 'HierarchicalPermissions');
    
    // For local development, return all agents
    const mockAgents: Agent[] = [
      {
        id: 'gemini-chat-agent',
        name: 'Gemini Chat Agent',
        description: 'Google Gemini AI chat assistant',
        provider: 'google',
        route: '/api/gemini',
        metadata: {
          tags: ['chat', 'ai', 'google'],
          category: 'Productivity',
          tier: 'free',
          permissionType: 'direct'
        },
        visibility: 'public',
        allowedRoles: ['user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'imagen-agent',
        name: 'Imagen Agent',
        description: 'Google Imagen AI image generation',
        provider: 'google',
        route: '/api/imagen',
        metadata: {
          tags: ['image', 'generation', 'ai', 'google'],
          category: 'Creative',
          tier: 'premium',
          permissionType: 'approval'
        },
        visibility: 'public',
        allowedRoles: ['user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    logger.info(`Found ${mockAgents.length} available agents for company`, { companyId }, 'HierarchicalPermissions');
    return mockAgents;
    
  } catch (error) {
    logger.error('Error fetching company available agents', error, 'HierarchicalPermissions');
    return [];
  }
};

/**
 * Get agents available to a network (granted by Company Admin)
 */
export const getNetworkAvailableAgents = async (companyId: string, networkId: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching network available agents', { companyId, networkId }, 'HierarchicalPermissions');
    
    // For local development, return the same agents as company level
    return await getCompanyAvailableAgents(companyId);
    
  } catch (error) {
    logger.error('Error fetching network available agents', error, 'HierarchicalPermissions');
    return [];
  }
};

/**
 * Grant agents to a company
 */
export const grantAgentsToCompany = async (
  companyId: string,
  companyName: string,
  agentPermissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } },
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    logger.debug('Granting agents to company', { companyId, agentPermissions }, 'HierarchicalPermissions');
    
    const permissions: { [agentId: string]: AgentPermission } = {};
    
    for (const [agentId, permission] of Object.entries(agentPermissions)) {
      permissions[agentId] = {
        agentId,
        agentName: `Agent ${agentId}`, // Mock name
        granted: permission.granted,
        assignmentType: permission.assignmentType,
        grantedBy: adminId,
        grantedAt: new Date().toISOString(),
        tier: 'free' // Default tier
      };
    }
    
    const companyPermissions: CompanyAgentPermissions = {
      companyId,
      companyName,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName
    };
    
    localCompanyPermissions.set(companyId, companyPermissions);
    
    logger.info('Agents granted to company successfully', { companyId }, 'HierarchicalPermissions');
    
  } catch (error) {
    logger.error('Error granting agents to company', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Grant agents to a network
 */
export const grantAgentsToNetwork = async (
  companyId: string,
  networkId: string,
  networkName: string,
  agentPermissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } },
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    logger.debug('Granting agents to network', { companyId, networkId, agentPermissions }, 'HierarchicalPermissions');
    
    const permissions: { [agentId: string]: AgentPermission } = {};
    
    for (const [agentId, permission] of Object.entries(agentPermissions)) {
      permissions[agentId] = {
        agentId,
        agentName: `Agent ${agentId}`, // Mock name
        granted: permission.granted,
        assignmentType: permission.assignmentType,
        grantedBy: adminId,
        grantedAt: new Date().toISOString(),
        tier: 'free' // Default tier
      };
    }
    
    const networkPermissions: NetworkAgentPermissions = {
      companyId,
      networkId,
      networkName,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName
    };
    
    localNetworkPermissions.set(`${companyId}_${networkId}`, networkPermissions);
    
    logger.info('Agents granted to network successfully', { companyId, networkId }, 'HierarchicalPermissions');
    
  } catch (error) {
    logger.error('Error granting agents to network', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Get company agent permissions
 */
export const getCompanyAgentPermissions = async (companyId: string): Promise<CompanyAgentPermissions | null> => {
  try {
    logger.debug('Fetching company agent permissions', { companyId }, 'HierarchicalPermissions');
    
    const permissions = localCompanyPermissions.get(companyId);
    return permissions || null;
    
  } catch (error) {
    logger.error('Error fetching company agent permissions', error, 'HierarchicalPermissions');
    return null;
  }
};

/**
 * Get network agent permissions
 */
export const getNetworkAgentPermissions = async (companyId: string, networkId: string): Promise<NetworkAgentPermissions | null> => {
  try {
    logger.debug('Fetching network agent permissions', { companyId, networkId }, 'HierarchicalPermissions');
    
    const permissions = localNetworkPermissions.get(`${companyId}_${networkId}`);
    return permissions || null;
    
  } catch (error) {
    logger.error('Error fetching network agent permissions', error, 'HierarchicalPermissions');
    return null;
  }
};

/**
 * Get company permission statistics
 */
export const getCompanyPermissionStats = async (companyId: string): Promise<{
  totalAvailable: number;
  totalGranted: number;
  byTier: { [tier: string]: number };
}> => {
  try {
    logger.debug('Fetching company permission stats', { companyId }, 'HierarchicalPermissions');
    
    const permissions = localCompanyPermissions.get(companyId);
    
    if (!permissions) {
      return {
        totalAvailable: 0,
        totalGranted: 0,
        byTier: {}
      };
    }
    
    const totalGranted = Object.values(permissions.permissions).filter(p => p.granted).length;
    const byTier: { [tier: string]: number } = {};
    
    Object.values(permissions.permissions).forEach(permission => {
      if (permission.granted) {
        byTier[permission.tier] = (byTier[permission.tier] || 0) + 1;
      }
    });
    
    return {
      totalAvailable: Object.keys(permissions.permissions).length,
      totalGranted,
      byTier
    };
    
  } catch (error) {
    logger.error('Error fetching company permission stats', error, 'HierarchicalPermissions');
    return {
      totalAvailable: 0,
      totalGranted: 0,
      byTier: {}
    };
  }
};

/**
 * Get network permission statistics
 */
export const getNetworkPermissionStats = async (companyId: string, networkId: string): Promise<{
  totalAvailable: number;
  totalGranted: number;
  byTier: { [tier: string]: number };
}> => {
  try {
    logger.debug('Fetching network permission stats', { companyId, networkId }, 'HierarchicalPermissions');
    
    const permissions = localNetworkPermissions.get(`${companyId}_${networkId}`);
    
    if (!permissions) {
      return {
        totalAvailable: 0,
        totalGranted: 0,
        byTier: {}
      };
    }
    
    const totalGranted = Object.values(permissions.permissions).filter(p => p.granted).length;
    const byTier: { [tier: string]: number } = {};
    
    Object.values(permissions.permissions).forEach(permission => {
      if (permission.granted) {
        byTier[permission.tier] = (byTier[permission.tier] || 0) + 1;
      }
    });
    
    return {
      totalAvailable: Object.keys(permissions.permissions).length,
      totalGranted,
      byTier
    };
    
  } catch (error) {
    logger.error('Error fetching network permission stats', error, 'HierarchicalPermissions');
    return {
      totalAvailable: 0,
      totalGranted: 0,
      byTier: {}
    };
  }
};

// Global agent settings interfaces
export interface GlobalAgentSettings {
  agentId: string;
  enabled: boolean;
  defaultTier: 'free' | 'premium' | 'enterprise';
  defaultAssignmentType: 'free' | 'direct' | 'approval';
  updatedAt: string;
  updatedBy: string;
}

export interface GlobalAgentConfig {
  settings: { [agentId: string]: GlobalAgentSettings };
  updatedAt: string;
  updatedBy: string;
}

/**
 * Save global agent settings
 */
export const saveGlobalAgentSettings = async (
  agentSettings: {[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}},
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    logger.debug('Saving global agent settings', { agentSettings }, 'HierarchicalPermissions');
    
    const settings: { [agentId: string]: GlobalAgentSettings } = {};
    
    for (const [agentId, setting] of Object.entries(agentSettings)) {
      settings[agentId] = {
        agentId,
        enabled: setting.enabled,
        defaultTier: setting.defaultTier,
        defaultAssignmentType: setting.defaultAssignmentType,
        updatedAt: new Date().toISOString(),
        updatedBy: adminName
      };
    }
    
    const globalConfig: GlobalAgentConfig = {
      settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName
    };
    
    localGlobalSettings.set('global', globalConfig);
    
    logger.info('Global agent settings saved successfully', undefined, 'HierarchicalPermissions');
    
  } catch (error) {
    logger.error('Error saving global agent settings', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Get global agent settings
 */
export const getGlobalAgentSettings = async (): Promise<GlobalAgentConfig | null> => {
  try {
    logger.debug('Fetching global agent settings', undefined, 'HierarchicalPermissions');
    
    const settings = localGlobalSettings.get('global');
    return settings || null;
    
  } catch (error) {
    logger.error('Error fetching global agent settings', error, 'HierarchicalPermissions');
    return null;
  }
};
