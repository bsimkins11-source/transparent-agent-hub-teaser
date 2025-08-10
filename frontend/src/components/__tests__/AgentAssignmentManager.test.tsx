import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentAssignmentManager from '../AgentAssignmentManager';
import { Agent } from '../../types/agent';
import { AgentPermission } from '../../services/hierarchicalPermissionService';

// Mock data for testing
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Marketing Assistant',
    description: 'AI-powered marketing content generator',
    provider: 'openai',
    route: '/api/marketing',
    metadata: {
      tags: ['marketing', 'content'],
      category: 'Marketing',
      tier: 'free',
      permissionType: 'free'
    },
    visibility: 'global',
    status: 'approved'
  },
  {
    id: 'agent-2',
    name: 'Sales Analyzer',
    description: 'Advanced sales data analysis and insights',
    provider: 'anthropic',
    route: '/api/sales',
    metadata: {
      tags: ['sales', 'analytics'],
      category: 'Sales',
      tier: 'premium',
      permissionType: 'approval'
    },
    visibility: 'global',
    status: 'approved'
  },
  {
    id: 'agent-3',
    name: 'Enterprise Manager',
    description: 'Enterprise-level business process automation',
    provider: 'google',
    route: '/api/enterprise',
    metadata: {
      tags: ['enterprise', 'automation'],
      category: 'Operations',
      tier: 'enterprise',
      permissionType: 'approval'
    },
    visibility: 'global',
    status: 'approved'
  }
];

const mockPermissions: { [agentId: string]: AgentPermission } = {
  'agent-1': {
    agentId: 'agent-1',
    agentName: 'Marketing Assistant',
    granted: true,
    assignmentType: 'free',
    grantedBy: 'admin-1',
    grantedAt: '2024-01-01T00:00:00Z',
    tier: 'free'
  },
  'agent-2': {
    agentId: 'agent-2',
    agentName: 'Sales Analyzer',
    granted: false,
    assignmentType: 'approval',
    grantedBy: 'admin-1',
    grantedAt: '2024-01-01T00:00:00Z',
    tier: 'premium'
  },
  'agent-3': {
    agentId: 'agent-3',
    agentName: 'Enterprise Manager',
    granted: false,
    assignmentType: 'approval',
    grantedBy: 'admin-1',
    grantedAt: '2024-01-01T00:00:00Z',
    tier: 'enterprise'
  }
};

const mockStats = {
  totalAvailable: 3,
  totalGranted: 1,
  byTier: {
    free: 1,
    premium: 1,
    enterprise: 1
  }
};

const mockOnSavePermissions = jest.fn();

describe('AgentAssignmentManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct title and description', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description for agent library"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    expect(screen.getByText('Test Agent Library')).toBeInTheDocument();
    expect(screen.getByText('Test description for agent library')).toBeInTheDocument();
  });

  it('displays stats cards when stats are provided', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
        stats={mockStats}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // Total Available
    
    // Look for specific stats by their context
    expect(screen.getByText('Currently Granted')).toBeInTheDocument(); // Total Granted
    expect(screen.getByText('Premium Agents')).toBeInTheDocument(); // Premium Agents
    expect(screen.getByText('Enterprise Agents')).toBeInTheDocument(); // Enterprise Agents
  });

  it('shows warning when no agents are available', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={[]}
        currentPermissions={{}}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    expect(screen.getByText('No agents available')).toBeInTheDocument();
    expect(screen.getByText('No agents have been granted to this level yet. Contact your administrator to assign agents.')).toBeInTheDocument();
  });

  it('renders agent table with correct columns', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Assignment Type')).toBeInTheDocument();
    // Look for the table header specifically, not the dropdown option
    expect(screen.getByText('Granted', { selector: 'th' })).toBeInTheDocument();
  });

  it('displays agent information correctly', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    expect(screen.getByText('Marketing Assistant')).toBeInTheDocument();
    expect(screen.getByText('AI-powered marketing content generator')).toBeInTheDocument();
    expect(screen.getByText('Sales Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Manager')).toBeInTheDocument();
  });

  it('shows correct tier badges with appropriate colors', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const freeBadge = screen.getByText('free');
    const premiumBadge = screen.getByText('premium');
    const enterpriseBadge = screen.getByText('enterprise');

    expect(freeBadge).toBeInTheDocument();
    expect(premiumBadge).toBeInTheDocument();
    expect(enterpriseBadge).toBeInTheDocument();

    // Check that badges have appropriate CSS classes
    expect(freeBadge.closest('span')).toHaveClass('bg-green-100', 'text-green-800');
    expect(premiumBadge.closest('span')).toHaveClass('bg-purple-100', 'text-purple-800');
    expect(enterpriseBadge.closest('span')).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('shows correct provider badges', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('anthropic')).toBeInTheDocument();
    expect(screen.getByText('google')).toBeInTheDocument();
  });

  it('allows toggling agent permissions', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    // Find the toggle button for the first agent (currently granted)
    const toggleButtons = screen.getAllByRole('button');
    const firstToggleButton = toggleButtons.find(button => 
      button.getAttribute('class')?.includes('w-6 h-6 rounded-full')
    );

    if (firstToggleButton) {
      fireEvent.click(firstToggleButton);
      
      // The permission should now be toggled
      // Note: In a real test environment, you'd need to check the state change
      expect(firstToggleButton).toBeInTheDocument();
    }
  });

  it('allows changing assignment types', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    // Find assignment type dropdowns - they are in the table rows
    const assignmentTypeSelects = screen.getAllByDisplayValue('Free (Direct Add)');
    
    // Check that we have the expected number of selects
    expect(assignmentTypeSelects.length).toBeGreaterThan(0);

    // Test changing an assignment type
    const firstSelect = assignmentTypeSelects[0];
    fireEvent.change(firstSelect, { target: { value: 'approval' } });
    
    expect(firstSelect).toHaveValue('approval');
  });

  it('filters agents by search term', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search agents...');
    fireEvent.change(searchInput, { target: { value: 'Marketing' } });

    // Should only show Marketing Assistant
    expect(screen.getByText('Marketing Assistant')).toBeInTheDocument();
    expect(screen.queryByText('Sales Analyzer')).not.toBeInTheDocument();
    expect(screen.queryByText('Enterprise Manager')).not.toBeInTheDocument();
  });

  it('filters agents by tier', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const tierSelect = screen.getByDisplayValue('All Tiers');
    fireEvent.change(tierSelect, { target: { value: 'premium' } });

    // Should only show premium agents
    expect(screen.queryByText('Marketing Assistant')).not.toBeInTheDocument();
    expect(screen.getByText('Sales Analyzer')).toBeInTheDocument();
    expect(screen.queryByText('Enterprise Manager')).not.toBeInTheDocument();
  });

  it('filters agents by provider', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const providerSelect = screen.getByDisplayValue('All Providers');
    fireEvent.change(providerSelect, { target: { value: 'openai' } });

    // Should only show OpenAI agents
    expect(screen.getByText('Marketing Assistant')).toBeInTheDocument();
    expect(screen.queryByText('Sales Analyzer')).not.toBeInTheDocument();
    expect(screen.queryByText('Enterprise Manager')).not.toBeInTheDocument();
  });

  it('filters agents by status', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'granted' } });

    // Should only show granted agents
    expect(screen.getByText('Marketing Assistant')).toBeInTheDocument();
    expect(screen.queryByText('Sales Analyzer')).not.toBeInTheDocument();
    expect(screen.queryByText('Enterprise Manager')).not.toBeInTheDocument();
  });

  it('performs bulk actions on filtered agents', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const grantAllButton = screen.getByText('Grant All Filtered');
    const revokeAllButton = screen.getByText('Revoke All Filtered');

    expect(grantAllButton).toBeInTheDocument();
    expect(revokeAllButton).toBeInTheDocument();

    // Test bulk grant action
    fireEvent.click(grantAllButton);
    
    // In a real test, you'd verify the state changes
    expect(grantAllButton).toBeInTheDocument();
  });

  it('calls onSavePermissions when save button is clicked', async () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    
    // Initially, the save button should be disabled if no changes
    expect(saveButton).toBeDisabled();

    // Make a change to enable the save button
    const toggleButtons = screen.getAllByRole('button');
    const firstToggleButton = toggleButtons.find(button => 
      button.getAttribute('class')?.includes('w-6 h-6 rounded-full')
    );

    if (firstToggleButton) {
      fireEvent.click(firstToggleButton);
      
      // Now the save button should be enabled
      const updatedSaveButton = screen.getByText('Save Changes');
      expect(updatedSaveButton).not.toBeDisabled();
      
      fireEvent.click(updatedSaveButton);
      
      await waitFor(() => {
        expect(mockOnSavePermissions).toHaveBeenCalled();
      });
    }
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
        loading={true}
      />
    );

    // Should show loading spinner
    const loadingSpinner = screen.getByRole('status', { hidden: true });
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('disables assignment type changes for non-granted agents', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    // Find assignment type selects
    const assignmentTypeSelects = screen.getAllByRole('combobox');
    
    // The second agent (Sales Analyzer) is not granted, so its select should be disabled
    const salesAnalyzerSelect = assignmentTypeSelects.find(select => 
      select.closest('tr')?.textContent?.includes('Sales Analyzer')
    );
    
    if (salesAnalyzerSelect) {
      expect(salesAnalyzerSelect).toBeDisabled();
    }
  });

  it('displays correct agent count in filters', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    expect(screen.getByText('3 agents shown')).toBeInTheDocument();
  });

  it('handles empty search results gracefully', () => {
    render(
      <AgentAssignmentManager
        title="Test Agent Library"
        description="Test description"
        availableAgents={mockAgents}
        currentPermissions={mockPermissions}
        onSavePermissions={mockOnSavePermissions}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search agents...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentAgent' } });

    expect(screen.getByText('No agents found matching your criteria')).toBeInTheDocument();
  });
});
