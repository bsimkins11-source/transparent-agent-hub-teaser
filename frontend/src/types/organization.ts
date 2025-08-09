export interface Organization {
  id: string;
  name: string;
  domain: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  adminEmail: string;
  adminName: string;
  networks: Network[];
  userCount: number;
  agentCount: number;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface Network {
  id: string;
  name: string;
  slug: string;
  type: 'business_unit' | 'region' | 'department' | 'custom';
  organizationId: string;
  adminEmail: string;
  adminName: string;
  description?: string;
  logo?: string;
  primaryColor?: string; // Inherits from organization if not set
  secondaryColor?: string; // Inherits from organization if not set
  userCount: number;
  agentCount: number;
  enabledAgents: string[]; // Agent IDs enabled for this network
  createdAt: string;
  status: 'active' | 'suspended';
  settings: NetworkSettings;
}

export interface NetworkSettings {
  allowUserSelfRegistration: boolean;
  requireApprovalForAgentAccess: boolean;
  customBranding: boolean;
  maxUsers?: number;
  maxAgents?: number;
}

export interface NetworkUser {
  id: string;
  email: string;
  displayName: string;
  role: 'network_admin' | 'user';
  networkId: string;
  organizationId: string;
  assignedAgents: string[];
  lastLogin: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export interface UserRole {
  userId: string;
  organizationId?: string;
  networkId?: string;
  role: 'super_admin' | 'company_admin' | 'network_admin' | 'user';
  permissions: UserPermissions;
}

export interface UserPermissions {
  // Global permissions
  canManageOrganizations: boolean;
  
  // Organization permissions
  canManageCompanyUsers: boolean;
  canManageCompanyAgents: boolean;
  canManageNetworks: boolean;
  canViewCompanyAnalytics: boolean;
  
  // Network permissions
  canManageNetworkUsers: boolean;
  canManageNetworkAgents: boolean;
  canViewNetworkAnalytics: boolean;
  canCustomizeNetworkBranding: boolean;
}
