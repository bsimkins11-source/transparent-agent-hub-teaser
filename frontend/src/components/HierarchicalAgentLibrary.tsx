import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  StarIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import AgentCard from './AgentCard';
import FilterBar from './FilterBar';
import { 
  LibraryType, 
  AgentWithContext, 
  LibraryStats,
  getLibraryAgents, 
  getLibraryStats, 
  canAccessLibrary,
  getLibraryInfo
} from '../services/libraryService';
import { addAgentToUserLibrary, removeAgentFromUserLibrary } from '../services/userLibraryService';
import toast from 'react-hot-toast';

interface HierarchicalAgentLibraryProps {
  initialLibrary?: LibraryType;
  showTabs?: boolean;
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

// Enhanced filter state with more options
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

// Recent searches interface
interface RecentSearch {
  query: string;
  timestamp: number;
}

export default function HierarchicalAgentLibrary({ 
  initialLibrary = 'global',
  showTabs = true 
}: HierarchicalAgentLibraryProps) {
  const { userProfile } = useAuth();
  const [currentLibrary, setCurrentLibrary] = useState<LibraryType>(initialLibrary);
  const [agents, setAgents] = useState<AgentWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [filters, setFilters] = useState<EnhancedFilters>({
    category: '',
    provider: '',
    search: '',
    tier: '',
    access: '',
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'asc'
  });
  const [confirmRemove, setConfirmRemove] = useState<{agent: AgentWithContext} | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'add' | 'remove' | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [bulkOperationProgress, setBulkOperationProgress] = useState<{
    current: number;
    total: number;
    operation: string;
    isRunning: boolean;
  } | null>(null);

  // Memoized filtered and sorted agents for performance
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           agent.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                           agent.metadata.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesTier = !filters.tier || agent.metadata.tier === filters.tier;
      const matchesProvider = !filters.provider || agent.provider === filters.provider;
      const matchesCategory = !filters.category || agent.metadata.category === filters.category;
      const matchesTags = filters.tags.length === 0 || 
                         filters.tags.some(tag => agent.metadata.tags.includes(tag));
      
      let matchesAccess = true;
      if (filters.access === 'available') {
        matchesAccess = agent.canAdd || agent.canRequest;
      } else if (filters.access === 'in-library') {
        matchesAccess = agent.inUserLibrary;
      } else if (filters.access === 'restricted') {
        matchesAccess = !agent.canAdd && !agent.canRequest;
      }
      
      return matchesSearch && matchesTier && matchesProvider && matchesCategory && matchesAccess && matchesTags;
    });

    // Sort agents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'tier':
          const tierOrder = { 'free': 1, 'premium': 2, 'enterprise': 3 };
          comparison = (tierOrder[a.metadata.tier || 'free'] || 0) - (tierOrder[b.metadata.tier || 'free'] || 0);
          break;
        case 'provider':
          comparison = a.provider.localeCompare(b.provider);
          break;
        case 'category':
          comparison = a.metadata.category.localeCompare(b.metadata.category);
          break;
        case 'relevance':
        default:
          // Relevance: in library first, then by name
          if (a.inUserLibrary !== b.inUserLibrary) {
            comparison = a.inUserLibrary ? -1 : 1;
          } else {
            comparison = a.name.localeCompare(b.name);
          }
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [agents, filters]);

  // Get unique tags from all agents for filter options
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    agents.forEach(agent => {
      agent.metadata.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [agents]);

  // Get unique categories for filter options
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    agents.forEach(agent => {
      if (agent.metadata.category) {
        categorySet.add(agent.metadata.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [agents]);

  useEffect(() => {
    loadLibraryData();
  }, [currentLibrary, userProfile]);

  const loadLibraryData = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      
      // Check if user can access this library
      if (!canAccessLibrary(currentLibrary, userProfile)) {
        // Fall back to global library
        setCurrentLibrary('global');
        return;
      }
      
      const [libraryAgents, libraryStats] = await Promise.all([
        getLibraryAgents(currentLibrary, userProfile),
        getLibraryStats(currentLibrary, userProfile)
      ]);
      
      setAgents(libraryAgents);
      setStats(libraryStats);
      
    } catch (error) {
      console.error('Failed to load library data:', error);
      toast.error('Failed to load agent library');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromLibrary = async (agent: AgentWithContext) => {
    // Show confirmation dialog
    setConfirmRemove({agent});
  };

  const confirmRemoveAgent = async () => {
    if (!confirmRemove || !userProfile?.uid) {
      return;
    }

    const { agent } = confirmRemove;

    try {
      await removeAgentFromUserLibrary(userProfile.uid, agent.id);
      
      // Refresh the library data
      await loadLibraryData();
      
      toast.success(`${agent.name} removed from your library`);
      setConfirmRemove(null);
    } catch (error) {
      console.error('Error removing agent from library:', error);
      toast.error(`Failed to remove ${agent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddToLibrary = async (agent: AgentWithContext) => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to add agents to your library');
      return;
    }

    // Check if agent requires approval
    const requiresApproval = agent.metadata?.tier === 'premium' || agent.metadata?.permissionType === 'approval';
    
    if (requiresApproval) {
      // Premium agents require approval - redirect to request access
      if (agent.canRequest) {
        toast('This is a premium agent that requires approval. Submitting request...', { icon: 'ℹ️' });
        await handleRequestAccess(agent);
      } else {
        toast.error('This premium agent is not available to your organization.');
      }
      return;
    }
    
    // For free agents, check if they can be added directly
    if (!agent.canAdd) {
      toast.error('This agent is not available to your organization.');
      return;
    }
    
    try {
      // Adding agent to library
      
      await addAgentToUserLibrary(
        userProfile.uid,
        userProfile.email,
        userProfile.displayName,
        agent.id,
        agent.name,
        userProfile.organizationId,
        userProfile.organizationName,
        userProfile.networkId || undefined,
        userProfile.networkName || undefined,
        `Added from ${currentLibrary} library`
      );
      
      toast.success(`${agent.name} added to your library!`);
      
      // Refresh library data to update UI
      loadLibraryData();
      
    } catch (error) {
      console.error('Failed to add agent to library:', error);
      console.error('Full error details:', {
        error,
        agentId: agent.id,
        userId: userProfile.uid,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast.error(`Failed to add ${agent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRequestAccess = async (agent: AgentWithContext) => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to request access');
      return;
    }

    try {
      // Import the request service
      const { createAgentRequest } = await import('../services/requestService');
      
      // Determine the appropriate approval level based on user's context
      let approvalLevel: 'network_admin' | 'company_admin' | 'super_admin' = 'company_admin';
      
      if (userProfile.networkId) {
        // User has a network, request goes to network admin first
        approvalLevel = 'network_admin';
      } else if (userProfile.organizationId && userProfile.organizationId !== 'unassigned') {
        // User has a company but no network, request goes to company admin
        approvalLevel = 'company_admin';
      } else {
        // Unassigned user, request goes to super admin
        approvalLevel = 'super_admin';
      }

      const requestId = await createAgentRequest(
        agent.id,
        agent.name,
        userProfile.uid,
        userProfile.email,
        userProfile.displayName,
        userProfile.organizationId,
        userProfile.organizationName,
        userProfile.networkId,
        userProfile.networkName,
        approvalLevel,
        'normal',
        `User requesting access to ${agent.name} from ${currentLibrary} library`,
        {
          businessJustification: `Access requested for ${agent.name} to enhance productivity`,
          expectedUsage: 'Regular use for business tasks',
          userRole: userProfile.role || 'user'
        }
      );
      
      toast.success(`Access request submitted for ${agent.name}! Your administrator will review it.`);
      
    } catch (error) {
      console.error('Failed to create access request:', error);
      toast.error('Failed to submit access request. Please try again.');
    }
  };

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedAgents.size === 0) return;

    try {
      const selectedAgentList = agents.filter(agent => selectedAgents.has(agent.id));
      setBulkOperationProgress({
        current: 0,
        total: selectedAgentList.length,
        operation: bulkAction === 'add' ? 'Adding agents to library...' : 'Removing agents from library...',
        isRunning: true
      });
      
      if (bulkAction === 'add') {
        // Add all selected agents
        for (let i = 0; i < selectedAgentList.length; i++) {
          const agent = selectedAgentList[i];
          if (agent.canAdd && !agent.inUserLibrary) {
            try {
              await handleAddToLibrary(agent);
              setBulkOperationProgress(prev => prev ? { ...prev, current: i + 1 } : null);
            } catch (error) {
              console.error(`Failed to add ${agent.name}:`, error);
              // Continue with other agents
            }
          }
        }
        toast.success(`${selectedAgents.size} agents added to your library!`);
      } else if (bulkAction === 'remove') {
        // Remove all selected agents
        for (let i = 0; i < selectedAgentList.length; i++) {
          const agent = selectedAgentList[i];
          if (agent.inUserLibrary) {
            try {
              await removeAgentFromUserLibrary(userProfile!.uid, agent.id);
              setBulkOperationProgress(prev => prev ? { ...prev, current: i + 1 } : null);
            } catch (error) {
              console.error(`Failed to remove ${agent.name}:`, error);
              // Continue with other agents
            }
          }
        }
        toast.success(`${selectedAgents.size} agents removed from your library!`);
        await loadLibraryData();
      }
      
      setSelectedAgents(new Set());
      setBulkAction(null);
    } catch (error) {
      console.error('Bulk operation failed:', error);
      toast.error('Some operations failed. Please try again.');
    } finally {
      setBulkOperationProgress(null);
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    const newSelection = new Set(selectedAgents);
    if (newSelection.has(agentId)) {
      newSelection.delete(agentId);
    } else {
      newSelection.add(agentId);
    }
    setSelectedAgents(newSelection);
  };

  const selectAllAgents = () => {
    setSelectedAgents(new Set(filteredAndSortedAgents.map(agent => agent.id)));
  };

  const clearSelection = () => {
    setSelectedAgents(new Set());
  };

  const libraryInfo = getLibraryInfo(currentLibrary, userProfile);
  
  const availableLibraries: LibraryType[] = ['global'];
  if (canAccessLibrary('company', userProfile)) availableLibraries.push('company');
  if (canAccessLibrary('network', userProfile)) availableLibraries.push('network');
  if (canAccessLibrary('personal', userProfile)) availableLibraries.push('personal');

  const getLibraryTabInfo = (libraryType: LibraryType) => {
    const info = getLibraryInfo(libraryType, userProfile);
    return {
      ...info,
      count: libraryType === currentLibrary ? agents.length : undefined
    };
  };

  const getAccessBadge = (agent: AgentWithContext) => {
    if (agent.inUserLibrary) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          In Library
        </span>
      );
    }
    
    if (agent.canAdd) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Available
        </span>
      );
    }
    
    if (agent.canRequest) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Request Access
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
        Restricted
      </span>
    );
  };

  // Save filters to localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem(`library-filters-${currentLibrary}`);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved filters:', error);
      }
    }
  }, [currentLibrary]);

  // Save filters when they change
  useEffect(() => {
    localStorage.setItem(`library-filters-${currentLibrary}`, JSON.stringify(filters));
  }, [filters, currentLibrary]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`recent-searches-${currentLibrary}`);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, [currentLibrary]);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem(`recent-searches-${currentLibrary}`, JSON.stringify(recentSearches));
  }, [recentSearches, currentLibrary]);

  // Enhanced search handling with recent searches
  const handleSearchChange = (query: string) => {
    setFilters({ ...filters, search: query });
    
    // Add to recent searches if query is meaningful
    if (query.trim().length > 2) {
      const newSearch: RecentSearch = {
        query: query.trim(),
        timestamp: Date.now()
      };
      
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.query !== query.trim());
        const updated = [newSearch, ...filtered].slice(0, 5); // Keep only 5 recent searches
        return updated;
      });
    }
  };

  const handleSearchSubmit = (query: string) => {
    setFilters({ ...filters, search: query });
    setShowSearchSuggestions(false);
  };

  const clearAllFilters = () => {
    const defaultFilters: EnhancedFilters = {
      category: '',
      provider: '',
      search: '',
      tier: '',
      access: '',
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    setSelectedAgents(new Set());
    setBulkAction(null);
    toast.success('All filters cleared');
  };

  const resetFiltersToDefault = () => {
    const savedFilters = localStorage.getItem(`library-filters-${currentLibrary}-default`);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(parsed);
        toast.success('Filters reset to default');
      } catch (error) {
        console.error('Failed to parse default filters:', error);
        clearAllFilters();
      }
    } else {
      clearAllFilters();
    }
  };

  const saveFiltersAsDefault = () => {
    localStorage.setItem(`library-filters-${currentLibrary}-default`, JSON.stringify(filters));
    toast.success('Current filters saved as default');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {libraryInfo.breadcrumb.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />}
                  <span className={`text-sm ${
                    index === libraryInfo.breadcrumb.length - 1 
                      ? 'font-medium text-gray-900' 
                      : 'text-gray-500'
                  }`}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          {/* Library Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">{libraryInfo.icon}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {libraryInfo.name}
              </h1>
            </div>
            
            {/* Current Library Indicator */}
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Currently viewing: {currentLibrary.charAt(0).toUpperCase() + currentLibrary.slice(1)} Library
              </span>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {libraryInfo.description}
            </p>
            
            {/* Enhanced Search Bar */}
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
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 hover:border-gray-400"
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
                
                {/* Keyboard Shortcut Hint */}
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                  Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to search, <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> to close
                </div>
                
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
                            onClick={() => handleSearchSubmit(search.query)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between group"
                          >
                            <span className="truncate">{search.query}</span>
                            <span className="text-xs text-gray-400 group-hover:text-gray-600">
                              {new Date(search.timestamp).toLocaleDateString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Search Suggestions */}
                    {filters.search && (
                      <div className="p-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Search Suggestions
                        </div>
                        {/* Provider suggestions */}
                        {['openai', 'google', 'anthropic'].map(provider => (
                          <button
                            key={provider}
                            onClick={() => handleSearchSubmit(provider)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            Provider: {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          </button>
                        ))}
                        {/* Tier suggestions */}
                        {['free', 'premium', 'enterprise'].map(tier => (
                          <button
                            key={tier}
                            onClick={() => handleSearchSubmit(tier)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            Tier: {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </button>
                        ))}
                        {/* Category suggestions */}
                        {availableCategories.slice(0, 5).map(category => (
                          <button
                            key={category}
                            onClick={() => handleSearchSubmit(category)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                          >
                            Category: {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Library Tabs */}
      {showTabs && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {availableLibraries.map((libraryType) => {
                const tabInfo = getLibraryTabInfo(libraryType);
                return (
                  <button
                    key={libraryType}
                    onClick={() => setCurrentLibrary(libraryType)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      currentLibrary === libraryType
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tabInfo.icon}</span>
                    <span>{tabInfo.name}</span>
                    {tabInfo.count !== undefined && (
                      <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                        {tabInfo.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters and Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4" />
                <span>{filteredAndSortedAgents.length} agents</span>
              </div>
              {stats && (
                <>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-4 h-4" />
                    <span>{stats.available} available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{stats.inUserLibrary} in library</span>
                  </div>
                </>
              )}
              {loading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filter Toggle for Mobile */}
              <div className="lg:hidden w-full">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                    showAdvancedFilters 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                >
                  <option value="">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                
                <select
                  value={filters.access}
                  onChange={(e) => setFilters({ ...filters, access: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                >
                  <option value="">All Access</option>
                  <option value="available">Available</option>
                  <option value="in-library">In My Library</option>
                  <option value="restricted">Restricted</option>
                </select>

                <select
                  value={filters.provider}
                  onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                >
                  <option value="">All Providers</option>
                  <option value="openai">OpenAI</option>
                  <option value="google">Google</option>
                  <option value="anthropic">Anthropic</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Advanced Filters Toggle - Desktop only */}
                <div className="hidden lg:block">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 ${
                      showAdvancedFilters 
                        ? 'border-blue-500 text-blue-600 bg-blue-50' 
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    <span>Advanced</span>
                  </button>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors hover:border-gray-400"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name</option>
                    <option value="tier">Tier</option>
                    <option value="provider">Provider</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <ArrowsUpDownIcon className={`w-4 h-4 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Filter Management Buttons */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Clear all filters"
                  >
                    Clear
                  </button>
                  <button
                    onClick={resetFiltersToDefault}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reset to default filters"
                  >
                    Reset
                  </button>
                  <button
                    onClick={saveFiltersAsDefault}
                    className="px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Save current filters as default"
                  >
                    Save Default
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-4">
                  {/* Tags Filter */}
                  <div>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Summary */}
          {(filters.category || filters.provider || filters.tier || filters.access || filters.tags.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Category: {filters.category}
                        <button
                          onClick={() => setFilters({ ...filters, category: '' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.provider && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Provider: {filters.provider}
                        <button
                          onClick={() => setFilters({ ...filters, provider: '' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.tier && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Tier: {filters.tier}
                        <button
                          onClick={() => setFilters({ ...filters, tier: '' })}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.access && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Access: {filters.access}
                        <button
                          onClick={() => setFilters({ ...filters, access: '' })}
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
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAgents.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-b border-blue-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-800">
                  {selectedAgents.size} agent{selectedAgents.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {bulkOperationProgress ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-blue-800">
                      {bulkOperationProgress.operation}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(bulkOperationProgress.current / bulkOperationProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-blue-800">
                        {bulkOperationProgress.current}/{bulkOperationProgress.total}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      value={bulkAction || ''}
                      onChange={(e) => setBulkAction(e.target.value as any)}
                      className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select action...</option>
                      <option value="add">Add to Library</option>
                      <option value="remove">Remove from Library</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Agent Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <AgentSkeleton key={index} index={index} />
            ))}
          </div>
        ) : filteredAndSortedAgents.length === 0 ? (
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
              onClick={() => setFilters({
                category: '',
                provider: '',
                search: '',
                tier: '',
                access: '',
                tags: [],
                sortBy: 'relevance',
                sortOrder: 'asc'
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <>
            {/* Selection Controls */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={selectAllAgents}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Select all ({filteredAndSortedAgents.length})
                </button>
                {selectedAgents.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredAndSortedAgents.length} of {agents.length} agents
              </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      checked={selectedAgents.has(agent.id)}
                      onChange={() => toggleAgentSelection(agent.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Access Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    {getAccessBadge(agent)}
                  </div>
                  
                  <AgentCard
                    agent={agent}
                    isInUserLibrary={agent.inUserLibrary}
                    showAddToLibrary={agent.canAdd && !agent.inUserLibrary || agent.inUserLibrary}
                    showRequestAccess={agent.canRequest && !agent.inUserLibrary}
                    onAddToLibrary={() => handleAddToLibrary(agent)}
                    onRequestAccess={() => handleRequestAccess(agent)}
                    onRemoveFromLibrary={() => handleRemoveFromLibrary(agent)}
                    libraryType={currentLibrary}
                  />
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 px-4 text-xs text-gray-400">
                      Debug: libraryType={currentLibrary}, canRequest={agent.canRequest}, inUserLibrary={agent.inUserLibrary}
                    </div>
                  )}
                  
                  {/* Additional context info */}
                  <div className="mt-2 px-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Available in: {agent.availableIn.join(', ')}</span>
                      {agent.grantedBy && (
                        <span>Granted by: {agent.grantedBy.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Removing Agent */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Agent</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove <strong>{confirmRemove.agent.name}</strong> from your library? 
              You'll lose access to this agent and any conversation history.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveAgent}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Agent
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
