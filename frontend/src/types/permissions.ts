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

// Creator-specific types
export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  bio?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  avatar?: string;
  
  // Creator stats
  totalAgents: number;
  totalRevenue: number;
  totalUsers: number;
  averageRating: number;
  
  // Verification status
  isVerified: boolean;
  verificationDate?: string;
  verificationMethod: 'email' | 'domain' | 'manual' | 'none';
  
  // Creator tier
  tier: 'basic' | 'verified' | 'premium' | 'enterprise';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

export interface CreatorAgentSubmission {
  id: string;
  creatorId: string;
  agentName: string;
  agentDescription: string;
  agentCategory: string;
  agentSubcategory?: string;
  agentTags: string[];
  
  // Technical details
  model: string;
  provider: 'openai' | 'google' | 'anthropic' | 'custom';
  apiEndpoint?: string;
  apiKeyRequired: boolean;
  
  // Pricing structure
  pricingModel: 'free' | 'per_call' | 'per_user' | 'subscription' | 'custom';
  basePrice: number;
  pricePerCall?: number;
  pricePerUser?: number;
  monthlyPrice?: number;
  
  // Usage limits
  maxCallsPerDay?: number;
  maxCallsPerMonth?: number;
  maxConcurrentUsers?: number;
  
  // Content and examples
  promptTemplate: string;
  exampleInputs: string[];
  exampleOutputs: string[];
  
  // Compliance and safety
  safetyMeasures: string[];
  contentFilters: string[];
  ageRestriction?: 'all' | '13+' | '18+' | '21+';
  
  // Status
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface CreatorDashboard {
  creatorId: string;
  
  // Agent overview
  agents: {
    total: number;
    published: number;
    draft: number;
    underReview: number;
    rejected: number;
  };
  
  // Usage analytics
  usage: {
    totalCalls: number;
    totalUsers: number;
    totalRevenue: number;
    averageRating: number;
    last30Days: {
      calls: number;
      users: number;
      revenue: number;
    };
  };
  
  // Revenue breakdown
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    byAgent: Array<{
      agentId: string;
      agentName: string;
      revenue: number;
      calls: number;
    }>;
  };
  
  // Performance metrics
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    topPerformingAgents: Array<{
      agentId: string;
      agentName: string;
      successRate: number;
      averageRating: number;
    }>;
  };
  
  // User feedback
  feedback: {
    totalReviews: number;
    averageRating: number;
    recentReviews: Array<{
      userId: string;
      agentId: string;
      rating: number;
      comment?: string;
      timestamp: string;
    }>;
  };
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
