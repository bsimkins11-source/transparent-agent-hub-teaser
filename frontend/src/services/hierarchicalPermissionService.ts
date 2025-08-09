import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
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

/**
 * Get agents available to a company (granted by Super Admin)
 */
export const getCompanyAvailableAgents = async (companyId: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching company available agents', { companyId }, 'HierarchicalPermissions');
    
    const companyPermissionsRef = doc(db, 'companyAgentPermissions', companyId);
    const companyDoc = await getDoc(companyPermissionsRef);
    
    if (!companyDoc.exists()) {
      logger.info('No company permissions found', { companyId }, 'HierarchicalPermissions');
      return [];
    }
    
    const companyPermissions = companyDoc.data() as CompanyAgentPermissions;
    const grantedAgentIds = Object.keys(companyPermissions.permissions).filter(
      agentId => companyPermissions.permissions[agentId].granted
    );
    
    // Fetch agent details for granted agents
    const agents: Agent[] = [];
    for (const agentId of grantedAgentIds) {
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      if (agentDoc.exists()) {
        const agentData = agentDoc.data();
        agents.push({
          id: agentDoc.id,
          name: agentData.name,
          description: agentData.description,
          provider: agentData.provider,
          route: agentData.route,
          metadata: {
            tags: agentData.metadata?.tags || [],
            category: agentData.metadata?.category || 'General',
            tier: agentData.metadata?.tier || 'free',
            permissionType: agentData.metadata?.permissionType || 'direct'
          },
          visibility: agentData.visibility || 'public',
          allowedRoles: agentData.allowedRoles || ['user'],
          createdAt: agentData.createdAt,
          updatedAt: agentData.updatedAt
        });
      }
    }
    
    logger.info(`Found ${agents.length} available agents for company`, { companyId }, 'HierarchicalPermissions');
    return agents;
    
  } catch (error) {
    logger.error('Error fetching company available agents', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Get agents available to a network (granted by Company Admin)
 */
export const getNetworkAvailableAgents = async (companyId: string, networkId: string): Promise<Agent[]> => {
  try {
    logger.debug('Fetching network available agents', { companyId, networkId }, 'HierarchicalPermissions');
    
    const networkPermissionsRef = doc(db, 'networkAgentPermissions', `${companyId}_${networkId}`);
    const networkDoc = await getDoc(networkPermissionsRef);
    
    if (!networkDoc.exists()) {
      logger.info('No network permissions found', { companyId, networkId }, 'HierarchicalPermissions');
      return [];
    }
    
    const networkPermissions = networkDoc.data() as NetworkAgentPermissions;
    const grantedAgentIds = Object.keys(networkPermissions.permissions).filter(
      agentId => networkPermissions.permissions[agentId].granted
    );
    
    // Fetch agent details for granted agents
    const agents: Agent[] = [];
    for (const agentId of grantedAgentIds) {
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      if (agentDoc.exists()) {
        const agentData = agentDoc.data();
        agents.push({
          id: agentDoc.id,
          name: agentData.name,
          description: agentData.description,
          provider: agentData.provider,
          route: agentData.route,
          metadata: {
            tags: agentData.metadata?.tags || [],
            category: agentData.metadata?.category || 'General',
            tier: agentData.metadata?.tier || 'free',
            permissionType: agentData.metadata?.permissionType || 'direct'
          },
          visibility: agentData.visibility || 'public',
          allowedRoles: agentData.allowedRoles || ['user'],
          createdAt: agentData.createdAt,
          updatedAt: agentData.updatedAt
        });
      }
    }
    
    logger.info(`Found ${agents.length} available agents for network`, { companyId, networkId }, 'HierarchicalPermissions');
    return agents;
    
  } catch (error) {
    logger.error('Error fetching network available agents', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Grant agents to a company (Super Admin action)
 */
export const grantAgentsToCompany = async (
  companyId: string,
  companyName: string,
  agentPermissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } },
  adminId: string,
  adminName: string
): Promise<void> => {
  try {
    logger.debug('Granting agents to company', { companyId, agentCount: Object.keys(agentPermissions).length }, 'HierarchicalPermissions');
    
    const permissions: { [agentId: string]: AgentPermission } = {};
    
    for (const [agentId, permission] of Object.entries(agentPermissions)) {
      // Get agent details for tier information
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      const agentData = agentDoc.exists() ? agentDoc.data() : null;
      
      permissions[agentId] = {
        agentId,
        agentName: agentData?.name || 'Unknown Agent',
        granted: permission.granted,
        assignmentType: permission.assignmentType,
        grantedBy: adminId,
        grantedAt: new Date().toISOString(),
        tier: agentData?.metadata?.tier || 'free'
      };
    }
    
    const companyPermissions: CompanyAgentPermissions = {
      companyId,
      companyName,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    };
    
    await setDoc(doc(db, 'companyAgentPermissions', companyId), companyPermissions);
    
    logger.info('Successfully granted agents to company', { companyId, grantedCount: Object.values(permissions).filter(p => p.granted).length }, 'HierarchicalPermissions');
    
  } catch (error) {
    logger.error('Error granting agents to company', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Grant agents to a network (Company Admin action)
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
    logger.debug('Granting agents to network', { companyId, networkId, agentCount: Object.keys(agentPermissions).length }, 'HierarchicalPermissions');
    
    // First verify that the company has access to these agents
    const companyAvailableAgents = await getCompanyAvailableAgents(companyId);
    const companyAgentIds = companyAvailableAgents.map(agent => agent.id);
    
    const permissions: { [agentId: string]: AgentPermission } = {};
    
    for (const [agentId, permission] of Object.entries(agentPermissions)) {
      // Only allow granting if company has access
      if (!companyAgentIds.includes(agentId)) {
        logger.warn('Attempted to grant agent not available to company', { companyId, agentId }, 'HierarchicalPermissions');
        continue;
      }
      
      // Get agent details
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      const agentData = agentDoc.exists() ? agentDoc.data() : null;
      
      permissions[agentId] = {
        agentId,
        agentName: agentData?.name || 'Unknown Agent',
        granted: permission.granted,
        assignmentType: permission.assignmentType,
        grantedBy: adminId,
        grantedAt: new Date().toISOString(),
        tier: agentData?.metadata?.tier || 'free'
      };
    }
    
    const networkPermissions: NetworkAgentPermissions = {
      companyId,
      networkId,
      networkName,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    };
    
    await setDoc(doc(db, 'networkAgentPermissions', `${companyId}_${networkId}`), networkPermissions);
    
    logger.info('Successfully granted agents to network', { companyId, networkId, grantedCount: Object.values(permissions).filter(p => p.granted).length }, 'HierarchicalPermissions');
    
  } catch (error) {
    logger.error('Error granting agents to network', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Get current company agent permissions
 */
export const getCompanyAgentPermissions = async (companyId: string): Promise<CompanyAgentPermissions | null> => {
  try {
    const companyPermissionsRef = doc(db, 'companyAgentPermissions', companyId);
    const companyDoc = await getDoc(companyPermissionsRef);
    
    if (!companyDoc.exists()) {
      return null;
    }
    
    return companyDoc.data() as CompanyAgentPermissions;
    
  } catch (error) {
    logger.error('Error fetching company agent permissions', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Get current network agent permissions
 */
export const getNetworkAgentPermissions = async (companyId: string, networkId: string): Promise<NetworkAgentPermissions | null> => {
  try {
    const networkPermissionsRef = doc(db, 'networkAgentPermissions', `${companyId}_${networkId}`);
    const networkDoc = await getDoc(networkPermissionsRef);
    
    if (!networkDoc.exists()) {
      return null;
    }
    
    return networkDoc.data() as NetworkAgentPermissions;
    
  } catch (error) {
    logger.error('Error fetching network agent permissions', error, 'HierarchicalPermissions');
    throw error;
  }
};

/**
 * Get permission statistics for a company
 */
export const getCompanyPermissionStats = async (companyId: string): Promise<{
  totalAvailable: number;
  totalGranted: number;
  byTier: { [tier: string]: number };
}> => {
  try {
    const permissions = await getCompanyAgentPermissions(companyId);
    
    if (!permissions) {
      return { totalAvailable: 0, totalGranted: 0, byTier: {} };
    }
    
    const allPermissions = Object.values(permissions.permissions);
    const grantedPermissions = allPermissions.filter(p => p.granted);
    
    const byTier = grantedPermissions.reduce((acc, permission) => {
      acc[permission.tier] = (acc[permission.tier] || 0) + 1;
      return acc;
    }, {} as { [tier: string]: number });
    
    return {
      totalAvailable: allPermissions.length,
      totalGranted: grantedPermissions.length,
      byTier
    };
    
  } catch (error) {
    logger.error('Error getting company permission stats', error, 'HierarchicalPermissions');
    return { totalAvailable: 0, totalGranted: 0, byTier: {} };
  }
};

/**
 * Get permission statistics for a network
 */
export const getNetworkPermissionStats = async (companyId: string, networkId: string): Promise<{
  totalAvailable: number;
  totalGranted: number;
  byTier: { [tier: string]: number };
}> => {
  try {
    const permissions = await getNetworkAgentPermissions(companyId, networkId);
    
    if (!permissions) {
      return { totalAvailable: 0, totalGranted: 0, byTier: {} };
    }
    
    const allPermissions = Object.values(permissions.permissions);
    const grantedPermissions = allPermissions.filter(p => p.granted);
    
    const byTier = grantedPermissions.reduce((acc, permission) => {
      acc[permission.tier] = (acc[permission.tier] || 0) + 1;
      return acc;
    }, {} as { [tier: string]: number });
    
    return {
      totalAvailable: allPermissions.length,
      totalGranted: grantedPermissions.length,
      byTier
    };
    
  } catch (error) {
    logger.error('Error getting network permission stats', error, 'HierarchicalPermissions');
    return { totalAvailable: 0, totalGranted: 0, byTier: {} };
  }
};
