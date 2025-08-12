import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types/agent';
import { AgentRequest } from '../types/agentRequest';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyBrandingFromRoute } from '../contexts/CompanyBrandingContext';
import toast from 'react-hot-toast';
import { addAgentToUserLibrary, removeAgentFromUserLibrary } from '../services/api';

interface CompanyBranding {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string;
}

interface EnhancedFilters {
  category: string;
  provider: string;
  search: string;
  tier: string;
  access: string;
  tags: string[];
  sortBy: 'name' | 'tier' | 'provider' | 'category' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

// Loading skeleton component for agents
const AgentSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-80 animate-pulse"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-3/4">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-16 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="mt-6 space-y-2">
      <div className="flex space-x-2">
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="mt-6">
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </motion.div>
);

export default function CompanyAgentLibrary() {
  const { companyId } = useParams<{ companyId: string }>();
  const { currentUser, userProfile } = useAuth();
  const { companyBranding, loading: brandingLoading } = useCompanyBrandingFromRoute();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [filters, setFilters] = useState<EnhancedFilters>({
    category: 'all',
    provider: 'all',
    search: '',
    tier: 'all',
    access: 'all',
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'asc'
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  // User request management
  const [userRequests, setUserRequests] = useState<AgentRequest[]>([]);
  const [userAssignedAgents, setUserAssignedAgents] = useState<string[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    loadAgents();
    if (currentUser) {
      loadUserData();
    }
  }, [companyId, currentUser]);



  const loadAgents = async () => {
    // Load company-specific agents based on companyId
    try {
      const { getLibraryAgents } = await import('../services/libraryService');
      
      // Create a modified userProfile with the correct organizationId for this company
      if (!userProfile || !companyId) {
        console.error('Missing userProfile or companyId');
        setLoading(false);
        return;
      }
      
      const modifiedUserProfile = {
        ...userProfile,
        organizationId: companyId
      };
      
      const companyAgents = await getLibraryAgents('company', modifiedUserProfile);
      console.log(`🔍 CompanyAgentLibrary: Loaded ${companyId} agents:`, companyAgents);
      
      if (companyAgents.length > 0) {
        // Convert AgentWithContext back to Agent for compatibility
        const agents = companyAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          provider: agent.provider,
          route: agent.route,
          visibility: agent.visibility,
          status: agent.status,
          metadata: agent.metadata,
          icon: agent.icon
        }));
        
        setAgents(agents);
        setFilteredAgents(agents);
        
        // Set company-specific categories and tags
        if (companyId === 'coca-cola') {
          setCategories(['Brand Marketing', 'Marketing Operations', 'Campaign Development', 'Brand Intelligence', 'Social Media', 'Consumer Intelligence', 'Event Management']);
          setProviders(['openai', 'anthropic']);
          setAvailableTags(['brand-harmony', 'messaging', 'tone', 'visual-identity', 'consistency', 'coca-cola', 'marketing-orchestration', 'multi-channel', 'customer-journey', 'campaign-coordination', 'synchronization', 'campaign-creation', 'social-media', 'promotional', 'content-generation', 'brand-analytics', 'sentiment-analysis', 'market-share', 'campaign-effectiveness', 'global-markets', 'conversation-monitoring', 'platform-management', 'engagement', 'customer-insights', 'behavior-analysis', 'consumer-preferences', 'trends', 'purchasing-patterns', 'event-planning', 'product-launches', 'promotional-activities', 'coordination', 'brand-events']);
        } else {
          // Transparent Partners or other companies
          setCategories(['AI Development', 'Agent Management', 'Security & Compliance', 'Performance Monitoring', 'Data Management', 'Integration Services']);
          setProviders(['google', 'openai', 'anthropic']);
          setAvailableTags(['ai-development', 'agent-management', 'security', 'compliance', 'performance', 'monitoring', 'data-management', 'integration', 'transparent-partners', 'enterprise', 'scalability', 'reliability']);
        }
        
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error(`Error loading ${companyId} agents:`, error);
    }
    
    // Fallback to company-specific mock agents if libraryService fails
    let mockAgents: Agent[];
    
    if (companyId === 'coca-cola') {
      mockAgents = [
        {
          id: 'project-harmony',
          name: 'Project Harmony',
          description: 'Coca-Cola\'s AI-powered brand harmony agent that ensures consistent messaging, tone, and visual identity across all marketing campaigns and touchpoints.',
          provider: 'openai',
          route: '/agents/project-harmony',
          visibility: 'company',
          status: 'approved',
          metadata: {
            tags: ['brand-harmony', 'messaging', 'tone', 'visual-identity', 'consistency', 'coca-cola'],
            category: 'Brand Marketing',
            tier: 'premium',
            permissionType: 'approval'
          }
        },
        {
          id: 'project-symphony',
          name: 'Project Symphony',
          description: 'Coca-Cola\'s AI marketing orchestration agent that coordinates multi-channel campaigns, synchronizes messaging, and optimizes customer journey touchpoints.',
          provider: 'anthropic',
          route: '/agents/project-symphony',
          visibility: 'company',
          status: 'approved',
          metadata: {
            tags: ['marketing-orchestration', 'multi-channel', 'customer-journey', 'campaign-coordination', 'synchronization', 'coca-cola'],
            category: 'Marketing Operations',
            tier: 'premium',
            permissionType: 'approval'
          }
        }
      ];
    } else {
      // Transparent Partners agents
      mockAgents = [
        {
          id: 'ai-hub-manager',
          name: 'AI Hub Manager',
          description: 'Transparent Partners\' AI hub management agent that orchestrates and coordinates all AI agents across the platform.',
          provider: 'google',
          route: '/agents/ai-hub-manager',
          visibility: 'company',
          status: 'approved',
          metadata: {
            tags: ['ai-development', 'agent-management', 'orchestration', 'transparent-partners'],
            category: 'AI Development',
            tier: 'premium',
            permissionType: 'approval'
          }
        },
        {
          id: 'security-compliance',
          name: 'Security & Compliance',
          description: 'Transparent Partners\' security and compliance agent that ensures all AI operations meet enterprise security standards.',
          provider: 'openai',
          route: '/agents/security-compliance',
          visibility: 'company',
          status: 'approved',
          metadata: {
            tags: ['security', 'compliance', 'enterprise', 'transparent-partners'],
            category: 'Security & Compliance',
            tier: 'premium',
            permissionType: 'approval'
          }
        }
      ];
    }
     
    setAgents(mockAgents);
    setFilteredAgents(mockAgents);
    
    // Set categories and tags based on company
    if (companyId === 'coca-cola') {
      setCategories(['Brand Marketing', 'Marketing Operations', 'Campaign Development', 'Brand Intelligence', 'Social Media', 'Consumer Intelligence', 'Event Management']);
      setProviders(['openai', 'anthropic']);
      setAvailableTags(['brand-harmony', 'messaging', 'tone', 'visual-identity', 'consistency', 'coca-cola', 'marketing-orchestration', 'multi-channel', 'customer-journey', 'campaign-coordination', 'synchronization', 'campaign-creation', 'social-media', 'promotional', 'content-generation', 'brand-analytics', 'sentiment-analysis', 'market-share', 'campaign-effectiveness', 'global-markets', 'conversation-monitoring', 'platform-management', 'engagement', 'customer-insights', 'behavior-analysis', 'consumer-preferences', 'trends', 'purchasing-patterns', 'event-planning', 'product-launches', 'promotional-activities', 'coordination', 'brand-events']);
    } else {
      setCategories(['AI Development', 'Agent Management', 'Security & Compliance', 'Performance Monitoring', 'Data Management', 'Integration Services']);
      setProviders(['google', 'openai', 'anthropic']);
      setAvailableTags(['ai-development', 'agent-management', 'security', 'compliance', 'performance', 'monitoring', 'data-management', 'integration', 'transparent-partners', 'enterprise', 'scalability', 'reliability']);
    }
    
    setLoading(false);
  };

  const loadUserData = async () => {
    // Mock user data
    const mockUserRequests: AgentRequest[] = [];
    const mockAssignedAgents: string[] = []; // No agents assigned initially
    setUserRequests(mockUserRequests);
    setUserAssignedAgents(mockAssignedAgents);
  };

  const handleRequestAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsRequestModalOpen(true);
  };

  const handleAddFreeAgent = async (agent: Agent) => {
    try {
      await addAgentToUserLibrary(agent.id, `Added from Company Library - ${agent.name}`);
      toast.success(`Added ${agent.name} to your library!`);
      setUserAssignedAgents([...userAssignedAgents, agent.id]);
    } catch (error) {
      console.error('Error adding agent to library:', error);
      toast.error(`Failed to add ${agent.name} to your library`);
    }
  };

  const handleRemoveFromLibrary = async (agent: Agent) => {
    // Show confirmation prompt
    const isConfirmed = window.confirm(
      `You are about to remove ${agent.name} from your library. Are you sure you want to continue?`
    );
    
    if (!isConfirmed) {
      return; // User cancelled
    }
    
    try {
      await removeAgentFromUserLibrary(agent.id);
      toast.success(`Removed ${agent.name} from your library`);
      setUserAssignedAgents(userAssignedAgents.filter(id => id !== agent.id));
    } catch (error) {
      console.error('Error removing agent from library:', error);
      toast.error(`Failed to remove ${agent.name} from your library`);
    }
  };

  const submitAgentRequest = async () => {
    if (!requestReason.trim()) {
      toast.error('Please provide a reason for your request');
      return;
    }
    if (!selectedAgent) return;
    
          const newRequest: AgentRequest = {
        id: `req-${Date.now()}`,
        userId: currentUser?.uid || 'user-1',
        userEmail: currentUser?.email || 'user@company.com',
        userName: userProfile?.displayName || 'User',
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        requestType: 'company',
        organizationId: companyId || '',
        networkId: 'company-wide',
        status: 'pending',
        requestReason: requestReason,
        requestedAt: new Date().toISOString()
      };
    
    setUserRequests([...userRequests, newRequest]);
    setRequestReason('');
    setSelectedAgent(null);
    setIsRequestModalOpen(false);
    toast.success(`Request submitted for ${selectedAgent.name}`);
  };

  const getAgentStatus = (agentId: string) => {
    if (userAssignedAgents.includes(agentId)) {
      return 'assigned';
    }
    const request = userRequests.find(req => req.agentId === agentId);
    if (request) {
      return request.status;
    }
    return 'available';
  };

  const handleSearchChange = (query: string) => {
    setFilters({ ...filters, search: query });
    if (query.trim()) {
      const filtered = agents.filter(agent => 
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.description.toLowerCase().includes(query.toLowerCase()) ||
        agent.metadata?.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      const newSearch: RecentSearch = {
        query: query.trim(),
        timestamp: Date.now()
      };
      setRecentSearches(prev => [newSearch, ...prev.filter(s => s.query !== query.trim())].slice(0, 5));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      provider: 'all',
      search: '',
      tier: 'all',
      access: 'all',
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'asc'
    });
    setFilteredAgents(agents);
  };

  const resetFiltersToDefault = () => {
    setFilters({
      category: 'all',
      provider: 'all',
      search: '',
      tier: 'all',
      access: 'all',
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'asc'
    });
    setFilteredAgents(agents);
  };

  if (loading || brandingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pl-8 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <AgentSkeleton key={index} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30 pt-0" style={{
      '--company-primary': '#E61A27',
      '--company-secondary': '#D4141A'
    } as React.CSSProperties}>
      {/* Section 1: Company Header with Logo - White Background, Above Everything */}
      <div className="bg-white border-b border-gray-200 relative z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Company Logo and Brand */}
            <div className="flex items-center space-x-6">
              {companyBranding?.logo && (
                companyBranding.logo.startsWith('/') ? (
                  <img 
                    src={companyBranding.logo} 
                    alt={`${companyBranding.name} Logo`}
                    className="h-16 w-auto"
                  />
                ) : (
                  <div className="text-6xl">
                    {companyBranding.logo}
                  </div>
                )
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {companyBranding?.name || 'Company'} Agent Library
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {companyBranding?.domain ? `${companyBranding.domain} • ` : ''}AI Agents for Business Success
                </p>
              </div>
            </div>
            
            {/* Breadcrumb Navigation */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li className="flex items-center">
                  <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                </li>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                <span className="text-sm font-medium text-gray-900">
                  {companyBranding?.name || 'Company'} Agent Library
                </span>
              </ol>
            </nav>
          </div>
        </div>
      </div>



      {/* Section 3: Company Branded Content Box - Dynamic based on company */}
      <div 
        className="text-white py-5 relative z-10 mt-16"
        style={{
          background: companyBranding ? 
            `linear-gradient(to right, ${companyBranding.primaryColor}, ${companyBranding.secondaryColor})` :
            'linear-gradient(to right, #6B7280, #4B5563)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            
          {/* Search Bar - Integrated in same blue box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name, description, capabilities, or tags..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 100)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(filters.search);
                  } else if (e.key === 'Escape') {
                    setSearchFocused(false);
                  }
                }}
                className="w-full pl-12 pr-4 py-4 border-0 rounded-xl focus:outline-none focus:ring-2 text-lg transition-all duration-200 bg-white/95 hover:bg-white focus:bg-white shadow-lg"
                style={{
                  '--tw-ring-color': companyId === 'coca-cola' ? '#E61A27' : '#8B5CF6'
                } as React.CSSProperties}
                aria-label="Search agents"
                role="searchbox"
              />
              {filters.search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
              

              
              {/* Search Suggestions Dropdown */}
              {searchFocused && (filters.search || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Recent Searches
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchChange(search.query)}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                        >
                          {search.query}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Search Suggestions */}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER BAR - Company Branded Design */}
      <div 
        className="border-b"
        style={{
          backgroundColor: companyBranding ? `${companyBranding.primaryColor}10` : '#F3F4F6',
          borderColor: companyBranding ? `${companyBranding.primaryColor}30` : '#D1D5DB'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Stats */}
            <div 
              className="flex items-center space-x-6 text-sm"
              style={{
                color: companyBranding ? companyBranding.primaryColor : '#6B7280'
              }}
            >
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4" />
                <span>{filteredAgents.length} agents</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4" />
                <span>{agents.filter(a => getAgentStatus(a.id) === 'available').length} available</span>
              </div>
            </div>
                      
            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filter Toggle for Mobile */}
              <div className="lg:hidden w-full">
                              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full px-3 py-2 border-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center space-x-2 bg-white/80 hover:bg-white"
                style={{
                  borderColor: companyBranding ? companyBranding.primaryColor : '#6B7280',
                  color: companyBranding ? companyBranding.primaryColor : '#6B7280',
                  '--tw-border-opacity': '1'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = companyBranding ? companyBranding.secondaryColor : '#4B5563';
                  e.currentTarget.style.color = companyBranding ? companyBranding.secondaryColor : '#4B5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = companyBranding ? companyBranding.primaryColor : '#6B7280';
                  e.currentTarget.style.color = companyBranding ? companyBranding.primaryColor : '#6B7280';
                }}
              >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  <span>{showAdvancedFilters ? 'Hide' : 'Show'} Filters</span>
                        </button>
            </div>

              {/* Basic Filters - Hidden on mobile when advanced is closed */}
              <div className={`${showAdvancedFilters ? 'flex' : 'hidden lg:flex'} flex-wrap items-center gap-3 w-full lg:w-auto`}>
                <select
                  value={filters.tier}
                  onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400"
                  style={{
                    '--tw-ring-color': companyBranding ? companyBranding.primaryColor : '#6B7280'
                  } as React.CSSProperties}
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                
                <select
                  value={filters.access}
                  onChange={(e) => setFilters({ ...filters, access: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400"
                  style={{
                    '--tw-ring-color': companyBranding ? companyBranding.primaryColor : '#6B7280'
                  } as React.CSSProperties}
                >
                  <option value="all">All Access</option>
                  <option value="direct">Direct Access</option>
                  <option value="approval">Approval Required</option>
                </select>

                <select
                  value={filters.provider}
                  onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 text-sm transition-colors hover:border-gray-400"
                  style={{
                    '--tw-ring-color': companyBranding ? companyBranding.primaryColor : '#6B7280'
                  } as React.CSSProperties}
                >
                  <option value="all">All Providers</option>
                  <option value="openai">OpenAI</option>
                  <option value="google">Google</option>
                  <option value="anthropic">Anthropic</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400"
                  style={{
                    '--tw-ring-color': companyBranding ? companyBranding.primaryColor : '#6B7280'
                  } as React.CSSProperties}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E61A27]"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="name">Sort by Name</option>
                <option value="tier">Sort by Tier</option>
                <option value="provider">Sort by Provider</option>
                <option value="category">Sort by Category</option>
              </select>
              <button
                onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
              </button>
            </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFiltersToDefault}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  {(filters.category !== 'all' || filters.provider !== 'all' || filters.tier !== 'all' || filters.access !== 'all' || filters.tags.length > 0) && (
                    <button
                      onClick={clearAllFilters}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
          </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters - Tags */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-gray-200"
              >
                {/* Tags Filter */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter(t => t !== tag)
                            : [...filters.tags, tag];
                          setFilters({ ...filters, tags: newTags });
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                          filters.tags.includes(tag)
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Active Filters Summary */}
          {(filters.category !== 'all' || filters.provider !== 'all' || filters.tier !== 'all' || filters.access !== 'all' || filters.tags.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.category !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Category: {filters.category}
                        <button
                          onClick={() => setFilters({ ...filters, category: 'all' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.provider !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Provider: {filters.provider}
                        <button
                          onClick={() => setFilters({ ...filters, provider: 'all' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.tier !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Tier: {filters.tier}
                        <button
                          onClick={() => setFilters({ ...filters, tier: 'all' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.access !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Access: {filters.access}
                        <button
                          onClick={() => setFilters({ ...filters, access: 'all' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Tag: {tag}
                        <button
                          onClick={() => setFilters({ ...filters, tags: filters.tags.filter(t => t !== tag) })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. AGENT CARDS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏢</span>
                <h2 className="text-xl font-semibold text-gray-900">{companyBranding?.name || 'Company'} Agent Library</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {filteredAgents.length} agents
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>{agents.filter(a => getAgentStatus(a.id) === 'available').length} available</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>{userAssignedAgents.length} in your library</span>
                </span>
              </div>
            </div>
          </div>

      {/* Agent Grid */}
          <div className="p-6">
        {filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No agents found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse a different library.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Access Badge */}
                    <div className="flex justify-end mb-2">
                    {getAgentStatus(agent.id) === 'assigned' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                          In Library
                      </span>
                    ) : getAgentStatus(agent.id) === 'pending' ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Available
                      </span>
                    )}
                  </div>

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">
                            {agent.provider === 'google' ? '🔍' : 
                             agent.provider === 'openai' ? '🚀' : 
                             agent.provider === 'anthropic' ? '🧠' : '⚡'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                        {agent.provider}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        agent.metadata?.tier === 'free' ? 'bg-green-100 text-green-800' :
                        agent.metadata?.tier === 'premium' ? 
                          (companyId === 'coca-cola' ? 'bg-red-100 text-[#E61A27]' : 'bg-blue-100 text-[#2563EB]') :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {agent.metadata?.tier || 'free'}
                      </span>
                      <span 
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: companyId === 'coca-cola' ? '#FEF2F2' : '#EFF6FF',
                          color: companyId === 'coca-cola' ? '#E61A27' : '#2563EB'
                        }}
                      >
                        {agent.metadata?.category || 'general'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {agent.description}
                    </p>
                    
                    <div className="flex justify-end">
                      {getAgentStatus(agent.id) === 'assigned' ? (
                        <button 
                          onClick={() => handleRemoveFromLibrary(agent)}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors font-medium"
                        >
                          Remove
                        </button>
                      ) : agent.metadata?.tier === 'free' ? (
                        <button 
                          onClick={() => handleAddFreeAgent(agent)}
                          className="px-4 py-2 text-white text-sm rounded-md transition-colors font-medium"
                          style={{
                            backgroundColor: companyId === 'coca-cola' ? '#E61A27' : '#2563EB',
                            '--tw-bg-opacity': '1'
                          } as React.CSSProperties}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = companyId === 'coca-cola' ? '#D4141A' : '#1D4ED8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = companyId === 'coca-cola' ? '#E61A27' : '#2563EB';
                          }}
                        >
                          Add to my library
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRequestAgent(agent)}
                          className="px-4 py-2 text-white text-sm rounded-md transition-colors font-medium"
                          style={{
                            backgroundColor: companyId === 'coca-cola' ? '#E61A27' : '#2563EB',
                            '--tw-bg-opacity': '1'
                          } as React.CSSProperties}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = companyId === 'coca-cola' ? '#D4141A' : '#1D4ED8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = companyId === 'coca-cola' ? '#E61A27' : '#2563EB';
                          }}
                        >
                          Request Access
                        </button>
                      )}
                    </div>
                </motion.div>
              ))}
            </div>
        )}
      </div>
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: companyId === 'coca-cola' ? '#FEF2F2' : '#EFF6FF'
                }}
              >
                <PlusIcon 
                  className="w-6 h-6" 
                  style={{
                    color: companyId === 'coca-cola' ? '#E61A27' : '#2563EB'
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Request Agent Access</h3>
                <p className="text-sm text-gray-600">Submit a request for {selectedAgent.name}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Request
              </label>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Please explain why you need access to this agent..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    '--tw-ring-color': companyBranding ? companyBranding.primaryColor : '#6B7280'
                  } as React.CSSProperties}
                rows={4}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAgentRequest}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                style={{
                  backgroundColor: companyId === 'coca-cola' ? '#E61A27' : '#2563EB'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = companyId === 'coca-cola' ? '#D4141A' : '#1D4ED8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = companyId === 'coca-cola' ? '#E61A27' : '#2563EB';
                }}
              >
                Submit Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
