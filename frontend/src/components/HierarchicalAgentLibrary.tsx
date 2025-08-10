import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  StarIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
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

export default function HierarchicalAgentLibrary({ 
  initialLibrary = 'global',
  showTabs = true 
}: HierarchicalAgentLibraryProps) {
  const { userProfile } = useAuth();
  const [currentLibrary, setCurrentLibrary] = useState<LibraryType>(initialLibrary);
  const [agents, setAgents] = useState<AgentWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    provider: '',
    search: '',
    tier: '',
    access: '' // 'available', 'in-library', 'restricted'
  });
  const [confirmRemove, setConfirmRemove] = useState<{agent: AgentWithContext} | null>(null);

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

    // Debug logging for development
    console.log('Adding agent to library:', { 
      agentId: agent.id, 
      agentName: agent.name,
      userId: userProfile.uid,
      userEmail: userProfile.email,
      organizationId: userProfile.organizationId,
      networkId: userProfile.networkId 
    });

    // Check if agent requires approval
    const requiresApproval = agent.metadata?.tier === 'premium' || agent.metadata?.permissionType === 'approval';
    
    if (requiresApproval) {
      // Premium agents require approval - redirect to request access
      if (agent.canRequest) {
        toast.info('This is a premium agent that requires approval. Submitting request...');
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

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         agent.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesTier = !filters.tier || agent.metadata.tier === filters.tier;
    const matchesProvider = !filters.provider || agent.provider === filters.provider;
    const matchesCategory = !filters.category || agent.metadata.category === filters.category;
    
    let matchesAccess = true;
    if (filters.access === 'available') {
      matchesAccess = agent.canAdd || agent.canRequest;
    } else if (filters.access === 'in-library') {
      matchesAccess = agent.inUserLibrary;
    } else if (filters.access === 'restricted') {
      matchesAccess = !agent.canAdd && !agent.canRequest;
    }
    
    return matchesSearch && matchesTier && matchesProvider && matchesCategory && matchesAccess;
  });

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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {libraryInfo.description}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents by name, description, or capabilities..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
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
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
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

      {/* Filters and Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4" />
                <span>{filteredAgents.length} agents</span>
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
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.tier}
                onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Tiers</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              
              <select
                value={filters.access}
                onChange={(e) => setFilters({ ...filters, access: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Access</option>
                <option value="available">Available</option>
                <option value="in-library">In My Library</option>
                <option value="restricted">Restricted</option>
              </select>

              <select
                value={filters.provider}
                onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Providers</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google</option>
                <option value="anthropic">Anthropic</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Categories</option>
                <option value="Marketing">Marketing</option>
                <option value="Analytics">Analytics</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Research">Research</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No agents found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse a different library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative"
              >
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
                />
                
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
        )}
      </div>

      {/* Confirmation Dialog for Removing Agent */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
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
          </div>
        </div>
      )}
    </div>
  );
}
