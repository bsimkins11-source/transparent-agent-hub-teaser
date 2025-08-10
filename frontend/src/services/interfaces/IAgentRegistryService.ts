import { 
  AgentRegistryEntry, 
  CreateRegistryEntryRequest, 
  UpdateRegistryEntryRequest, 
  RegistrySearchFilters, 
  RegistryStats 
} from '../../types/agentRegistry';

export interface IAgentRegistryService {
  // Core Registry Operations
  createEntry(request: CreateRegistryEntryRequest): Promise<string>;
  getEntry(entryId: string): Promise<AgentRegistryEntry | null>;
  updateEntry(request: UpdateRegistryEntryRequest): Promise<void>;
  deleteEntry(entryId: string): Promise<void>;
  getAllEntries(filters?: RegistrySearchFilters): Promise<AgentRegistryEntry[]>;
  
  // Approval Workflow
  approveEntry(entryId: string, approverId: string, notes?: string): Promise<void>;
  rejectEntry(entryId: string, rejectorId: string, reason: string): Promise<void>;
  requestReview(entryId: string, requesterId: string): Promise<void>;
  
  // Search & Discovery
  searchEntries(query: string, filters?: RegistrySearchFilters): Promise<AgentRegistryEntry[]>;
  getEntriesByCategory(category: string): Promise<AgentRegistryEntry[]>;
  getEntriesByProvider(provider: string): Promise<AgentRegistryEntry[]>;
  getEntriesByStatus(status: string): Promise<AgentRegistryEntry[]>;
  
  // Analytics & Reporting
  getRegistryStats(filters?: RegistrySearchFilters): Promise<RegistryStats>;
  getTenantUsage(tenantId: string, timeRange: string): Promise<any>;
  getApprovalMetrics(timeRange: string): Promise<any>;
  
  // Version Management
  getEntryVersions(agentId: string): Promise<AgentRegistryEntry[]>;
  createNewVersion(entryId: string, version: string): Promise<string>;
  deprecateVersion(entryId: string, reason: string): Promise<void>;
  
  // Compliance & Governance
  validateCompliance(entryId: string): Promise<boolean>;
  getComplianceReport(entryId: string): Promise<any>;
  updateComplianceStatus(entryId: string, status: any): Promise<void>;
}
