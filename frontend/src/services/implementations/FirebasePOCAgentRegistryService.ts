import { 
  IAgentRegistryService, 
  AgentRegistryEntry, 
  POCRegistryEntry,
  CreateRegistryEntryRequest, 
  UpdateRegistryEntryRequest,
  RegistrySearchFilters,
  VersionHistoryEntry,
  RegistryStats,
  AgentStatus
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class FirebasePOCAgentRegistryService implements IAgentRegistryService {
  private readonly COLLECTION_NAME = 'agent_registry';
  private readonly VERSION_HISTORY_COLLECTION = 'version_history';
  private readonly AUDIT_LOGS_COLLECTION = 'audit_logs';

  // Core Registry Operations
  async createEntry(request: CreateRegistryEntryRequest): Promise<string> {
    try {
      const entry: POCRegistryEntry = {
        id: '', // Will be set by Firestore
        agentId: request.agentId,
        version: request.version || '1.0.0',
        agentType: request.agentType, // New required field
        status: 'draft',
        metadata: {
          name: request.metadata.name,
          description: request.metadata.description,
          category: request.metadata.category,
          tags: request.metadata.tags || [],
          // Updated provider and model structure
          providers: request.metadata.providers || {
            primary: {
              name: 'OpenAI',
              type: 'ai_model',
              provider: 'openai',
              region: 'us-east-1',
              credentials: {
                type: 'api_key',
                config: {}
              },
              features: ['chat', 'completion', 'embedding']
            }
          },
          models: request.metadata.models || {
            primary: {
              name: 'gpt-4',
              provider: 'openai',
              version: 'latest',
              capabilities: {
                maxTokens: 8192,
                supportsVision: false,
                supportsAudio: false,
                supportsFunctionCalling: true,
                supportsStreaming: true,
                supportsFineTuning: false
              },
              performance: {
                latency: 100,
                accuracy: 0.95,
                costPerToken: 0.00003
              },
              contextWindow: 8192
            }
          },
          // New API integrations
          apiIntegrations: request.metadata.apiIntegrations || {
            aiServices: [],
            externalAPIs: [],
            webhooks: []
          },
          capabilities: request.metadata.capabilities || [],
          limitations: request.metadata.limitations || [],
          useCases: request.metadata.useCases || [],
          estimatedCost: request.metadata.estimatedCost || { perRequest: 0, currency: 'USD' },
          performanceMetrics: request.metadata.performanceMetrics || { avgLatency: 0, successRate: 0, maxTokens: 0 },
          inputSchema: request.metadata.inputSchema || {},
          outputSchema: request.metadata.outputSchema || {},
          examples: request.metadata.examples || [],
          // Marketplace configuration
          marketplace: request.metadata.marketplace
        },
        governance: {
          owner: request.governance.owner || 'Unknown',
          reviewers: request.governance.reviewers || [],
          approvalWorkflow: request.governance.approvalWorkflow || {
            type: 'single_approver',
            approvers: ['admin'],
            requiredApprovals: 1,
            autoApprove: false,
            approvalThreshold: 1
          },
          accessControl: request.governance.accessControl || {
            allowedRoles: ['user'],
            allowedTenants: [],
            rateLimiting: { requestsPerMinute: 60, requestsPerHour: 1000, requestsPerDay: 10000 }
          },
          compliance: request.governance.compliance || {
            gdprCompliant: false,
            hipaaCompliant: false,
            soc2Compliant: false,
            iso27001Compliant: false,
            dataRetentionDays: 30,
            auditLogging: true
          },
          riskLevel: request.governance.riskLevel || 'low',
          dataClassification: request.governance.dataClassification || 'internal',
          // POC-specific fields
          ownerId: request.governance.ownerId || 'unknown',
          ownerName: request.governance.ownerName || 'Unknown',
          companyId: request.governance.companyId || 'unknown',
          companyName: request.governance.companyName || 'Unknown',
          reviewRequired: request.governance.reviewRequired || true,
          complianceNotes: request.governance.complianceNotes || ''
        },
        deployment: {
          environment: request.deployment?.environment || 'development',
          // Updated infrastructure configuration
          infrastructure: request.deployment?.infrastructure || {
            primary: {
              provider: 'aws',
              region: 'us-east-1',
              services: [],
              credentials: {
                type: 'iam_role',
                config: {}
              }
            }
          },
          // Updated runtime configuration
          runtime: request.deployment?.runtime || {
            type: 'serverless',
            language: 'python',
            version: '3.9'
          },
          scaling: request.deployment?.scaling || {
            minInstances: 1,
            maxInstances: 10,
            targetCpuUtilization: 70,
            autoScaling: true
          },
          healthChecks: request.deployment?.healthChecks || {
            endpoint: '/health',
            interval: 30,
            timeout: 5,
            healthyThreshold: 2,
            unhealthyThreshold: 3
          },
          resourceRequirements: request.deployment?.resourceRequirements || {},
          healthCheckEndpoint: request.deployment?.healthCheckEndpoint || '',
          monitoringConfig: request.deployment?.monitoringConfig || {}
        },
        audit: {
          createdBy: request.governance.ownerId || 'unknown',
          createdAt: new Date(),
          updatedAt: new Date(),
          versionHistory: [],
          accessLogs: [],
          performanceLogs: [],
          changeLogs: []
        },
        tenant: {
          tenantId: request.governance.companyId || 'unknown',
          tenantName: request.governance.companyName || 'Unknown',
          accessLevel: 'full',
          customizations: {
            branding: true,
            customPrompts: true,
            rateLimiting: true,
            dataIsolation: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create initial version history entry
      await this.createVersionHistoryEntry(docRef.id, entry);

      return docRef.id;
    } catch (error) {
      console.error('Error creating agent registry entry:', error);
      throw new Error(`Failed to create agent registry entry: ${error}`);
    }
  }

  async updateEntry(request: UpdateRegistryEntryRequest): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, request.id);
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        throw new Error('Agent registry entry not found');
      }

      const updateData: Partial<POCRegistryEntry> = {
        ...request.metadata && { metadata: request.metadata },
        ...request.governance && { governance: request.governance },
        ...request.deployment && { deployment: request.deployment },
        ...request.status && { status: request.status },
        updatedAt: new Date()
      };

      await updateDoc(entryRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Log the change
      await this.logChange(request.id, 'update', updateData);
    } catch (error) {
      console.error('Error updating agent registry entry:', error);
      throw new Error(`Failed to update agent registry entry: ${error}`);
    }
  }

  async deleteEntry(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await deleteDoc(entryRef);
      
      // Log the deletion
      await this.logChange(entryId, 'delete', {});
    } catch (error) {
      console.error('Error deleting agent registry entry:', error);
      throw new Error(`Failed to delete agent registry entry: ${error}`);
    }
  }

  async getEntry(entryId: string): Promise<AgentRegistryEntry | null> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      const entryDoc = await getDoc(entryRef);
      
      if (!entryDoc.exists()) {
        return null;
      }

      return this.convertFirestoreDocToEntry(entryDoc);
    } catch (error) {
      console.error('Error getting agent registry entry:', error);
      throw new Error(`Failed to get agent registry entry: ${error}`);
    }
  }

  async getAllEntries(filters?: RegistrySearchFilters): Promise<AgentRegistryEntry[]> {
    try {
      let q = collection(db, this.COLLECTION_NAME);
      
      // Apply filters
      if (filters?.status && filters.status.length > 0 && !filters.status.includes('all' as any)) {
        q = query(q, where('status', 'in', filters.status));
      }
      
      if (filters?.category && filters.category.length > 0 && !filters.category.includes('all')) {
        q = query(q, where('metadata.category', 'in', filters.category));
      }
      
      if (filters?.provider && filters.provider.length > 0 && !filters.provider.includes('all')) {
        q = query(q, where('metadata.provider', 'in', filters.provider));
      }
      
      if (filters?.owner && filters.owner.length > 0) {
        q = query(q, where('governance.owner', 'in', filters.owner));
      }

      if (filters?.tenant && filters.tenant.length > 0) {
        q = query(q, where('tenant.tenantId', 'in', filters.tenant));
      }

      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreDocToEntry(doc));
    } catch (error) {
      console.error('Error getting all agent registry entries:', error);
      throw new Error(`Failed to get agent registry entries: ${error}`);
    }
  }

  // Version Management
  async getVersionHistory(agentId: string): Promise<VersionHistoryEntry[]> {
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
      console.error('Error getting version history:', error);
      throw new Error(`Failed to get version history: ${error}`);
    }
  }

  async createNewVersion(agentId: string, changes: string[]): Promise<string> {
    try {
      // Get the latest version
      const latestEntry = await this.getLatestVersion(agentId);
      if (!latestEntry) {
        throw new Error('No existing version found for agent');
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

      return docRef.id;
    } catch (error) {
      console.error('Error creating new version:', error);
      throw new Error(`Failed to create new version: ${error}`);
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
    } catch (error) {
      console.error('Error deprecating version:', error);
      throw new Error(`Failed to deprecate version: ${error}`);
    }
  }

  // Governance Operations
  async submitForReview(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        status: 'pending_review',
        updatedAt: serverTimestamp()
      });

      // Log the submission
      await this.logChange(entryId, 'submit_for_review', {});
    } catch (error) {
      console.error('Error submitting for review:', error);
      throw new Error(`Failed to submit for review: ${error}`);
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
    } catch (error) {
      console.error('Error approving entry:', error);
      throw new Error(`Failed to approve entry: ${error}`);
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
    } catch (error) {
      console.error('Error rejecting entry:', error);
      throw new Error(`Failed to reject entry: ${error}`);
    }
  }

  // Access Control
  async checkAccess(entryId: string, userId: string, tenantId: string): Promise<boolean> {
    try {
      const entry = await this.getEntry(entryId);
      if (!entry) return false;

      // Owner has full access
      if (entry.governance.ownerId === userId) return true;

      // Check tenant access
      if (entry.tenant.tenantId === tenantId) {
        // For now, allow tenant access if approved
        return entry.status === 'approved';
      }

      return false;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }

  async grantAccess(entryId: string, userId: string, permissions: string[]): Promise<void> {
    // POC implementation - would need a separate access control collection
    console.log(`Granting access to user ${userId} for entry ${entryId} with permissions:`, permissions);
  }

  async revokeAccess(entryId: string, userId: string): Promise<void> {
    // POC implementation - would need a separate access control collection
    console.log(`Revoking access for user ${userId} from entry ${entryId}`);
  }

  // Audit & Compliance
  async logAccess(entryId: string, logEntry: any): Promise<void> {
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

  async logPerformance(entryId: string, logEntry: any): Promise<void> {
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

  async getAuditTrail(entryId: string, filters?: any): Promise<any> {
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
      console.error('Error getting audit trail:', error);
      return [];
    }
  }

  // Analytics & Reporting
  async getRegistryStats(filters?: RegistrySearchFilters): Promise<RegistryStats> {
    try {
      const entries = await this.getAllEntries(filters);
      
      const stats: RegistryStats = {
        total: entries.length,
        byStatus: {} as Record<AgentStatus, number>,
        byCategory: {},
        byProvider: {},
        byRiskLevel: {},
        byTenant: {},
        pendingReview: entries.filter(e => e.status === 'pending_review').length,
        recentlyUpdated: entries
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 10)
          .length
      };

      // Count by status
      entries.forEach(entry => {
        stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
        stats.byCategory[entry.metadata.category] = (stats.byCategory[entry.metadata.category] || 0) + 1;
        stats.byProvider[entry.metadata.provider] = (stats.byProvider[entry.metadata.provider] || 0) + 1;
        stats.byRiskLevel[entry.governance.riskLevel] = (stats.byRiskLevel[entry.governance.riskLevel] || 0) + 1;
        stats.byTenant[entry.tenant.tenantName] = (stats.byTenant[entry.tenant.tenantName] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting registry stats:', error);
      return {
        total: 0,
        byStatus: {} as Record<AgentStatus, number>,
        byCategory: {},
        byProvider: {},
        byRiskLevel: {},
        byTenant: {},
        pendingReview: 0,
        recentlyUpdated: 0
      };
    }
  }

  async getTenantUsage(tenantId: string, timeRange: string): Promise<any> {
    // POC implementation - basic usage stats
    try {
      const entries = await this.getAllEntries({ tenant: [tenantId] });
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
      console.error('Error getting tenant usage:', error);
      return {};
    }
  }

  async getComplianceReport(complianceType: string): Promise<any> {
    // POC implementation - basic compliance info
    try {
      const entries = await this.getAllEntries();
      return {
        totalEntries: entries.length,
        compliantEntries: entries.filter(e => e.status === 'approved').length,
        nonCompliantEntries: entries.filter(e => e.status === 'rejected').length,
        pendingReview: entries.filter(e => e.status === 'pending_review').length
      };
    } catch (error) {
      console.error('Error getting compliance report:', error);
      return {};
    }
  }

  // Search & Discovery
  async searchEntries(query: string, filters?: RegistrySearchFilters): Promise<AgentRegistryEntry[]> {
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
      console.error('Error searching entries:', error);
      return [];
    }
  }

  async getEntriesByCategory(category: string): Promise<AgentRegistryEntry[]> {
    try {
      return await this.getAllEntries({ category: [category] });
    } catch (error) {
      console.error('Error getting entries by category:', error);
      return [];
    }
  }

  async getEntriesByProvider(provider: string): Promise<AgentRegistryEntry[]> {
    try {
      return await this.getAllEntries({ provider: [provider] });
    } catch (error) {
      console.error('Error getting entries by provider:', error);
      return [];
    }
  }

  async getEntriesByStatus(status: string): Promise<AgentRegistryEntry[]> {
    try {
      return await this.getAllEntries({ status: [status as AgentStatus] });
    } catch (error) {
      console.error('Error getting entries by status:', error);
      return [];
    }
  }

  async getEntryVersions(agentId: string): Promise<AgentRegistryEntry[]> {
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
      console.error('Error getting entry versions:', error);
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
      console.error('Error requesting review:', error);
      throw new Error('Failed to request review');
    }
  }

  async validateCompliance(entryId: string): Promise<boolean> {
    try {
      const entry = await this.getEntry(entryId);
      if (!entry) return false;
      
      // Basic compliance validation
      const hasOwner = !!entry.governance.owner;
      const hasReviewers = entry.governance.reviewers.length > 0;
      const hasRiskAssessment = !!entry.governance.riskLevel;
      const hasDataClassification = !!entry.governance.dataClassification;
      
      return hasOwner && hasReviewers && hasRiskAssessment && hasDataClassification;
    } catch (error) {
      console.error('Error validating compliance:', error);
      return false;
    }
  }

  async updateComplianceStatus(entryId: string, status: any): Promise<void> {
    try {
      const entryRef = doc(db, this.COLLECTION_NAME, entryId);
      await updateDoc(entryRef, {
        'governance.compliance': status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating compliance status:', error);
      throw new Error('Failed to update compliance status');
    }
  }

  // Private helper methods
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

  private async logChange(entryId: string, action: string, details: any): Promise<void> {
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

  private convertFirestoreDocToEntry(doc: any): POCRegistryEntry {
    const data = doc.data();
    return {
      id: doc.id,
      agentId: data.agentId,
      version: data.version,
      agentType: data.agentType || 'internal_transparent', // Default to internal if not set
      status: data.status,
      metadata: data.metadata,
      governance: data.governance,
      deployment: data.deployment,
      audit: {
        ...data.audit,
        createdAt: data.audit?.createdAt?.toDate() || new Date(),
        updatedAt: data.audit?.updatedAt?.toDate() || new Date()
      },
      tenant: data.tenant,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}
