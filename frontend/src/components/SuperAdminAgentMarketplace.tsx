import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CogIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { serviceFactory } from '../services/ServiceFactory';
import { POCRegistryEntry, AgentStatus, CreateRegistryEntryRequest } from '../types/agentRegistry';

interface SuperAdminAgentMarketplaceProps {
  className?: string;
}

const SuperAdminAgentMarketplace: React.FC<SuperAdminAgentMarketplaceProps> = ({ className = '' }) => {
  const [registryEntries, setRegistryEntries] = useState<POCRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<POCRegistryEntry | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as AgentStatus | 'all',
    category: 'all',
    provider: 'all',
    company: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'status' | 'company'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<any>(null);

  // Mock data for POC demonstration
  const mockRegistryEntries: POCRegistryEntry[] = [
    {
      id: '1',
      agentId: 'agent-001',
      version: '1.0.0',
      status: 'pending_review',
      metadata: {
        name: 'Customer Support Agent',
        description: 'AI-powered customer support agent for handling common inquiries',
        category: 'customer_service',
        tags: ['support', 'customer', 'ai'],
        provider: 'openai',
        capabilities: ['text_generation', 'sentiment_analysis'],
        inputSchema: { query: 'string', context: 'string' },
        outputSchema: { response: 'string', confidence: 'number' },
        examples: ['How do I reset my password?', 'What are your return policies?']
      },
      governance: {
        ownerId: 'user-001',
        ownerName: 'John Smith',
        companyId: 'company-001',
        companyName: 'TechCorp Inc.',
        reviewRequired: true,
        approvalWorkflow: 'admin_review',
        complianceNotes: 'Pending security review',
        riskLevel: 'low'
      },
      deployment: {
        environment: 'development',
        region: 'us-central1',
        resourceRequirements: { cpu: '1', memory: '2GB' },
        healthCheckEndpoint: '/health',
        monitoringConfig: { metrics: true, logging: true }
      },
      audit: {
        createdBy: 'user-001',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        versionHistory: [],
        accessLogs: [],
        performanceLogs: [],
        changeLogs: []
      },
      tenant: {
        tenantId: 'company-001',
        tenantName: 'TechCorp Inc.',
        dataIsolation: 'strict',
        accessPolicies: ['owner_only']
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      agentId: 'agent-002',
      version: '2.1.0',
      status: 'approved',
      metadata: {
        name: 'Data Analysis Bot',
        description: 'Advanced data analysis and visualization agent',
        category: 'analytics',
        tags: ['data', 'analysis', 'visualization'],
        provider: 'anthropic',
        capabilities: ['data_processing', 'chart_generation', 'insights'],
        inputSchema: { dataset: 'file', query: 'string' },
        outputSchema: { insights: 'array', charts: 'array', summary: 'string' },
        examples: ['Analyze sales trends', 'Generate customer segmentation charts']
      },
      governance: {
        ownerId: 'user-002',
        ownerName: 'Sarah Johnson',
        companyId: 'company-002',
        companyName: 'DataFlow Solutions',
        reviewRequired: true,
        approvalWorkflow: 'admin_review',
        complianceNotes: 'Approved for production use',
        riskLevel: 'medium'
      },
      deployment: {
        environment: 'production',
        region: 'us-east1',
        resourceRequirements: { cpu: '2', memory: '4GB' },
        healthCheckEndpoint: '/health',
        monitoringConfig: { metrics: true, logging: true, alerting: true }
      },
      audit: {
        createdBy: 'user-002',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
        versionHistory: [],
        accessLogs: [],
        performanceLogs: [],
        changeLogs: []
      },
      tenant: {
        tenantId: 'company-002',
        tenantName: 'DataFlow Solutions',
        dataIsolation: 'strict',
        accessPolicies: ['owner_only']
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    }
  ];

  useEffect(() => {
    // Simulate loading and populate with mock data
    const timer = setTimeout(() => {
      setRegistryEntries(mockRegistryEntries);
      setLoading(false);
      // Calculate initial stats
      calculateStats(mockRegistryEntries);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const calculateStats = (entries: POCRegistryEntry[]) => {
    const stats = {
      total: entries.length,
      pendingReview: entries.filter(e => e.status === 'pending_review').length,
      approved: entries.filter(e => e.status === 'approved').length,
      rejected: entries.filter(e => e.status === 'rejected').length,
      byCategory: entries.reduce((acc, entry) => {
        acc[entry.metadata.category] = (acc[entry.metadata.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCompany: entries.reduce((acc, entry) => {
        acc[entry.governance.companyName] = (acc[entry.governance.companyName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    setStats(stats);
  };

  const filteredAndSortedEntries = registryEntries
    .filter(entry => {
      const matchesStatus = filters.status === 'all' || entry.status === filters.status;
      const matchesCategory = filters.category === 'all' || entry.metadata.category === filters.category;
      const matchesProvider = filters.provider === 'all' || entry.metadata.provider === filters.provider;
      const matchesCompany = filters.company === 'all' || entry.governance.companyName === filters.company;
      const matchesSearch = searchTerm === '' || 
        entry.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.governance.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCategory && matchesProvider && matchesCompany && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.metadata.name;
          bValue = b.metadata.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'company':
          aValue = a.governance.companyName;
          bValue = b.governance.companyName;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'deprecated': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
      case 'pending_review': return <ClockIcon className="w-4 h-4" />;
      case 'approved': return <CheckIcon className="w-4 h-4" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4" />;
      case 'deprecated': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'archived': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (entry: POCRegistryEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  const handleApprove = async (entryId: string) => {
    try {
      const registryService = serviceFactory.getPOCAgentRegistryService();
      await registryService.approveEntry(entryId, 'super-admin-001', 'Approved by super admin');
      
      // Update local state
      setRegistryEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: 'approved' as AgentStatus }
          : entry
      ));
      
      // Recalculate stats
      calculateStats(registryEntries.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: 'approved' as AgentStatus }
          : entry
      ));
    } catch (error) {
      console.error('Error approving entry:', error);
    }
  };

  const handleReject = async (entryId: string, reason: string) => {
    try {
      const registryService = serviceFactory.getPOCAgentRegistryService();
      await registryService.rejectEntry(entryId, 'super-admin-001', reason);
      
      // Update local state
      setRegistryEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: 'rejected' as AgentStatus }
          : entry
      ));
      
      // Recalculate stats
      calculateStats(registryEntries.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: 'rejected' as AgentStatus }
          : entry
      ));
    } catch (error) {
      console.error('Error rejecting entry:', error);
    }
  };

  const handleAssignToCompany = (entry: POCRegistryEntry) => {
    setSelectedEntry(entry);
    setShowAssignmentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GlobeAltIcon className="w-8 h-8 text-blue-600" />
              Master Agent Marketplace
            </h1>
            <p className="text-gray-600 mt-1">
              Super Admin Dashboard for Global Agent Governance and Distribution
            </p>
          </div>
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents, companies, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as AgentStatus | 'all' }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="deprecated">Deprecated</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="customer_service">Customer Service</option>
              <option value="analytics">Analytics</option>
              <option value="automation">Automation</option>
              <option value="content">Content</option>
            </select>
            
            <select
              value={filters.provider}
              onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Entries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Agent Registry</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Date</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="company">Company</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAndSortedEntries.length > 0 ? (
            filteredAndSortedEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.metadata.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                        {entry.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">v{entry.version}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{entry.metadata.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        {entry.governance.companyName}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {entry.governance.ownerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <CogIcon className="w-4 h-4" />
                        {entry.metadata.provider}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.metadata.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(entry)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    
                    {entry.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(entry.id, 'Rejected by super admin')}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {entry.status === 'approved' && (
                      <button
                        onClick={() => handleAssignToCompany(entry)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {showDetails && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedEntry.metadata.name}</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Agent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.metadata.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.metadata.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Provider</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.metadata.provider}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Version</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.version}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Governance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Owner</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.governance.ownerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.governance.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.governance.riskLevel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Review Required</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEntry.governance.reviewRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.metadata.capabilities.map((capability, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.metadata.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Assignment Modal */}
      <AnimatePresence>
        {showAssignmentModal && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAssignmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Assign Agent to Company</h2>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Assign "{selectedEntry.metadata.name}" to a company's agent library.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Choose a company...</option>
                      <option value="company-003">Acme Corp</option>
                      <option value="company-004">Innovation Labs</option>
                      <option value="company-005">Global Solutions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="read">Read Only</option>
                      <option value="execute">Execute</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Optional notes about this assignment..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement assignment logic
                      setShowAssignmentModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Agent
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminAgentMarketplace;
