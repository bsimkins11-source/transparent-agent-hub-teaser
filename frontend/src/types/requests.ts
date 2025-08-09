export interface AgentRequest {
  id: string
  userId: string
  userEmail: string
  userName: string
  agentId: string
  agentName: string
  requestReason?: string
  status: 'pending' | 'approved' | 'denied' | 'escalated'
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewerEmail?: string
  reviewerName?: string
  denyReason?: string
  adminContact?: {
    name: string
    email: string
    role: string
  }
  // Hierarchy context
  organizationId: string
  organizationName: string
  networkId?: string
  networkName?: string
  // Approval level (where the request should be handled)
  approvalLevel: 'network_admin' | 'company_admin' | 'super_admin'
  // Priority and metadata
  priority: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: {
    userRole?: string
    businessJustification?: string
    expectedUsage?: string
    deadline?: string
  }
}

export interface AgentAssignment {
  id: string
  userId: string
  userEmail: string
  userName: string
  agentId: string
  agentName: string
  assignedBy: string
  assignedByEmail: string
  assignedByName: string
  assignedAt: string
  assignmentType: 'direct' | 'approved_request'
  organizationId: string
  organizationName: string
  networkId?: string
  networkName?: string
  assignmentReason?: string
  isActive?: boolean
  // Assignment context
  expiresAt?: string
}

export interface ApprovalAction {
  id: string
  requestId: string
  action: 'approve' | 'deny' | 'escalate'
  reviewerId: string
  reviewerEmail: string
  reviewerName: string
  reviewerRole: 'network_admin' | 'company_admin' | 'super_admin'
  actionAt: string
  reason?: string
  notes?: string
  // If escalated
  escalatedTo?: 'company_admin' | 'super_admin'
  escalationReason?: string
}

export interface AdminContact {
  name: string
  email: string
  role: 'network_admin' | 'company_admin' | 'super_admin'
  organizationId: string
  networkId?: string
  isActive: boolean
}

export interface ApprovalStats {
  pending: number
  approved: number
  denied: number
  escalated: number
  totalRequests: number
  avgResponseTime: number // in hours
  oldestPendingDays: number
}
