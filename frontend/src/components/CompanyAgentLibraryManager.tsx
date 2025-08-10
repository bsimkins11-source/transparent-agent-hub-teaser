import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types/agent';
import { AgentPermission } from '../services/hierarchicalPermissionService';
import { AgentRequest } from '../services/requestService';
import toast from 'react-hot-toast';

interface CompanyNetwork {
  id: string;
  name: string;
  slug: string;
  type: 'business_unit' | 'region' | 'department' | 'custom';
  adminEmail: string;
  adminName: string;
  description: string;
  userCount: number;
  agentCount: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

interface CompanyUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'network_admin' | 'company_admin';
  networkId?: string;
  networkName?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

interface CompanyAgentLibraryManagerProps {
  companyId: string;
  companyName: string;
  onClose?: () => void;
}

export default function CompanyAgentLibraryManager({ 
  companyId, 
  companyName, 
  onClose 
}: CompanyAgentLibraryManagerProps) {
  const [activeTab, setActiveTab] = useState<'agents' | 'requests' | 'networks' | 'users'>('agents');
  const [loading, setLoading] = useState(false);
  
  // Agent management state
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [agentPermissions, setAgentPermissions] = useState<{ [agentId: string]: AgentPermission }>({});
  
  // Request management state
  const [pendingRequests, setPendingRequests] = useState<AgentRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<AgentRequest[]>([]);
  const [deniedRequests, setDeniedRequests] = useState<AgentRequest[]>([]);
  
  // Network management state
  const [networks, setNetworks] = useState<CompanyNetwork[]>([]);
  const [isCreateNetworkModalOpen, setIsCreateNetworkModalOpen] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    slug: '',
    type: 'business_unit' as const,
    adminEmail: '',
    adminName: '',
    description: ''
  });
  
  // User management state
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    role: 'user' as const,
    networkId: ''
  });

  // Filters
  const [agentFilters, setAgentFilters] = useState({
    search: '',
    tier: '',
    provider: '',
    category: '',
    status: ''
  });

  const [requestFilters, setRequestFilters] = useState({
    search: '',
    priority: '',
    status: '',
    networkId: ''
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load agents, requests, networks, and users in parallel
      await Promise.all([
        loadCompanyAgents(),
        loadAgentRequests(),
        loadCompanyNetworks(),
        loadCompanyUsers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyAgents = async () => {
    try {
      // This would call the hierarchical permission service
      // const agents = await getCompanyAvailableAgents(companyId);
      // setAvailableAgents(agents);
      // Mock data for now
      setAvailableAgents([]);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadAgentRequests = async () => {
    try {
      // This would call the request service
      // const requests = await getAgentRequests('company_admin', companyId);
      // setPendingRequests(requests.filter(r => r.status === 'pending'));
      // setApprovedRequests(requests.filter(r => r.status === 'approved'));
      // setDeniedRequests(requests.filter(r => r.status === 'denied'));
      // Mock data for now
      setPendingRequests([]);
      setApprovedRequests([]);
      setDeniedRequests([]);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadCompanyNetworks = async () => {
    try {
      // This would call the company service
      // const networks = await getCompanyNetworks(companyId);
      // setNetworks(networks);
      // Mock data for now
      setNetworks([]);
    } catch (error) {
      console.error('Error loading networks:', error);
    }
  };

  const loadCompanyUsers = async () => {
    try {
      // This would call the company service
      // const users = await getCompanyUsers(companyId);
      // setUsers(users);
      // Mock data for now
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Agent management functions
  const handleAgentPermissionChange = async (agentId: string, granted: boolean, assignmentType: 'free' | 'direct' | 'approval') => {
    try {
      // This would call the hierarchical permission service
      // await updateCompanyAgentPermission(companyId, agentId, { granted, assignmentType });
      setAgentPermissions(prev => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          granted,
          assignmentType
        }
      }));
      toast.success('Agent permission updated successfully');
    } catch (error) {
      console.error('Error updating agent permission:', error);
      toast.error('Failed to update agent permission');
    }
  };

  // Request management functions
  const handleApproveRequest = async (requestId: string, reason?: string) => {
    try {
      // This would call the request service
      // await approveAgentRequest(requestId, 'company-admin-id', 'admin@company.com', 'Admin Name', reason);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleDenyRequest = async (requestId: string, reason?: string) => {
    try {
      // This would call the request service
      // await denyAgentRequest(requestId, 'company-admin-id', 'admin@company.com', 'Admin Name', reason);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request denied');
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    }
  };

  // Network management functions
  const handleCreateNetwork = async () => {
    try {
      // This would call the company service
      // await createCompanyNetwork(companyId, newNetwork);
      const network: CompanyNetwork = {
        id: `network-${Date.now()}`,
        ...newNetwork,
        userCount: 0,
        agentCount: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setNetworks(prev => [...prev, network]);
      setIsCreateNetworkModalOpen(false);
      setNewNetwork({
        name: '',
        slug: '',
        type: 'business_unit',
        adminEmail: '',
        adminName: '',
        description: ''
      });
      toast.success('Network created successfully');
    } catch (error) {
      console.error('Error creating network:', error);
      toast.error('Failed to create network');
    }
  };

  const handleDeleteNetwork = async (networkId: string) => {
    try {
      // This would call the company service
      // await deleteCompanyNetwork(companyId, networkId);
      setNetworks(prev => prev.filter(n => n.id !== networkId));
      toast.success('Network deleted successfully');
    } catch (error) {
      console.error('Error deleting network:', error);
      toast.error('Failed to delete network');
    }
  };

  // User management functions
  const handleCreateUser = async () => {
    try {
      // This would call the company service
      // await addCompanyUser(companyId, newUser);
      const user: CompanyUser = {
        id: `user-${Date.now()}`,
        ...newUser,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, user]);
      setIsCreateUserModalOpen(false);
      setNewUser({
        email: '',
        displayName: '',
        role: 'user',
        networkId: ''
      });
      toast.success('User added successfully');
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      // This would call the company service
      // await removeCompanyUser(companyId, userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User removed successfully');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };

  const tabs = [
    { id: 'agents', name: 'Agent Library', icon: Cog6ToothIcon, count: availableAgents.length },
    { id: 'requests', name: 'Agent Requests', icon: ClockIcon, count: pendingRequests.length },
    { id: 'networks', name: 'Networks', icon: BuildingOfficeIcon, count: networks.length },
    { id: 'users', name: 'Users', icon: UsersIcon, count: users.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
          <p className="text-gray-600">Manage {companyName}'s agents, networks, and users</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <div className="min-h-96">
          {/* Agent Library Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Company Agent Library</h3>
                <p className="text-sm text-gray-500">
                  Manage agents available to your company users
                </p>
              </div>

              {availableAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No agents available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Contact your super administrator to grant agents to your company.
                  </p>
                </div>
              ) : (
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
                            Assignment Type
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availableAgents.map((agent) => (
                          <tr key={agent.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                                <div className="text-sm text-gray-500">{agent.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {agent.provider}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {agent.metadata?.tier || 'free'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={agentPermissions[agent.id]?.assignmentType || 'approval'}
                                onChange={(e) => handleAgentPermissionChange(
                                  agent.id, 
                                  true, 
                                  e.target.value as 'free' | 'direct' | 'approval'
                                )}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="free">Free (Direct Add)</option>
                                <option value="direct">Direct (Admin Assigns)</option>
                                <option value="approval">Approval (User Requests)</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleAgentPermissionChange(agent.id, false, 'approval')}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agent Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Agent Access Requests</h3>
                <p className="text-sm text-gray-500">
                  Review and approve agent access requests from your users
                </p>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All agent access requests have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">{request.agentName}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              request.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Requested by {request.userName} ({request.userEmail})
                          </p>
                          {request.networkName && (
                            <p className="text-sm text-gray-500 mt-1">
                              Network: {request.networkName}
                            </p>
                          )}
                          {request.requestReason && (
                            <p className="text-sm text-gray-700 mt-2">
                              <strong>Reason:</strong> {request.requestReason}
                            </p>
                          )}
                          {request.businessJustification && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Business Justification:</strong> {request.businessJustification}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenyRequest(request.id)}
                            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Networks Tab */}
          {activeTab === 'networks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Company Networks</h3>
                <button
                  onClick={() => setIsCreateNetworkModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Network
                </button>
              </div>

              {networks.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No networks</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first network to organize users and agents by business units, regions, or departments.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networks.map((network) => (
                    <div key={network.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{network.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{network.description}</p>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                              <span className="capitalize">{network.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <UserIcon className="w-4 h-4 mr-2" />
                              <span>{network.adminName} ({network.adminEmail})</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <UsersIcon className="w-4 h-4 mr-2" />
                              <span>{network.userCount} users, {network.agentCount} agents</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteNetwork(network.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Company Users</h3>
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Add User
                </button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add users to your company to start using the agent portal.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Network
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'company_admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'network_admin' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {user.networkName || 'Company-wide'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Network Modal */}
      {isCreateNetworkModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Network</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Network Name</label>
                  <input
                    type="text"
                    value={newNetwork.name}
                    onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter network name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    type="text"
                    value={newNetwork.slug}
                    onChange={(e) => setNewNetwork({ ...newNetwork, slug: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="network-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newNetwork.type}
                    onChange={(e) => setNewNetwork({ ...newNetwork, type: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="business_unit">Business Unit</option>
                    <option value="region">Region</option>
                    <option value="department">Department</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                  <input
                    type="email"
                    value={newNetwork.adminEmail}
                    onChange={(e) => setNewNetwork({ ...newNetwork, adminEmail: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                  <input
                    type="text"
                    value={newNetwork.adminName}
                    onChange={(e) => setNewNetwork({ ...newNetwork, adminName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newNetwork.description}
                    onChange={(e) => setNewNetwork({ ...newNetwork, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Network description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateNetworkModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNetwork}
                  disabled={!newNetwork.name || !newNetwork.slug || !newNetwork.adminEmail || !newNetwork.adminName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Network
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="User Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="network_admin">Network Admin</option>
                    <option value="company_admin">Company Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Network (Optional)</label>
                  <select
                    value={newUser.networkId}
                    onChange={(e) => setNewUser({ ...newUser, networkId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Company-wide</option>
                    {networks.map(network => (
                      <option key={network.id} value={network.id}>{network.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.email || !newUser.displayName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
