import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  CpuChipIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  SwatchIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  MapIcon,
  GlobeAmericasIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface CompanyUser {
  id: string;
  email: string;
  displayName: string;
  role: 'company_admin' | 'user';
  assignedAgents: string[];
  lastLogin: string;
  status: 'active' | 'suspended';
}

interface CompanyAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isEnabled: boolean;
  assignedUsers: number;
}

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

export default function CompanyAdminDashboard() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [agents, setAgents] = useState<CompanyAgent[]>([]);
  const [networks, setNetworks] = useState<CompanyNetwork[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'networks' | 'branding'>('users');
  
  // User management state
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isAssignAgentsModalOpen, setIsAssignAgentsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [assignedAgentIds, setAssignedAgentIds] = useState<string[]>([]);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    role: 'user' as 'user' | 'company_admin'
  });

  // Network management state
  const [isCreateNetworkModalOpen, setIsCreateNetworkModalOpen] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    type: 'business_unit' as 'business_unit' | 'region' | 'department' | 'custom',
    adminEmail: '',
    adminName: '',
    description: ''
  });

  // Network agent assignment state
  const [isNetworkAgentModalOpen, setIsNetworkAgentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<CompanyNetwork | null>(null);
  const [networkAgentPermissions, setNetworkAgentPermissions] = useState<{[networkId: string]: string[]}>({});
  const [companyAvailableAgents, setCompanyAvailableAgents] = useState<string[]>([]);

  // Company branding state
  const [companyBranding, setCompanyBranding] = useState({
    logo: '/transparent-partners-logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAgents: 0,
    totalInteractions: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    // Mock data for the current company (based on user's organization)
    const mockUsers: CompanyUser[] = [
      {
        id: 'user1',
        email: 'user1@transparent.partners',
        displayName: 'Alice Johnson',
        role: 'user',
        assignedAgents: ['agent-briefing', 'agent-research'],
        lastLogin: '2024-01-15',
        status: 'active'
      },
      {
        id: 'user2',
        email: 'user2@transparent.partners',
        displayName: 'Bob Wilson',
        role: 'user',
        assignedAgents: ['agent-analytics'],
        lastLogin: '2024-01-14',
        status: 'active'
      },
      {
        id: 'admin1',
        email: 'admin@transparent.partners',
        displayName: 'Carol Smith',
        role: 'company_admin',
        assignedAgents: ['agent-briefing', 'agent-analytics', 'agent-research'],
        lastLogin: '2024-01-16',
        status: 'active'
      }
    ];

    const mockAgents: CompanyAgent[] = [
      {
        id: 'agent-briefing',
        name: 'Briefing Agent',
        description: 'Summarizes documents and creates briefings',
        icon: '📄',
        category: 'Productivity',
        isEnabled: true,
        assignedUsers: 2
      },
      {
        id: 'agent-analytics',
        name: 'Analytics Agent',
        description: 'Analyzes data and generates insights',
        icon: '📊',
        category: 'Analytics',
        isEnabled: true,
        assignedUsers: 2
      },
      {
        id: 'agent-research',
        name: 'Research Agent',
        description: 'Conducts research and gathers information',
        icon: '🔍',
        category: 'Research',
        isEnabled: true,
        assignedUsers: 1
      },
      {
        id: 'agent-interview',
        name: 'Interview Agent',
        description: 'Conducts structured interviews',
        icon: '🎤',
        category: 'HR',
        isEnabled: false,
        assignedUsers: 0
      }
    ];

    const mockNetworks: CompanyNetwork[] = [
      {
        id: 'north-america',
        name: 'North America',
        slug: 'north-america',
        type: 'region',
        adminEmail: 'na.admin@transparent.partners',
        adminName: 'Sarah Johnson',
        description: 'North American operations and sales teams',
        userCount: 45,
        agentCount: 8,
        status: 'active',
        createdAt: '2024-01-10'
      },
      {
        id: 'manufacturing',
        name: 'Manufacturing',
        slug: 'manufacturing',
        type: 'business_unit',
        adminEmail: 'mfg.admin@transparent.partners',
        adminName: 'Mike Chen',
        description: 'Manufacturing and production teams',
        userCount: 28,
        agentCount: 5,
        status: 'active',
        createdAt: '2024-01-12'
      },
      {
        id: 'sales',
        name: 'Sales',
        slug: 'sales',
        type: 'department',
        adminEmail: 'sales.admin@transparent.partners',
        adminName: 'Lisa Rodriguez',
        description: 'Sales and customer success teams',
        userCount: 32,
        agentCount: 7,
        status: 'active',
        createdAt: '2024-01-15'
      }
    ];

    setUsers(mockUsers);
    setAgents(mockAgents);
    setNetworks(mockNetworks);
    
    // Initialize company available agents (agents granted by Super Admin)
    // In production, this would come from the backend
    const availableAgents = ['briefing-agent', 'analytics-agent', 'research-agent', 'writing-agent'];
    setCompanyAvailableAgents(availableAgents);
    
    // Initialize network agent permissions
    const initialNetworkPermissions: {[networkId: string]: string[]} = {};
    mockNetworks.forEach(network => {
      if (network.id === 'north-america') {
        initialNetworkPermissions[network.id] = ['briefing-agent', 'analytics-agent'];
      } else if (network.id === 'manufacturing') {
        initialNetworkPermissions[network.id] = ['briefing-agent', 'research-agent'];
      } else {
        initialNetworkPermissions[network.id] = ['briefing-agent'];
      }
    });
    setNetworkAgentPermissions(initialNetworkPermissions);
    
    setStats({
      totalUsers: mockUsers.length,
      activeAgents: mockAgents.filter(a => a.isEnabled).length,
      totalInteractions: 245,
      pendingRequests: 3
    });
  }, []);

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.displayName) {
      toast.error('Email and Display Name are required');
      return;
    }

    // Check if email belongs to company domain
    const userDomain = newUser.email.split('@')[1];
    if (userDomain !== userProfile?.organizationId.replace('-', '.')) {
      toast.error(`Email must belong to ${userProfile?.organizationName} domain`);
      return;
    }

    const user: CompanyUser = {
      id: `user-${Date.now()}`,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      assignedAgents: [],
      lastLogin: 'Never',
      status: 'active'
    };

    setUsers([...users, user]);
    toast.success('User created successfully!');
    
    // Reset form
    setNewUser({ email: '', displayName: '', role: 'user' });
    setIsCreateUserModalOpen(false);
  };

  const openAssignAgentsModal = (user: CompanyUser) => {
    setSelectedUser(user);
    setAssignedAgentIds(user.assignedAgents);
    setIsAssignAgentsModalOpen(true);
  };

  const handleAssignAgents = () => {
    if (selectedUser) {
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, assignedAgents: assignedAgentIds } : u
      ));
      toast.success(`Agents assigned to ${selectedUser.displayName}`);
      setIsAssignAgentsModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Network agent assignment functions
  const openNetworkAgentModal = (network: CompanyNetwork) => {
    setSelectedNetwork(network);
    setIsNetworkAgentModalOpen(true);
  };

  const toggleNetworkAgentAccess = (networkId: string, agentId: string) => {
    setNetworkAgentPermissions(prev => {
      const currentPermissions = prev[networkId] || [];
      const hasAccess = currentPermissions.includes(agentId);
      
      if (hasAccess) {
        // Remove access
        return {
          ...prev,
          [networkId]: currentPermissions.filter(id => id !== agentId)
        };
      } else {
        // Grant access
        return {
          ...prev,
          [networkId]: [...currentPermissions, agentId]
        };
      }
    });
  };

  const saveNetworkAgentPermissions = () => {
    if (!selectedNetwork) return;
    
    // In production, this would make an API call to save permissions
    const assignedAgents = networkAgentPermissions[selectedNetwork.id] || [];
    
    toast.success(`Agent permissions updated for ${selectedNetwork.name}! Assigned ${assignedAgents.length} agents.`);
    setIsNetworkAgentModalOpen(false);
    setSelectedNetwork(null);
  };

  const toggleAgentAssignment = (agentId: string) => {
    setAssignedAgentIds(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map(agent =>
      agent.id === agentId ? { ...agent, isEnabled: !agent.isEnabled } : agent
    ));
    
    const agent = agents.find(a => a.id === agentId);
    toast.success(`${agent?.name} ${agent?.isEnabled ? 'disabled' : 'enabled'} for company`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (window.confirm(`Are you sure you want to delete ${user?.displayName}?`)) {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const extractBrandingFromWebsite = async (websiteUrl: string) => {
    try {
      toast.loading('Analyzing website for branding...', { id: 'branding-extraction' });
      
      // Simulate API call to extract branding (in production, this would call a backend service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted branding data (in production, this would come from the API)
      const extractedBranding = {
        logo: `https://logo.clearbit.com/${new URL(websiteUrl).hostname}`,
        primaryColor: getRandomColor(),
        secondaryColor: getRandomColor()
      };
      
      setCompanyBranding({
        logo: extractedBranding.logo,
        primaryColor: extractedBranding.primaryColor,
        secondaryColor: extractedBranding.secondaryColor
      });
      
      toast.success('Branding extracted successfully!', { id: 'branding-extraction' });
    } catch (error) {
      toast.error('Failed to extract branding. Please try manually.', { id: 'branding-extraction' });
    }
  };

  const getRandomColor = () => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!userProfile || userProfile.role === 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-soft border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Company Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userProfile?.organizationName} Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your company's users and agent access
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Company Users" 
            value={stats.totalUsers} 
            icon={UsersIcon} 
            iconColor="text-blue-500" 
          />
          <StatCard 
            title="Active Agents" 
            value={stats.activeAgents} 
            icon={CpuChipIcon} 
            iconColor="text-purple-500" 
          />
          <StatCard 
            title="Total Interactions" 
            value={stats.totalInteractions} 
            icon={ChartBarIcon} 
            iconColor="text-green-500" 
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.pendingRequests} 
            icon={Cog6ToothIcon} 
            iconColor="text-yellow-500" 
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UsersIcon className="w-5 h-5 inline mr-2" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'agents'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CpuChipIcon className="w-5 h-5 inline mr-2" />
                Agent Library
              </button>
              <button
                onClick={() => setActiveTab('networks')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'networks'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
                Networks
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'branding'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SwatchIcon className="w-5 h-5 inline mr-2" />
                Company Branding
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search and Actions */}
            {(activeTab === 'users' || activeTab === 'agents' || activeTab === 'networks') && (
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'users' ? 'Search users...' : 
                      activeTab === 'agents' ? 'Search agents...' : 
                      'Search networks...'
                    }
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {activeTab === 'users' && (
                  <button
                    onClick={() => setIsCreateUserModalOpen(true)}
                    className="btn-primary flex items-center space-x-2 ml-4"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add User</span>
                  </button>
                )}
                {activeTab === 'networks' && (
                  <button
                    onClick={() => setIsCreateNetworkModalOpen(true)}
                    className="btn-primary flex items-center space-x-2 ml-4"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Network</span>
                  </button>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Agents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'company_admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.assignedAgents.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.assignedAgents.map(agentId => (
                                <span key={agentId} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                  {agents.find(a => a.id === agentId)?.name || agentId}
                                </span>
                              ))}
                            </div>
                          ) : (
                            'None'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openAssignAgentsModal(user)}
                            className="text-brand-600 hover:text-brand-900 mr-4"
                            title="Assign Agents"
                          >
                            <Cog6ToothIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{agent.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <span className="text-sm text-gray-500">{agent.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAgentStatus(agent.id)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                          agent.isEnabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {agent.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{agent.assignedUsers} users assigned</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Networks Tab */}
            {activeTab === 'networks' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networks.map((network) => (
                    <motion.div
                      key={network.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-medium transition-all duration-200"
                    >
                      {/* Network Header */}
                      <div className="flex items-center justify-between mb-4">
                        <Link 
                          to={`/network-admin?network=${network.id}&company=${userProfile?.organizationId}`}
                          className="flex items-center space-x-3 hover:bg-white rounded-lg p-2 -m-2 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {network.type === 'region' ? <MapIcon className="w-5 h-5" /> : 
                             network.type === 'business_unit' ? <BuildingOfficeIcon className="w-5 h-5" /> : 
                             <GlobeAmericasIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                              {network.name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">{network.type.replace('_', ' ')}</p>
                            <p className="text-xs text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to manage network →
                            </p>
                          </div>
                        </Link>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          network.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {network.status}
                        </span>
                      </div>

                      {/* Network Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{network.userCount}</div>
                          <div className="text-sm text-gray-500">Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{network.agentCount}</div>
                          <div className="text-sm text-gray-500">Agents</div>
                        </div>
                      </div>

                      {/* Network Admin */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-1">Network Admin</div>
                        <div className="text-sm text-gray-900">{network.adminName}</div>
                        <div className="text-xs text-gray-500">{network.adminEmail}</div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4">{network.description}</p>

                      {/* Agent Assignment Info */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Assigned Agents</div>
                        <div className="flex flex-wrap gap-1">
                          {(networkAgentPermissions[network.id] || []).length > 0 ? (
                            networkAgentPermissions[network.id].map(agentId => (
                              <span key={agentId} className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                {agentId.replace('-', ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No agents assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openNetworkAgentModal(network)}
                          className="btn-primary text-sm px-3 py-1 flex-1"
                        >
                          Assign Agents
                        </button>
                        <button className="btn-outline text-sm px-3 py-1">
                          Settings
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions for Networks */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Network Management</p>
                      <p>Networks allow you to organize users by business unit, region, or department. Each network can have its own admin and customized agent access.</p>
                      <div className="mt-2 space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          View Agent Library →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Branding Tab */}
            {activeTab === 'branding' && (
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Branding</h3>
                  <p className="text-gray-600">Customize your company's appearance across the Agent Hub</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Branding Form */}
                  <div className="space-y-6">
                    {/* Auto-Extract Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Auto-Extract Branding
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Paste your company website URL to automatically extract colors and logo
                      </p>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const websiteUrl = formData.get('websiteUrl') as string;
                        if (websiteUrl) {
                          extractBrandingFromWebsite(websiteUrl);
                        }
                      }}>
                        <div className="flex space-x-3">
                          <input
                            type="url"
                            name="websiteUrl"
                            className="input-field flex-1"
                            placeholder="https://yourcompany.com"
                            required
                          />
                          <button
                            type="submit"
                            className="btn-primary px-6 py-2 text-sm whitespace-nowrap flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Extract</span>
                          </button>
                        </div>
                      </form>
                      <div className="mt-3 text-xs text-gray-500">
                        ✨ AI-powered extraction of your website's colors, fonts, and logo
                      </div>
                    </div>

                    {/* Logo Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Company Logo</h4>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm">
                              <p className="font-medium text-blue-900 mb-1">Logo Guidelines:</p>
                              <ul className="text-blue-700 space-y-1">
                                <li>• <strong>Optimal size:</strong> 200x200px minimum (square preferred)</li>
                                <li>• <strong>Best formats:</strong> PNG (transparent) or SVG</li>
                                <li>• <strong>File size:</strong> Keep under 500KB</li>
                                <li>• <strong>Design tip:</strong> Simple, high-contrast logos work best</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                          <input
                            type="url"
                            className="input-field"
                            value={companyBranding.logo}
                            onChange={(e) => setCompanyBranding({
                              ...companyBranding, 
                              logo: e.target.value
                            })}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        
                        {companyBranding.logo && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Logo Preview & Auto-Sizing</span>
                              <span className="text-xs text-gray-500">Responsive display sizes</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              {/* Extra small (mobile nav) */}
                              <div className="text-center">
                                <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                                  <img 
                                    src={companyBranding.logo} 
                                    alt="Logo xs" 
                                    className="w-6 h-6 object-contain mx-auto"
                                    style={{ 
                                      maxWidth: '24px', 
                                      maxHeight: '24px',
                                      objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">Mobile (24px)</span>
                              </div>
                              
                              {/* Small (header) */}
                              <div className="text-center">
                                <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                                  <img 
                                    src={companyBranding.logo} 
                                    alt="Logo small" 
                                    className="w-8 h-8 object-contain mx-auto"
                                    style={{ 
                                      maxWidth: '32px', 
                                      maxHeight: '32px',
                                      objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">Header (32px)</span>
                              </div>
                              
                              {/* Medium (cards) */}
                              <div className="text-center">
                                <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                                  <img 
                                    src={companyBranding.logo} 
                                    alt="Logo medium" 
                                    className="w-12 h-12 object-contain mx-auto"
                                    style={{ 
                                      maxWidth: '48px', 
                                      maxHeight: '48px',
                                      objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">Cards (48px)</span>
                              </div>
                              
                              {/* Large (dashboard) */}
                              <div className="text-center">
                                <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                                  <img 
                                    src={companyBranding.logo} 
                                    alt="Logo large" 
                                    className="w-16 h-16 object-contain mx-auto"
                                    style={{ 
                                      maxWidth: '64px', 
                                      maxHeight: '64px',
                                      objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">Dashboard (64px)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color Palette Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Color Palette</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                              value={companyBranding.primaryColor}
                              onChange={(e) => setCompanyBranding({
                                ...companyBranding, 
                                primaryColor: e.target.value
                              })}
                            />
                            <input
                              type="text"
                              className="input-field flex-1"
                              value={companyBranding.primaryColor}
                              onChange={(e) => setCompanyBranding({
                                ...companyBranding, 
                                primaryColor: e.target.value
                              })}
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                              value={companyBranding.secondaryColor}
                              onChange={(e) => setCompanyBranding({
                                ...companyBranding, 
                                secondaryColor: e.target.value
                              })}
                            />
                            <input
                              type="text"
                              className="input-field flex-1"
                              value={companyBranding.secondaryColor}
                              onChange={(e) => setCompanyBranding({
                                ...companyBranding, 
                                secondaryColor: e.target.value
                              })}
                              placeholder="#1E40AF"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => {
                            // Save branding and create/update company page
                            const companySlug = userProfile?.organizationId || 'company';
                            
                            // In production, this would save to backend and create the company page
                            localStorage.setItem(`company-branding-${companySlug}`, JSON.stringify({
                              name: userProfile?.organizationName,
                              logo: companyBranding.logo,
                              primaryColor: companyBranding.primaryColor,
                              secondaryColor: companyBranding.secondaryColor,
                              domain: userProfile?.organizationId?.replace('-', '.') || 'company.com'
                            }));
                            
                            toast.success('Company branding updated successfully!');
                            toast.success(`Company page created/updated: /company/${companySlug}`, {
                              duration: 4000,
                              icon: '🏢'
                            });
                          }}
                          className="btn-primary"
                        >
                          Save Branding & Update Company Page
                        </button>
                        
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-green-700">
                              <p className="font-medium">Company Page URL:</p>
                              <p className="font-mono">
                                /company/{userProfile?.organizationId || 'company'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Preview</h4>
                    
                    {/* Header Preview */}
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {companyBranding.logo ? (
                            <img 
                              src={companyBranding.logo} 
                              alt="Company logo" 
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div 
                              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: companyBranding.primaryColor }}
                            >
                              {userProfile?.organizationName?.charAt(0) || 'C'}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">
                            {userProfile?.organizationName} Agent Hub
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Button Preview */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Button Styles</h5>
                      <div className="flex space-x-3">
                        <button 
                          className="px-4 py-2 text-white rounded-lg font-medium"
                          style={{ backgroundColor: companyBranding.primaryColor }}
                        >
                          Primary Button
                        </button>
                        <button 
                          className="px-4 py-2 text-white rounded-lg font-medium"
                          style={{ backgroundColor: companyBranding.secondaryColor }}
                        >
                          Secondary Button
                        </button>
                      </div>
                    </div>

                    {/* Card Preview */}
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">Agent Card Style</h5>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <h6 className="font-semibold text-gray-900">Sample Agent</h6>
                            <p className="text-sm text-gray-500">AI Assistant</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">This is how your agents will appear to users.</p>
                        <button 
                          className="w-full py-2 text-white rounded font-medium text-sm"
                          style={{ backgroundColor: companyBranding.primaryColor }}
                        >
                          Launch Agent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder={`user@${userProfile?.organizationId.replace('-', '.')}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="input-field mt-1"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'company_admin'})}
                >
                  <option value="user">User</option>
                  <option value="company_admin">Company Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsCreateUserModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreateUser} className="btn-primary">Add User</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Agents Modal */}
      {isAssignAgentsModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assign Agents to {selectedUser.displayName}
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {agents.filter(agent => agent.isEnabled).map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAgentAssignment(agent.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      assignedAgentIds.includes(agent.id)
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {assignedAgentIds.includes(agent.id) ? (
                      <span className="flex items-center"><CheckIcon className="w-4 h-4 mr-1" /> Assigned</span>
                    ) : (
                      'Assign'
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAssignAgentsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAssignAgents} className="btn-primary">Save Assignments</button>
            </div>
          </div>
        </div>
      )}

      {/* Network Agent Assignment Modal */}
      {isNetworkAgentModalOpen && selectedNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assign Agents to {selectedNetwork.name}
            </h2>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Company Admin Agent Control</p>
                  <p>Assign agents from your company's available agents to this network. Only agents granted by the Super Admin are available for assignment.</p>
                </div>
              </div>
            </div>

            {/* Available Company Agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companyAvailableAgents.map((agentId) => {
                const agent = {
                  id: agentId,
                  name: agentId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                  icon: agentId === 'briefing-agent' ? '📄' : 
                        agentId === 'analytics-agent' ? '📊' : 
                        agentId === 'research-agent' ? '🔍' : 
                        agentId === 'writing-agent' ? '✍️' : '🤖',
                  category: agentId === 'briefing-agent' ? 'Productivity' : 
                           agentId === 'analytics-agent' ? 'Analytics' : 
                           agentId === 'research-agent' ? 'Research' : 
                           agentId === 'writing-agent' ? 'Productivity' : 'General',
                  description: agentId === 'briefing-agent' ? 'Summarizes documents and creates briefings' : 
                              agentId === 'analytics-agent' ? 'Analyzes data and generates insights' : 
                              agentId === 'research-agent' ? 'Conducts comprehensive research' : 
                              agentId === 'writing-agent' ? 'Content creation and writing assistance' : 'General purpose AI agent',
                  tier: 'free'
                };
                const hasAccess = networkAgentPermissions[selectedNetwork.id]?.includes(agentId) || false;
                
                return (
                  <div key={agentId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{agent.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{agent.category}</span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Available
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleNetworkAgentAccess(selectedNetwork.id, agentId)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasAccess
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {hasAccess ? '✓ Assigned' : 'Assign to Network'}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                    
                    {hasAccess && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500 mb-2">Network Permission:</div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>• Available to network users</span>
                          <span>• Can be assigned by network admin</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {companyAvailableAgents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Available</h3>
                <p className="text-gray-600">
                  Your Super Admin hasn't granted any agents to this company yet. Contact them to request access to agents.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsNetworkAgentModalOpen(false)} 
                className="btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={saveNetworkAgentPermissions} 
                className="btn-primary"
              >
                Save Agent Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
