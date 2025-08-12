// Local user management service
import { logger } from '../utils/logger';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  organizationId: string;
  organizationName: string;
  role: 'user' | 'company_admin' | 'network_admin' | 'super_admin';
  networkId?: string;
  networkName?: string;
  assignedAgents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'company' | 'network';
  parentId?: string;
  adminUsers: string[];
  memberUsers: string[];
  createdAt: string;
  updatedAt: string;
}

// Local storage for users and organizations (in-memory for development)
const localUsers: Map<string, UserProfile> = new Map();
const localOrganizations: Map<string, Organization> = new Map();

// Initialize with some default data for testing
const initializeDefaultData = () => {
  // Create default super admin user
  const superAdmin: UserProfile = {
    id: 'super-admin-1',
    email: 'admin@transparent.ai',
    displayName: 'Super Admin',
    organizationId: 'transparent-ai',
    organizationName: 'Transparent AI',
    role: 'super_admin',
    assignedAgents: ['gemini-chat-agent', 'imagen-agent'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Create default company admin user
  const companyAdmin: UserProfile = {
    id: 'company-admin-1',
    email: 'company@example.com',
    displayName: 'Company Admin',
    organizationId: 'example-company',
    organizationName: 'Example Company',
    role: 'company_admin',
    assignedAgents: ['gemini-chat-agent'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Create default regular user
  const regularUser: UserProfile = {
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'Regular User',
    organizationId: 'example-company',
    organizationName: 'Example Company',
    role: 'user',
    assignedAgents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Create organizations
  const transparentOrg: Organization = {
    id: 'transparent-ai',
    name: 'Transparent AI',
    type: 'company',
    adminUsers: ['super-admin-1'],
    memberUsers: ['super-admin-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const exampleCompany: Organization = {
    id: 'example-company',
    name: 'Example Company',
    type: 'company',
    adminUsers: ['company-admin-1'],
    memberUsers: ['company-admin-1', 'user-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Store data
  localUsers.set('super-admin-1', superAdmin);
  localUsers.set('company-admin-1', companyAdmin);
  localUsers.set('user-1', regularUser);
  localOrganizations.set('transparent-ai', transparentOrg);
  localOrganizations.set('example-company', exampleCompany);
  
  logger.info('Initialized default user management data', undefined, 'UserManagementService');
};

// Initialize default data
initializeDefaultData();

export const createUserProfile = async (
  userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    logger.debug('Creating user profile', { email: userData.email }, 'UserManagementService');
    
    const userId = `user-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newUser: UserProfile = {
      ...userData,
      id: userId,
      createdAt: now,
      updatedAt: now
    };
    
    localUsers.set(userId, newUser);
    
    logger.info('User profile created successfully', { id: userId, email: userData.email }, 'UserManagementService');
    return userId;
    
  } catch (error) {
    logger.error('Error creating user profile', error, 'UserManagementService');
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    logger.debug('Fetching user profile', { id: userId }, 'UserManagementService');
    
    const user = localUsers.get(userId);
    if (!user) {
      logger.info('User profile not found', { id: userId }, 'UserManagementService');
      return null;
    }
    
    logger.info('User profile fetched successfully', { id: userId, email: user.email }, 'UserManagementService');
    return user;
    
  } catch (error) {
    logger.error('Error fetching user profile', error, 'UserManagementService');
    throw error;
  }
};

export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    logger.debug('Fetching user profile by email', { email }, 'UserManagementService');
    
    const users = Array.from(localUsers.values());
    const user = users.find(u => u.email === email);
    
    if (!user) {
      logger.info('User profile not found by email', { email }, 'UserManagementService');
      return null;
    }
    
    logger.info('User profile fetched successfully by email', { email, id: user.id }, 'UserManagementService');
    return user;
    
  } catch (error) {
    logger.error('Error fetching user profile by email', error, 'UserManagementService');
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    logger.debug('Updating user profile', { id: userId }, 'UserManagementService');
    
    const user = localUsers.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localUsers.set(userId, updatedUser);
    
    logger.info('User profile updated successfully', { id: userId }, 'UserManagementService');
    
  } catch (error) {
    logger.error('Error updating user profile', error, 'UserManagementService');
    throw error;
  }
};

export const deleteUserProfile = async (userId: string): Promise<void> => {
  try {
    logger.debug('Deleting user profile', { id: userId }, 'UserManagementService');
    
    const deleted = localUsers.delete(userId);
    if (!deleted) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    logger.info('User profile deleted successfully', { id: userId }, 'UserManagementService');
    
  } catch (error) {
    logger.error('Error deleting user profile', error, 'UserManagementService');
    throw error;
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    logger.debug('Fetching all users', undefined, 'UserManagementService');
    
    const users = Array.from(localUsers.values());
    
    logger.info(`Fetched ${users.length} users`, undefined, 'UserManagementService');
    return users;
    
  } catch (error) {
    logger.error('Error fetching all users', error, 'UserManagementService');
    throw error;
  }
};

export const getUsersByOrganization = async (organizationId: string): Promise<UserProfile[]> => {
  try {
    logger.debug('Fetching users by organization', { organizationId }, 'UserManagementService');
    
    const users = Array.from(localUsers.values());
    const orgUsers = users.filter(user => user.organizationId === organizationId);
    
    logger.info(`Found ${orgUsers.length} users in organization`, { organizationId }, 'UserManagementService');
    return orgUsers;
    
  } catch (error) {
    logger.error('Error fetching users by organization', error, 'UserManagementService');
    throw error;
  }
};

export const getUsersByRole = async (role: UserProfile['role']): Promise<UserProfile[]> => {
  try {
    logger.debug('Fetching users by role', { role }, 'UserManagementService');
    
    const users = Array.from(localUsers.values());
    const roleUsers = users.filter(user => user.role === role);
    
    logger.info(`Found ${roleUsers.length} users with role ${role}`, undefined, 'UserManagementService');
    return roleUsers;
    
  } catch (error) {
    logger.error('Error fetching users by role', error, 'UserManagementService');
    throw error;
  }
};

export const createOrganization = async (
  orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    logger.debug('Creating organization', { name: orgData.name }, 'UserManagementService');
    
    const orgId = `org-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newOrg: Organization = {
      ...orgData,
      id: orgId,
      createdAt: now,
      updatedAt: now
    };
    
    localOrganizations.set(orgId, newOrg);
    
    logger.info('Organization created successfully', { id: orgId, name: orgData.name }, 'UserManagementService');
    return orgId;
    
  } catch (error) {
    logger.error('Error creating organization', error, 'UserManagementService');
    throw error;
  }
};

export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  try {
    logger.debug('Fetching organization', { id: orgId }, 'UserManagementService');
    
    const org = localOrganizations.get(orgId);
    if (!org) {
      logger.info('Organization not found', { id: orgId }, 'UserManagementService');
      return null;
    }
    
    logger.info('Organization fetched successfully', { id: orgId, name: org.name }, 'UserManagementService');
    return org;
    
  } catch (error) {
    logger.error('Error fetching organization', error, 'UserManagementService');
    throw error;
  }
};

export const getAllOrganizations = async (): Promise<Organization[]> => {
  try {
    logger.debug('Fetching all organizations', undefined, 'UserManagementService');
    
    const orgs = Array.from(localOrganizations.values());
    
    logger.info(`Fetched ${orgs.length} organizations`, undefined, 'UserManagementService');
    return orgs;
    
  } catch (error) {
    logger.error('Error fetching all organizations', error, 'UserManagementService');
    throw error;
  }
};

export const updateOrganization = async (orgId: string, updates: Partial<Organization>): Promise<void> => {
  try {
    logger.debug('Updating organization', { id: orgId }, 'UserManagementService');
    
    const org = localOrganizations.get(orgId);
    if (!org) {
      throw new Error(`Organization with id ${orgId} not found`);
    }
    
    const updatedOrg: Organization = {
      ...org,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localOrganizations.set(orgId, updatedOrg);
    
    logger.info('Organization updated successfully', { id: orgId }, 'UserManagementService');
    
  } catch (error) {
    logger.error('Error updating organization', error, 'UserManagementService');
    throw error;
  }
};

export const deleteOrganization = async (orgId: string): Promise<void> => {
  try {
    logger.debug('Deleting organization', { id: orgId }, 'UserManagementService');
    
    const deleted = localOrganizations.delete(orgId);
    if (!deleted) {
      throw new Error(`Organization with id ${orgId} not found`);
    }
    
    logger.info('Organization deleted successfully', { id: orgId }, 'UserManagementService');
    
  } catch (error) {
    logger.error('Error deleting organization', error, 'UserManagementService');
    throw error;
  }
};

export const getUserManagementStats = async (): Promise<{
  totalUsers: number;
  totalOrganizations: number;
  usersByRole: { [role: string]: number };
  usersByOrganization: { [orgId: string]: number };
}> => {
  try {
    logger.debug('Fetching user management statistics', undefined, 'UserManagementService');
    
    const users = Array.from(localUsers.values());
    const orgs = Array.from(localOrganizations.values());
    
    const stats = {
      totalUsers: users.length,
      totalOrganizations: orgs.length,
      usersByRole: {} as { [role: string]: number },
      usersByOrganization: {} as { [orgId: string]: number }
    };
    
    users.forEach(user => {
      // Count by role
      stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
      
      // Count by organization
      stats.usersByOrganization[user.organizationId] = (stats.usersByOrganization[user.organizationId] || 0) + 1;
    });
    
    logger.info('User management statistics calculated', { totalUsers: stats.totalUsers }, 'UserManagementService');
    return stats;
    
  } catch (error) {
    logger.error('Error calculating user management statistics', error, 'UserManagementService');
    throw error;
  }
};
