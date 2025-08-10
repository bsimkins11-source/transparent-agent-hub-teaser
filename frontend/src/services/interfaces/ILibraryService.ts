import { Agent } from '../../types/agent';
import { UserProfile } from '../../contexts/AuthContext';

export type LibraryType = 'global' | 'company' | 'network' | 'personal';

export interface AgentWithContext extends Agent {
  availableIn: LibraryType[];
  accessLevel: 'direct' | 'request' | 'restricted';
  grantedBy?: 'super_admin' | 'company_admin' | 'network_admin';
  inUserLibrary: boolean;
  canAdd: boolean;
  canRequest: boolean;
  assignmentType?: 'free' | 'direct' | 'approval';
}

export interface LibraryStats {
  total: number;
  available: number;
  inUserLibrary: number;
  byTier: { [tier: string]: number };
  byCategory: { [category: string]: number };
}

export interface LibraryInfo {
  name: string;
  description: string;
  icon: string;
  breadcrumb: string[];
}

export interface ILibraryService {
  // Core library operations
  getLibraryAgents(libraryType: LibraryType, userProfile: UserProfile | null): Promise<AgentWithContext[]>;
  getLibraryStats(libraryType: LibraryType, userProfile: UserProfile | null): Promise<LibraryStats>;
  canAccessLibrary(libraryType: LibraryType, userProfile: UserProfile | null): boolean;
  getLibraryInfo(libraryType: LibraryType, userProfile: UserProfile | null): LibraryInfo;
  
  // User library management
  getUserLibraryAgents(userId: string): Promise<string[]>;
  addAgentToUserLibrary(userId: string, agentId: string): Promise<void>;
  removeAgentFromUserLibrary(userId: string, agentId: string): Promise<void>;
  
  // Multi-tenancy support
  getAgentsByTenant(tenantId: string, libraryType: LibraryType): Promise<AgentWithContext[]>;
  grantAgentToTenant(agentId: string, tenantId: string, grantedBy: string): Promise<void>;
  revokeAgentFromTenant(agentId: string, tenantId: string): Promise<void>;
}
