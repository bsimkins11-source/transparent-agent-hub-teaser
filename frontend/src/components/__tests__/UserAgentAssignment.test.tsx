import React from 'react';
import { render as originalRender, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserAgentAssignment from '../UserAgentAssignment';
import { AgentRequest, AgentAssignment, ApprovalAction } from '../../types/requests';
import { AuthProvider } from '../../__mocks__/contexts/AuthContext';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

// Custom render function that automatically wraps with TestWrapper
const render = (ui: React.ReactElement) => {
  return originalRender(ui, { wrapper: TestWrapper });
};

// Mock data for testing
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'user',
  organizationId: 'org-1',
  organizationName: 'Test Organization',
  assignedAgents: ['agent-1'],
  status: 'active' as const
};

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
    assignmentType: 'approval' as const
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

const mockPendingRequests: AgentRequest[] = [
  {
    id: 'request-1',
    userId: 'user-1',
    userEmail: 'test@example.com',
    userName: 'Test User',
    agentId: 'agent-2',
    agentName: 'Sales Analyzer',
    requestReason: 'Need for Q4 sales analysis',
    status: 'pending',
    requestedAt: '2024-01-01T00:00:00Z',
    organizationId: 'org-1',
    organizationName: 'Test Organization',
    approvalLevel: 'company_admin',
    priority: 'high',
    metadata: {
      businessJustification: 'Critical for Q4 planning'
    }
  }
];

const mockOnAssignAgent = jest.fn();
const mockOnApproveRequest = jest.fn();

describe('UserAgentAssignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Agent Management: Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com • Test Organization')).toBeInTheDocument();
  });

  it('shows correct tabs with counts', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Direct Assignment (2)')).toBeInTheDocument();
    expect(screen.getByText('Pending Requests (1)')).toBeInTheDocument();
  });

  it('displays available agents for assignment', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Should show agents not already assigned to the user
    expect(screen.getByText('Sales Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Manager')).toBeInTheDocument();
    expect(screen.queryByText('Marketing Assistant')).not.toBeInTheDocument(); // Already assigned
  });

  it('allows selecting agents for assignment', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Click on Sales Analyzer to select it
    const salesAnalyzerCard = screen.getByText('Sales Analyzer').closest('div');
    if (salesAnalyzerCard) {
      fireEvent.click(salesAnalyzerCard);
      
      // Should show assignment actions
      expect(screen.getByText('Ready to assign 1 agent(s) to Test User')).toBeInTheDocument();
    }
  });

  it('shows assignment reason input', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    const reasonInput = screen.getByPlaceholderText('e.g., Required for Q4 project, Training purposes...');
    expect(reasonInput).toBeInTheDocument();
    
    fireEvent.change(reasonInput, { target: { value: 'Q4 project requirement' } });
    expect(reasonInput).toHaveValue('Q4 project requirement');
  });

  it('handles direct assignment correctly', async () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Select an agent
    const salesAnalyzerCard = screen.getByText('Sales Analyzer').closest('div');
    if (salesAnalyzerCard) {
      fireEvent.click(salesAnalyzerCard);
      
      // Click assign button
      const assignButton = screen.getByText('Assign Agents');
      fireEvent.click(assignButton);
      
      await waitFor(() => {
        expect(mockOnAssignAgent).toHaveBeenCalledWith('user-1', 'agent-2', 'direct');
      });
    }
  });

  it('shows error when no agents are selected for assignment', async () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // The Assign Agents button should not be visible when no agents are selected
    expect(screen.queryByText('Assign Agents')).not.toBeInTheDocument();
    
    // Select an agent first
    const salesAnalyzerCard = screen.getByText('Sales Analyzer').closest('div');
    if (salesAnalyzerCard) {
      fireEvent.click(salesAnalyzerCard);
      
      // Now the button should be visible
      const assignButton = screen.getByText('Assign Agents');
      expect(assignButton).toBeInTheDocument();
    }
  });

  it('displays pending requests correctly', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Switch to requests tab
    const requestsTab = screen.getByText('Pending Requests (1)');
    fireEvent.click(requestsTab);

    expect(screen.getByText('Sales Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Requested 12/31/2023')).toBeInTheDocument();
    expect(screen.getByText('high priority')).toBeInTheDocument();
  });

  it('handles request approval correctly', async () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Switch to requests tab
    const requestsTab = screen.getByText('Pending Requests (1)');
    fireEvent.click(requestsTab);

    // Click approve button
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(mockOnApproveRequest).toHaveBeenCalledWith('request-1', 'approve');
    });
  });

  it('handles request denial with reason', async () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Switch to requests tab
    const requestsTab = screen.getByText('Pending Requests (1)');
    fireEvent.click(requestsTab);

    // Click deny button
    const denyButton = screen.getByText('Deny');
    fireEvent.click(denyButton);
    
    // Should show reason input
    const reasonInput = screen.getByPlaceholderText('Please provide a clear reason for denying this request...');
    expect(reasonInput).toBeInTheDocument();
    
    // Enter reason and confirm
    fireEvent.change(reasonInput, { target: { value: 'Budget constraints' } });
    const confirmButton = screen.getByText('Confirm Denial');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnApproveRequest).toHaveBeenCalledWith('request-1', 'deny', 'Budget constraints');
    });
  });

  it('shows error when denying without reason', async () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Switch to requests tab
    const requestsTab = screen.getByText('Pending Requests (1)');
    fireEvent.click(requestsTab);

    // Click deny button
    const denyButton = screen.getByText('Deny');
    fireEvent.click(denyButton);
    
    // Try to confirm without reason
    const confirmButton = screen.getByText('Confirm Denial');
    fireEvent.click(confirmButton);
    
    // Should show error
    expect(screen.getByText('Please provide a reason for denial')).toBeInTheDocument();
  });

  it('displays business justification when available', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Switch to requests tab
    const requestsTab = screen.getByText('Pending Requests (1)');
    fireEvent.click(requestsTab);

    expect(screen.getByText('Business Justification:')).toBeInTheDocument();
    expect(screen.getByText('Critical for Q4 planning')).toBeInTheDocument();
  });

  it('shows correct assignment type restrictions based on admin level', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="network_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Network admin should see restrictions for enterprise agents
    const enterpriseAgent = screen.getByText('Enterprise Manager').closest('div');
    if (enterpriseAgent) {
      // Look for the parent div that contains the CSS classes
      const agentCard = enterpriseAgent.closest('div[class*="border-red-200"]');
      expect(agentCard).toBeInTheDocument();
      // Look for the specific text within the Enterprise Manager agent card
      const enterpriseAgentCard = screen.getByText('Enterprise Manager').closest('div[class*="border-red-200"]');
      expect(enterpriseAgentCard).toBeInTheDocument();
      expect(enterpriseAgentCard).toHaveTextContent('Requires Higher Authorization:');
      expect(enterpriseAgentCard).toHaveTextContent('This enterprise agent requires Super Admin approval for assignment.');
    }
  });

  it('allows company admin to assign premium agents directly', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Company admin should be able to assign premium agents
    const premiumAgent = screen.getByText('Sales Analyzer').closest('div');
    if (premiumAgent) {
      // Look for the parent div that contains the CSS classes
      const agentCard = premiumAgent.closest('div[class*="border-gray-200"]');
      expect(agentCard).toBeInTheDocument();
      // Check that it doesn't have restriction styling
      expect(screen.queryByText('Requires Higher Authorization: This premium agent requires Company Admin approval for assignment.')).not.toBeInTheDocument();
    }
  });

  it('shows no agents message when all are assigned', () => {
    const userWithAllAgents = {
      ...mockUser,
      assignedAgents: ['agent-1', 'agent-2', 'agent-3']
    };

    render(
      <UserAgentAssignment
        user={userWithAllAgents}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('All available agents are already assigned to this user.')).toBeInTheDocument();
  });

  it('shows no requests message when no pending requests', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={[]}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Switch to requests tab
    const requestsTab = screen.getByText('Pending Requests (0)');
    fireEvent.click(requestsTab);

    expect(screen.getByText('No pending agent requests from this user.')).toBeInTheDocument();
  });

  it('handles multiple agent selection correctly', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="super_admin"
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    // Select multiple agents - as super admin, can select both
    const salesAnalyzerCard = screen.getByText('Sales Analyzer').closest('div');
    const enterpriseManagerCard = screen.getByText('Enterprise Manager').closest('div');
    
    if (salesAnalyzerCard && enterpriseManagerCard) {
      fireEvent.click(salesAnalyzerCard);
      fireEvent.click(enterpriseManagerCard);
      
      // Should show assignment actions for multiple agents
      expect(screen.getByText('Ready to assign 2 agent(s) to Test User')).toBeInTheDocument();
    }
  });

  it('closes modal when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <UserAgentAssignment
        user={mockUser}
        availableAgents={mockAvailableAgents}
        pendingRequests={mockPendingRequests}
        onAssignAgent={mockOnAssignAgent}
        onApproveRequest={mockOnApproveRequest}
        adminLevel="company_admin"
        isOpen={false}
        onClose={jest.fn()}
      />
    );

    expect(screen.queryByText('Agent Management: Test User')).not.toBeInTheDocument();
  });
});
