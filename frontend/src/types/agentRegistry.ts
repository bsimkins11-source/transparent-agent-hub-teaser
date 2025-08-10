import { Agent } from './agent';

// Enhanced type definitions with better organization and type safety
export type AgentType = 'ai_agent' | 'workflow_agent' | 'integration_agent' | 'custom_agent';
export type AgentStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'deprecated' | 'archived';
export type ComplianceLevel = 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
export type BillingModel = 'per_token' | 'per_request' | 'subscription' | 'enterprise';
export type ProviderType = 'openai' | 'google' | 'anthropic' | 'azure' | 'aws' | 'custom';
export type ServiceType = 'ai_model' | 'api_service' | 'custom_service';

// Core Registry Entry with enhanced type safety
export interface AgentRegistryEntry {
  readonly id: string;
  readonly agentId: string;
  readonly version: string;
  readonly agentType: AgentType;
  readonly status: AgentStatus;
  readonly metadata: AgentMetadata;
  readonly ownerId: string;
  readonly organizationId?: string;
  readonly networkId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt?: Date;
  readonly deprecationDate?: Date;
  readonly deprecationReason?: string;
  
  // Enhanced cost tracking with immutable structure
  readonly costStructure: CostStructure;
  readonly usageLimits: UsageLimits;
  
  // Performance and compliance with readonly properties
  readonly performanceMetrics: PerformanceMetrics;
  readonly complianceStatus: ComplianceStatus;
  
  // Governance and approval workflow
  readonly approvalWorkflow: ApprovalWorkflow;
  readonly accessControls: AccessControls;
  
  // Audit and versioning with immutable arrays
  readonly versionHistory: readonly VersionHistoryEntry[];
  readonly auditTrail: readonly AuditTrailEntry[];
}

// POC Registry Entry - simplified but maintains enterprise structure
export interface POCRegistryEntry extends Omit<AgentRegistryEntry, 'versionHistory' | 'auditTrail'> {
  readonly versionHistory: readonly VersionHistoryEntry[];
  readonly auditTrail: readonly AuditTrailEntry[];
}

// Enhanced metadata with better organization
export interface AgentMetadata {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly tags: readonly string[];
  
  // Enhanced provider configuration with readonly arrays
  readonly providers: readonly ProviderConfiguration[];
  readonly models: readonly ModelConfiguration[];
  
  // API and integration details
  readonly apiIntegrations: APIIntegrations;
  
  // Capabilities and limitations
  readonly capabilities: readonly string[];
  readonly limitations: readonly string[];
  readonly useCases: readonly string[];
  
  // Examples and documentation
  readonly examples: readonly AgentExample[];
  readonly documentation: DocumentationLinks;
  
  // Marketplace configuration
  readonly marketplace: MarketplaceConfig;
}

// Credential configuration
export interface CredentialConfiguration {
  readonly type: 'api_key' | 'oauth2' | 'jwt' | 'service_account' | 'none';
  readonly config: Readonly<Record<string, unknown>>;
}

// Provider configuration with enhanced type safety
export interface ProviderConfiguration {
  readonly name: string;
  readonly type: ServiceType;
  readonly provider: ProviderType;
  readonly region: string;
  readonly credentials: CredentialConfiguration;
  readonly features: readonly string[];
  readonly sla?: ServiceLevelAgreement;
}

// Model configuration with performance metrics
export interface ModelConfiguration {
  readonly name: string;
  readonly provider: string;
  readonly version: string;
  readonly capabilities: ModelCapabilities;
  readonly performance: ModelPerformance;
  readonly contextWindow: number;
  readonly pricing: ModelPricing;
}

// Model capabilities with boolean flags
export interface ModelCapabilities {
  readonly maxTokens: number;
  readonly supportsVision: boolean;
  readonly supportsAudio: boolean;
  readonly supportsFunctionCalling: boolean;
  readonly supportsStreaming: boolean;
  readonly supportsFineTuning: boolean;
  readonly supportsEmbeddings: boolean;
}

// Model performance metrics
export interface ModelPerformance {
  readonly latency: number; // ms
  readonly accuracy: number; // 0-1
  readonly costPerToken: number;
  readonly throughput: number; // requests/second
  readonly availability: number; // 0-1
}

// Model pricing structure
export interface ModelPricing {
  readonly inputCostPer1kTokens: number;
  readonly outputCostPer1kTokens: number;
  readonly embeddingCostPer1kTokens?: number;
  readonly currency: string;
  readonly billingModel: BillingModel;
}

// API integrations with readonly arrays
export interface APIIntegrations {
  readonly aiServices: readonly AIServiceIntegration[];
  readonly externalAPIs: readonly ExternalAPIIntegration[];
  readonly webhooks: readonly WebhookConfiguration[];
  readonly databases: readonly DatabaseIntegration[];
}

// AI service integration
export interface AIServiceIntegration {
  readonly service: string;
  readonly endpoint: string;
  readonly authentication: AuthenticationMethod;
  readonly rateLimits: RateLimitConfig;
  readonly retryPolicy: RetryPolicy;
}

// External API integration
export interface ExternalAPIIntegration {
  readonly name: string;
  readonly baseUrl: string;
  readonly authentication: AuthenticationMethod;
  readonly endpoints: readonly APIEndpoint[];
  readonly rateLimits: RateLimitConfig;
}

// Webhook configuration
export interface WebhookConfiguration {
  readonly url: string;
  readonly events: readonly string[];
  readonly authentication: AuthenticationMethod;
  readonly retryPolicy: RetryPolicy;
}

// Database integration
export interface DatabaseIntegration {
  readonly type: 'firestore' | 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  readonly connectionString?: string;
  readonly collections?: readonly string[];
  readonly tables?: readonly string[];
  readonly permissions: DatabasePermissions;
}

// Authentication method with type safety
export interface AuthenticationMethod {
  readonly type: 'api_key' | 'oauth2' | 'jwt' | 'service_account' | 'none';
  readonly config: Readonly<Record<string, unknown>>;
}

// Rate limit configuration
export interface RateLimitConfig {
  readonly requestsPerMinute: number;
  readonly requestsPerHour: number;
  readonly burstLimit: number;
}

// Retry policy configuration
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffMultiplier: number;
  readonly maxBackoff: number;
}

// Database permissions
export interface DatabasePermissions {
  readonly read: boolean;
  readonly write: boolean;
  readonly delete: boolean;
  readonly admin: boolean;
}

// API endpoint definition
export interface APIEndpoint {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly description: string;
  readonly requiresAuth: boolean;
}

// Service level agreement
export interface ServiceLevelAgreement {
  readonly uptime: number; // percentage
  readonly responseTime: number; // ms
  readonly supportResponseTime: number; // hours
  readonly compensation: string;
}

// Agent example with readonly properties
export interface AgentExample {
  readonly title: string;
  readonly description: string;
  readonly input: string;
  readonly output: string;
  readonly tags: readonly string[];
}

// Documentation links
export interface DocumentationLinks {
  readonly userGuide?: string;
  readonly apiReference?: string;
  readonly tutorials?: readonly string[];
  readonly faq?: string;
  readonly changelog?: string;
}

// Marketplace configuration
export interface MarketplaceConfig {
  readonly isPublic: boolean;
  readonly pricing: MarketplacePricing;
  readonly categories: readonly string[];
  readonly featured: boolean;
  readonly rating?: number;
  readonly reviewCount?: number;
}

// Marketplace pricing
export interface MarketplacePricing {
  readonly model: 'free' | 'pay_per_use' | 'subscription' | 'enterprise';
  readonly basePrice?: number;
  readonly pricePerRequest?: number;
  readonly pricePerToken?: number;
  readonly currency: string;
  readonly billingCycle?: 'monthly' | 'quarterly' | 'annually';
}

// Enhanced cost structure with readonly properties
export interface CostStructure {
  readonly baseCost: number;
  readonly costPerRequest: number;
  readonly costPerToken: number;
  readonly costPerMinute: number;
  readonly currency: string;
  readonly billingModel: BillingModel;
  readonly volumeDiscounts: readonly VolumeDiscount[];
  readonly costBreakdown: CostBreakdown;
}

// Volume discount structure
export interface VolumeDiscount {
  readonly threshold: number;
  readonly discountPercentage: number;
  readonly appliesTo: 'requests' | 'tokens' | 'minutes';
}

// Cost breakdown with readonly properties
export interface CostBreakdown {
  readonly infrastructure: number;
  readonly aiModel: number;
  readonly apiCalls: number;
  readonly storage: number;
  readonly bandwidth: number;
  readonly support: number;
}

// Usage limits with readonly properties
export interface UsageLimits {
  readonly maxRequestsPerDay: number;
  readonly maxRequestsPerMonth: number;
  readonly maxTokensPerRequest: number;
  readonly maxConcurrentRequests: number;
  readonly rateLimitPerMinute: number;
  readonly storageLimitGB: number;
}

// Performance metrics with readonly properties
export interface PerformanceMetrics {
  readonly averageLatency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
  readonly successRate: number;
  readonly errorRate: number;
  readonly throughput: number;
  readonly availability: number;
  readonly lastUpdated: Date;
}

// Compliance status with readonly properties
export interface ComplianceStatus {
  readonly gdpr: ComplianceLevel;
  readonly hipaa: ComplianceLevel;
  readonly sox: ComplianceLevel;
  readonly iso27001: ComplianceLevel;
  readonly soc2: ComplianceLevel;
  readonly lastAudit: Date;
  readonly nextAudit: Date;
  readonly complianceNotes: readonly string[];
}

// Approval workflow with readonly properties
export interface ApprovalWorkflow {
  readonly requiresApproval: boolean;
  readonly approvalLevels: readonly ApprovalLevel[];
  readonly autoApprovalThreshold?: number;
  readonly approvalDeadline?: number; // hours
  readonly escalationPolicy?: EscalationPolicy;
}

// Approval level with readonly properties
export interface ApprovalLevel {
  readonly level: number;
  readonly role: string;
  readonly required: boolean;
  readonly autoApprove?: boolean;
}

// Escalation policy
export interface EscalationPolicy {
  readonly escalationTime: number; // hours
  readonly escalateTo: string;
  readonly notificationChannels: readonly string[];
}

// Access controls with readonly properties
export interface AccessControls {
  readonly allowedRoles: readonly string[];
  readonly allowedOrganizations: readonly string[];
  readonly allowedNetworks: readonly string[];
  readonly ipWhitelist?: readonly string[];
  readonly timeRestrictions?: readonly TimeRestriction[];
  readonly featureFlags: Readonly<Record<string, boolean>>;
}

// Time restriction
export interface TimeRestriction {
  readonly daysOfWeek: readonly number[];
  readonly startTime: string; // HH:MM
  readonly endTime: string; // HH:MM
  readonly timezone: string;
}

// Version history entry with readonly properties
export interface VersionHistoryEntry {
  readonly version: string;
  readonly releaseDate: Date;
  readonly changes: readonly string[];
  readonly author: string;
  readonly approvalStatus: 'pending' | 'approved' | 'rejected';
  readonly reviewer?: string;
  readonly reviewDate?: Date;
  readonly reviewNotes?: string;
  readonly breakingChanges: boolean;
  readonly migrationGuide?: string;
}

// Audit trail entry with readonly properties
export interface AuditTrailEntry {
  readonly action: string;
  readonly timestamp: Date;
  readonly userId: string;
  readonly userEmail: string;
  readonly userName: string;
  readonly details: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

// Request interfaces with readonly properties
export interface CreateRegistryEntryRequest {
  readonly agentId: string;
  readonly version?: string;
  readonly agentType: AgentType;
  readonly metadata: AgentMetadata;
  readonly ownerId: string;
  readonly organizationId?: string;
  readonly networkId?: string;
}

export interface UpdateRegistryEntryRequest {
  readonly id: string;
  readonly version?: string;
  readonly metadata?: Partial<AgentMetadata>;
  readonly status?: AgentStatus;
  readonly costStructure?: Partial<CostStructure>;
  readonly usageLimits?: Partial<UsageLimits>;
  readonly performanceMetrics?: Partial<PerformanceMetrics>;
  readonly complianceStatus?: Partial<ComplianceStatus>;
  readonly approvalWorkflow?: Partial<ApprovalWorkflow>;
  readonly accessControls?: Partial<AccessControls>;
}

// Search filters with readonly properties
export interface RegistrySearchFilters {
  readonly status?: readonly AgentStatus[];
  readonly category?: readonly string[];
  readonly tags?: readonly string[];
  readonly provider?: readonly string[];
  readonly organizationId?: string;
  readonly networkId?: string;
  readonly costRange?: Readonly<{ readonly min: number; readonly max: number }>;
  readonly performanceThreshold?: Readonly<{ readonly latency: number; readonly successRate: number }>;
  readonly complianceLevel?: readonly ComplianceLevel[];
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}

// Registry statistics with readonly properties
export interface RegistryStats {
  readonly totalEntries: number;
  readonly byStatus: Readonly<Record<AgentStatus, number>>;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byProvider: Readonly<Record<string, number>>;
  readonly byOrganization: Readonly<Record<string, number>>;
  readonly byNetwork: Readonly<Record<string, number>>;
  readonly averageCost: number;
  readonly averagePerformance: PerformanceMetrics;
  readonly complianceSummary: Readonly<Record<ComplianceLevel, number>>;
}

// Enhanced service interface with better method signatures
export interface AgentRegistryService {
  // Core operations
  createEntry(request: CreateRegistryEntryRequest): Promise<string>;
  updateEntry(request: UpdateRegistryEntryRequest): Promise<void>;
  deleteEntry(entryId: string): Promise<void>;
  getEntry(entryId: string): Promise<AgentRegistryEntry | null>;
  getAllEntries(filters?: RegistrySearchFilters): Promise<readonly AgentRegistryEntry[]>;
  
  // Version management
  getVersionHistory(agentId: string): Promise<readonly VersionHistoryEntry[]>;
  createNewVersion(agentId: string, changes: readonly string[]): Promise<string>;
  deprecateVersion(entryId: string, reason: string): Promise<void>;
  
  // Approval workflow
  submitForReview(entryId: string): Promise<void>;
  approveEntry(entryId: string, approverId: string, notes?: string): Promise<void>;
  rejectEntry(entryId: string, rejectorId: string, reason: string): Promise<void>;
  
  // Access control
  checkAccess(entryId: string, userId: string, tenantId: string): Promise<boolean>;
  grantAccess(entryId: string, userId: string, permissions: readonly string[]): Promise<void>;
  revokeAccess(entryId: string, userId: string): Promise<void>;
  
  // Audit and logging
  logAccess(entryId: string, logEntry: Readonly<Record<string, unknown>>): Promise<void>;
  logPerformance(entryId: string, logEntry: Readonly<Record<string, unknown>>): Promise<void>;
  getAuditTrail(entryId: string, filters?: Readonly<Record<string, unknown>>): Promise<readonly unknown[]>;
  
  // Analytics and reporting
  getRegistryStats(filters?: RegistrySearchFilters): Promise<RegistryStats>;
  getTenantUsage(tenantId: string, timeRange: string): Promise<Readonly<Record<string, unknown>>>;
  getComplianceReport(complianceType: string): Promise<Readonly<Record<string, unknown>>>;
  
  // Search and discovery
  searchEntries(query: string, filters?: RegistrySearchFilters): Promise<readonly AgentRegistryEntry[]>;
  getEntriesByCategory(category: string): Promise<readonly AgentRegistryEntry[]>;
  getEntriesByProvider(provider: string): Promise<readonly AgentRegistryEntry[]>;
  getEntriesByStatus(status: string): Promise<readonly AgentRegistryEntry[]>;
  getEntryVersions(agentId: string): Promise<readonly AgentRegistryEntry[]>;
  
  // Compliance and governance
  requestReview(entryId: string, requesterId: string): Promise<void>;
  validateCompliance(entryId: string): Promise<boolean>;
  updateComplianceStatus(entryId: string, status: Readonly<Record<string, unknown>>): Promise<void>;
}

// Utility types for better type safety
export type ReadonlyAgentRegistryEntry = Readonly<AgentRegistryEntry>;
export type ReadonlyAgentMetadata = Readonly<AgentMetadata>;
export type ReadonlyRegistryStats = Readonly<RegistryStats>;

// Type guards for runtime type checking
export const isAgentRegistryEntry = (obj: unknown): obj is AgentRegistryEntry => {
  return obj !== null && 
         typeof obj === 'object' && 
         'id' in obj && 
         'agentId' in obj && 
         'status' in obj;
};

export const isAgentMetadata = (obj: unknown): obj is AgentMetadata => {
  return obj !== null && 
         typeof obj === 'object' && 
         'name' in obj && 
         'description' in obj && 
         'category' in obj;
};

// Constants for common values
export const AGENT_STATUSES: readonly AgentStatus[] = [
  'draft',
  'pending_approval', 
  'approved',
  'published',
  'deprecated',
  'archived'
] as const;

export const COMPLIANCE_LEVELS: readonly ComplianceLevel[] = [
  'compliant',
  'non_compliant',
  'pending',
  'not_applicable'
] as const;

export const PROVIDER_TYPES: readonly ProviderType[] = [
  'openai',
  'google',
  'anthropic',
  'azure',
  'aws',
  'custom'
] as const;
