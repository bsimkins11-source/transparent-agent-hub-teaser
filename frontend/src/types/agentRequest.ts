export interface AgentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  agentId: string;
  agentName: string;
  requestType: 'company' | 'network';
  organizationId: string; // company ID
  networkId?: string; // optional for network requests
  status: 'pending' | 'approved' | 'denied';
  requestReason: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface UserAgentLibrary {
  userId: string;
  assignedAgents: string[];
  requestedAgents: string[];
  lastUpdated: string;
}

export interface AgentUsageStats {
  agentId: string;
  totalUsers: number;
  activeUsers: number;
  totalInteractions: number;
  averageRating: number;
}
