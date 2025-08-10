import { UserProfile } from '../../contexts/AuthContext';

// Multi-Tenant Security Service Interface for Enterprise Data Isolation
export interface ITenantSecurityService {
  // Tenant Management
  createTenant(tenantData: CreateTenantRequest): Promise<string>;
  updateTenant(tenantId: string, updates: UpdateTenantRequest): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  getTenant(tenantId: string): Promise<Tenant | null>;
  getAllTenants(): Promise<Tenant[]>;
  
  // User-Tenant Association
  assignUserToTenant(userId: string, tenantId: string, role: TenantRole): Promise<void>;
  removeUserFromTenant(userId: string, tenantId: string): Promise<void>;
  getUserTenants(userId: string): Promise<UserTenantAssociation[]>;
  getTenantUsers(tenantId: string): Promise<UserTenantAssociation[]>;
  
  // Access Control & Permissions
  checkAccess(userId: string, tenantId: string, resource: string, action: string): Promise<boolean>;
  grantPermission(userId: string, tenantId: string, resource: string, actions: string[]): Promise<void>;
  revokePermission(userId: string, tenantId: string, resource: string, actions: string[]): Promise<void>;
  getUserPermissions(userId: string, tenantId: string): Promise<Permission[]>;
  
  // Data Isolation
  enforceTenantIsolation<T>(data: T, tenantId: string): Promise<T>;
  validateTenantAccess(userId: string, tenantId: string): Promise<ValidationResult>;
  getTenantScopedQuery(tenantId: string, collection: string): Promise<any>;
  
  // Security Policies
  getTenantSecurityPolicy(tenantId: string): Promise<TenantSecurityPolicy>;
  updateTenantSecurityPolicy(tenantId: string, policy: Partial<TenantSecurityPolicy>): Promise<void>;
  validateSecurityPolicy(policy: TenantSecurityPolicy): Promise<ValidationResult>;
  
  // Audit & Compliance
  logTenantAccess(userId: string, tenantId: string, resource: string, action: string, success: boolean): Promise<void>;
  getTenantAuditLogs(tenantId: string, filters: AuditLogFilters): Promise<TenantAuditLog[]>;
  generateTenantComplianceReport(tenantId: string): Promise<ComplianceReport>;
  
  // Data Encryption & Security
  encryptTenantData(data: any, tenantId: string): Promise<string>;
  decryptTenantData(encryptedData: string, tenantId: string): Promise<any>;
  rotateTenantEncryptionKey(tenantId: string): Promise<void>;
  
  // Health & Security Status
  getTenantSecurityStatus(tenantId: string): Promise<TenantSecurityStatus>;
  runTenantSecurityScan(tenantId: string): Promise<SecurityScanResult>;
}

// Core Types
export interface Tenant {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  status: TenantStatus;
  type: TenantType;
  tier: TenantTier;
  createdAt: Date;
  updatedAt: Date;
  
  // Contact Information
  contactEmail: string;
  contactPhone?: string;
  adminUserId: string;
  
  // Security Configuration
  securityPolicy: TenantSecurityPolicy;
  dataRetentionDays: number;
  encryptionEnabled: boolean;
  auditLoggingEnabled: boolean;
  
  // Compliance
  complianceStandards: ComplianceStandard[];
  dataClassification: DataClassification;
  
  // Customization
  branding: TenantBranding;
  customizations: TenantCustomizations;
}

export type TenantStatus = 'active' | 'suspended' | 'inactive' | 'pending_approval';
export type TenantType = 'enterprise' | 'business' | 'startup' | 'individual';
export type TenantTier = 'basic' | 'professional' | 'enterprise' | 'custom';

export interface TenantSecurityPolicy {
  // Data Access Controls
  dataIsolationLevel: 'strict' | 'moderate' | 'relaxed';
  crossTenantDataSharing: boolean;
  allowedDataCategories: string[];
  restrictedDataCategories: string[];
  
  // Authentication & Authorization
  requireMFA: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
  
  // Network Security
  allowedIPRanges: string[];
  vpnRequired: boolean;
  geoRestrictions: string[];
  
  // Audit & Monitoring
  auditLogRetentionDays: number;
  realTimeMonitoring: boolean;
  alertThresholds: AlertThresholds;
  
  // Compliance
  dataEncryptionAtRest: boolean;
  dataEncryptionInTransit: boolean;
  backupEncryption: boolean;
  keyRotationDays: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAgeDays: number;
  preventReuse: number;
}

export interface AlertThresholds {
  failedLoginAttempts: number;
  suspiciousActivityScore: number;
  dataAccessAnomaly: number;
  performanceDegradation: number;
}

export type ComplianceStandard = 'GDPR' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'PCI-DSS' | 'SOX';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface TenantBranding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  customDomain?: string;
}

export interface TenantCustomizations {
  customFields: Record<string, any>;
  workflowCustomizations: Record<string, any>;
  integrationSettings: Record<string, any>;
  featureFlags: Record<string, boolean>;
}

export interface CreateTenantRequest {
  name: string;
  displayName: string;
  description?: string;
  type: TenantType;
  tier: TenantTier;
  contactEmail: string;
  adminUserId: string;
  securityPolicy?: Partial<TenantSecurityPolicy>;
  complianceStandards?: ComplianceStandard[];
  branding?: Partial<TenantBranding>;
}

export interface UpdateTenantRequest {
  displayName?: string;
  description?: string;
  status?: TenantStatus;
  tier?: TenantTier;
  contactEmail?: string;
  securityPolicy?: Partial<TenantSecurityPolicy>;
  branding?: Partial<TenantBranding>;
}

export interface UserTenantAssociation {
  userId: string;
  tenantId: string;
  role: TenantRole;
  permissions: string[];
  joinedAt: Date;
  lastAccessAt?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export type TenantRole = 'owner' | 'admin' | 'manager' | 'user' | 'viewer';

export interface Permission {
  resource: string;
  actions: string[];
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface AuditLogFilters {
  userId?: string;
  resource?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface TenantAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  tenantId: string;
  resource: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  sessionId: string;
  requestId: string;
}

export interface ComplianceReport {
  tenantId: string;
  generatedAt: Date;
  complianceStandards: ComplianceStandard[];
  overallScore: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextReviewDate: Date;
}

export interface ComplianceFinding {
  standard: ComplianceStandard;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  dueDate?: Date;
}

export interface TenantSecurityStatus {
  tenantId: string;
  lastUpdated: Date;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  complianceStatus: Record<ComplianceStandard, 'compliant' | 'non_compliant' | 'partial'>;
  recommendations: SecurityRecommendation[];
}

export interface SecurityRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  remediation: string;
  estimatedCost?: number;
}

export interface SecurityScanResult {
  scanId: string;
  tenantId: string;
  startedAt: Date;
  completedAt: Date;
  status: 'running' | 'completed' | 'failed';
  findings: SecurityFinding[];
  summary: SecurityScanSummary;
}

export interface SecurityFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedResources: string[];
  remediation: string;
  references: string[];
}

export interface SecurityScanSummary {
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  riskScore: number;
  complianceScore: number;
}

// POC-Ready Simplified Interfaces
export interface POCTenant {
  id: string;
  name: string;
  displayName: string;
  status: TenantStatus;
  adminUserId: string;
  createdAt: Date;
}

export interface POCUserTenantAssociation {
  userId: string;
  tenantId: string;
  role: TenantRole;
  joinedAt: Date;
}

export interface POCSecurityPolicy {
  dataIsolationLevel: 'strict' | 'moderate' | 'relaxed';
  requireMFA: boolean;
  auditLoggingEnabled: boolean;
}

// Simplified Tenant Security Service for POC
export interface IPOCTenantSecurityService {
  // Essential tenant management for POC
  createTenant(tenantData: Omit<CreateTenantRequest, 'securityPolicy' | 'complianceStandards' | 'branding'>): Promise<string>;
  getTenant(tenantId: string): Promise<POCTenant | null>;
  
  // Basic user-tenant association for POC
  assignUserToTenant(userId: string, tenantId: string, role: TenantRole): Promise<void>;
  getUserTenants(userId: string): Promise<POCUserTenantAssociation[]>;
  
  // Simple access control for POC
  checkAccess(userId: string, tenantId: string, resource: string, action: string): Promise<boolean>;
  
  // Basic data isolation for POC
  enforceTenantIsolation<T>(data: T, tenantId: string): Promise<T>;
  validateTenantAccess(userId: string, tenantId: string): Promise<ValidationResult>;
}
