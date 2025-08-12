import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentCard from '../AgentCard';
import { Agent } from '../../types/agent';

// Mock agent data
const mockAgent: Agent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'A test agent for testing purposes',
  provider: 'openai',
  route: '/api/test',
  metadata: {
    tags: ['test', 'demo'],
    category: 'Testing',
    tier: 'free'
  },
  visibility: 'global',
  status: 'approved'
};

describe('AgentCard', () => {
  const defaultProps = {
    agent: mockAgent,
    isInUserLibrary: false,
    showAddToLibrary: false,
    showRequestAccess: false,
    currentLibrary: 'global' as const,
    onAddToLibrary: jest.fn(),
    onRequestAccess: jest.fn(),
    onRemoveFromLibrary: jest.fn(),
    onOpenAgent: jest.fn()
  };

  it('renders agent information correctly', () => {
    render(<AgentCard {...defaultProps} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('A test agent for testing purposes')).toBeInTheDocument();
    expect(screen.getByText('openai')).toBeInTheDocument();
  });

  it('shows "Add to Library" button for global library when agent can be added', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        showAddToLibrary={true}
        currentLibrary="global"
      />
    );
    
    expect(screen.getByText('Add to Library')).toBeInTheDocument();
    expect(screen.getByText('Add to Library')).toHaveClass('bg-blue-600');
  });

  it('shows "Add to Library" button for company library when agent can be added', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        showAddToLibrary={true}
        currentLibrary="company"
      />
    );
    
    expect(screen.getByText('Add to Library')).toBeInTheDocument();
    expect(screen.getByText('Add to Library')).toHaveClass('bg-blue-600');
  });

  it('shows "Request Access" button for global library when access is required', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        showRequestAccess={true}
        currentLibrary="global"
      />
    );
    
    expect(screen.getByText('Request Access')).toBeInTheDocument();
    expect(screen.getByText('Request Access')).toHaveClass('bg-orange-600');
  });

  it('shows "Request Access" button for company library when access is required', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        showRequestAccess={true}
        currentLibrary="company"
      />
    );
    
    expect(screen.getByText('Request Access')).toBeInTheDocument();
    expect(screen.getByText('Request Access')).toHaveClass('bg-orange-600');
  });

  it('shows "Open" button and small remove button for personal library when agent is in user library', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        isInUserLibrary={true}
        currentLibrary="personal"
      />
    );
    
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Open')).toHaveClass('bg-green-600');
    expect(screen.getByText('Remove from Library')).toBeInTheDocument();
    expect(screen.getByText('Remove from Library')).toHaveClass('bg-gray-100');
  });

  it('changes "View Details" text to "Open Agent" for personal library when agent is in user library', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        isInUserLibrary={true}
        currentLibrary="personal"
      />
    );
    
    expect(screen.getByText('Open Agent')).toBeInTheDocument();
  });

  it('shows "View Details" text for other libraries', () => {
    render(
      <AgentCard 
        {...defaultProps} 
        currentLibrary="global"
      />
    );
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('calls onOpenAgent when Open button is clicked in personal library', () => {
    const onOpenAgent = jest.fn();
    render(
      <AgentCard 
        {...defaultProps} 
        isInUserLibrary={true}
        currentLibrary="personal"
        onOpenAgent={onOpenAgent}
      />
    );
    
    fireEvent.click(screen.getByText('Open'));
    expect(onOpenAgent).toHaveBeenCalledTimes(1);
  });

  it('calls onAddToLibrary when Add to Library button is clicked', () => {
    const onAddToLibrary = jest.fn();
    render(
      <AgentCard 
        {...defaultProps} 
        showAddToLibrary={true}
        currentLibrary="global"
        onAddToLibrary={onAddToLibrary}
      />
    );
    
    fireEvent.click(screen.getByText('Add to Library'));
    expect(onAddToLibrary).toHaveBeenCalledTimes(1);
  });

  it('calls onRequestAccess when Request Access button is clicked', () => {
    const onRequestAccess = jest.fn();
    render(
      <AgentCard 
        {...defaultProps} 
        showRequestAccess={true}
        currentLibrary="global"
        onRequestAccess={onRequestAccess}
      />
    );
    
    fireEvent.click(screen.getByText('Request Access'));
    expect(onRequestAccess).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveFromLibrary when Remove button is clicked', () => {
    const onRemoveFromLibrary = jest.fn();
    render(
      <AgentCard 
        {...defaultProps} 
        isInUserLibrary={true}
        currentLibrary="personal"
        onRemoveFromLibrary={onRemoveFromLibrary}
      />
    );
    
    fireEvent.click(screen.getByText('Remove from Library'));
    expect(onRemoveFromLibrary).toHaveBeenCalledTimes(1);
  });
});
