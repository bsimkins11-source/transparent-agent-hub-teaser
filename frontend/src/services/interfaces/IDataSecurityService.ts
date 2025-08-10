// Data Security Service Interface
// Defines the contract for data encryption, access control, and security monitoring

export interface IDataSecurityService {
  // Data Encryption & Decryption
  encryptData(data: any, tenantId: string, encryptionLevel?: 'standard' | 'high' | 'military'): Promise<string>;
  decryptData(encryptedDataString: string, tenantId: string): Promise<any>;
  
  // Key Management
  generateTenantKeys(tenantId: string, keyType?: 'data' | 'communication' | 'storage'): Promise<TenantKeys>;
  rotateTenantKeys(tenantId: string, keyType?: 'data' | 'communication' | 'storage'): Promise<void>;
  
  // Access Control & Validation
  validateDataAccess(
    userId: string,
    tenantId: string,
    resource: string,
    action: string,
    context?: AccessContext
  ): Promise<AccessValidationResult>;
  
  // Security Reporting
  generateSecurityReport(tenantId: string, timeRange: { start: Date; end: Date }): Promise<SecurityReport>;
}

// Core Types
export interface TenantKeys {
  tenantId: string;
  keyType: 'data' | 'communication' | 'storage';
  publicKey: string;
  privateKey: string;
  generatedAt: string;
  expiresAt: string;
  algorithm: string;
}

export interface AccessContext {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timeOfDay?: string;
}

export interface AccessValidationResult {
  allowed: boolean;
  reason?: string;
  securityLevel: 'low' | 'medium' | 'high';
  additionalChecks?: string[];
}

export interface SecurityReport {
  tenantId: string;
  generatedAt: string;
  timeRange: { start: Date; end: Date };
  summary: SecuritySummary;
  details: SecurityDetails;
}

export interface SecuritySummary {
  totalAccessAttempts: number;
  successfulAccesses: number;
  failedAccesses: number;
  securityIncidents: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityDetails {
  accessPatterns: AccessPattern[];
  securityEvents: SecurityEvent[];
  complianceStatus: Record<string, 'compliant' | 'non_compliant' | 'partial'>;
  recommendations: SecurityRecommendation[];
}

export interface AccessPattern {
  userId: string;
  resource: string;
  frequency: number;
  timeDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  riskScore: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  remediation: string;
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

// POC-Ready Simplified Interface
export interface IPOCTenantSecurityService {
  // Essential security operations for POC
  encryptData(data: any, tenantId: string): Promise<string>;
  decryptData(encryptedDataString: string, tenantId: string): Promise<any>;
  
  // Basic access validation for POC
  validateDataAccess(
    userId: string,
    tenantId: string,
    resource: string,
    action: string
  ): Promise<AccessValidationResult>;
}
