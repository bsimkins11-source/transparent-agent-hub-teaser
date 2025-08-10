import { Agent } from '../../types/agent';

export interface CreateAgentRequest {
  name: string;
  description: string;
  provider: 'openai' | 'google' | 'anthropic';
  route: string;
  category: string;
  tags: string[];
  tier: 'free' | 'premium' | 'enterprise';
  visibility: 'public' | 'private';
  allowedRoles: string[];
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  id: string;
}

export interface AgentStats {
  total: number;
  byTier: Record<string, number>;
  byProvider: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface IAgentService {
  // Core CRUD operations
  createAgent(agentData: CreateAgentRequest): Promise<string>;
  updateAgent(updateData: UpdateAgentRequest): Promise<void>;
  deleteAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): Promise<Agent | null>;
  getAllAgents(): Promise<Agent[]>;
  getAllAgentsForManagement(): Promise<Agent[]>;
  
  // Statistics and analytics
  getAgentStats(): Promise<AgentStats>;
  
  // Search and filtering
  searchAgents(query: string): Promise<Agent[]>;
  getAgentsByCategory(category: string): Promise<Agent[]>;
  getAgentsByProvider(provider: string): Promise<Agent[]>;
  getAgentsByTier(tier: string): Promise<Agent[]>;
  
  // Multi-tenancy support
  getAgentsByTenant(tenantId: string): Promise<Agent[]>;
  assignAgentToTenant(agentId: string, tenantId: string): Promise<void>;
  removeAgentFromTenant(agentId: string, tenantId: string): Promise<void>;
}
