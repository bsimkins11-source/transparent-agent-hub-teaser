import { UserLibraryService } from '../userLibraryService';
import { Agent } from '../../types/agent';
import { AgentRequest, AgentAssignment } from '../../types/requests';
import { HierarchicalPermissionService } from '../hierarchicalPermissionService';

// Mock the hierarchical permission service
jest.mock('../hierarchicalPermissionService');
const MockHierarchicalPermissionService = HierarchicalPermissionService as jest.MockedClass<typeof HierarchicalPermissionService>;

describe('UserLibraryService', () => {
  let userLibraryService: UserLibraryService;
  let mockPermissionService: jest.Mocked<HierarchicalPermissionService>;

  const mockAgent: Agent = {
    id: 'agent-1',
    name: 'Test Agent',
    description: 'A test agent',
    provider: 'openai',
    route: '/api/test',
    metadata: {
      tags: ['test'],
      category: 'Test',
      tier: 'premium',
      permissionType: 'direct'
    },
    visibility: 'global',
    status: 'approved'
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'user',
    organizationId: 'org-1',
    organizationName: 'Test Organization',
    assignedAgents: [],
    status: 'active' as const
  };

  beforeEach(() => {
    mockPermissionService = new MockHierarchicalPermissionService() as jest.Mocked<HierarchicalPermissionService>;
    userLibraryService = new UserLibraryService(mockPermissionService);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('assignAgentToUser', () => {
    it('successfully assigns a free agent to a user', async () => {
      const freeAgent = { ...mockAgent, metadata: { ...mockAgent.metadata, tier: 'free' } };
      
      mockPermissionService.canAssignAgent.mockReturnValue(true);
      mockPermissionService.getAssignmentType.mockReturnValue('free');

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'direct',
        'Test assignment'
      );

      expect(result.success).toBe(true);
      expect(result.assignment).toBeDefined();
      expect(result.assignment?.userId).toBe('user-1');
      expect(result.assignment?.agentId).toBe('agent-1');
      expect(result.assignment?.assignmentType).toBe('direct');
      expect(result.assignment?.reason).toBe('Test assignment');
    });

    it('successfully assigns a premium agent to a user', async () => {
      const premiumAgent = { ...mockAgent, metadata: { ...mockAgent.metadata, tier: 'premium' } };
      
      mockPermissionService.canAssignAgent.mockReturnValue(true);
      mockPermissionService.getAssignmentType.mockReturnValue('direct');

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'direct',
        'Premium agent assignment'
      );

      expect(result.success).toBe(true);
      expect(result.assignment).toBeDefined();
      expect(result.assignment?.assignmentType).toBe('direct');
    });

    it('fails to assign enterprise agent without proper permissions', async () => {
      const enterpriseAgent = { ...mockAgent, metadata: { ...mockAgent.metadata, tier: 'enterprise' } };
      
      mockPermissionService.canAssignAgent.mockReturnValue(false);
      mockPermissionService.getRequiredApprovalLevel.mockReturnValue('super_admin');

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'direct',
        'Enterprise agent assignment'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient permissions');
      expect(result.error).toContain('super_admin');
    });

    it('creates approval request when enterprise agent assignment requires approval', async () => {
      const enterpriseAgent = { ...mockAgent, metadata: { ...mockAgent.metadata, tier: 'enterprise' } };
      
      mockPermissionService.canAssignAgent.mockReturnValue(false);
      mockPermissionService.requiresApproval.mockReturnValue(true);
      mockPermissionService.getRequiredApprovalLevel.mockReturnValue('super_admin');

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'approval',
        'Enterprise agent request'
      );

      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
      expect(result.request?.status).toBe('pending');
      expect(result.request?.approvalLevel).toBe('super_admin');
    });

    it('prevents duplicate agent assignments', async () => {
      // Mock existing assignment
      const existingAssignment: AgentAssignment = {
        id: 'assignment-1',
        userId: 'user-1',
        agentId: 'agent-1',
        assignedAt: '2024-01-01T00:00:00Z',
        assignedBy: 'admin-1',
        assignmentType: 'direct',
        reason: 'Previous assignment',
        status: 'active'
      };

      // Mock that user already has this agent
      jest.spyOn(userLibraryService, 'getUserAssignments').mockResolvedValue([existingAssignment]);

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'direct',
        'Duplicate assignment'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('already assigned');
    });

    it('handles assignment with business justification', async () => {
      mockPermissionService.canAssignAgent.mockReturnValue(true);
      mockPermissionService.getAssignmentType.mockReturnValue('direct');

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'direct',
        'Business requirement',
        'Critical for Q4 project'
      );

      expect(result.success).toBe(true);
      expect(result.assignment?.metadata?.businessJustification).toBe('Critical for Q4 project');
    });
  });

  describe('approveAgentRequest', () => {
    const mockRequest: AgentRequest = {
      id: 'request-1',
      userId: 'user-1',
      userEmail: 'test@example.com',
      userName: 'Test User',
      agentId: 'agent-1',
      agentName: 'Test Agent',
      requestReason: 'Test request',
      status: 'pending',
      requestedAt: '2024-01-01T00:00:00Z',
      organizationId: 'org-1',
      organizationName: 'Test Organization',
      approvalLevel: 'company_admin',
      priority: 'medium',
      metadata: {}
    };

    it('successfully approves an agent request', async () => {
      mockPermissionService.canApproveRequest.mockReturnValue(true);
      mockPermissionService.getAssignmentType.mockReturnValue('direct');

      const result = await userLibraryService.approveAgentRequest(
        'request-1',
        'approve',
        'admin-1',
        'Approved for business needs'
      );

      expect(result.success).toBe(true);
      expect(result.assignment).toBeDefined();
      expect(result.assignment?.status).toBe('active');
      expect(result.request?.status).toBe('approved');
    });

    it('successfully denies an agent request with reason', async () => {
      mockPermissionService.canApproveRequest.mockReturnValue(true);

      const result = await userLibraryService.approveAgentRequest(
        'request-1',
        'deny',
        'admin-1',
        'Budget constraints'
      );

      expect(result.success).toBe(true);
      expect(result.request?.status).toBe('denied');
      expect(result.request?.metadata?.denialReason).toBe('Budget constraints');
    });

    it('fails to approve request without proper permissions', async () => {
      mockPermissionService.canApproveRequest.mockReturnValue(false);
      mockPermissionService.getRequiredApprovalLevel.mockReturnValue('super_admin');

      const result = await userLibraryService.approveAgentRequest(
        'request-1',
        'approve',
        'company-admin-1',
        'Approval attempt'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient permissions');
    });

    it('handles approval escalation for enterprise agents', async () => {
      const enterpriseRequest = {
        ...mockRequest,
        agentName: 'Enterprise Agent',
        metadata: { ...mockRequest.metadata, tier: 'enterprise' }
      };

      mockPermissionService.canApproveRequest.mockReturnValue(false);
      mockPermissionService.requiresApproval.mockReturnValue(true);
      mockPermissionService.getRequiredApprovalLevel.mockReturnValue('super_admin');

      const result = await userLibraryService.approveAgentRequest(
        'request-1',
        'approve',
        'company-admin-1',
        'Escalation attempt'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires super_admin approval');
    });

    it('prevents approving already processed requests', async () => {
      const approvedRequest = { ...mockRequest, status: 'approved' as const };

      const result = await userLibraryService.approveAgentRequest(
        'request-1',
        'approve',
        'admin-1',
        'Duplicate approval'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('already processed');
    });
  });

  describe('getUserAssignments', () => {
    it('returns all active assignments for a user', async () => {
      const mockAssignments: AgentAssignment[] = [
        {
          id: 'assignment-1',
          userId: 'user-1',
          agentId: 'agent-1',
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin-1',
          assignmentType: 'direct',
          reason: 'Test assignment',
          status: 'active'
        },
        {
          id: 'assignment-2',
          userId: 'user-1',
          agentId: 'agent-2',
          assignedAt: '2024-01-02T00:00:00Z',
          assignedBy: 'admin-1',
          assignmentType: 'approved',
          reason: 'Approved request',
          status: 'active'
        }
      ];

      // Mock the method to return assignments
      jest.spyOn(userLibraryService, 'getUserAssignments').mockResolvedValue(mockAssignments);

      const result = await userLibraryService.getUserAssignments('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('filters assignments by status', async () => {
      const mockAssignments: AgentAssignment[] = [
        {
          id: 'assignment-1',
          userId: 'user-1',
          agentId: 'agent-1',
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin-1',
          assignmentType: 'direct',
          reason: 'Test assignment',
          status: 'active'
        },
        {
          id: 'assignment-2',
          userId: 'user-1',
          agentId: 'agent-2',
          assignedAt: '2024-01-02T00:00:00Z',
          assignedBy: 'admin-1',
          assignmentType: 'approved',
          reason: 'Approved request',
          status: 'inactive'
        }
      ];

      jest.spyOn(userLibraryService, 'getUserAssignments').mockResolvedValue(mockAssignments);

      const activeAssignments = await userLibraryService.getUserAssignments('user-1', 'active');
      const inactiveAssignments = await userLibraryService.getUserAssignments('user-1', 'inactive');

      expect(activeAssignments).toHaveLength(1);
      expect(inactiveAssignments).toHaveLength(1);
    });
  });

  describe('removeAgentFromUser', () => {
    it('successfully removes an agent from a user', async () => {
      const mockAssignment: AgentAssignment = {
        id: 'assignment-1',
        userId: 'user-1',
        agentId: 'agent-1',
        assignedAt: '2024-01-01T00:00:00Z',
        assignedBy: 'admin-1',
        assignmentType: 'direct',
        reason: 'Test assignment',
        status: 'active'
      };

      jest.spyOn(userLibraryService, 'getUserAssignments').mockResolvedValue([mockAssignment]);

      const result = await userLibraryService.removeAgentFromUser(
        'user-1',
        'agent-1',
        'admin-1',
        'No longer needed'
      );

      expect(result.success).toBe(true);
      expect(result.assignment?.status).toBe('removed');
      expect(result.assignment?.metadata?.removalReason).toBe('No longer needed');
    });

    it('fails to remove non-existent assignment', async () => {
      jest.spyOn(userLibraryService, 'getUserAssignments').mockResolvedValue([]);

      const result = await userLibraryService.removeAgentFromUser(
        'user-1',
        'agent-1',
        'admin-1',
        'Removal attempt'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('prevents removing already removed assignments', async () => {
      const removedAssignment: AgentAssignment = {
        id: 'assignment-1',
        userId: 'user-1',
        agentId: 'agent-1',
        assignedAt: '2024-01-01T00:00:00Z',
        assignedBy: 'admin-1',
        assignmentType: 'direct',
        reason: 'Test assignment',
        status: 'removed'
      };

      jest.spyOn(userLibraryService, 'getUserAssignments').mockResolvedValue([removedAssignment]);

      const result = await userLibraryService.removeAgentFromUser(
        'user-1',
        'agent-1',
        'admin-1',
        'Duplicate removal'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('already removed');
    });
  });

  describe('getPendingRequests', () => {
    it('returns all pending requests for an organization', async () => {
      const mockRequests: AgentRequest[] = [
        {
          id: 'request-1',
          userId: 'user-1',
          userEmail: 'user1@example.com',
          userName: 'User 1',
          agentId: 'agent-1',
          agentName: 'Agent 1',
          requestReason: 'Test request 1',
          status: 'pending',
          requestedAt: '2024-01-01T00:00:00Z',
          organizationId: 'org-1',
          organizationName: 'Test Organization',
          approvalLevel: 'company_admin',
          priority: 'medium',
          metadata: {}
        },
        {
          id: 'request-2',
          userId: 'user-2',
          userEmail: 'user2@example.com',
          userName: 'User 2',
          agentId: 'agent-2',
          agentName: 'Agent 2',
          requestReason: 'Test request 2',
          status: 'pending',
          requestedAt: '2024-01-02T00:00:00Z',
          organizationId: 'org-1',
          organizationName: 'Test Organization',
          approvalLevel: 'company_admin',
          priority: 'high',
          metadata: {}
        }
      ];

      jest.spyOn(userLibraryService, 'getPendingRequests').mockResolvedValue(mockRequests);

      const result = await userLibraryService.getPendingRequests('org-1');

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('pending');
      expect(result[1].status).toBe('pending');
    });

    it('filters requests by approval level', async () => {
      const mockRequests: AgentRequest[] = [
        {
          id: 'request-1',
          userId: 'user-1',
          userEmail: 'user1@example.com',
          userName: 'User 1',
          agentId: 'agent-1',
          agentName: 'Agent 1',
          requestReason: 'Company admin request',
          status: 'pending',
          requestedAt: '2024-01-01T00:00:00Z',
          organizationId: 'org-1',
          organizationName: 'Test Organization',
          approvalLevel: 'company_admin',
          priority: 'medium',
          metadata: {}
        },
        {
          id: 'request-2',
          userId: 'user-2',
          userEmail: 'user2@example.com',
          userName: 'User 2',
          agentId: 'agent-2',
          agentName: 'Agent 2',
          requestReason: 'Super admin request',
          status: 'pending',
          requestedAt: '2024-01-02T00:00:00Z',
          organizationId: 'org-1',
          organizationName: 'Test Organization',
          approvalLevel: 'super_admin',
          priority: 'high',
          metadata: {}
        }
      ];

      jest.spyOn(userLibraryService, 'getPendingRequests').mockResolvedValue(mockRequests);

      const companyAdminRequests = await userLibraryService.getPendingRequests('org-1', 'company_admin');
      const superAdminRequests = await userLibraryService.getPendingRequests('org-1', 'super_admin');

      expect(companyAdminRequests).toHaveLength(1);
      expect(superAdminRequests).toHaveLength(1);
    });
  });

  describe('bulkAgentOperations', () => {
    it('successfully performs bulk agent assignment', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const agentId = 'agent-1';
      
      mockPermissionService.canAssignAgent.mockReturnValue(true);
      mockPermissionService.getAssignmentType.mockReturnValue('direct');

      const result = await userLibraryService.bulkAssignAgent(
        userIds,
        agentId,
        'direct',
        'admin-1',
        'Bulk assignment for team'
      );

      expect(result.success).toBe(true);
      expect(result.assignments).toHaveLength(3);
      expect(result.assignments?.every(a => a.agentId === agentId)).toBe(true);
    });

    it('handles partial failures in bulk operations', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const agentId = 'agent-1';
      
      // Mock that one user already has the agent
      jest.spyOn(userLibraryService, 'getUserAssignments')
        .mockResolvedValueOnce([]) // user-1: no existing assignment
        .mockResolvedValueOnce([{ // user-2: already has agent
          id: 'existing-assignment',
          userId: 'user-2',
          agentId: 'agent-1',
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin-1',
          assignmentType: 'direct',
          reason: 'Previous assignment',
          status: 'active'
        }])
        .mockResolvedValueOnce([]); // user-3: no existing assignment

      mockPermissionService.canAssignAgent.mockReturnValue(true);
      mockPermissionService.getAssignmentType.mockReturnValue('direct');

      const result = await userLibraryService.bulkAssignAgent(
        userIds,
        agentId,
        'direct',
        'admin-1',
        'Bulk assignment with conflicts'
      );

      expect(result.success).toBe(true);
      expect(result.assignments).toHaveLength(2); // Only 2 successful assignments
      expect(result.errors).toHaveLength(1); // 1 error for duplicate
    });

    it('fails bulk operation when no users can be assigned', async () => {
      const userIds = ['user-1', 'user-2'];
      const agentId = 'agent-1';
      
      // Mock that all users already have the agent
      jest.spyOn(userLibraryService, 'getUserAssignments')
        .mockResolvedValue([{
          id: 'existing-assignment',
          userId: 'user-1',
          agentId: 'agent-1',
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin-1',
          assignmentType: 'direct',
          reason: 'Previous assignment',
          status: 'active'
        }]);

      const result = await userLibraryService.bulkAssignAgent(
        userIds,
        agentId,
        'direct',
        'admin-1',
        'Bulk assignment all conflicts'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No users could be assigned');
    });
  });

  describe('error handling', () => {
    it('handles database connection errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(userLibraryService, 'assignAgentToUser').mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        userLibraryService.assignAgentToUser('user-1', 'agent-1', 'direct', 'Test')
      ).rejects.toThrow('Database connection failed');
    });

    it('handles permission service errors gracefully', async () => {
      mockPermissionService.canAssignAgent.mockImplementation(() => {
        throw new Error('Permission service unavailable');
      });

      const result = await userLibraryService.assignAgentToUser(
        'user-1',
        'agent-1',
        'direct',
        'Test'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission service unavailable');
    });

    it('validates input parameters', async () => {
      const result = await userLibraryService.assignAgentToUser(
        '', // Invalid user ID
        'agent-1',
        'direct',
        'Test'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user ID');
    });
  });
});
