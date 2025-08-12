import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
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
import LibrarySidebar from './LibrarySidebar';
import { 
  LibraryType, 
  AgentWithContext, 
  LibraryStats,
  getLibraryAgents, 
  getLibraryStats, 
  canAccessLibrary,
  getLibraryInfo,
  addAgentToLocalLibrary
} from '../services/libraryService';
import { removeAgentFromUserLibrary } from '../services/api';
import toast from 'react-hot-toast';

// Error boundary component for individual agent cards
const AgentCardWithErrorBoundary = ({ agent, ...props }: any) => {
  try {
    // Validate agent data before rendering
    if (!agent || !agent.id || !agent.name) {
      console.error('Invalid agent data:', agent);
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Invalid agent data</p>
        </div>
      );
    }
    
    return <AgentCard agent={agent} {...props} />;
  } catch (error) {
    console.error('Error rendering agent card:', error, agent);
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Error rendering agent</p>
        <p className="text-red-600 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

interface HierarchicalAgentLibraryProps {
  initialLibrary?: LibraryType;
  showTabs?: boolean;
  companyBranding?: {
    id: string;
    name: string;
    domain: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    status: 'active' | 'suspended';
  } | null;
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
  showTabs = true,
  companyBranding = null
}: HierarchicalAgentLibraryProps) {
  // State for agent interface
  const [openAgent, setOpenAgent] = useState<AgentWithContext | null>(null);
  const [agentMessages, setAgentMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [agentInput, setAgentInput] = useState('');
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const { userProfile, loading: authLoading } = useAuth();
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

  const navigate = useNavigate();
  
  // Force global library access when needed
  const [forceGlobalAccess, setForceGlobalAccess] = useState(false);

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
    console.log('🔄 Library changed, loading data for:', currentLibrary);
    // Only load library data when auth is not loading and user profile is available
    if (!authLoading && userProfile) {
      loadLibraryData();
    }
  }, [currentLibrary, userProfile, authLoading]);

  // Debug useEffect to monitor currentLibrary changes
  useEffect(() => {
    console.log('🎯 currentLibrary state changed to:', currentLibrary);
    console.log('🎯 This should trigger loadLibraryData for:', currentLibrary);
    console.log('🎯 Stack trace:', new Error().stack);
  }, [currentLibrary]);



  const loadLibraryData = async (forceRefresh = false) => {
    if (!userProfile) {
      // This should not happen since we check userProfile before calling this function
      console.warn('loadLibraryData called without userProfile - this should not happen');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Starting to load library data for:', currentLibrary);
      console.log('👤 User profile:', { uid: userProfile.uid, email: userProfile.email });
      console.log('🔍 Library type being loaded:', currentLibrary);
      console.log('🔍 Force refresh:', forceRefresh);
      
      // Check if user can access this library
      const canAccess = canAccessLibrary(currentLibrary, userProfile);
      console.log('🔍 Can access library check result:', canAccess);
      console.log('🔍 Library type:', currentLibrary);
      console.log('🔍 User organization ID:', userProfile.organizationId);
      console.log('🔍 User network ID:', userProfile.networkId);
      
      if (!canAccess) {
        console.log('❌ User cannot access library:', currentLibrary, 'falling back to global');
        // Fall back to global library
        setCurrentLibrary('global');
        return;
      }
      
      // Force refresh by adding a timestamp to bypass cache
      const timestamp = forceRefresh ? Date.now() : 0;
      
      console.log('📡 Fetching library agents and stats...');
      console.log('🔍 Calling getLibraryAgents with:', { libraryType: currentLibrary, userId: userProfile.uid });
      
      const [libraryAgents, libraryStats] = await Promise.all([
        getLibraryAgents(currentLibrary, userProfile),
        getLibraryStats(currentLibrary, userProfile)
      ]);
      
      console.log('✅ Library data fetched successfully:', {
        libraryType: currentLibrary,
        userId: userProfile.uid,
        totalAgents: libraryAgents.length,
        agentsInUserLibrary: libraryAgents.filter(a => a.inUserLibrary).length,
        geminiAgent: libraryAgents.find(a => a.name.includes('Gemini')),
        timestamp,
        rawAgents: libraryAgents
      });

      // Validate agent data before setting state
      const validAgents = libraryAgents.filter(agent => {
        if (!agent || !agent.id || !agent.name) {
          console.error('❌ Invalid agent data found:', agent);
          return false;
        }
        return true;
      });

      if (validAgents.length !== libraryAgents.length) {
        console.warn(`⚠️ Filtered out ${libraryAgents.length - validAgents.length} invalid agents`);
      }

              // Special debugging for Gemini agent issue
        if (forceRefresh) {
          console.log('🔍 Force refresh triggered - checking Gemini agent status...');
          // Firebase debugging removed - using local services
        }
      
      console.log('🎯 Setting agents state with', validAgents.length, 'valid agents');
      setAgents(validAgents);
      setStats(libraryStats);
      
    } catch (error) {
      console.error('❌ Failed to load library data:', error);
      console.error('❌ Error details:', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        currentLibrary,
        userId: userProfile?.uid
      });
      toast.error('Failed to load agent library');
      // Set empty arrays to prevent blank screen
      setAgents([]);
      setStats(null);
    } finally {
      setLoading(false);
      console.log('🏁 Library data loading completed');
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
      // REMOVED FIREBASE - use local library functions
      const { removeAgentFromLocalLibrary } = await import('../services/libraryService');
      
      const success = await removeAgentFromLocalLibrary(userProfile.uid, agent.id);
      
      if (success) {
        toast.success(`${agent.name} removed from your library`);
        
        // Refresh library data
        await loadLibraryData(true);
        
        // Update UI state
        setAgents(prevAgents => 
          prevAgents.map(a => 
            a.id === agent.id 
              ? { ...a, inUserLibrary: false, canAdd: true }
              : a
          )
        );
      } else {
        toast.error(`Failed to remove ${agent.name} from library`);
      }
      
    } catch (error) {
      console.error('Failed to remove agent from library:', error);
      toast.error('Failed to remove agent from library');
    } finally {
      setConfirmRemove(null);
    }
  };

  const handleAddToLibrary = async (agent: AgentWithContext) => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to add agents to your library');
      return;
    }

    console.log('🔄 Starting agent assignment process:', {
      agentId: agent.id,
      agentName: agent.name,
      userId: userProfile.uid,
      userEmail: userProfile.email,
      organizationId: userProfile.organizationId,
      networkId: userProfile.networkId
    });

    try {
      console.log('✅ Agent can be added, proceeding with assignment...');
      
      // REMOVED FIREBASE - use local library functions
      const { addAgentToLocalLibrary } = await import('../services/libraryService');
      
      // Adding agent to local library
      const success = await addAgentToLocalLibrary(userProfile.uid, agent.id);
      
      if (success) {
        console.log('✅ Agent successfully added to local library');
        toast.success(`${agent.name} added to your library!`);
        
        // Refresh library data to update UI
        console.log('🔄 Refreshing library data...');
        await loadLibraryData(true);
        
        // Also refresh the current agent's state immediately for better UX
        setAgents(prevAgents => 
          prevAgents.map(a => 
            a.id === agent.id 
              ? { ...a, inUserLibrary: true, canAdd: false }
              : a
          )
        );
        
        console.log('✅ UI state updated successfully');
      } else {
        toast.error(`Failed to add ${agent.name} to library`);
      }
      
    } catch (error) {
      console.error('❌ Failed to add agent to library:', error);
      console.error('Full error details:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        agentId: agent.id,
        agentName: agent.name,
        userId: userProfile.uid,
        userEmail: userProfile.email,
        organizationId: userProfile.organizationId,
        networkId: userProfile.networkId
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
              await removeAgentFromUserLibrary(agent.id);
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
  
  // Ensure global library is always available
  const availableLibraries: LibraryType[] = ['global'];
  console.log('🔍 Building availableLibraries array...');
  console.log('🔍 Starting with global:', availableLibraries);
  
  if (canAccessLibrary('company', userProfile)) {
    availableLibraries.push('company');
    console.log('🔍 Added company library');
  }
  if (canAccessLibrary('network', userProfile)) {
    availableLibraries.push('network');
    console.log('🔍 Added network library');
  }
  if (canAccessLibrary('personal', userProfile)) {
    availableLibraries.push('personal');
    console.log('🔍 Added personal library');
  }
  
  console.log('🔍 Final availableLibraries array:', availableLibraries);
  console.log('🔍 Global library included:', availableLibraries.includes('global'));
  console.log('🔍 Global library index:', availableLibraries.indexOf('global'));
  
  // Fallback: if for some reason global is not in the array, add it
  if (!availableLibraries.includes('global')) {
    console.warn('⚠️ Global library not in availableLibraries, adding it back');
    availableLibraries.unshift('global');
  }
  
  // Function to force switch to global library
  const forceSwitchToGlobal = () => {
    console.log('🔄 Force switching to global library');
    setCurrentLibrary('global');
    setForceGlobalAccess(true);
  };
  
  // Debug logging for library access
  console.log('🔍 Library access check:', {
    global: canAccessLibrary('global', userProfile),
    company: canAccessLibrary('company', userProfile),
    network: canAccessLibrary('network', userProfile),
    personal: canAccessLibrary('personal', userProfile),
    availableLibraries,
    userProfile: {
      uid: userProfile?.uid,
      organizationId: userProfile?.organizationId,
      networkId: userProfile?.networkId
    }
  });

  const getLibraryTabInfo = (libraryType: LibraryType) => {
    const info = getLibraryInfo(libraryType, userProfile);
    return {
      ...info,
      count: libraryType === currentLibrary ? agents.length : undefined
    };
  };

  const getAccessBadge = (agent: AgentWithContext) => {
    if (agent.inUserLibrary && currentLibrary !== 'personal') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          In Your Library
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

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pl-8 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // For non-authenticated users, show read-only mode
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pl-8 pt-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pl-8">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">Global Library</span>
                </li>
              </ol>
            </nav>

            {/* Library Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🌍</span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Global Agent Library
                </h1>
              </div>
              
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Read-Only Mode
                </span>
              </div>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                Browse our collection of AI agents. Sign in to add agents to your library and access full functionality.
              </p>
              
              {/* Sign In Prompt */}
              <div className="mb-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Sign In to Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Read-Only Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Show limited agent information for non-authenticated users */}
            {agents.slice(0, 12).map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-3/4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.provider}</p>
                  </div>
                  <div className="w-16 h-6 bg-gray-100 rounded text-xs text-gray-600 flex items-center justify-center">
                    {agent.metadata?.tier || 'N/A'}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{agent.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.metadata?.tags?.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500">Sign in to access full functionality</span>
                </div>
              </div>
            ))}
          </div>
          
          {agents.length > 12 && (
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Showing 12 of {agents.length} agents. Sign in to see all agents and access full functionality.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Sign In to See More
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-8 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pl-8">
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
                  className={`w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 text-lg transition-all duration-200 hover:border-gray-400 ${
                    companyBranding && currentLibrary === 'company'
                      ? 'focus:ring-2 focus:ring-opacity-50 focus:border-opacity-50'
                      : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  style={companyBranding && currentLibrary === 'company' ? {
                    '--tw-ring-color': companyBranding.primaryColor,
                    '--tw-border-color': companyBranding.primaryColor
                  } as React.CSSProperties : {}}
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

      {/* Library Sidebar - REMOVED TO FIX TAB CONFLICTS */}
      {/* <LibrarySidebar 
        currentLibrary={currentLibrary === 'personal' ? 'personal' : currentLibrary === 'global' ? 'global' : 'company'}
        companySlug={userProfile?.organizationId}
        networkSlug={userProfile?.networkId}
      /> */}

      {/* BRAND NEW NAVIGATION - COMPLETELY DIFFERENT STRUCTURE */}
      {showTabs && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-8">
            <div className="flex items-center space-x-8 overflow-x-auto py-4">
              {/* Global Tab - NEW STRUCTURE */}
              <button
                onClick={() => {
                  console.log('🌐 Global tab clicked - NEW STRUCTURE');
                  console.log('🔍 Current library before:', currentLibrary);
                  console.log('🔍 User profile:', userProfile);
                  console.log('🔍 Can access global library:', canAccessLibrary('global', userProfile));
                  setCurrentLibrary('global');
                  console.log('🔍 setCurrentLibrary called');
                  // Force immediate check
                  setTimeout(() => {
                    console.log('🔍 Current library after 100ms:', currentLibrary);
                  }, 100);
                }}
                className={`flex items-center space-x-2 px-2 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  currentLibrary === 'global'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>🌐</span>
                <span>Global Library</span>
              </button>

              {/* Company Tab - NEW STRUCTURE */}
              <button
                onClick={() => {
                  console.log('🏢 Company tab clicked - NEW STRUCTURE');
                  console.log('🔍 Current library before:', currentLibrary);
                  console.log('🔍 User profile:', userProfile);
                  console.log('🔍 Can access company library:', canAccessLibrary('company', userProfile));
                  setCurrentLibrary('company');
                  console.log('🔍 setCurrentLibrary called');
                  // Force immediate check
                  setTimeout(() => {
                    console.log('🔍 Current library after 100ms:', currentLibrary);
                  }, 100);
                }}
                className={`flex items-center space-x-2 px-2 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  currentLibrary === 'company'
                    ? companyBranding 
                      ? 'text-white'
                      : 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={currentLibrary === 'company' && companyBranding ? {
                  borderColor: companyBranding.primaryColor,
                  color: companyBranding.primaryColor
                } : {}}
              >
                <span>🏢</span>
                <span>Transparent Partners</span>
              </button>

              {/* Personal Tab - NEW STRUCTURE */}
              <button
                onClick={() => {
                  console.log('👤 Personal tab clicked - NEW STRUCTURE');
                  console.log('🔍 Current library before:', currentLibrary);
                  console.log('🔍 User profile:', userProfile);
                  console.log('🔍 Can access personal library:', canAccessLibrary('personal', userProfile));
                  setCurrentLibrary('personal');
                  console.log('🔍 setCurrentLibrary called');
                  // Force immediate check
                  setTimeout(() => {
                    console.log('🔍 Current library after 100ms:', currentLibrary);
                  }, 100);
                }}
                className={`flex items-center space-x-2 px-2 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  currentLibrary === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>👤</span>
                <span>My Library</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Enhanced Filters and Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pl-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4" />
                <span>{filteredAndSortedAgents.length} agents</span>
              </div>
              {stats && (
                <>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-4 h-4" />
                    <span>{stats.available} available</span>
                  </div>
                  {currentLibrary !== 'personal' && (
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{stats.inUserLibrary} in your library</span>
                    </div>
                  )}
                </>
              )}
              {loading && (
                <div className={`flex items-center space-x-2 ${
                  companyBranding && currentLibrary === 'company'
                    ? 'text-white'
                    : 'text-blue-600'
                }`}>
                  <div 
                    className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                      companyBranding && currentLibrary === 'company'
                        ? 'border-white border-opacity-30'
                        : 'border-blue-600'
                    }`}
                  ></div>
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
                      ? companyBranding && currentLibrary === 'company'
                        ? 'text-white'
                        : 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                  style={showAdvancedFilters && companyBranding && currentLibrary === 'company' ? {
                    borderColor: companyBranding.primaryColor,
                    backgroundColor: companyBranding.primaryColor
                  } : {}}
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
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400 ${
                    companyBranding && currentLibrary === 'company'
                      ? 'focus:ring-opacity-50'
                      : 'focus:ring-blue-500'
                  }`}
                  style={companyBranding && currentLibrary === 'company' ? {
                    '--tw-ring-color': companyBranding.primaryColor
                  } as React.CSSProperties : {}}
                >
                  <option value="">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                
                <select
                  value={filters.access}
                  onChange={(e) => setFilters({ ...filters, access: e.target.value })}
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400 ${
                    companyBranding && currentLibrary === 'company'
                      ? 'focus:ring-opacity-50'
                      : 'focus:ring-blue-500'
                  }`}
                  style={companyBranding && currentLibrary === 'company' ? {
                    '--tw-ring-color': companyBranding.primaryColor
                  } as React.CSSProperties : {}}
                >
                  <option value="">All Access</option>
                  <option value="available">Available</option>
                  {currentLibrary !== 'personal' && (
                    <option value="in-library">In Your Library</option>
                  )}
                  <option value="restricted">Restricted</option>
                </select>

                <select
                  value={filters.provider}
                  onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400 ${
                    companyBranding && currentLibrary === 'company'
                      ? 'focus:ring-opacity-50'
                      : 'focus:ring-blue-500'
                  }`}
                  style={companyBranding && currentLibrary === 'company' ? {
                    '--tw-ring-color': companyBranding.primaryColor
                  } as React.CSSProperties : {}}
                >
                  <option value="">All Providers</option>
                  <option value="openai">OpenAI</option>
                  <option value="google">Google</option>
                  <option value="anthropic">Anthropic</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400 ${
                    companyBranding && currentLibrary === 'company'
                      ? 'focus:ring-opacity-50'
                      : 'focus:ring-blue-500'
                  }`}
                  style={companyBranding && currentLibrary === 'company' ? {
                    '--tw-ring-color': companyBranding.primaryColor
                  } as React.CSSProperties : {}}
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
                        ? companyBranding && currentLibrary === 'company'
                          ? 'text-white'
                          : 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                    style={showAdvancedFilters && companyBranding && currentLibrary === 'company' ? {
                      borderColor: companyBranding.primaryColor,
                      backgroundColor: companyBranding.primaryColor
                    } : {}}
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
                    className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors hover:border-gray-400 ${
                      companyBranding && currentLibrary === 'company'
                        ? 'focus:ring-opacity-50'
                        : 'focus:ring-blue-500'
                    }`}
                    style={companyBranding && currentLibrary === 'company' ? {
                      '--tw-ring-color': companyBranding.primaryColor
                    } as React.CSSProperties : {}}
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
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      companyBranding && currentLibrary === 'company'
                        ? 'text-white hover:text-white hover:bg-opacity-80'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                    style={companyBranding && currentLibrary === 'company' ? {
                      backgroundColor: companyBranding.primaryColor
                    } : {}}
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
                  
                  {/* Manual Refresh Button */}
                  <button
                    onClick={() => loadLibraryData(true)}
                    className="px-3 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
                    title="Force refresh library data"
                  >
                    🔄 Refresh
                  </button>
                  
                  {/* Check Gemini Status Button */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={async () => {
                        try {
                          if (!userProfile?.uid) {
                            toast.error('No user profile found');
                            return;
                          }
                          
                          // Firebase debugging removed - using local services
                          toast.info('Firebase debugging removed - using local services');
                          
                        } catch (error) {
                          console.error('Error checking Gemini status:', error);
                          toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      className="px-3 py-2 text-sm text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200 hover:border-orange-300"
                      title="Check Gemini agent status in real-time"
                    >
                      🔍 Check Gemini
                    </button>
                  )}
                  
                  {/* Force Add Gemini Button */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={async () => {
                        try {
                          if (!userProfile?.uid) {
                            toast.error('No user profile found');
                            return;
                          }
                          
                          const geminiAgent = agents.find(a => a.name.includes('Gemini'));
                          if (!geminiAgent) {
                            toast.error('No Gemini agent found in current agents list');
                            return;
                          }
                          
                          toast('🔄 Force adding Gemini agent to your library...', { icon: '⏳' });
                          
                          // Force add the agent using the API
                          await addAgentToLocalLibrary(userProfile.uid, geminiAgent.id);
                          
                          toast.success('✅ Gemini agent force-added to your library!');
                          
                          // Force refresh the data
                          await loadLibraryData(true);
                          
                        } catch (error) {
                          console.error('Error force-adding Gemini agent:', error);
                          toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                      title="Force add Gemini agent to library for debugging"
                    >
                      🚀 Force Add Gemini
                    </button>
                  )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            {/* Error State */}
            {!loading && filteredAndSortedAgents.length === 0 && (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                <p className="text-gray-600 mb-4">
                  {currentLibrary === 'personal' 
                    ? "No agents are currently available in your personal library."
                    : "No agents found matching your current filters."
                  }
                </p>
                <button
                  onClick={() => loadLibraryData(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Library
                </button>
              </div>
            )}

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  
                  <AgentCardWithErrorBoundary
                    agent={agent}
                    isInUserLibrary={agent.inUserLibrary}
                    showAddToLibrary={agent.canAdd && !agent.inUserLibrary}
                    showRequestAccess={agent.canRequest && !agent.inUserLibrary}
                    currentLibrary={currentLibrary}
                    onAddToLibrary={() => handleAddToLibrary(agent)}
                    onRequestAccess={() => handleRequestAccess(agent)}
                    onRemoveFromLibrary={() => handleRemoveFromLibrary(agent)}
                    onOpenAgent={() => {
                      setOpenAgent(agent);
                      // Initialize with welcome message for Gemini
                      if (agent.id === 'gemini-chat-agent') {
                        setAgentMessages([
                          {
                            role: 'assistant',
                            content: `Hello! I'm Gemini, your AI assistant. I can help you with various tasks, answer questions, and engage in meaningful conversations. What would you like to know?`
                          }
                        ]);
                      } else {
                        setAgentMessages([
                          {
                            role: 'assistant',
                            content: `Hello! I'm ${agent.name}. How can I help you today?`
                          }
                        ]);
                      }
                    }}
                  />
                  


                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Agent Interface Modal */}
      {openAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                {openAgent.id === 'gemini-chat-agent' ? (
                  <img 
                    src="/Google-Gemini-Logo.png" 
                    alt="Gemini Logo" 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{openAgent.name}</h2>
                  <p className="text-gray-600 capitalize">{openAgent.provider}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpenAgent(null);
                  setAgentMessages([]);
                  setAgentInput('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Interface */}
            <div className="flex flex-col h-[70vh]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {agentMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isAgentLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!agentInput.trim() || isAgentLoading) return;

                    const userMessage = agentInput.trim();
                    setAgentInput('');
                    
                    // Add user message
                    setAgentMessages(prev => [...prev, { role: 'user', content: userMessage }]);
                    
                    setIsAgentLoading(true);
                    
                    try {
                      // Simulate AI response (in real app, this would call the actual Gemini API)
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      let aiResponse = '';
                      if (openAgent.id === 'gemini-chat-agent') {
                        // Gemini-specific responses
                        const responses = [
                          "That's an interesting question! Let me help you with that. I have access to a wide range of information and can assist with creative tasks, research, coding, and general knowledge.",
                          "I'm here to help! Whether you need assistance with writing, analysis, problem-solving, or just want to chat, I'm ready to engage. What's on your mind?",
                          "Great question! I'm designed to be helpful, informative, and engaging. I can assist with everything from simple queries to complex problem-solving tasks.",
                          "I appreciate your message! I'm here to provide helpful, accurate, and engaging responses. How can I assist you today?",
                          "That's a thoughtful question. I can help you explore this topic further, provide insights, or assist with any related tasks you have in mind."
                        ];
                        aiResponse = responses[Math.floor(Math.random() * responses.length)];
                      } else {
                        // Generic AI response
                        aiResponse = `Thank you for your message: "${userMessage}". I'm here to help you with your request. How can I assist you further?`;
                      }
                      
                      setAgentMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
                    } catch (error) {
                      console.error('Error getting AI response:', error);
                      setAgentMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: 'I apologize, but I encountered an error. Please try again.' 
                      }]);
                    } finally {
                      setIsAgentLoading(false);
                    }
                  }}
                  className="flex space-x-4"
                >
                  <input
                    type="text"
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={isAgentLoading}
                  />
                  <button
                    type="submit"
                    disabled={!agentInput.trim() || isAgentLoading}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isAgentLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
