import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import AgentCard from '../components/AgentCard';
import FilterBar from '../components/FilterBar';
import { Agent, FilterState } from '../types/agent';
import { AgentRequest } from '../types/agentRequest';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CompanyBranding {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string;
}

export default function CompanyAgentLibrary() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { currentUser, userProfile } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    provider: 'all'
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [companyBranding, setCompanyBranding] = useState<CompanyBranding | null>(null);
  const [loading, setLoading] = useState(true);

  // User request management
  const [userRequests, setUserRequests] = useState<AgentRequest[]>([]);
  const [userAssignedAgents, setUserAssignedAgents] = useState<string[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    loadCompanyData();
    loadAgents();
    if (currentUser) {
      loadUserData();
    }
  }, [companySlug, currentUser]);

  const loadCompanyData = async () => {
    if (!companySlug) return;
    
    // Try to load from localStorage first (saved branding)
    const savedBranding = localStorage.getItem(`company-branding-${companySlug}`);
    if (savedBranding) {
      const company = JSON.parse(savedBranding);
      setCompanyBranding(company);
      
      // Apply company branding to CSS custom properties
      document.documentElement.style.setProperty('--company-primary', company.primaryColor);
      document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
      return;
    }
    
    // Fallback to mock companies for demo
    const mockCompanies = {
      'transparent-partners': {
        name: 'Transparent Partners',
        logo: '/transparent-partners-logo.png',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        domain: 'transparent.partners'
      },
      'test-company-inc': {
        name: 'Test Company Inc.',
        logo: '',
        primaryColor: '#10B981',
        secondaryColor: '#047857',
        domain: 'testcompany.com'
      }
    };

    const company = mockCompanies[companySlug as keyof typeof mockCompanies];
    if (company) {
      setCompanyBranding(company);
      
      // Apply company branding to CSS custom properties
      document.documentElement.style.setProperty('--company-primary', company.primaryColor);
      document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
    }
  };

  const loadAgents = async () => {
    // Mock agents data - in production, this would filter based on company permissions
    const mockAgents: Agent[] = [
      {
        id: 'briefing-agent',
        name: 'Briefing Agent',
        description: 'Transforms complex documents, presentations, and meeting notes into clear, actionable briefings.',
        provider: 'openai',
        category: 'Productivity',
        tags: ['summarization', 'writing', 'analysis'],
        route: '/agents/briefing-agent',
        metadata: {
          model: 'GPT-4',
          responseTime: '~2s',
          accuracy: '95%'
        }
      },
      {
        id: 'analytics-agent',
        name: 'Analytics Agent',
        description: 'Analyzes data patterns and generates comprehensive insights with interactive visualizations.',
        provider: 'openai',
        category: 'Analytics',
        tags: ['data-analysis', 'visualization', 'insights'],
        route: '/agents/analytics-agent',
        metadata: {
          model: 'GPT-4',
          responseTime: '~3s',
          accuracy: '92%'
        }
      },
      {
        id: 'research-agent',
        name: 'Research Agent',
        description: 'Conducts comprehensive research across multiple sources and synthesizes findings.',
        provider: 'google',
        category: 'Research',
        tags: ['research', 'analysis', 'synthesis'],
        route: '/agents/research-agent',
        metadata: {
          model: 'Gemini Pro',
          responseTime: '~4s',
          accuracy: '90%'
        }
      },
      {
        id: 'interview-agent',
        name: 'Interview Agent',
        description: 'Conducts structured interviews and generates detailed candidate assessments.',
        provider: 'anthropic',
        category: 'HR',
        tags: ['interviews', 'assessment', 'hr'],
        route: '/agents/interview-agent',
        metadata: {
          model: 'Claude 3',
          responseTime: '~2.5s',
          accuracy: '94%'
        }
      }
    ];

    setAgents(mockAgents);
    setFilteredAgents(mockAgents);
    
    // Extract unique categories and providers
    const uniqueCategories = [...new Set(mockAgents.map(agent => agent.category))];
    const uniqueProviders = [...new Set(mockAgents.map(agent => agent.provider))];
    
    setCategories(uniqueCategories);
    setProviders(uniqueProviders);
    setLoading(false);
  };

  const loadUserData = async () => {
    if (!currentUser || !userProfile) return;

    // Mock user assigned agents and requests
    const mockUserAssignedAgents = ['briefing-agent', 'analytics-agent'];
    const mockUserRequests: AgentRequest[] = [
      {
        id: 'req-1',
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: userProfile.displayName,
        agentId: 'research-agent',
        agentName: 'Research Agent',
        requestType: 'company',
        organizationId: companySlug || '',
        status: 'pending',
        requestReason: 'Need research capabilities for market analysis projects',
        requestedAt: '2024-01-20T10:30:00Z'
      }
    ];

    setUserAssignedAgents(mockUserAssignedAgents);
    setUserRequests(mockUserRequests);
  };

  const handleRequestAgent = (agent: Agent) => {
    // Check if this is a free agent that can be added directly
    const tier = agent.metadata?.tier || 'free';
    
    if (tier === 'free') {
      // Direct addition for free agents
      handleAddFreeAgent(agent);
    } else {
      // Request approval for premium agents
      setSelectedAgent(agent);
      setIsRequestModalOpen(true);
    }
  };

  const handleAddFreeAgent = (agent: Agent) => {
    // Add free agent directly to user's library
    const updatedAssignedAgents = [...userAssignedAgents, agent.id];
    setUserAssignedAgents(updatedAssignedAgents);
    
    toast.success(`${agent.name} added to your library!`);
    
    // In production, this would update the user's profile in Firestore
    console.log(`Added free agent ${agent.name} to user library`);
  };

  const submitAgentRequest = async () => {
    if (!selectedAgent || !currentUser || !userProfile || !requestReason.trim()) {
      toast.error('Please provide a reason for the request');
      return;
    }

    const newRequest: AgentRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userName: userProfile.displayName,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      requestType: 'company', // Could be 'network' if networkSlug exists
      organizationId: companySlug || '',
      status: 'pending',
      requestReason: requestReason.trim(),
      requestedAt: new Date().toISOString()
    };

    setUserRequests(prev => [...prev, newRequest]);
    toast.success(`Request submitted for ${selectedAgent.name}! Your admin will review it soon.`);
    
    setIsRequestModalOpen(false);
    setSelectedAgent(null);
    setRequestReason('');
  };

  const getAgentStatus = (agentId: string) => {
    if (userAssignedAgents.includes(agentId)) {
      return 'assigned';
    }
    
    const pendingRequest = userRequests.find(req => 
      req.agentId === agentId && req.status === 'pending'
    );
    
    if (pendingRequest) {
      return 'requested';
    }
    
    return 'available';
  };

  useEffect(() => {
    let filtered = agents;

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        agent.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(agent => agent.category === filters.category);
    }

    // Apply provider filter
    if (filters.provider !== 'all') {
      filtered = filtered.filter(agent => agent.provider === filters.provider);
    }

    setFilteredAgents(filtered);
  }, [filters, agents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!companyBranding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-soft border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h2>
          <p className="text-gray-600">The requested company page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            {companyBranding.logo ? (
              <img 
                src={companyBranding.logo} 
                alt={`${companyBranding.name} logo`}
                className="w-16 h-16 object-contain"
                style={{ 
                  maxWidth: '64px', 
                  maxHeight: '64px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: companyBranding.primaryColor }}
              >
                {companyBranding.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {companyBranding.name} Agent Library
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Powerful AI agents tailored for your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            providers={providers}
          />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: companyBranding.primaryColor }}>
                  {filteredAgents.length}
                </div>
                <div className="text-sm text-gray-600">Available Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: companyBranding.primaryColor }}>
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: companyBranding.primaryColor }}>
                  {providers.length}
                </div>
                <div className="text-sm text-gray-600">AI Providers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAgents.map((agent, index) => {
              const agentStatus = getAgentStatus(agent.id);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-medium transition-all duration-200 h-full flex flex-col">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                          style={{
                            background: `linear-gradient(to bottom right, ${companyBranding.primaryColor}, ${companyBranding.secondaryColor})`
                          }}
                        >
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 capitalize">{agent.provider}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{agent.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {agentStatus === 'assigned' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Assigned
                        </span>
                      )}
                      {agentStatus === 'requested' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Requested
                        </span>
                      )}
                    </div>

                    {/* Agent Description */}
                    <p className="text-gray-600 text-sm mb-4 flex-grow">{agent.description}</p>

                    {/* Agent Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          +{agent.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      {agentStatus === 'assigned' ? (
                        <button
                          className="w-full btn-primary"
                          onClick={() => window.open(`/my-agents/${agent.id}`, '_blank')}
                        >
                          Open Agent
                        </button>
                      ) : agentStatus === 'requested' ? (
                        <button className="w-full btn-secondary cursor-not-allowed" disabled>
                          Request Pending
                        </button>
                      ) : (
                        <button
                          className={`w-full transition-all ${
                            (agent.metadata?.tier || 'free') === 'free'
                              ? 'btn-primary'
                              : 'btn-outline hover:btn-primary'
                          }`}
                          onClick={() => handleRequestAgent(agent)}
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          {(agent.metadata?.tier || 'free') === 'free' ? 'Add Free Agent' : 'Request Premium Agent'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Company Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Need a custom agent for {companyBranding.name}?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact your administrator to request new agents or customize existing ones for your specific needs.
            </p>
            <button 
              className="px-6 py-3 text-white font-medium rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: companyBranding.primaryColor }}
            >
              Request Custom Agent
            </button>
          </div>
        </div>
      </div>

      {/* Agent Request Modal */}
      {isRequestModalOpen && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Request Access to {selectedAgent.name}
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{
                    background: `linear-gradient(to bottom right, ${companyBranding?.primaryColor}, ${companyBranding?.secondaryColor})`
                  }}
                >
                  {selectedAgent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedAgent.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{selectedAgent.description}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="requestReason" className="block text-sm font-medium text-gray-700 mb-2">
                Why do you need this agent? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="requestReason"
                rows={4}
                className="input-field resize-none"
                placeholder="Explain how you plan to use this agent and why it would be valuable for your work..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your admin will review this request and may contact you for more details.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setIsRequestModalOpen(false);
                  setSelectedAgent(null);
                  setRequestReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={submitAgentRequest}
                disabled={!requestReason.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-primary {
          background-color: ${companyBranding?.primaryColor || '#3B82F6'};
        }
        .btn-primary:hover {
          background-color: ${companyBranding?.secondaryColor || '#1E40AF'};
        }
      `}</style>
    </div>
  );
}
