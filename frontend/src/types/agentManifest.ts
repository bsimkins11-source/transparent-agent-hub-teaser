// Standardized Agent Contract Schema
// This defines the contract between agents and the platform
// Similar to package.json for AI agents

export interface AgentManifest {
  // Basic Identity
  name: string;
  version: string;
  author: string;
  description: string;
  tags: string[];
  category: string;
  subcategory?: string;
  
  // Visibility & Access Control
  visibility: 'global' | 'private' | 'network' | 'company';
  accessControl: {
    requiresApproval: boolean;
    allowedOrganizations?: string[];
    allowedNetworks?: string[];
    maxUsers?: number;
    maxConcurrentExecutions?: number;
  };
  
  // Execution Configuration
  execution: {
    type: 'prompt' | 'webhook' | 'container' | 'plugin';
    entrypoint: string; // URL, container image, or prompt template
    runtime?: {
      language?: string;
      framework?: string;
      requirements?: string[];
      environment?: Record<string, string>;
    };
    auth: {
      type: 'api_key' | 'oauth2' | 'jwt' | 'none';
      env?: string;
      config?: Record<string, any>;
    };
    timeout?: number; // seconds
    memory?: string; // e.g., "512Mi", "1Gi"
    cpu?: string; // e.g., "0.5", "1"
  };
  
  // AI Model Configuration
  model: {
    provider: 'openai' | 'vertexai' | 'anthropic' | 'huggingface' | 'custom' | 'none';
    model?: string;
    apiVersion?: string;
    parameters?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    };
    fallback?: {
      provider: string;
      model: string;
      conditions?: string[];
    };
  };
  
  // Data Source Configuration
  data: {
    sources: DataSource[];
    access: ('read' | 'write' | 'delete')[];
    permissions: DataPermission[];
    encryption?: {
      atRest: boolean;
      inTransit: boolean;
      algorithm?: string;
    };
  };
  
  // Input/Output Schema
  inputs: {
    type: 'json' | 'text' | 'binary' | 'multipart';
    schema?: string; // URL to JSON schema
    required: string[];
    optional?: string[];
    examples: InputExample[];
    validation?: {
      maxSize?: number;
      allowedTypes?: string[];
      customRules?: string[];
    };
  };
  
  outputs: {
    type: 'json' | 'text' | 'binary' | 'stream';
    schema?: string; // URL to JSON schema
    examples: OutputExample[];
    streaming?: boolean;
    maxResponseSize?: number;
  };
  
  // Pricing & Monetization
  pricing: {
    type: 'per_execution' | 'per_token' | 'subscription' | 'byo_compute';
    basePrice?: number;
    usdPerCall?: number;
    usdPerToken?: number;
    monthlyPrice?: number;
    freeTier?: {
      callsPerMonth: number;
      tokensPerMonth?: number;
    };
    revenueShare?: number; // Percentage for creator
    billingCycle?: 'monthly' | 'quarterly' | 'annually';
  };
  
  // Security & Compliance
  security: {
    dataRetention?: number; // days
    auditLogging: boolean;
    encryption: boolean;
    piiHandling?: 'none' | 'mask' | 'encrypt' | 'anonymize';
    gdprCompliant?: boolean;
    hipaaCompliant?: boolean;
    soc2Compliant?: boolean;
    contentFilters: string[];
    safetyMeasures: string[];
    ageRestriction?: string;
  };
  
  // Performance & Monitoring
  performance: {
    expectedLatency?: number; // ms
    maxConcurrentExecutions: number;
    rateLimit?: {
      callsPerMinute: number;
      callsPerHour: number;
      callsPerDay: number;
    };
    sla?: {
      availability: number; // percentage
      responseTime: number; // ms
      errorRate: number; // percentage
    };
  };
  
  // Dependencies & Integrations
  dependencies?: {
    externalApis?: ExternalAPI[];
    requiredServices?: string[];
    optionalServices?: string[];
    versionConstraints?: Record<string, string>;
  };
  
  // Documentation & Support
  documentation: {
    readme?: string;
    apiDocs?: string;
    examples?: string;
    supportEmail?: string;
    supportUrl?: string;
    changelog?: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastDeployed?: string;
  deploymentStatus: 'draft' | 'pending' | 'active' | 'deprecated' | 'archived';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  reviewNotes?: string;
}

export interface DataSource {
  type: 's3' | 'gcs' | 'bigquery' | 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'api' | 'custom';
  name: string;
  description: string;
  endpoint?: string;
  authentication: {
    type: 'service_account' | 'api_key' | 'oauth2' | 'jwt' | 'none';
    config: Record<string, any>;
  };
  schema?: string; // JSON schema or description
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  dataRetention?: number; // days
}

export interface DataPermission {
  source: string; // DataSource name
  operations: ('read' | 'write' | 'delete' | 'create')[];
  conditions?: string[]; // e.g., ["user.organizationId == data.organizationId"]
  scope: 'user' | 'organization' | 'network' | 'global';
}

export interface InputExample {
  name: string;
  description: string;
  value: any;
  expectedOutput?: any;
}

export interface OutputExample {
  name: string;
  description: string;
  value: any;
  success: boolean;
}

export interface ExternalAPI {
  name: string;
  url: string;
  authentication: 'api_key' | 'oauth2' | 'jwt' | 'none';
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  required: boolean;
}

// Agent Execution Context
export interface AgentExecutionContext {
  executionId: string;
  agentId: string;
  manifest: AgentManifest;
  userId: string;
  organizationId: string;
  networkId?: string;
  
  // Input data
  inputs: Record<string, any>;
  metadata: {
    userAgent: string;
    ipAddress: string;
    timestamp: string;
    sessionId?: string;
  };
  
  // Runtime configuration
  runtime: {
    timeout: number;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  };
  
  // Data access context
  dataContext: {
    availableSources: string[];
    userPermissions: string[];
    organizationContext: Record<string, any>;
  };
}

// Agent Execution Result
export interface AgentExecutionResult {
  executionId: string;
  agentId: string;
  success: boolean;
  output: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  // Performance metrics
  metrics: {
    startTime: string;
    endTime: string;
    duration: number; // ms
    tokenCount?: number;
    cost: number; // USD
    memoryUsage?: number;
    cpuUsage?: number;
  };
  
  // Audit trail
  audit: {
    dataSourcesAccessed: string[];
    operationsPerformed: string[];
    userPermissionsUsed: string[];
    externalApisCalled?: string[];
  };
  
  // Compliance
  compliance: {
    dataRetentionApplied: boolean;
    encryptionUsed: boolean;
    auditLogged: boolean;
    piiHandled: boolean;
  };
}

// Agent Deployment Configuration
export interface AgentDeploymentConfig {
  agentId: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  
  // Infrastructure
  infrastructure: {
    type: 'cloud_run' | 'gke' | 'cloud_functions' | 'external';
    region: string;
    scaling: {
      minInstances: number;
      maxInstances: number;
      targetCpuUtilization: number;
    };
    resources: {
      memory: string;
      cpu: string;
      timeout: number;
    };
  };
  
  // Networking
  networking: {
    public: boolean;
    allowedIps?: string[];
    vpcConnector?: string;
    loadBalancer?: boolean;
  };
  
  // Monitoring
  monitoring: {
    logging: boolean;
    metrics: boolean;
    tracing: boolean;
    alerting: boolean;
    dashboards: boolean;
  };
  
  // Security
  security: {
    serviceAccount: string;
    secrets: string[];
    networkPolicy?: string;
    podSecurityPolicy?: string;
  };
}

// Agent Marketplace Listing
export interface AgentMarketplaceListing {
  id: string;
  manifest: AgentManifest;
  creator: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    totalAgents: number;
  };
  
  // Marketplace metrics
  metrics: {
    totalDownloads: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
    lastUpdated: string;
  };
  
  // Pricing & availability
  pricing: {
    currentPrice: number;
    originalPrice?: number;
    discount?: number;
    currency: string;
    available: boolean;
  };
  
  // Categories & tags
  categories: string[];
  tags: string[];
  
  // Status
  status: 'active' | 'featured' | 'trending' | 'new' | 'deprecated';
  featuredUntil?: string;
  
  // Approval & moderation
  moderation: {
    approved: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    flags: string[];
    lastModerated: string;
  };
}
