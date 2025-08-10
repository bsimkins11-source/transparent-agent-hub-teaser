import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types/agent';
import { AgentPermission } from '../services/hierarchicalPermissionService';
import toast from 'react-hot-toast';

interface AgentAssignmentManagerProps {
  title: string;
  description: string;
  availableAgents: Agent[];
  currentPermissions: { [agentId: string]: AgentPermission };
  onSavePermissions: (permissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } }) => Promise<void>;
  onClose?: () => void;
  loading?: boolean;
  stats?: {
    totalAvailable: number;
    totalGranted: number;
    byTier: { [tier: string]: number };
  };
}

export default function AgentAssignmentManager({
  title,
  description,
  availableAgents,
  currentPermissions,
  onSavePermissions,
  onClose,
  loading = false,
  stats
}: AgentAssignmentManagerProps) {
  const [localPermissions, setLocalPermissions] = useState<{ [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } }>({});
  const [filters, setFilters] = useState({
    search: '',
    tier: '',
    provider: '',
    category: '',
    status: '' // 'granted', 'not-granted', 'all'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize local permissions from current permissions
    const initialPermissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } } = {};
    
    availableAgents.forEach(agent => {
      const currentPermission = currentPermissions[agent.id];
      initialPermissions[agent.id] = {
        granted: currentPermission?.granted || false,
        assignmentType: currentPermission?.assignmentType || (agent.metadata?.tier === 'free' ? 'direct' : 'approval')
      };
    });
    
    setLocalPermissions(initialPermissions);
  }, [availableAgents, currentPermissions]);

  const handlePermissionToggle = (agentId: string) => {
    setLocalPermissions(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        granted: !prev[agentId]?.granted
      }
    }));
  };

  const handleAssignmentTypeChange = (agentId: string, assignmentType: 'free' | 'direct' | 'approval') => {
    setLocalPermissions(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        assignmentType
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSavePermissions(localPermissions);
      toast.success('Agent permissions updated successfully!');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error('Failed to update agent permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAction = (action: 'grant-all' | 'revoke-all') => {
    const updatedPermissions = { ...localPermissions };
    
    filteredAgents.forEach(agent => {
      updatedPermissions[agent.id] = {
        ...updatedPermissions[agent.id],
        granted: action === 'grant-all'
      };
    });
    
    setLocalPermissions(updatedPermissions);
  };

  const filteredAgents = availableAgents.filter(agent => {
    const matchesSearch = (agent.name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
                         (agent.description?.toLowerCase() || '').includes(filters.search.toLowerCase());
    const matchesTier = !filters.tier || agent.metadata?.tier === filters.tier;
    const matchesProvider = !filters.provider || agent.provider === filters.provider;
    const matchesCategory = !filters.category || agent.metadata?.category === filters.category;
    
    let matchesStatus = true;
    if (filters.status === 'granted') {
      matchesStatus = localPermissions[agent.id]?.granted === true;
    } else if (filters.status === 'not-granted') {
      matchesStatus = localPermissions[agent.id]?.granted !== true;
    }
    
    return matchesSearch && matchesTier && matchesProvider && matchesCategory && matchesStatus;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-emerald-100 text-emerald-800';
      case 'google': return 'bg-orange-100 text-orange-800';
      case 'anthropic': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const grantedCount = Object.values(localPermissions).filter(p => p.granted).length;
  const hasChanges = JSON.stringify(localPermissions) !== JSON.stringify(
    availableAgents.reduce((acc, agent) => {
      const currentPermission = currentPermissions[agent.id];
      acc[agent.id] = {
        granted: currentPermission?.granted || false,
        assignmentType: currentPermission?.assignmentType || (agent.metadata.tier === 'free' ? 'direct' : 'approval')
      };
      return acc;
    }, {} as { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{availableAgents.length}</p>
                <p className="text-gray-600">Available Agents</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="ml-4">
              <p className="text-2xl font-bold text-green-600">{grantedCount}</p>
              <p className="text-gray-600">Currently Granted</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="ml-4">
              <p className="text-2xl font-bold text-purple-600">{stats.byTier.premium || 0}</p>
              <p className="text-gray-600">Premium Agents</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="ml-4">
              <p className="text-2xl font-bold text-blue-600">{stats.byTier.enterprise || 0}</p>
              <p className="text-gray-600">Enterprise Agents</p>
            </div>
          </div>
        </div>
      )}

      {/* Warning if no agents available */}
      {availableAgents.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No agents available
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                No agents have been granted to this level yet. Contact your administrator to assign agents.
              </p>
            </div>
          </div>
        </div>
      )}

      {availableAgents.length > 0 && (
        <>
          {/* Filters and Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.tier}
                onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tiers</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={filters.provider}
                onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Providers</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google</option>
                <option value="anthropic">Anthropic</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="granted">Granted</option>
                <option value="not-granted">Not Granted</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            
            {/* Bulk Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('grant-all')}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Grant All Filtered
                </button>
                <button
                  onClick={() => handleBulkAction('revoke-all')}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Revoke All Filtered
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {filteredAgents.length} agents shown
              </div>
            </div>
          </div>

          {/* Agents Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment Type
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Granted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="status" aria-label="Loading"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No agents found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {agent.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProviderColor(agent.provider)}`}>
                            {agent.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(agent.metadata.tier || 'free')}`}>
                            {agent.metadata.tier || 'free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {agent.metadata.category}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={localPermissions[agent.id]?.assignmentType || 'direct'}
                            onChange={(e) => handleAssignmentTypeChange(agent.id, e.target.value as 'free' | 'direct' | 'approval')}
                            disabled={!localPermissions[agent.id]?.granted}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            <option value="free">Free (Direct Add)</option>
                            <option value="direct">Direct (Admin Assigns)</option>
                            <option value="approval">Approval (User Requests)</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handlePermissionToggle(agent.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              localPermissions[agent.id]?.granted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {localPermissions[agent.id]?.granted && (
                              <CheckIcon className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
