import { UserProfile } from '../../contexts/AuthContext';

// Comprehensive Security Configuration Service Interface
// Manages security policies, settings, and configurations across the system
export interface ISecurityConfigurationService {
  // Security Policy Management
  getSecurityPolicy(policyId: string): Promise<SecurityPolicy | null>;
  createSecurityPolicy(policy: CreateSecurityPolicyRequest): Promise<string>;
  updateSecurityPolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<void>;
  deleteSecurityPolicy(policyId: string): Promise<void>;
  listSecurityPolicies(filters?: SecurityPolicyFilters): Promise<SecurityPolicy[]>;
  
  // Policy Assignment & Enforcement
  assignPolicyToTenant(tenantId: string, policyId: string): Promise<void>;
  assignPolicyToUser(userId: string, policyId: string): Promise<void>;
  assignPolicyToResource(resourceId: string, policyId: string): Promise<void>;
  getAssignedPolicies(tenantId?: string, userId?: string, resourceId?: string): Promise<PolicyAssignment[]>;
  
  // Security Settings Management
  getSecuritySettings(scope: SecurityScope): Promise<SecuritySettings | null>;
  updateSecuritySettings(scope: SecurityScope, settings: Partial<SecuritySettings>): Promise<void>;
  applySecuritySettings(scope: SecurityScope): Promise<void>;
  
  // Compliance & Standards Management
  getComplianceStandards(): Promise<ComplianceStandard[]>;
  getComplianceStatus(tenantId: string): Promise<ComplianceStatus>;
  validateCompliance(tenantId: string, standard: string): Promise<ComplianceValidationResult>;
  generateComplianceReport(tenantId: string, standard: string): Promise<ComplianceReport>;
  
  // Security Configuration Templates
  getSecurityTemplates(templateType: SecurityTemplateType): Promise<SecurityTemplate[]>;
  createSecurityTemplate(template: CreateSecurityTemplateRequest): Promise<string>;
  applySecurityTemplate(templateId: string, scope: SecurityScope): Promise<void>;
  
  // Security Policy Validation & Testing
  validateSecurityPolicy(policy: SecurityPolicy): Promise<PolicyValidationResult>;
  testSecurityPolicy(policyId: string, testScenario: SecurityTestScenario): Promise<PolicyTestResult>;
  simulateSecurityPolicy(policyId: string, simulationData: any): Promise<PolicySimulationResult>;
  
  // Security Configuration Monitoring
  getSecurityConfigurationStatus(scope: SecurityScope): Promise<SecurityConfigurationStatus>;
  monitorSecurityConfiguration(scope: SecurityScope): Promise<SecurityMonitoringResult>;
  getSecurityConfigurationHistory(scope: SecurityScope, timeRange: TimeRange): Promise<SecurityConfigurationChange[]>;
  
  // Security Configuration Backup & Recovery
  backupSecurityConfiguration(scope: SecurityScope): Promise<SecurityConfigurationBackup>;
  restoreSecurityConfiguration(backupId: string, scope: SecurityScope): Promise<void>;
  exportSecurityConfiguration(scope: SecurityScope, format: 'json' | 'yaml' | 'xml'): Promise<string>;
  
  // Security Configuration Analytics
  analyzeSecurityConfiguration(scope: SecurityScope, analysisType: SecurityAnalysisType): Promise<SecurityAnalysisResult>;
  getSecurityConfigurationMetrics(scope: SecurityScope, timeRange: TimeRange): Promise<SecurityConfigurationMetrics>;
  generateSecurityConfigurationReport(scope: SecurityScope, reportType: SecurityReportType): Promise<SecurityConfigurationReport>;
}

// Core Types
export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  version: string;
  status: PolicyStatus;
  priority: PolicyPriority;
  category: PolicyCategory;
  
  // Policy Rules
  rules: SecurityRule[];
  conditions: SecurityCondition[];
  exceptions: SecurityException[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Compliance
  complianceStandards: string[];
  tags: string[];
  
  // Enforcement
  enforcementLevel: EnforcementLevel;
  autoEnforce: boolean;
  requireApproval: boolean;
}

export type PolicyStatus = 'draft' | 'active' | 'inactive' | 'deprecated' | 'archived';
export type PolicyPriority = 'low' | 'medium' | 'high' | 'critical';
export type PolicyCategory = 'access_control' | 'data_protection' | 'network_security' | 'compliance' | 'audit' | 'incident_response';
export type EnforcementLevel = 'advisory' | 'recommended' | 'required' | 'mandatory';

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  condition: string;
  action: RuleAction;
  priority: number;
  enabled: boolean;
}

export type RuleType = 'allow' | 'deny' | 'log' | 'alert' | 'quarantine' | 'block';
export type RuleAction = 'permit' | 'block' | 'log' | 'notify' | 'escalate' | 'custom';

export interface SecurityCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex';

export interface SecurityException {
  id: string;
  reason: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  scope: string[];
}

export interface SecuritySettings {
  id: string;
  scope: SecurityScope;
  
  // Authentication Settings
  authentication: AuthenticationSettings;
  
  // Authorization Settings
  authorization: AuthorizationSettings;
  
  // Data Protection Settings
  dataProtection: DataProtectionSettings;
  
  // Network Security Settings
  networkSecurity: NetworkSecuritySettings;
  
  // Monitoring & Alerting Settings
  monitoring: MonitoringSettings;
  
  // Compliance Settings
  compliance: ComplianceSettings;
  
  // Incident Response Settings
  incidentResponse: IncidentResponseSettings;
  
  // Metadata
  version: string;
  lastUpdated: Date;
  updatedBy: string;
}

export interface SecurityScope {
  type: 'global' | 'tenant' | 'user' | 'resource' | 'group';
  id?: string;
  name?: string;
}

export interface AuthenticationSettings {
  requireMFA: boolean;
  mfaMethods: MFAMethod[];
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  passwordPolicy: PasswordPolicy;
  rememberMeEnabled: boolean;
  rememberMeDurationDays: number;
}

export type MFAMethod = 'sms' | 'email' | 'totp' | 'hardware_token' | 'biometric' | 'push_notification';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAgeDays: number;
  preventReuse: number;
  complexityScore: number;
}

export interface AuthorizationSettings {
  roleBasedAccessControl: boolean;
  attributeBasedAccessControl: boolean;
  dynamicAccessControl: boolean;
  accessReviewFrequency: 'monthly' | 'quarterly' | 'annually' | 'never';
  autoProvisioning: boolean;
  justInTimeAccess: boolean;
  privilegedAccessManagement: boolean;
}

export interface DataProtectionSettings {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  encryptionAlgorithm: string;
  keyRotationDays: number;
  dataRetentionDays: number;
  backupEncryption: boolean;
  dataClassification: boolean;
  dataLossPrevention: boolean;
  privacyControls: PrivacyControls;
}

export interface PrivacyControls {
  dataMinimization: boolean;
  purposeLimitation: boolean;
  retentionLimitation: boolean;
  accessControl: boolean;
  dataPortability: boolean;
  rightToErasure: boolean;
}

export interface NetworkSecuritySettings {
  allowedIPRanges: string[];
  vpnRequired: boolean;
  geoRestrictions: string[];
  rateLimiting: RateLimitingSettings;
  ddosProtection: boolean;
  webApplicationFirewall: boolean;
  networkSegmentation: boolean;
}

export interface RateLimitingSettings {
  enabled: boolean;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  burstLimit: number;
  rateLimitBy: 'ip' | 'user' | 'session' | 'tenant';
}

export interface MonitoringSettings {
  auditLogging: boolean;
  realTimeMonitoring: boolean;
  alertThresholds: AlertThresholds;
  retentionDays: number;
  logAggregation: boolean;
  performanceMonitoring: boolean;
  securityEventCorrelation: boolean;
}

export interface AlertThresholds {
  failedLoginAttempts: number;
  suspiciousActivityScore: number;
  dataAccessAnomaly: number;
  performanceDegradation: number;
  securityIncidentCount: number;
  complianceViolationCount: number;
}

export interface ComplianceSettings {
  standards: string[];
  dataClassification: string;
  auditRequirements: AuditRequirements;
  reportingFrequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  automatedCompliance: boolean;
  complianceOfficer: string;
}

export interface AuditRequirements {
  auditTrail: boolean;
  auditLogRetention: number;
  auditReviewFrequency: string;
  externalAuditRequired: boolean;
  complianceReporting: boolean;
}

export interface IncidentResponseSettings {
  incidentResponsePlan: boolean;
  automatedIncidentDetection: boolean;
  escalationProcedures: boolean;
  notificationChannels: string[];
  responseTimeSLA: number;
  postIncidentReview: boolean;
  lessonsLearned: boolean;
}

// Request/Response Types
export interface CreateSecurityPolicyRequest {
  name: string;
  description: string;
  category: PolicyCategory;
  priority: PolicyPriority;
  rules: SecurityRule[];
  conditions: SecurityCondition[];
  complianceStandards: string[];
  tags: string[];
  enforcementLevel: EnforcementLevel;
  autoEnforce: boolean;
  requireApproval: boolean;
}

export interface SecurityPolicyFilters {
  category?: PolicyCategory;
  status?: PolicyStatus;
  priority?: PolicyPriority;
  complianceStandard?: string;
  tag?: string;
  createdBy?: string;
  dateRange?: TimeRange;
}

export interface PolicyAssignment {
  id: string;
  policyId: string;
  scope: SecurityScope;
  assignedBy: string;
  assignedAt: Date;
  effectiveDate: Date;
  expirationDate?: Date;
  status: 'active' | 'inactive' | 'expired';
}

export interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  mandatory: boolean;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  implementation: string;
  testing: string;
}

export interface ComplianceStatus {
  tenantId: string;
  standard: string;
  overallScore: number;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  requirements: RequirementStatus[];
  lastAssessment: Date;
  nextAssessment: Date;
}

export interface RequirementStatus {
  requirementId: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  score: number;
  findings: string[];
  remediation: string[];
  dueDate?: Date;
}

export interface ComplianceValidationResult {
  isValid: boolean;
  score: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextSteps: string[];
}

export interface ComplianceFinding {
  requirementId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  remediation: string;
  estimatedEffort: string;
  dueDate?: Date;
}

export interface ComplianceReport {
  id: string;
  tenantId: string;
  standard: string;
  generatedAt: Date;
  overallScore: number;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  executiveSummary: string;
  detailedFindings: ComplianceFinding[];
  recommendations: string[];
  nextReviewDate: Date;
}

export interface SecurityTemplate {
  id: string;
  name: string;
  description: string;
  type: SecurityTemplateType;
  category: PolicyCategory;
  complianceStandards: string[];
  settings: Partial<SecuritySettings>;
  policies: Partial<SecurityPolicy>[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  version: string;
  isPublic: boolean;
}

export type SecurityTemplateType = 'baseline' | 'compliance' | 'industry' | 'custom' | 'best_practice';

export interface CreateSecurityTemplateRequest {
  name: string;
  description: string;
  type: SecurityTemplateType;
  category: PolicyCategory;
  complianceStandards: string[];
  settings: Partial<SecuritySettings>;
  policies: Partial<SecurityPolicy>[];
  tags: string[];
  isPublic: boolean;
}

export interface PolicyValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning' | 'info';
  code: string;
}

export interface SecurityTestScenario {
  id: string;
  name: string;
  description: string;
  testData: any;
  expectedResult: any;
  environment: string;
}

export interface PolicyTestResult {
  testId: string;
  policyId: string;
  scenario: SecurityTestScenario;
  result: 'passed' | 'failed' | 'error';
  actualResult: any;
  executionTime: number;
  errors: string[];
  warnings: string[];
}

export interface PolicySimulationResult {
  simulationId: string;
  policyId: string;
  inputData: any;
  outputData: any;
  executionPath: string[];
  performanceMetrics: PerformanceMetrics;
  securityImpact: SecurityImpact;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkCalls: number;
}

export interface SecurityImpact {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: string[];
  mitigations: string[];
  complianceImpact: string[];
}

export interface SecurityConfigurationStatus {
  scope: SecurityScope;
  overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastUpdated: Date;
  components: ComponentStatus[];
  alerts: SecurityAlert[];
  recommendations: string[];
}

export interface ComponentStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastCheck: Date;
  details: string;
  metrics: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface SecurityMonitoringResult {
  scope: SecurityScope;
  timestamp: Date;
  metrics: SecurityMetrics;
  events: SecurityEvent[];
  anomalies: SecurityAnomaly[];
}

export interface SecurityMetrics {
  totalEvents: number;
  securityEvents: number;
  complianceEvents: number;
  performanceEvents: number;
  riskScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  details: Record<string, any>;
}

export interface SecurityAnomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  description: string;
  affectedResources: string[];
  confidence: number;
}

export interface SecurityConfigurationChange {
  id: string;
  scope: SecurityScope;
  changeType: 'created' | 'updated' | 'deleted' | 'applied';
  changedBy: string;
  changedAt: Date;
  description: string;
  previousValue?: any;
  newValue?: any;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface SecurityConfigurationBackup {
  id: string;
  scope: SecurityScope;
  backupType: 'full' | 'incremental' | 'differential';
  createdBy: string;
  createdAt: Date;
  size: number;
  checksum: string;
  storageLocation: string;
  retentionDays: number;
}

export type SecurityAnalysisType = 'risk_assessment' | 'compliance_audit' | 'security_posture' | 'threat_analysis' | 'vulnerability_assessment';

export interface SecurityAnalysisResult {
  analysisId: string;
  scope: SecurityScope;
  analysisType: SecurityAnalysisType;
  performedAt: Date;
  performedBy: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  findings: SecurityFinding[];
  recommendations: string[];
  nextSteps: string[];
}

export interface SecurityFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  likelihood: 'low' | 'medium' | 'high';
  remediation: string;
  estimatedEffort: string;
  dueDate?: Date;
}

export interface SecurityConfigurationMetrics {
  scope: SecurityScope;
  timeRange: TimeRange;
  totalPolicies: number;
  activePolicies: number;
  complianceScore: number;
  riskScore: number;
  securityIncidents: number;
  policyViolations: number;
  averageResponseTime: number;
  uptime: number;
}

export type SecurityReportType = 'executive_summary' | 'detailed_analysis' | 'compliance_report' | 'risk_assessment' | 'incident_report';

export interface SecurityConfigurationReport {
  id: string;
  scope: SecurityScope;
  reportType: SecurityReportType;
  generatedAt: Date;
  generatedBy: string;
  timeRange: TimeRange;
  executiveSummary: string;
  detailedAnalysis: any;
  recommendations: string[];
  nextReviewDate: Date;
  attachments: ReportAttachment[];
}

export interface ReportAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
  description: string;
}
