export interface AgentPermission {
  agentId: string;
  agentName: string;
  agentDescription: string;
  agentIcon: string;
  agentCategory: string;
  provider: 'openai' | 'google' | 'anthropic';
  
  // Permission levels
  permissions: {
    // Who can grant this agent to others
    canGrantToCompanies: boolean;    // Super Admin only
    canGrantToNetworks: boolean;     // Super Admin + Company Admin
    canGrantToUsers: boolean;        // Super Admin + Company Admin + Network Admin
    
    // Who currently has access
    availableToCompanies: string[];  // Company IDs that have access
    availableToNetworks: string[];   // Network IDs that have access
    availableToUsers: string[];      // User IDs that have access
    
    // Usage restrictions
    maxUsersPerNetwork?: number;
    maxUsersPerCompany?: number;
    requiresApproval: boolean;
    
    // Billing/licensing
    isPremium: boolean;
    licenseType: 'per_user' | 'per_company' | 'per_network' | 'unlimited';
    maxLicenses?: number;
    usedLicenses: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin who made it available
}

export interface PermissionRequest {
  id: string;
  requestType: 'agent_access' | 'network_creation' | 'user_creation';
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  requestedFor?: string; // User/Network ID if requesting for someone else
  
  // Agent-specific
  agentId?: string;
  agentName?: string;
  
  // Network-specific
  networkName?: string;
  networkType?: 'business_unit' | 'region' | 'department';
  
  // Context
  organizationId: string;
  networkId?: string;
  justification: string;
  businessCase?: string;
  
  // Status
  status: 'pending' | 'approved' | 'denied' | 'expired';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Metadata
  createdAt: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface PermissionGrant {
  id: string;
  agentId: string;
  grantedTo: string; // User/Network/Company ID
  grantedToType: 'user' | 'network' | 'company';
  grantedBy: string; // Admin who granted it
  grantedByRole: 'super_admin' | 'company_admin' | 'network_admin';
  
  // Restrictions
  restrictions: {
    maxUsage?: number;
    usageCount: number;
    expiresAt?: string;
    allowedNetworks?: string[];
    allowedTimeSlots?: string[]; // Business hours, etc.
  };
  
  // Status
  status: 'active' | 'suspended' | 'expired' | 'revoked';
  createdAt: string;
  lastUsed?: string;
}

export interface AgentCatalog {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  category: string;
  subcategory?: string;
  provider: 'openai' | 'google' | 'anthropic';
  
  // Availability
  tier: 'free' | 'premium' | 'enterprise';
  visibility: 'public' | 'private' | 'beta';
  
  // Capabilities
  capabilities: string[];
  useCases: string[];
  industries: string[];
  
  // Technical details
  model: string;
  averageResponseTime: string;
  accuracy: string;
  supportedLanguages: string[];
  
  // Permissions & Licensing
  defaultPermissions: {
    requiresApproval: boolean;
    maxUsersPerCompany: number;
    licenseType: 'per_user' | 'per_company' | 'unlimited';
  };
  
  // Metadata
  version: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  
  // Analytics
  totalUsers: number;
  totalCompanies: number;
  averageRating: number;
  totalInteractions: number;
}

export interface PermissionSummary {
  userId: string;
  userEmail: string;
  userName: string;
  organizationId: string;
  networkId?: string;
  
  // Available agents
  availableAgents: {
    agentId: string;
    agentName: string;
    grantedBy: string;
    grantedAt: string;
    restrictions: {
      maxUsage?: number;
      usageCount: number;
      expiresAt?: string;
      allowedNetworks?: string[];
      allowedTimeSlots?: string[];
    };
    usageCount: number;
    lastUsed?: string;
  }[];
  
  // Pending requests
  pendingRequests: {
    agentId: string;
    agentName: string;
    requestedAt: string;
    status: 'pending' | 'under_review';
  }[];
  
  // Usage stats
  totalInteractions: number;
  mostUsedAgent: string;
  lastActivity: string;
}
