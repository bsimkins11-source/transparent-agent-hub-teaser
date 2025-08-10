import { 
  HierarchicalPermissionService, 
  AgentPermission, 
  AdminLevel,
  AssignmentType,
  AgentTier 
} from '../hierarchicalPermissionService';

describe('HierarchicalPermissionService', () => {
  let permissionService: HierarchicalPermissionService;

  beforeEach(() => {
    permissionService = new HierarchicalPermissionService();
  });

  describe('getAgentPermissions', () => {
    it('returns correct permissions for free agents', () => {
      const permissions = permissionService.getAgentPermissions('free', 'company_admin');
      
      expect(permissions).toEqual({
        canAssign: true,
        canApprove: true,
        canRequest: true,
        requiresApproval: false,
        approvalLevel: 'company_admin',
        assignmentType: 'free'
      });
    });

    it('returns correct permissions for premium agents for company admin', () => {
      const permissions = permissionService.getAgentPermissions('premium', 'company_admin');
      
      expect(permissions).toEqual({
        canAssign: true,
        canApprove: true,
        canRequest: true,
        requiresApproval: false,
        approvalLevel: 'company_admin',
        assignmentType: 'direct'
      });
    });

    it('returns correct permissions for premium agents for network admin', () => {
      const permissions = permissionService.getAgentPermissions('premium', 'network_admin');
      
      expect(permissions).toEqual({
        canAssign: true,
        canApprove: true,
        canRequest: true,
        requiresApproval: false,
        approvalLevel: 'network_admin',
        assignmentType: 'direct'
      });
    });

    it('returns correct permissions for enterprise agents for company admin', () => {
      const permissions = permissionService.getAgentPermissions('enterprise', 'company_admin');
      
      expect(permissions).toEqual({
        canAssign: false,
        canApprove: false,
        canRequest: true,
        requiresApproval: true,
        approvalLevel: 'super_admin',
        assignmentType: 'approval'
      });
    });

    it('returns correct permissions for enterprise agents for network admin', () => {
      const permissions = permissionService.getAgentPermissions('enterprise', 'network_admin');
      
      expect(permissions).toEqual({
        canAssign: false,
        canApprove: false,
        canRequest: true,
        requiresApproval: true,
        approvalLevel: 'super_admin',
        assignmentType: 'approval'
      });
    });

    it('returns correct permissions for enterprise agents for super admin', () => {
      const permissions = permissionService.getAgentPermissions('enterprise', 'super_admin');
      
      expect(permissions).toEqual({
        canAssign: true,
        canApprove: true,
        canRequest: true,
        requiresApproval: false,
        approvalLevel: 'super_admin',
        assignmentType: 'direct'
      });
    });
  });

  describe('canAssignAgent', () => {
    it('allows company admin to assign free agents', () => {
      const canAssign = permissionService.canAssignAgent('free', 'company_admin');
      expect(canAssign).toBe(true);
    });

    it('allows company admin to assign premium agents', () => {
      const canAssign = permissionService.canAssignAgent('premium', 'company_admin');
      expect(canAssign).toBe(true);
    });

    it('prevents company admin from assigning enterprise agents', () => {
      const canAssign = permissionService.canAssignAgent('enterprise', 'company_admin');
      expect(canAssign).toBe(false);
    });

    it('allows network admin to assign free agents', () => {
      const canAssign = permissionService.canAssignAgent('free', 'network_admin');
      expect(canAssign).toBe(true);
    });

    it('allows network admin to assign premium agents', () => {
      const canAssign = permissionService.canAssignAgent('premium', 'network_admin');
      expect(canAssign).toBe(true);
    });

    it('prevents network admin from assigning enterprise agents', () => {
      const canAssign = permissionService.canAssignAgent('enterprise', 'network_admin');
      expect(canAssign).toBe(false);
    });

    it('allows super admin to assign all agent tiers', () => {
      expect(permissionService.canAssignAgent('free', 'super_admin')).toBe(true);
      expect(permissionService.canAssignAgent('premium', 'super_admin')).toBe(true);
      expect(permissionService.canAssignAgent('enterprise', 'super_admin')).toBe(true);
    });
  });

  describe('canApproveRequest', () => {
    it('allows company admin to approve free agent requests', () => {
      const canApprove = permissionService.canApproveRequest('free', 'company_admin');
      expect(canApprove).toBe(true);
    });

    it('allows company admin to approve premium agent requests', () => {
      const canApprove = permissionService.canApproveRequest('premium', 'company_admin');
      expect(canApprove).toBe(true);
    });

    it('prevents company admin from approving enterprise agent requests', () => {
      const canApprove = permissionService.canApproveRequest('enterprise', 'company_admin');
      expect(canApprove).toBe(false);
    });

    it('allows network admin to approve free agent requests', () => {
      const canApprove = permissionService.canApproveRequest('free', 'network_admin');
      expect(canApprove).toBe(true);
    });

    it('allows network admin to approve premium agent requests', () => {
      const canApprove = permissionService.canApproveRequest('premium', 'network_admin');
      expect(canApprove).toBe(true);
    });

    it('prevents network admin from approving enterprise agent requests', () => {
      const canApprove = permissionService.canApproveRequest('enterprise', 'network_admin');
      expect(canApprove).toBe(false);
    });

    it('allows super admin to approve all agent tier requests', () => {
      expect(permissionService.canApproveRequest('free', 'super_admin')).toBe(true);
      expect(permissionService.canApproveRequest('premium', 'super_admin')).toBe(true);
      expect(permissionService.canApproveRequest('enterprise', 'super_admin')).toBe(true);
    });
  });

  describe('requiresApproval', () => {
    it('free agents do not require approval', () => {
      expect(permissionService.requiresApproval('free', 'company_admin')).toBe(false);
      expect(permissionService.requiresApproval('free', 'network_admin')).toBe(false);
      expect(permissionService.requiresApproval('free', 'super_admin')).toBe(false);
    });

    it('premium agents do not require approval for company admin and above', () => {
      expect(permissionService.requiresApproval('premium', 'company_admin')).toBe(false);
      expect(permissionService.requiresApproval('premium', 'network_admin')).toBe(false);
      expect(permissionService.requiresApproval('premium', 'super_admin')).toBe(false);
    });

    it('enterprise agents require approval for company and network admins', () => {
      expect(permissionService.requiresApproval('enterprise', 'company_admin')).toBe(true);
      expect(permissionService.requiresApproval('enterprise', 'network_admin')).toBe(true);
    });

    it('enterprise agents do not require approval for super admin', () => {
      expect(permissionService.requiresApproval('enterprise', 'super_admin')).toBe(false);
    });
  });

  describe('getApprovalLevel', () => {
    it('returns correct approval level for free agents', () => {
      expect(permissionService.getApprovalLevel('free', 'company_admin')).toBe('company_admin');
      expect(permissionService.getApprovalLevel('free', 'network_admin')).toBe('network_admin');
      expect(permissionService.getApprovalLevel('free', 'super_admin')).toBe('super_admin');
    });

    it('returns correct approval level for premium agents', () => {
      expect(permissionService.getApprovalLevel('premium', 'company_admin')).toBe('company_admin');
      expect(permissionService.getApprovalLevel('premium', 'network_admin')).toBe('network_admin');
      expect(permissionService.getApprovalLevel('premium', 'super_admin')).toBe('super_admin');
    });

    it('returns super admin approval level for enterprise agents', () => {
      expect(permissionService.getApprovalLevel('enterprise', 'company_admin')).toBe('super_admin');
      expect(permissionService.getApprovalLevel('enterprise', 'network_admin')).toBe('super_admin');
      expect(permissionService.getApprovalLevel('enterprise', 'super_admin')).toBe('super_admin');
    });
  });

  describe('getAssignmentType', () => {
    it('returns correct assignment type for free agents', () => {
      expect(permissionService.getAssignmentType('free', 'company_admin')).toBe('free');
      expect(permissionService.getAssignmentType('free', 'network_admin')).toBe('free');
      expect(permissionService.getAssignmentType('free', 'super_admin')).toBe('free');
    });

    it('returns correct assignment type for premium agents', () => {
      expect(permissionService.getAssignmentType('premium', 'company_admin')).toBe('direct');
      expect(permissionService.getAssignmentType('premium', 'network_admin')).toBe('direct');
      expect(permissionService.getAssignmentType('premium', 'super_admin')).toBe('direct');
    });

    it('returns correct assignment type for enterprise agents', () => {
      expect(permissionService.getAssignmentType('enterprise', 'company_admin')).toBe('approval');
      expect(permissionService.getAssignmentType('enterprise', 'network_admin')).toBe('approval');
      expect(permissionService.getAssignmentType('enterprise', 'super_admin')).toBe('direct');
    });
  });

  describe('canRequestAgent', () => {
    it('allows all admin levels to request free agents', () => {
      expect(permissionService.canRequestAgent('free', 'company_admin')).toBe(true);
      expect(permissionService.canRequestAgent('free', 'network_admin')).toBe(true);
      expect(permissionService.canRequestAgent('free', 'super_admin')).toBe(true);
    });

    it('allows all admin levels to request premium agents', () => {
      expect(permissionService.canRequestAgent('premium', 'company_admin')).toBe(true);
      expect(permissionService.canRequestAgent('premium', 'network_admin')).toBe(true);
      expect(permissionService.canRequestAgent('premium', 'super_admin')).toBe(true);
    });

    it('allows all admin levels to request enterprise agents', () => {
      expect(permissionService.canRequestAgent('enterprise', 'company_admin')).toBe(true);
      expect(permissionService.canRequestAgent('enterprise', 'network_admin')).toBe(true);
      expect(permissionService.canRequestAgent('enterprise', 'super_admin')).toBe(true);
    });
  });

  describe('getAdminLevelHierarchy', () => {
    it('returns correct hierarchy levels', () => {
      const hierarchy = permissionService.getAdminLevelHierarchy();
      
      expect(hierarchy).toEqual([
        'super_admin',
        'network_admin', 
        'company_admin'
      ]);
    });
  });

  describe('isHigherLevelAdmin', () => {
    it('correctly identifies higher level admins', () => {
      expect(permissionService.isHigherLevelAdmin('super_admin', 'network_admin')).toBe(true);
      expect(permissionService.isHigherLevelAdmin('super_admin', 'company_admin')).toBe(true);
      expect(permissionService.isHigherLevelAdmin('network_admin', 'company_admin')).toBe(true);
    });

    it('correctly identifies lower level admins', () => {
      expect(permissionService.isHigherLevelAdmin('company_admin', 'network_admin')).toBe(false);
      expect(permissionService.isHigherLevelAdmin('company_admin', 'super_admin')).toBe(false);
      expect(permissionService.isHigherLevelAdmin('network_admin', 'super_admin')).toBe(false);
    });

    it('returns false for same level admins', () => {
      expect(permissionService.isHigherLevelAdmin('company_admin', 'company_admin')).toBe(false);
      expect(permissionService.isHigherLevelAdmin('network_admin', 'network_admin')).toBe(false);
      expect(permissionService.isHigherLevelAdmin('super_admin', 'super_admin')).toBe(false);
    });
  });

  describe('getRequiredApprovalLevel', () => {
    it('returns correct required approval level for each agent tier', () => {
      expect(permissionService.getRequiredApprovalLevel('free')).toBe('company_admin');
      expect(permissionService.getRequiredApprovalLevel('premium')).toBe('company_admin');
      expect(permissionService.getRequiredApprovalLevel('enterprise')).toBe('super_admin');
    });
  });

  describe('edge cases and invalid inputs', () => {
    it('handles invalid agent tier gracefully', () => {
      const permissions = permissionService.getAgentPermissions('invalid' as AgentTier, 'company_admin');
      
      // Should default to most restrictive permissions
      expect(permissions.canAssign).toBe(false);
      expect(permissions.canApprove).toBe(false);
      expect(permissions.requiresApproval).toBe(true);
    });

    it('handles invalid admin level gracefully', () => {
      const permissions = permissionService.getAgentPermissions('free', 'invalid' as AdminLevel);
      
      // Should default to most restrictive permissions
      expect(permissions.canAssign).toBe(false);
      expect(permissions.canApprove).toBe(false);
      expect(permissions.requiresApproval).toBe(true);
    });

    it('handles null/undefined inputs gracefully', () => {
      expect(() => permissionService.getAgentPermissions(null as any, 'company_admin')).not.toThrow();
      expect(() => permissionService.getAgentPermissions('free', null as any)).not.toThrow();
    });
  });

  describe('permission inheritance', () => {
    it('higher level admins inherit all permissions of lower levels', () => {
      // Super admin should have all permissions that company admin has
      const companyAdminPermissions = permissionService.getAgentPermissions('premium', 'company_admin');
      const superAdminPermissions = permissionService.getAgentPermissions('premium', 'super_admin');
      
      expect(superAdminPermissions.canAssign).toBe(true);
      expect(superAdminPermissions.canApprove).toBe(true);
      expect(superAdminPermissions.canRequest).toBe(true);
      
      // Super admin should have additional permissions
      expect(superAdminPermissions.canAssign).toBe(companyAdminPermissions.canAssign);
      expect(superAdminPermissions.canApprove).toBe(companyAdminPermissions.canApprove);
    });

    it('permission escalation follows proper hierarchy', () => {
      // Company admin can assign premium agents
      expect(permissionService.canAssignAgent('premium', 'company_admin')).toBe(true);
      
      // Network admin can assign premium agents (same level)
      expect(permissionService.canAssignAgent('premium', 'network_admin')).toBe(true);
      
      // Super admin can assign premium agents (higher level)
      expect(permissionService.canAssignAgent('premium', 'super_admin')).toBe(true);
    });
  });
});
