import { Agent } from './agent';

// Agent Registry Types for Enterprise Governance
export interface AgentRegistryEntry {
  id: string;
  agentId: string;
  version: string;
  agentType: 'ai_agent' | 'workflow_agent' | 'integration_agent' | 'custom_agent';
  status: AgentStatus;
  metadata: AgentMetadata;
  ownerId: string;
  organizationId?: string;
  networkId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  deprecationDate?: string;
  deprecationReason?: string;
  
  // Enhanced cost tracking
  costStructure: CostStructure;
  usageLimits: UsageLimits;
  
  // Performance and compliance
  performanceMetrics: PerformanceMetrics;
  complianceStatus: ComplianceStatus;
  
  // Governance and approval
  approvalWorkflow: ApprovalWorkflow;
  accessControls: AccessControls;
  
  // Audit and versioning
  versionHistory: VersionHistoryEntry[];
  auditTrail: AuditTrailEntry[];
}

export interface POCRegistryEntry extends Omit<AgentRegistryEntry, 'versionHistory' | 'auditTrail'> {
  // Simplified for POC but maintains enterprise structure
}

export interface AgentMetadata {
  name: string;
  description: string;
  category: string;
  tags: string[];
  
  // Enhanced provider configuration
  providers: ProviderConfiguration[];
  models: ModelConfiguration[];
  
  // API and integration details
  apiIntegrations: APIIntegrations;
  
  // Capabilities and limitations
  capabilities: string[];
  limitations: string[];
  useCases: string[];
  
  // Examples and documentation
  examples: AgentExample[];
  documentation: DocumentationLinks;
  
  // Marketplace configuration
  marketplace: MarketplaceConfig;
}

export interface ProviderConfiguration {
  name: string;
  type: 'ai_model' | 'api_service' | 'custom_service';
  provider: 'openai' | 'google' | 'anthropic' | 'azure' | 'aws' | 'custom';
  region: string;
  credentials: CredentialConfiguration;
  features: string[];
  sla?: ServiceLevelAgreement;
}

export interface ModelConfiguration {
  name: string;
  provider: string;
  version: string;
  capabilities: ModelCapabilities;
  performance: ModelPerformance;
  contextWindow: number;
  pricing: ModelPricing;
}

export interface ModelCapabilities {
  maxTokens: number;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsFunctionCalling: boolean;
  supportsStreaming: boolean;
  supportsFineTuning: boolean;
  supportsEmbeddings: boolean;
}

export interface ModelPerformance {
  latency: number; // ms
  accuracy: number; // 0-1
  costPerToken: number;
  throughput: number; // requests/second
  availability: number; // 0-1
}

export interface ModelPricing {
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  embeddingCostPer1kTokens?: number;
  currency: string;
  billingModel: 'per_token' | 'per_request' | 'subscription';
}

export interface APIIntegrations {
  aiServices: AIServiceIntegration[];
  externalAPIs: ExternalAPIIntegration[];
  webhooks: WebhookConfiguration[];
  databases: DatabaseIntegration[];
}

export interface AIServiceIntegration {
  service: string;
  endpoint: string;
  authentication: AuthenticationMethod;
  rateLimits: RateLimitConfig;
  retryPolicy: RetryPolicy;
}

export interface ExternalAPIIntegration {
  name: string;
  baseUrl: string;
  authentication: AuthenticationMethod;
  endpoints: APIEndpoint[];
  rateLimits: RateLimitConfig;
}

export interface WebhookConfiguration {
  url: string;
  events: string[];
  authentication: AuthenticationMethod;
  retryPolicy: RetryPolicy;
}

export interface DatabaseIntegration {
  type: 'firestore' | 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  connectionString?: string;
  collections?: string[];
  tables?: string[];
  permissions: DatabasePermissions;
}

export interface AuthenticationMethod {
  type: 'api_key' | 'oauth2' | 'jwt' | 'service_account' | 'none';
  config: Record<string, any>;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoff: number;
}

export interface DatabasePermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}

export interface AgentExample {
  title: string;
  description: string;
  input: string;
  output: string;
  tags: string[];
}

export interface DocumentationLinks {
  userGuide?: string;
  apiReference?: string;
  tutorials?: string[];
  faq?: string;
  changelog?: string;
}

export interface MarketplaceConfig {
  isPublic: boolean;
  pricing: MarketplacePricing;
  categories: string[];
  featured: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface MarketplacePricing {
  model: 'free' | 'pay_per_use' | 'subscription' | 'enterprise';
  basePrice?: number;
  pricePerRequest?: number;
  pricePerToken?: number;
  currency: string;
  billingCycle?: 'monthly' | 'quarterly' | 'annually';
}

// Enhanced cost tracking
export interface CostStructure {
  baseCost: number;
  costPerRequest: number;
  costPerToken: number;
  costPerMinute: number;
  currency: string;
  billingModel: 'pay_per_use' | 'subscription' | 'enterprise';
  volumeDiscounts: VolumeDiscount[];
  costBreakdown: CostBreakdown;
}

export interface VolumeDiscount {
  threshold: number;
  discountPercentage: number;
  appliesTo: 'requests' | 'tokens' | 'minutes';
}

export interface CostBreakdown {
  infrastructure: number;
  aiModel: number;
  apiCalls: number;
  storage: number;
  bandwidth: number;
  support: number;
}

export interface UsageLimits {
  maxRequestsPerDay: number;
  maxRequestsPerMonth: number;
  maxTokensPerRequest: number;
  maxConcurrentRequests: number;
  rateLimitPerMinute: number;
  storageLimitGB: number;
}

export interface PerformanceMetrics {
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  availability: number;
  lastUpdated: string;
}

export interface ComplianceStatus {
  gdpr: ComplianceLevel;
  hipaa: ComplianceLevel;
  sox: ComplianceLevel;
  iso27001: ComplianceLevel;
  soc2: ComplianceLevel;
  lastAudit: string;
  nextAudit: string;
  complianceNotes: string[];
}

export type ComplianceLevel = 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';

export interface ApprovalWorkflow {
  requiresApproval: boolean;
  approvalLevels: ApprovalLevel[];
  autoApprovalThreshold?: number;
  approvalDeadline?: number; // hours
  escalationPolicy?: EscalationPolicy;
}

export interface ApprovalLevel {
  level: number;
  role: string;
  required: boolean;
  autoApprove?: boolean;
}

export interface EscalationPolicy {
  escalationTime: number; // hours
  escalateTo: string;
  notificationChannels: string[];
}

export interface AccessControls {
  allowedRoles: string[];
  allowedOrganizations: string[];
  allowedNetworks: string[];
  ipWhitelist?: string[];
  timeRestrictions?: TimeRestriction[];
  featureFlags: Record<string, boolean>;
}

export interface TimeRestriction {
  daysOfWeek: number[];
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
}

export interface VersionHistoryEntry {
  version: string;
  releaseDate: string;
  changes: string[];
  author: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  reviewer?: string;
  reviewDate?: string;
  reviewNotes?: string;
  breakingChanges: boolean;
  migrationGuide?: string;
}

export interface AuditTrailEntry {
  action: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  details: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateRegistryEntryRequest {
  agentId: string;
  version?: string;
  agentType: AgentRegistryEntry['agentType'];
  metadata: AgentMetadata;
  ownerId: string;
  organizationId?: string;
  networkId?: string;
}

export interface UpdateRegistryEntryRequest {
  id: string;
  version?: string;
  metadata?: Partial<AgentMetadata>;
  status?: AgentStatus;
  costStructure?: Partial<CostStructure>;
  usageLimits?: Partial<UsageLimits>;
  performanceMetrics?: Partial<PerformanceMetrics>;
  complianceStatus?: Partial<ComplianceStatus>;
  approvalWorkflow?: Partial<ApprovalWorkflow>;
  accessControls?: Partial<AccessControls>;
}

export interface RegistrySearchFilters {
  status?: AgentStatus[];
  category?: string[];
  tags?: string[];
  provider?: string[];
  organizationId?: string;
  networkId?: string;
  costRange?: { min: number; max: number };
  performanceThreshold?: { latency: number; successRate: number };
  complianceLevel?: ComplianceLevel[];
  createdAfter?: string;
  createdBefore?: string;
}

export type AgentStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'deprecated' | 'archived';

export interface RegistryStats {
  totalEntries: number;
  byStatus: Record<AgentStatus, number>;
  byCategory: Record<string, number>;
  byProvider: Record<string, number>;
  byOrganization: Record<string, number>;
  byNetwork: Record<string, number>;
  averageCost: number;
  averagePerformance: PerformanceMetrics;
  complianceSummary: Record<ComplianceLevel, number>;
}

// Enhanced interfaces for better type safety
export interface AgentRegistryService {
  createEntry(request: CreateRegistryEntryRequest): Promise<string>;
  updateEntry(request: UpdateRegistryEntryRequest): Promise<void>;
  deleteEntry(entryId: string): Promise<void>;
  getEntry(entryId: string): Promise<AgentRegistryEntry | null>;
  getAllEntries(filters?: RegistrySearchFilters): Promise<AgentRegistryEntry[]>;
  getVersionHistory(agentId: string): Promise<VersionHistoryEntry[]>;
  createNewVersion(agentId: string, changes: string[]): Promise<string>;
  deprecateVersion(entryId: string, reason: string): Promise<void>;
  submitForReview(entryId: string): Promise<void>;
  approveEntry(entryId: string, approverId: string, notes?: string): Promise<void>;
  rejectEntry(entryId: string, rejectorId: string, reason: string): Promise<void>;
  checkAccess(entryId: string, userId: string, tenantId: string): Promise<boolean>;
  grantAccess(entryId: string, userId: string, permissions: string[]): Promise<void>;
  revokeAccess(entryId: string, userId: string): Promise<void>;
  logAccess(entryId: string, logEntry: any): Promise<void>;
  logPerformance(entryId: string, logEntry: any): Promise<void>;
  getAuditTrail(entryId: string, filters?: any): Promise<any[]>;
  getRegistryStats(filters?: RegistrySearchFilters): Promise<RegistryStats>;
  getTenantUsage(tenantId: string, timeRange: string): Promise<any>;
  getComplianceReport(complianceType: string): Promise<any>;
  searchEntries(query: string, filters?: RegistrySearchFilters): Promise<AgentRegistryEntry[]>;
  getEntriesByCategory(category: string): Promise<AgentRegistryEntry[]>;
  getEntriesByProvider(provider: string): Promise<AgentRegistryEntry[]>;
  getEntriesByStatus(status: string): Promise<AgentRegistryEntry[]>;
  getEntryVersions(agentId: string): Promise<AgentRegistryEntry[]>;
  requestReview(entryId: string, requesterId: string): Promise<void>;
  validateCompliance(entryId: string): Promise<boolean>;
  updateComplianceStatus(entryId: string, status: any): Promise<void>;
}
