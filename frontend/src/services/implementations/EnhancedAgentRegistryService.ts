import { 
  IAgentRegistryService,
  AgentRegistryEntry, 
  POCRegistryEntry,
  CreateRegistryEntryRequest, 
  UpdateRegistryEntryRequest,
  RegistrySearchFilters,
  VersionHistoryEntry,
  RegistryStats,
  AgentStatus,
  AgentType,
  ComplianceLevel,
  ProviderType,
  isAgentRegistryEntry,
  isAgentMetadata,
  AGENT_STATUSES,
  COMPLIANCE_LEVELS,
  PROVIDER_TYPES
} from '../../types/agentRegistry';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Enhanced error types for better error handling
export class AgentRegistryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AgentRegistryError';
  }
}

export class ValidationError extends AgentRegistryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AgentRegistryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class AccessDeniedError extends AgentRegistryError {
  constructor(userId: string, resource: string) {
    super(`Access denied for user ${userId} to ${resource}`, 'ACCESS_DENIED');
    this.name = 'AccessDeniedError';
  }
}

// Cache configuration for performance optimization
interface CacheConfig {
  readonly maxSize: number;
  readonly ttl: number; // milliseconds
  readonly cleanupInterval: number; // milliseconds
}

// Cache entry with expiration
interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
}

// Enhanced cache implementation with LRU eviction
class LRUCache<K, V> {
  private readonly cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Enhanced agent registry service with best-in-class patterns
export class EnhancedAgentRegistryService implements IAgentRegistryService {
  private readonly COLLECTION_NAME = 'agent_registry';
  private readonly VERSION_HISTORY_COLLECTION = 'version_history';
  private readonly AUDIT_LOGS_COLLECTION = 'audit_logs';
  
  // Performance optimizations
  private readonly cache: LRUCache<string, AgentRegistryEntry>;
  private readonly statsCache: LRUCache<string, RegistryStats>;
  private readonly queryCache: LRUCache<string, readonly AgentRegistryEntry[]>;
  
  // Configuration
  private readonly cacheConfig: CacheConfig = {
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 1000 // 1 minute
  };

  // Batch operations for better performance
  private readonly batchSize = 500;
  private readonly pendingOperations: Array<() => Promise<void>> = [];
  private readonly batchTimeout = 100; // ms

  constructor() {
    this.cache = new LRUCache<string, AgentRegistryEntry>(this.cacheConfig.maxSize);
    this.statsCache = new LRUCache<string, RegistryStats>(this.cacheConfig.maxSize);
    this.queryCache = new LRUCache<string, readonly AgentRegistryEntry[]>(this.cacheConfig.maxSize);
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  // Core Registry Operations with enhanced error handling and validation
  async createEntry(request: CreateRegistryEntryRequest): Promise<string> {
    try {
      // Validate request
      this.validateCreateRequest(request);
      
      // Check for duplicate agent ID
      const existingEntry = await this.findByAgentId(request.agentId);
      if (existingEntry) {
        throw new ValidationError(`Agent with ID ${request.agentId} already exists`);
      }

      const entry: POCRegistryEntry = this.buildRegistryEntry(request);
      
      // Use batch operation for better performance
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create initial version history entry
      await this.createVersionHistoryEntry(docRef.id, entry);
      
      // Invalidate relevant caches
      this.invalidateCaches();
      
      return docRef.id;
    } catch (error) {
      this.handleError('createEntry', error);
      throw error;
    }
  }

  async updateEntry(request: UpdateRegistryEntryRequest): Promise<void> {
    try {
      // Validate request
      this.validateUpdateRequest(request);
      
      const entryRef = doc(db, this.COLLECTION_NAME, request.id);
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        throw new NotFoundError('Agent registry entry', request.id);
      }

      const updateData: Partial<POCRegistryEntry> = this.buildUpdateData(request);
      
      await updateDoc(entryRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Log the change
      await this.logChange(request.id, 'update', updateData);
      
      // Invalidate caches
      this.cache.delete(request.id);
      this.invalidateQueryCaches();
      
    } catch (error) {
      this.handleError('updateEntry', error);
      throw error;
    }
  }

  async deleteEntry(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        throw new NotFoundError('Agent registry entry', entryId);
      }

      await deleteDoc(entryRef);
      
      // Log the deletion
      await this.logChange(entryId, 'delete', {});
      
      // Invalidate caches
      this.cache.delete(entryId);
      this.invalidateQueryCaches();
      
    } catch (error) {
      this.handleError('deleteEntry', error);
      throw error;
    }
  }

  async getEntry(entryId: string): Promise<AgentRegistryEntry | null> {
    try {
      // Check cache first
      const cached = this.cache.get(entryId);
      if (cached) {
        return cached;
      }

      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        return null;
      }

      const entry = this.convertFirestoreDocToEntry(entryDoc);
      
      // Cache the result
      this.cache.set(entryId, entry);
      
      return entry;
    } catch (error) {
      this.handleError('getEntry', error);
      throw error;
    }
  }

  async getAllEntries(filters?: RegistrySearchFilters): Promise<readonly AgentRegistryEntry[]> {
    try {
      // Generate cache key for query
      const cacheKey = this.generateQueryCacheKey(filters);
      
      // Check cache first
      const cached = this.queryCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const constraints: QueryConstraint[] = [];
      
      // Apply filters efficiently
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }
      
      if (filters?.category && filters.category.length > 0) {
        constraints.push(where('metadata.category', 'in', filters.category));
      }
      
      if (filters?.provider && filters.provider.length > 0) {
        constraints.push(where('metadata.provider', 'in', filters.provider));
      }
      
      if (filters?.organizationId) {
        constraints.push(where('organizationId', '==', filters.organizationId));
      }

      if (filters?.networkId) {
        constraints.push(where('networkId', '==', filters.networkId));
      }

      // Order by creation date for consistent results
      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const entries = querySnapshot.docs.map(doc => this.convertFirestoreDocToEntry(doc));
      
      // Cache the result
      this.queryCache.set(cacheKey, entries);
      
      return entries;
    } catch (error) {
      this.handleError('getAllEntries', error);
      throw error;
    }
  }

  // Version Management with enhanced performance
  async getVersionHistory(agentId: string): Promise<readonly VersionHistoryEntry[]> {
    try {
      const q = query(
        collection(db, this.VERSION_HISTORY_COLLECTION),
        where('agentId', '==', agentId),
        orderBy('version', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VersionHistoryEntry[];
    } catch (error) {
      this.handleError('getVersionHistory', error);
      throw error;
    }
  }

  async createNewVersion(agentId: string, changes: readonly string[]): Promise<string> {
    try {
      // Get the latest version
      const latestEntry = await this.getLatestVersion(agentId);
      if (!latestEntry) {
        throw new NotFoundError('Agent version', agentId);
      }

      // Create new version entry
      const newVersion = this.incrementVersion(latestEntry.version);
      const newEntry: POCRegistryEntry = {
        ...latestEntry,
        id: '',
        version: newVersion,
        status: 'draft',
        audit: {
          ...latestEntry.audit,
          updatedAt: new Date(),
          changeLogs: [
            ...(latestEntry.audit.changeLogs || []),
            {
              timestamp: new Date(),
              type: 'version_created',
              description: `New version ${newVersion} created`,
              changes: changes,
              authorId: latestEntry.governance.ownerId
            }
          ]
        },
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...newEntry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create version history entry
      await this.createVersionHistoryEntry(docRef.id, newEntry);
      
      // Invalidate caches
      this.invalidateCaches();
      
      return docRef.id;
    } catch (error) {
      this.handleError('createNewVersion', error);
      throw error;
    }
  }

  async deprecateVersion(entryId: string, reason: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        status: 'deprecated',
        'governance.complianceNotes': reason,
        updatedAt: serverTimestamp()
      });

      // Log the deprecation
      await this.logChange(entryId, 'deprecate', { reason });
      
      // Invalidate caches
      this.cache.delete(entryId);
      this.invalidateQueryCaches();
      
    } catch (error) {
      this.handleError('deprecateVersion', error);
      throw error;
    }
  }

  // Governance Operations with enhanced security
  async submitForReview(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        status: 'pending_review',
        updatedAt: serverTimestamp()
      });

      // Log the submission
      await this.logChange(entryId, 'submit_for_review', {});
      
      // Invalidate caches
      this.cache.delete(entryId);
      this.invalidateQueryCaches();
      
    } catch (error) {
      this.handleError('submitForReview', error);
      throw error;
    }
  }

  async approveEntry(entryId: string, approverId: string, notes?: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        status: 'approved',
        'governance.approvalWorkflow': 'approved',
        updatedAt: serverTimestamp()
      });

      // Log the approval
      await this.logChange(entryId, 'approve', { approverId, notes });
      
      // Invalidate caches
      this.cache.delete(entryId);
      this.invalidateQueryCaches();
      
    } catch (error) {
      this.handleError('approveEntry', error);
      throw error;
    }
  }

  async rejectEntry(entryId: string, rejectorId: string, reason: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        status: 'rejected',
        'governance.complianceNotes': reason,
        updatedAt: serverTimestamp()
      });

      // Log the rejection
      await this.logChange(entryId, 'reject', { rejectorId, reason });
      
      // Invalidate caches
      this.cache.delete(entryId);
      this.invalidateQueryCaches();
      
    } catch (error) {
      this.handleError('rejectEntry', error);
      throw error;
    }
  }

  // Access Control with enhanced security
  async checkAccess(entryId: string, userId: string, tenantId: string): Promise<boolean> {
    try {
      const entry = await this.getEntry(entryId);
      if (!entry) return false;

      // Owner has full access
      if (entry.ownerId === userId) return true;

      // Check tenant access
      if (entry.organizationId === tenantId) {
        // For now, allow tenant access if approved
        return entry.status === 'approved';
      }

      return false;
    } catch (error) {
      this.handleError('checkAccess', error);
      return false;
    }
  }

  async grantAccess(entryId: string, userId: string, permissions: readonly string[]): Promise<void> {
    // Enhanced implementation would use a separate access control collection
    console.log(`Granting access to user ${userId} for entry ${entryId} with permissions:`, permissions);
  }

  async revokeAccess(entryId: string, userId: string): Promise<void> {
    // Enhanced implementation would use a separate access control collection
    console.log(`Revoking access for user ${userId} from entry ${entryId}`);
  }

  // Audit & Compliance with enhanced logging
  async logAccess(entryId: string, logEntry: Readonly<Record<string, unknown>>): Promise<void> {
    try {
      await addDoc(collection(db, this.AUDIT_LOGS_COLLECTION), {
        entryId,
        type: 'access',
        ...logEntry,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  }

  async logPerformance(entryId: string, logEntry: Readonly<Record<string, unknown>>): Promise<void> {
    try {
      await addDoc(collection(db, this.AUDIT_LOGS_COLLECTION), {
        entryId,
        type: 'performance',
        ...logEntry,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging performance:', error);
    }
  }

  async getAuditTrail(entryId: string, filters?: Readonly<Record<string, unknown>>): Promise<readonly unknown[]> {
    try {
      const q = query(
        collection(db, this.AUDIT_LOGS_COLLECTION),
        where('entryId', '==', entryId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      this.handleError('getAuditTrail', error);
      return [];
    }
  }

  // Analytics & Reporting with enhanced performance
  async getRegistryStats(filters?: RegistrySearchFilters): Promise<RegistryStats> {
    try {
      // Generate cache key for stats
      const cacheKey = this.generateStatsCacheKey(filters);
      
      // Check cache first
      const cached = this.statsCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const entries = await this.getAllEntries(filters);
      
      const stats: RegistryStats = this.calculateStats(entries);
      
      // Cache the result
      this.statsCache.set(cacheKey, stats);
      
      return stats;
    } catch (error) {
      this.handleError('getRegistryStats', error);
      return this.getEmptyStats();
    }
  }

  async getTenantUsage(tenantId: string, timeRange: string): Promise<Readonly<Record<string, unknown>>> {
    try {
      const entries = await this.getAllEntries({ organizationId: tenantId });
      return {
        totalAgents: entries.length,
        activeAgents: entries.filter(e => e.status === 'approved').length,
        pendingReview: entries.filter(e => e.status === 'pending_review').length,
        byCategory: entries.reduce((acc, entry) => {
          acc[entry.metadata.category] = (acc[entry.metadata.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      this.handleError('getTenantUsage', error);
      return {};
    }
  }

  async getComplianceReport(complianceType: string): Promise<Readonly<Record<string, unknown>>> {
    try {
      const entries = await this.getAllEntries();
      return {
        totalEntries: entries.length,
        compliantEntries: entries.filter(e => e.status === 'approved').length,
        nonCompliantEntries: entries.filter(e => e.status === 'rejected').length,
        pendingReview: entries.filter(e => e.status === 'pending_review').length
      };
    } catch (error) {
      this.handleError('getComplianceReport', error);
      return {};
    }
  }

  // Search & Discovery with enhanced performance
  async searchEntries(query: string, filters?: RegistrySearchFilters): Promise<readonly AgentRegistryEntry[]> {
    try {
      const entries = await this.getAllEntries(filters);
      const searchTerm = query.toLowerCase();
      
      return entries.filter(entry => 
        entry.metadata.name.toLowerCase().includes(searchTerm) ||
        entry.metadata.description.toLowerCase().includes(searchTerm) ||
        entry.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        entry.metadata.category.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      this.handleError('searchEntries', error);
      return [];
    }
  }

  async getEntriesByCategory(category: string): Promise<readonly AgentRegistryEntry[]> {
    try {
      return await this.getAllEntries({ category: [category] });
    } catch (error) {
      this.handleError('getEntriesByCategory', error);
      return [];
    }
  }

  async getEntriesByProvider(provider: string): Promise<readonly AgentRegistryEntry[]> {
    try {
      return await this.getAllEntries({ provider: [provider] });
    } catch (error) {
      this.handleError('getEntriesByProvider', error);
      return [];
    }
  }

  async getEntriesByStatus(status: string): Promise<readonly AgentRegistryEntry[]> {
    try {
      return await this.getAllEntries({ status: [status as AgentStatus] });
    } catch (error) {
      this.handleError('getEntriesByStatus', error);
      return [];
    }
  }

  async getEntryVersions(agentId: string): Promise<readonly AgentRegistryEntry[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('agentId', '==', agentId),
        orderBy('version', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as AgentRegistryEntry[];
    } catch (error) {
      this.handleError('getEntryVersions', error);
      return [];
    }
  }

  async requestReview(entryId: string, requesterId: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        status: 'pending_review',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleError('requestReview', error);
      throw error;
    }
  }

  async validateCompliance(entryId: string): Promise<boolean> {
    try {
      const entry = await this.getEntry(entryId);
      if (!entry) return false;
      
      // Enhanced compliance validation
      const hasOwner = !!entry.ownerId;
      const hasMetadata = !!entry.metadata;
      const hasRiskAssessment = !!entry.complianceStatus;
      const hasDataClassification = !!entry.accessControls;
      
      return hasOwner && hasMetadata && hasRiskAssessment && hasDataClassification;
    } catch (error) {
      this.handleError('validateCompliance', error);
      return false;
    }
  }

  async updateComplianceStatus(entryId: string, status: Readonly<Record<string, unknown>>): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        'complianceStatus': status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleError('updateComplianceStatus', error);
      throw error;
    }
  }

  // Private helper methods with enhanced performance and error handling
  private validateCreateRequest(request: CreateRegistryEntryRequest): void {
    if (!request.agentId?.trim()) {
      throw new ValidationError('Agent ID is required');
    }
    if (!request.metadata?.name?.trim()) {
      throw new ValidationError('Agent name is required');
    }
    if (!request.metadata?.description?.trim()) {
      throw new ValidationError('Agent description is required');
    }
    if (!request.ownerId?.trim()) {
      throw new ValidationError('Owner ID is required');
    }
    if (!AGENT_STATUSES.includes(request.agentType as AgentType)) {
      throw new ValidationError(`Invalid agent type: ${request.agentType}`);
    }
  }

  private validateUpdateRequest(request: UpdateRegistryEntryRequest): void {
    if (!request.id?.trim()) {
      throw new ValidationError('Entry ID is required');
    }
  }

  private buildRegistryEntry(request: CreateRegistryEntryRequest): POCRegistryEntry {
    return {
      id: '',
      agentId: request.agentId,
      version: request.version || '1.0.0',
      agentType: request.agentType,
      status: 'draft',
      metadata: request.metadata,
      ownerId: request.ownerId,
      organizationId: request.organizationId,
      networkId: request.networkId,
      createdAt: new Date(),
      updatedAt: new Date(),
      costStructure: this.getDefaultCostStructure(),
      usageLimits: this.getDefaultUsageLimits(),
      performanceMetrics: this.getDefaultPerformanceMetrics(),
      complianceStatus: this.getDefaultComplianceStatus(),
      approvalWorkflow: this.getDefaultApprovalWorkflow(),
      accessControls: this.getDefaultAccessControls(),
      versionHistory: [],
      auditTrail: []
    } as POCRegistryEntry;
  }

  private buildUpdateData(request: UpdateRegistryEntryRequest): Partial<POCRegistryEntry> {
    const updateData: Partial<POCRegistryEntry> = {};
    
    if (request.metadata) updateData.metadata = request.metadata;
    if (request.status) updateData.status = request.status;
    if (request.costStructure) updateData.costStructure = request.costStructure;
    if (request.usageLimits) updateData.usageLimits = request.usageLimits;
    if (request.performanceMetrics) updateData.performanceMetrics = request.performanceMetrics;
    if (request.complianceStatus) updateData.complianceStatus = request.complianceStatus;
    if (request.approvalWorkflow) updateData.approvalWorkflow = request.approvalWorkflow;
    if (request.accessControls) updateData.accessControls = request.accessControls;
    
    return updateData;
  }

  private getDefaultCostStructure() {
    return {
      baseCost: 0,
      costPerRequest: 0,
      costPerToken: 0,
      costPerMinute: 0,
      currency: 'USD',
      billingModel: 'pay_per_use' as const,
      volumeDiscounts: [],
      costBreakdown: {
        infrastructure: 0,
        aiModel: 0,
        apiCalls: 0,
        storage: 0,
        bandwidth: 0,
        support: 0
      }
    };
  }

  private getDefaultUsageLimits() {
    return {
      maxRequestsPerDay: 1000,
      maxRequestsPerMonth: 30000,
      maxTokensPerRequest: 10000,
      maxConcurrentRequests: 10,
      rateLimitPerMinute: 60,
      storageLimitGB: 1
    };
  }

  private getDefaultPerformanceMetrics() {
    return {
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      successRate: 0,
      errorRate: 0,
      throughput: 0,
      availability: 0,
      lastUpdated: new Date()
    };
  }

  private getDefaultComplianceStatus() {
    return {
      gdpr: 'not_applicable' as ComplianceLevel,
      hipaa: 'not_applicable' as ComplianceLevel,
      sox: 'not_applicable' as ComplianceLevel,
      iso27001: 'not_applicable' as ComplianceLevel,
      soc2: 'not_applicable' as ComplianceLevel,
      lastAudit: new Date(),
      nextAudit: new Date(),
      complianceNotes: []
    };
  }

  private getDefaultApprovalWorkflow() {
    return {
      requiresApproval: true,
      approvalLevels: [],
      autoApprovalThreshold: 1,
      approvalDeadline: 24
    };
  }

  private getDefaultAccessControls() {
    return {
      allowedRoles: ['user'],
      allowedOrganizations: [],
      allowedNetworks: [],
      featureFlags: {}
    };
  }

  private async findByAgentId(agentId: string): Promise<AgentRegistryEntry | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('agentId', '==', agentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      return this.convertFirestoreDocToEntry(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error finding by agent ID:', error);
      return null;
    }
  }

  private async getLatestVersion(agentId: string): Promise<POCRegistryEntry | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('agentId', '==', agentId),
        orderBy('version', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      return this.convertFirestoreDocToEntry(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error getting latest version:', error);
      return null;
    }
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0]) || 0;
    const minor = parseInt(parts[1]) || 0;
    const patch = parseInt(parts[2]) || 0;
    return `${major}.${minor}.${patch + 1}`;
  }

  private async createVersionHistoryEntry(entryId: string, entry: POCRegistryEntry): Promise<void> {
    try {
      await addDoc(collection(db, this.VERSION_HISTORY_COLLECTION), {
        entryId,
        agentId: entry.agentId,
        version: entry.version,
        status: entry.status,
        createdAt: serverTimestamp(),
        metadata: entry.metadata
      });
    } catch (error) {
      console.error('Error creating version history entry:', error);
    }
  }

  private async logChange(entryId: string, action: string, details: unknown): Promise<void> {
    try {
      await addDoc(collection(db, this.AUDIT_LOGS_COLLECTION), {
        entryId,
        type: 'change',
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging change:', error);
    }
  }

  private convertFirestoreDocToEntry(doc: QueryDocumentSnapshot<DocumentData>): POCRegistryEntry {
    const data = doc.data();
    return {
      id: doc.id,
      agentId: data.agentId,
      version: data.version,
      agentType: data.agentType || 'ai_agent',
      status: data.status,
      metadata: data.metadata,
      ownerId: data.ownerId,
      organizationId: data.organizationId,
      networkId: data.networkId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      costStructure: data.costStructure || this.getDefaultCostStructure(),
      usageLimits: data.usageLimits || this.getDefaultUsageLimits(),
      performanceMetrics: data.performanceMetrics || this.getDefaultPerformanceMetrics(),
      complianceStatus: data.complianceStatus || this.getDefaultComplianceStatus(),
      approvalWorkflow: data.approvalWorkflow || this.getDefaultApprovalWorkflow(),
      accessControls: data.accessControls || this.getDefaultAccessControls(),
      versionHistory: data.versionHistory || [],
      auditTrail: data.auditTrail || []
    } as POCRegistryEntry;
  }

  private calculateStats(entries: readonly AgentRegistryEntry[]): RegistryStats {
    const stats: RegistryStats = {
      totalEntries: entries.length,
      byStatus: {} as Record<AgentStatus, number>,
      byCategory: {},
      byProvider: {},
      byOrganization: {},
      byNetwork: {},
      averageCost: 0,
      averagePerformance: this.getDefaultPerformanceMetrics(),
      complianceSummary: {} as Record<ComplianceLevel, number>
    };

    // Initialize counters
    AGENT_STATUSES.forEach(status => stats.byStatus[status] = 0);
    COMPLIANCE_LEVELS.forEach(level => stats.complianceSummary[level] = 0);

    // Count entries
    entries.forEach(entry => {
      stats.byStatus[entry.status]++;
      stats.byCategory[entry.metadata.category] = (stats.byCategory[entry.metadata.category] || 0) + 1;
      if (entry.organizationId) {
        stats.byOrganization[entry.organizationId] = (stats.byOrganization[entry.organizationId] || 0) + 1;
      }
      if (entry.networkId) {
        stats.byNetwork[entry.networkId] = (stats.byNetwork[entry.networkId] || 0) + 1;
      }
    });

    // Calculate averages
    if (entries.length > 0) {
      const totalCost = entries.reduce((sum, entry) => sum + entry.costStructure.baseCost, 0);
      stats.averageCost = totalCost / entries.length;
    }

    return stats;
  }

  private getEmptyStats(): RegistryStats {
    return {
      totalEntries: 0,
      byStatus: {} as Record<AgentStatus, number>,
      byCategory: {},
      byProvider: {},
      byOrganization: {},
      byNetwork: {},
      averageCost: 0,
      averagePerformance: this.getDefaultPerformanceMetrics(),
      complianceSummary: {} as Record<ComplianceLevel, number>
    };
  }

  private generateQueryCacheKey(filters?: RegistrySearchFilters): string {
    if (!filters) return 'all';
    
    const parts = [
      filters.status?.join(',') || 'all',
      filters.category?.join(',') || 'all',
      filters.provider?.join(',') || 'all',
      filters.organizationId || 'all',
      filters.networkId || 'all'
    ];
    
    return parts.join('|');
  }

  private generateStatsCacheKey(filters?: RegistrySearchFilters): string {
    return `stats:${this.generateQueryCacheKey(filters)}`;
  }

  private invalidateCaches(): void {
    this.cache.clear();
    this.statsCache.clear();
  }

  private invalidateQueryCaches(): void {
    this.queryCache.clear();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Clean up expired cache entries
      // Note: LRU cache doesn't support TTL, so this is a simplified cleanup
      if (this.cache.size() > this.cacheConfig.maxSize * 0.8) {
        this.cache.clear();
      }
      
      if (this.statsCache.size() > this.cacheConfig.maxSize * 0.8) {
        this.statsCache.clear();
      }
      
      if (this.queryCache.size() > this.cacheConfig.maxSize * 0.8) {
        this.queryCache.clear();
      }
    }, this.cacheConfig.cleanupInterval);
  }

  private handleError(operation: string, error: unknown): void {
    if (error instanceof AgentRegistryError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new AgentRegistryError(
        `Operation ${operation} failed: ${error.message}`,
        'OPERATION_FAILED',
        { operation },
        error
      );
    }
    
    throw new AgentRegistryError(
      `Operation ${operation} failed with unknown error`,
      'UNKNOWN_ERROR',
      { operation, error }
    );
  }
}
