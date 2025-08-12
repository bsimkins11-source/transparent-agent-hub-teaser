export interface Agent {
  id: string
  name: string
  description: string
  provider: 'openai' | 'google' | 'anthropic'
  route: string
  icon?: string
  metadata: {
    tags: string[]
    category: string
    tier?: 'free' | 'premium' | 'enterprise'
    permissionType?: 'free' | 'direct' | 'approval'
    // New fields for submission workflow
    version?: string
    promptTemplateId?: string
    executionTarget?: 'vertex' | 'openai' | 'cloud-run'
    testConfig?: any
    changelog?: string[]
  }
  visibility: 'global' | 'private' | 'company' | 'network'
  allowedClients?: string[]
  allowedRoles?: string[]
  createdAt?: string
  updatedAt?: string
  
  // New fields for submission and approval workflow
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'deprecated'
  submitterId?: string
  submitterEmail?: string
  submitterName?: string
  submissionDate?: string
  reviewedBy?: string
  reviewerEmail?: string
  reviewerName?: string
  approvalDate?: string
  rejectionReason?: string
  auditTrail?: AuditEntry[]
  
  // Company and network context
  organizationId?: string
  organizationName?: string
  networkId?: string
  networkName?: string
}

export interface AuditEntry {
  action: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'updated' | 'deprecated'
  timestamp: string
  userId: string
  userEmail: string
  userName: string
  details?: string
  metadata?: any
}

export interface AgentSubmission {
  name: string
  description: string
  provider: 'openai' | 'google' | 'anthropic'
  route: string
  category: string
  icon?: string
  tags: string[]
  tier: 'free' | 'premium' | 'enterprise'
  visibility: 'global' | 'private' | 'company' | 'network'
  allowedClients?: string[]
  version?: string
  promptTemplateId?: string
  executionTarget?: 'vertex' | 'openai' | 'cloud-run'
  testConfig?: any
  changelog?: string[]
  organizationId?: string
  networkId?: string
}

export interface AgentReview {
  agentId: string
  action: 'approve' | 'reject' | 'request_changes'
  comments?: string
  rejectionReason?: string
  visibility?: 'global' | 'private' | 'company' | 'network'
  allowedClients?: string[]
}

export interface AgentInteraction {
  message: string
  response: string
  timestamp: string
}

export interface FilterState {
  category: string
  provider: string
  search: string
}
