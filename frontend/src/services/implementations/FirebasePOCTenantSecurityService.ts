import { 
  IPOCTenantSecurityService, 
  CreateTenantRequest, 
  POCTenant, 
  TenantRole, 
  POCUserTenantAssociation, 
  ValidationResult 
} from '../interfaces/ITenantSecurityService';
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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class FirebasePOCTenantSecurityService implements IPOCTenantSecurityService {
  private readonly TENANTS_COLLECTION = 'tenants';
  private readonly USER_TENANT_ASSOCIATIONS_COLLECTION = 'user_tenant_associations';
  private readonly ACCESS_CONTROL_COLLECTION = 'access_control';

  async createTenant(tenantData: Omit<CreateTenantRequest, 'securityPolicy' | 'complianceStandards' | 'branding'>): Promise<string> {
    try {
      const tenant: POCTenant = {
        id: '', // Will be set by Firestore
        name: tenantData.name,
        description: tenantData.description,
        domain: tenantData.domain,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          dataIsolation: 'strict',
          maxUsers: tenantData.maxUsers || 100,
          maxAgents: tenantData.maxAgents || 50,
          allowedRegions: tenantData.allowedRegions || ['us-central1'],
          securityLevel: 'enterprise'
        }
      };

      const docRef = await addDoc(collection(db, this.TENANTS_COLLECTION), {
        ...tenant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error(`Failed to create tenant: ${error}`);
    }
  }

  async getTenant(tenantId: string): Promise<POCTenant | null> {
    try {
      const tenantRef = doc(db, this.TENANTS_COLLECTION, tenantId);
      const tenantDoc = await getDoc(tenantRef);
      
      if (!tenantDoc.exists()) {
        return null;
      }

      return this.convertFirestoreDocToTenant(tenantDoc);
    } catch (error) {
      console.error('Error getting tenant:', error);
      throw new Error(`Failed to get tenant: ${error}`);
    }
  }

  async assignUserToTenant(userId: string, tenantId: string, role: TenantRole): Promise<void> {
    try {
      // Check if tenant exists
      const tenant = await this.getTenant(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check if user is already assigned to this tenant
      const existingAssociation = await this.getUserTenantAssociation(userId, tenantId);
      if (existingAssociation) {
        // Update existing association
        const associationRef = doc(db, this.USER_TENANT_ASSOCIATIONS_COLLECTION, existingAssociation.id);
        await updateDoc(associationRef, {
          role,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new association
        const association: Omit<POCUserTenantAssociation, 'id'> = {
          userId,
          tenantId,
          role,
          status: 'active',
          assignedAt: new Date(),
          updatedAt: new Date()
        };

        await addDoc(collection(db, this.USER_TENANT_ASSOCIATIONS_COLLECTION), {
          ...association,
          assignedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error assigning user to tenant:', error);
      throw new Error(`Failed to assign user to tenant: ${error}`);
    }
  }

  async getUserTenants(userId: string): Promise<POCUserTenantAssociation[]> {
    try {
      const q = query(
        collection(db, this.USER_TENANT_ASSOCIATIONS_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as POCUserTenantAssociation[];
    } catch (error) {
      console.error('Error getting user tenants:', error);
      throw new Error(`Failed to get user tenants: ${error}`);
    }
  }

  async checkAccess(userId: string, tenantId: string, resource: string, action: string): Promise<boolean> {
    try {
      // Get user's role in this tenant
      const association = await this.getUserTenantAssociation(userId, tenantId);
      if (!association || association.status !== 'active') {
        return false;
      }

      // Simple role-based access control for POC
      switch (association.role) {
        case 'super_admin':
          return true; // Super admins have access to everything
        case 'tenant_admin':
          // Tenant admins have access to most resources within their tenant
          return resource.startsWith('tenant:') || resource === 'agent_registry';
        case 'user':
          // Regular users have limited access
          return resource === 'agent_registry' && (action === 'read' || action === 'create');
        case 'reviewer':
          // Reviewers can read and approve/reject
          return resource === 'agent_registry' && (action === 'read' || action === 'approve' || action === 'reject');
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }

  async enforceTenantIsolation<T>(data: T, tenantId: string): Promise<T> {
    try {
      // For POC, we'll add tenantId to the data if it doesn't exist
      if (typeof data === 'object' && data !== null) {
        const dataWithTenant = { ...data, tenantId };
        return dataWithTenant as T;
      }
      return data;
    } catch (error) {
      console.error('Error enforcing tenant isolation:', error);
      return data;
    }
  }

  async validateTenantAccess(userId: string, tenantId: string): Promise<ValidationResult> {
    try {
      const association = await this.getUserTenantAssociation(userId, tenantId);
      const tenant = await this.getTenant(tenantId);

      if (!tenant) {
        return {
          isValid: false,
          reason: 'Tenant not found',
          details: { tenantId }
        };
      }

      if (!association || association.status !== 'active') {
        return {
          isValid: false,
          reason: 'User not associated with tenant or association inactive',
          details: { userId, tenantId, associationStatus: association?.status }
        };
      }

      return {
        isValid: true,
        reason: 'Access granted',
        details: { 
          userId, 
          tenantId, 
          role: association.role,
          tenantStatus: tenant.status 
        }
      };
    } catch (error) {
      console.error('Error validating tenant access:', error);
      return {
        isValid: false,
        reason: 'Validation error',
        details: { error: error.message }
      };
    }
  }

  // Helper methods
  private async getUserTenantAssociation(userId: string, tenantId: string): Promise<POCUserTenantAssociation | null> {
    try {
      const q = query(
        collection(db, this.USER_TENANT_ASSOCIATIONS_COLLECTION),
        where('userId', '==', userId),
        where('tenantId', '==', tenantId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as POCUserTenantAssociation;
    } catch (error) {
      console.error('Error getting user tenant association:', error);
      return null;
    }
  }

  private convertFirestoreDocToTenant(doc: any): POCTenant {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      domain: data.domain,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      settings: data.settings
    };
  }
}
