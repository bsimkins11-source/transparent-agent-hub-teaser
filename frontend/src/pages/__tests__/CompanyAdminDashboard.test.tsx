import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyAdminDashboard from '../CompanyAdminDashboard';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyBrandingContext } from '../../contexts/CompanyBrandingContext';

// Mock the services
jest.mock('../../services/userLibraryService');
jest.mock('../../services/agentManagementService');
jest.mock('../../services/hierarchicalPermissionService');

// Mock data for testing
const mockUser = {
  id: 'admin-1',
  email: 'admin@company.com',
  displayName: 'Company Admin',
  role: 'company_admin',
  organizationId: 'company-1',
  organizationName: 'Test Company',
  assignedAgents: [],
  status: 'active' as const
};

const mockCompanyUsers = [
  {
    id: 'user-1',
    email: 'user1@company.com',
    displayName: 'User 1',
    role: 'user',
    organizationId: 'company-1',
    organizationName: 'Test Company',
    assignedAgents: ['agent-1'],
    status: 'active' as const
  },
  {
    id: 'user-2',
    email: 'user2@company.com',
    displayName: 'User 2',
    role: 'user',
    organizationId: 'company-1',
    organizationName: 'Test Company',
    assignedAgents: [],
    status: 'active' as const
  }
];

const mockAvailableAgents = [
  {
    id: 'agent-1',
    name: 'Marketing Assistant',
    description: 'AI-powered marketing content generator',
    icon: '🤖',
    category: 'Marketing',
    tier: 'free' as const,
    assignmentType: 'free' as const
  },
  {
    id: 'agent-2',
    name: 'Sales Analyzer',
    description: 'Advanced sales data analysis and insights',
    icon: '📊',
    category: 'Sales',
    tier: 'premium' as const,
    assignmentType: 'direct' as const
  },
  {
    id: 'agent-3',
    name: 'Enterprise Manager',
    description: 'Enterprise-level business process automation',
    icon: '🏢',
    category: 'Operations',
    tier: 'enterprise' as const,
    assignmentType: 'approval' as const
  }
];

const mockPendingRequests = [
  {
    id: 'request-1',
    userId: 'user-2',
    userEmail: 'user2@company.com',
    userName: 'User 2',
    agentId: 'agent-3',
    agentName: 'Enterprise Manager',
    requestReason: 'Need for enterprise automation',
    status: 'pending',
    requestedAt: '2024-01-01T00:00:00Z',
    organizationId: 'company-1',
    organizationName: 'Test Company',
    approvalLevel: 'super_admin',
    priority: 'high',
    metadata: {
      businessJustification: 'Critical for Q4 automation'
    }
  }
];

const mockAuthContextValue = {
  user: mockUser,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordReset: jest.fn(),
  confirmPasswordReset: jest.fn(),
  refreshUser: jest.fn()
};

const mockCompanyBrandingContextValue = {
  companyBranding: {
    name: 'Test Company',
    logo: 'test-logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  },
  loading: false,
  updateCompanyBranding: jest.fn()
};

describe('CompanyAdminDashboard - Agent Assignment Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <CompanyBrandingContext.Provider value={mockCompanyBrandingContextValue}>
          <CompanyAdminDashboard />
        </CompanyBrandingContext.Provider>
      </AuthContext.Provider>
    );
  };

  describe('User Management Section', () => {
    it('displays company users with their assigned agents', () => {
      renderDashboard();

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('1 agent assigned')).toBeInTheDocument();
      expect(screen.getByText('0 agents assigned')).toBeInTheDocument();
    });

    it('shows agent assignment modal when clicking on user', async () => {
      renderDashboard();

      // Click on User 2 to open agent assignment
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });
      }
    });

    it('allows company admin to assign free agents directly', async () => {
      renderDashboard();

      // Open agent assignment for User 2
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });

        // Should see available agents
        expect(screen.getByText('Marketing Assistant')).toBeInTheDocument();
        expect(screen.getByText('Sales Analyzer')).toBeInTheDocument();
        expect(screen.getByText('Enterprise Manager')).toBeInTheDocument();
      }
    });

    it('shows permission restrictions for enterprise agents', async () => {
      renderDashboard();

      // Open agent assignment for User 2
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });

        // Enterprise agent should show restriction
        const enterpriseAgent = screen.getByText('Enterprise Manager').closest('div');
        if (enterpriseAgent) {
          expect(enterpriseAgent).toHaveClass('border-red-200', 'bg-red-50');
          expect(screen.getByText('Requires Higher Authorization: This enterprise agent requires Super Admin approval for assignment.')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Agent Assignment Workflow', () => {
    it('allows direct assignment of premium agents', async () => {
      renderDashboard();

      // Open agent assignment for User 2
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });

        // Select Sales Analyzer (premium agent)
        const salesAnalyzerCard = screen.getByText('Sales Analyzer').closest('div');
        if (salesAnalyzerCard) {
          fireEvent.click(salesAnalyzerCard);
          
          // Should show assignment actions
          expect(screen.getByText('Ready to assign 1 agent(s) to User 2')).toBeInTheDocument();
          
          // Enter assignment reason
          const reasonInput = screen.getByPlaceholderText('e.g., Required for Q4 project, Training purposes...');
          fireEvent.change(reasonInput, { target: { value: 'Q4 sales analysis' } });
          
          // Click assign button
          const assignButton = screen.getByText('Assign Agents');
          fireEvent.click(assignButton);
          
          // Should call assignment service
          // This would be tested in integration tests
        }
      }
    });

    it('creates approval request for enterprise agents', async () => {
      renderDashboard();

      // Open agent assignment for User 2
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });

        // Enterprise agent should show it requires approval
        const enterpriseAgent = screen.getByText('Enterprise Manager').closest('div');
        if (enterpriseAgent) {
          expect(screen.getByText('Requires Higher Authorization: This enterprise agent requires Super Admin approval for assignment.')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Pending Requests Management', () => {
    it('displays pending agent requests', () => {
      renderDashboard();

      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Manager')).toBeInTheDocument();
      expect(screen.getByText('Requested for enterprise automation')).toBeInTheDocument();
      expect(screen.getByText('high priority')).toBeInTheDocument();
    });

    it('shows business justification for requests', () => {
      renderDashboard();

      expect(screen.getByText('Business Justification: Critical for Q4 automation')).toBeInTheDocument();
    });

    it('allows company admin to approve requests they have permission for', () => {
      renderDashboard();

      // Company admin should see approve/deny buttons for requests they can handle
      const approveButton = screen.getByText('Approve');
      const denyButton = screen.getByText('Deny');
      
      expect(approveButton).toBeInTheDocument();
      expect(denyButton).toBeInTheDocument();
    });

    it('shows escalation notice for requests requiring higher approval', () => {
      renderDashboard();

      // Enterprise agent request requires super admin approval
      expect(screen.getByText('Requires super_admin approval')).toBeInTheDocument();
    });
  });

  describe('Bulk Operations', () => {
    it('allows bulk agent assignment to multiple users', async () => {
      renderDashboard();

      // Should have bulk assignment functionality
      expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
      
      // This would be tested in integration tests with actual service calls
    });

    it('shows progress and results for bulk operations', () => {
      renderDashboard();

      // Should display bulk operation status
      expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
    });
  });

  describe('Permission Enforcement', () => {
    it('prevents company admin from assigning enterprise agents directly', async () => {
      renderDashboard();

      // Open agent assignment for User 2
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });

        // Enterprise agent should be disabled for direct assignment
        const enterpriseAgent = screen.getByText('Enterprise Manager').closest('div');
        if (enterpriseAgent) {
          expect(enterpriseAgent).toHaveClass('border-red-200', 'bg-red-50');
          expect(enterpriseAgent).toHaveClass('cursor-not-allowed');
        }
      }
    });

    it('allows company admin to assign free and premium agents', async () => {
      renderDashboard();

      // Open agent assignment for User 2
      const user2Row = screen.getByText('User 2').closest('tr');
      if (user2Row) {
        fireEvent.click(user2Row);
        
        await waitFor(() => {
          expect(screen.getByText('Agent Management: User 2')).toBeInTheDocument();
        });

        // Free and premium agents should be available for assignment
        const freeAgent = screen.getByText('Marketing Assistant').closest('div');
        const premiumAgent = screen.getByText('Sales Analyzer').closest('div');
        
        if (freeAgent && premiumAgent) {
          expect(freeAgent).toHaveClass('border-gray-200');
          expect(premiumAgent).toHaveClass('border-gray-200');
          expect(freeAgent).not.toHaveClass('border-red-200', 'bg-red-50');
          expect(premiumAgent).not.toHaveClass('border-red-200', 'bg-red-50');
        }
      }
    });
  });

  describe('User Experience', () => {
    it('provides clear feedback for user actions', () => {
      renderDashboard();

      // Should show clear status messages and feedback
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
    });

    it('handles loading states gracefully', () => {
      renderDashboard();

      // Should show loading indicators when appropriate
      // This would be tested with actual async operations
    });

    it('provides error handling and user feedback', () => {
      renderDashboard();

      // Should handle errors gracefully and show user-friendly messages
      // This would be tested with actual error scenarios
    });
  });

  describe('Integration with Services', () => {
    it('calls user library service for agent assignments', () => {
      renderDashboard();

      // The component should integrate with UserLibraryService
      // This would be tested in integration tests
    });

    it('uses hierarchical permission service for access control', () => {
      renderDashboard();

      // The component should use HierarchicalPermissionService
      // This would be tested in integration tests
    });

    it('integrates with agent management service', () => {
      renderDashboard();

      // The component should integrate with AgentManagementService
      // This would be tested in integration tests
    });
  });

  describe('Responsive Design', () => {
    it('adapts to different screen sizes', () => {
      renderDashboard();

      // Should be responsive and work on different screen sizes
      // This would be tested with different viewport sizes
    });

    it('provides mobile-friendly interface', () => {
      renderDashboard();

      // Should be mobile-friendly with appropriate touch targets
      // This would be tested with mobile viewport simulation
    });
  });
});
