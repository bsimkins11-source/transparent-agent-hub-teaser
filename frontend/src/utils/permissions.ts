import { UserProfile } from '../contexts/AuthContext';

/**
 * Permission utility functions for role-based access control
 */

export const canAccessSuperAdmin = (userProfile: UserProfile | null): boolean => {
  return userProfile?.role === 'super_admin';
};

export const canAccessCompanyAdmin = (userProfile: UserProfile | null): boolean => {
  // Super admin can access everything
  if (userProfile?.role === 'super_admin') return true;
  
  // Company admin can access company admin
  if (userProfile?.role === 'company_admin') return true;
  
  // Network admin cannot access company admin
  if (userProfile?.role === 'network_admin') return false;
  
  // User role cannot access company admin
  return false;
};

export const canAccessNetworkAdmin = (userProfile: UserProfile | null): boolean => {
  // Super admin can access everything
  if (userProfile?.role === 'super_admin') return true;
  
  // Company admin can access network admin
  if (userProfile?.role === 'company_admin') return true;
  
  // Network admin can access network admin
  if (userProfile?.role === 'network_admin') return true;
  
  // User role cannot access network admin
  return false;
};

export const canAccessAnyAdmin = (userProfile: UserProfile | null): boolean => {
  return canAccessSuperAdmin(userProfile) || canAccessCompanyAdmin(userProfile) || canAccessNetworkAdmin(userProfile);
};

export const canManageCompany = (userProfile: UserProfile | null): boolean => {
  return userProfile?.permissions?.canManageCompany || false;
};

export const canManageNetwork = (userProfile: UserProfile | null): boolean => {
  return userProfile?.permissions?.canManageNetwork || false;
};

export const canViewAllNetworks = (userProfile: UserProfile | null): boolean => {
  // Super admin and company admin can view all networks in their scope
  return canAccessSuperAdmin(userProfile) || canAccessCompanyAdmin(userProfile);
};

export const canManageSpecificNetwork = (userProfile: UserProfile | null, networkId: string): boolean => {
  // Super admin and company admin can manage any network
  if (canAccessSuperAdmin(userProfile) || canAccessCompanyAdmin(userProfile)) {
    return true;
  }
  
  // Network admin can only manage their specific network
  if (canAccessNetworkAdmin(userProfile)) {
    return userProfile?.networkId === networkId;
  }
  
  return false;
};

export const getAccessibleNetworks = (userProfile: UserProfile | null, allNetworks: string[]): string[] => {
  // Super admin and company admin can access all networks
  if (canViewAllNetworks(userProfile)) {
    return allNetworks;
  }
  
  // Network admin can only access their specific network
  if (canAccessNetworkAdmin(userProfile) && userProfile?.networkId) {
    return allNetworks.filter(networkId => networkId === userProfile.networkId);
  }
  
  return [];
};

export const getApprovalLevel = (userProfile: UserProfile | null): 'super_admin' | 'company_admin' | 'network_admin' | null => {
  if (canAccessSuperAdmin(userProfile)) return 'super_admin';
  if (canAccessCompanyAdmin(userProfile)) return 'company_admin';
  if (canAccessNetworkAdmin(userProfile)) return 'network_admin';
  return null;
};

export const canApproveForOrganization = (userProfile: UserProfile | null, organizationId: string): boolean => {
  // Super admin can approve for any organization
  if (canAccessSuperAdmin(userProfile)) return true;
  
  // Company admin can approve for their own organization
  if (canAccessCompanyAdmin(userProfile)) {
    return userProfile?.organizationId === organizationId;
  }
  
  return false;
};

export const canApproveForNetwork = (userProfile: UserProfile | null, organizationId: string, networkId: string): boolean => {
  // Super admin and company admin can approve for any network in their organization
  if (canAccessSuperAdmin(userProfile)) return true;
  if (canAccessCompanyAdmin(userProfile) && userProfile?.organizationId === organizationId) return true;
  
  // Network admin can approve for their specific network
  if (canAccessNetworkAdmin(userProfile)) {
    return userProfile?.organizationId === organizationId && userProfile?.networkId === networkId;
  }
  
  return false;
};
