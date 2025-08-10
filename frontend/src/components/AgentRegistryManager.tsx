import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { serviceFactory } from '../services/ServiceFactory';
import { POCRegistryEntry, AgentStatus, CreateRegistryEntryRequest } from '../types/agentRegistry';
import toast from 'react-hot-toast';
import AgentRegistryForm from './AgentRegistryForm';

interface AgentRegistryManagerProps {
  className?: string;
}

const AgentRegistryManager: React.FC<AgentRegistryManagerProps> = ({ className = '' }) => {
  const [registryEntries, setRegistryEntries] = useState<POCRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<POCRegistryEntry | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as AgentStatus | 'all',
    category: 'all',
    provider: 'all'
  });

  const agentRegistryService = serviceFactory.getPOCAgentRegistryService();

  useEffect(() => {
    loadRegistryEntries();
  }, [filters]);

  const loadRegistryEntries = async () => {
    try {
      setLoading(true);
      const entries = await agentRegistryService.getAllEntries();
      setRegistryEntries(entries as POCRegistryEntry[]);
    } catch (error) {
      console.error('Failed to load registry entries:', error);
      toast.error('Failed to load agent registry');
      // Fall back to empty array
      setRegistryEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = registryEntries.filter(entry => {
    if (filters.status !== 'all' && entry.status !== filters.status) return false;
    if (filters.category !== 'all' && entry.metadata.category !== filters.category) return false;
    if (filters.provider !== 'all' && entry.metadata.provider !== filters.provider) return false;
    return true;
  });

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'deprecated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'approved': return <CheckIcon className="w-4 h-4" />;
      case 'pending_review': return <ClockIcon className="w-4 h-4" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4" />;
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
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
      await agentRegistryService.approveEntry(entryId, 'current-user-id', 'Approved by admin');
      toast.success('Agent approved successfully');
      await loadRegistryEntries(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve agent:', error);
      toast.error('Failed to approve agent');
    }
  };

  const handleReject = async (entryId: string) => {
    try {
      await agentRegistryService.rejectEntry(entryId, 'current-user-id', 'Rejected by admin');
      toast.success('Agent rejected successfully');
      await loadRegistryEntries(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject agent:', error);
      toast.error('Failed to reject agent');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Registry</h2>
          <p className="text-gray-600">Manage AI agent governance, versioning, and approvals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Agent
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as AgentStatus | 'all' }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Analytics">Analytics</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>

          <select
            value={filters.provider}
            onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="google">Google</option>
            <option value="anthropic">Anthropic</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Registry Entries */}
      <div className="grid gap-4">
        {filteredEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{entry.metadata.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                    {getStatusIcon(entry.status)}
                    <span className="ml-1 capitalize">{entry.status.replace('_', ' ')}</span>
                  </span>
                  <span className="text-sm text-gray-500">v{entry.version}</span>
                </div>
                
                <p className="text-gray-600 mb-3">{entry.metadata.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {entry.metadata.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{entry.metadata.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Provider:</span>
                    <span className="ml-2 font-medium capitalize">{entry.metadata.provider}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <span className="ml-2 font-medium">{entry.governance.owner}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Risk Level:</span>
                    <span className={`ml-2 font-medium px-2 py-1 rounded text-xs ${
                      entry.governance.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      entry.governance.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {entry.governance.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleViewDetails(entry)}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View
                </button>

                {entry.status === 'pending_review' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(entry.id)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(entry.id)}
                      className="inline-flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.status !== 'all' || filters.category !== 'all' || filters.provider !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first agent to the registry'
            }
          </p>
        </div>
      )}

      {/* Agent Details Modal */}
      {showDetails && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEntry.metadata.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Metadata */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Agent Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500">Description:</span>
                      <p className="text-gray-900">{selectedEntry.metadata.description}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.metadata.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Provider:</span>
                      <span className="ml-2 text-gray-900 capitalize">{selectedEntry.metadata.provider}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.metadata.model}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Version:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.version}</span>
                    </div>
                  </div>
                </div>

                {/* Governance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Governance</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500">Owner:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.governance.owner}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Level:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        selectedEntry.governance.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        selectedEntry.governance.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedEntry.governance.riskLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Classification:</span>
                      <span className="ml-2 text-gray-900 capitalize">{selectedEntry.governance.dataClassification}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reviewers:</span>
                      <div className="ml-2">
                        {selectedEntry.governance.reviewers.map((reviewer, index) => (
                          <span key={index} className="block text-gray-900">{reviewer}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance & Cost */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance & Cost</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500">Avg Latency:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.metadata.performanceMetrics.avgLatency}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.metadata.performanceMetrics.successRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost per Request:</span>
                      <span className="ml-2 text-gray-900">
                        ${selectedEntry.metadata.estimatedCost.perRequest} {selectedEntry.metadata.estimatedCost.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tenant Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tenant Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500">Tenant:</span>
                      <span className="ml-2 text-gray-900">{selectedEntry.tenant.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Access Level:</span>
                      <span className="ml-2 text-gray-900 capitalize">{selectedEntry.tenant.accessLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Customizations:</span>
                      <div className="ml-2">
                        {Object.entries(selectedEntry.tenant.customizations).map(([key, value]) => (
                          <span key={key} className="block text-gray-900">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value ? 'Yes' : 'No'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {selectedEntry.createdAt.toLocaleDateString()}</span>
                  <span>Last Updated: {selectedEntry.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Agent Registry Form */}
      <AgentRegistryForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={loadRegistryEntries}
      />
    </div>
  );
};

export default AgentRegistryManager;
