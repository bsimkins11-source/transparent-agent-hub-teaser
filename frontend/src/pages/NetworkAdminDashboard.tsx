import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  BuildingOfficeIcon,
  MapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyBrandingFromRoute } from '../contexts/CompanyBrandingContext';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';
import { Network, NetworkUser } from '../types/organization';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import LibrarySidebar from '../components/LibrarySidebar';
import { NewAgentRequest, getNetworkNewAgentRequests, updateNewAgentRequestStatus } from '../services/newAgentRequestService';

export default function NetworkAdminDashboard() {
  const { companySlug, networkSlug } = useParams<{ companySlug: string; networkSlug: string }>();
  const { userProfile } = useAuth();
  const { companyBranding, loading: brandingLoading } = useCompanyBrandingFromRoute();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [network, setNetwork] = useState<Network | null>(null);
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'new_agent_requests' | 'settings'>('users');
  const [loading, setLoading] = useState(true);
  
  // User management state
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isAssignAgentsModalOpen, setIsAssignAgentsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null);
  const [assignedAgentIds, setAssignedAgentIds] = useState<string[]>([]);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    role: 'user' as 'user' | 'network_admin'
  });

  // User agent assignment state
  const [isAssignUserAgentsModalOpen, setIsAssignUserAgentsModalOpen] = useState(false);
  const [selectedUserForAgents, setSelectedUserForAgents] = useState<NetworkUser | null>(null);
  const [networkAvailableAgents, setNetworkAvailableAgents] = useState<string[]>([]);
  const [userAgentAssignments, setUserAgentAssignments] = useState<{[userId: string]: string[]}>({});

  // New agent requests state
  const [newAgentRequests, setNewAgentRequests] = useState<NewAgentRequest[]>([]);
  const [isReviewRequestModalOpen, setIsReviewRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<NewAgentRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAgents: 0,
    totalInteractions: 0,
    pendingRequests: 0,
    newAgentRequests: 0
  });

  useEffect(() => {
    loadNetworkData();
    loadUsers();
    loadAgents();
    loadNewAgentRequests();
  }, [companySlug, networkSlug]);

  const loadNetworkData = async () => {
    // Mock network data - in production, this would fetch from backend
    const mockNetwork: Network = {
      id: `${companySlug}-${networkSlug}`,
      name: getNetworkDisplayName(networkSlug || ''),
      slug: networkSlug || '',
      type: getNetworkType(networkSlug || ''),
      organizationId: companySlug || '',
      adminEmail: userProfile?.email || '',
      adminName: userProfile?.displayName || '',
      description: `${getNetworkDisplayName(networkSlug || '')} business unit with specialized AI agents and workflows.`,
      userCount: 15,
      agentCount: 6,
      enabledAgents: ['briefing-agent', 'analytics-agent', 'research-agent'],
      createdAt: '2024-01-15',
      status: 'active',
      settings: {
        allowUserSelfRegistration: false,
        requireApprovalForAgentAccess: true,
        customBranding: true,
        maxUsers: 50,
        maxAgents: 10
      }
    };
    
    setNetwork(mockNetwork);
    setLoading(false);
  };

  const getNetworkDisplayName = (slug: string): string => {
    const names: { [key: string]: string } = {
      'north-america': 'North America',
      'emea': 'EMEA',
      'apac': 'Asia Pacific',
      'manufacturing': 'Manufacturing',
      'sales': 'Sales',
      'marketing': 'Marketing',
      'engineering': 'Engineering',
      'finance': 'Finance',
      'hr': 'Human Resources'
    };
    return names[slug] || slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getNetworkType = (slug: string): 'business_unit' | 'region' | 'department' | 'custom' => {
    const regions = ['north-america', 'emea', 'apac', 'latam'];
    const departments = ['manufacturing', 'sales', 'marketing', 'engineering', 'finance', 'hr'];
    
    if (regions.includes(slug)) return 'region';
    if (departments.includes(slug)) return 'business_unit';
    return 'custom';
  };

  const loadUsers = async () => {
    // Mock users data
    const mockUsers: NetworkUser[] = [
      {
        id: 'user1',
        email: 'john.doe@company.com',
        displayName: 'John Doe',
        role: 'user',
        networkId: `${companySlug}-${networkSlug}`,
        organizationId: companySlug || '',
        assignedAgents: ['briefing-agent', 'research-agent'],
        lastLogin: '2024-01-15',
        status: 'active',
        createdAt: '2024-01-10'
      },
      {
        id: 'user2',
        email: 'jane.smith@company.com',
        displayName: 'Jane Smith',
        role: 'user',
        networkId: `${companySlug}-${networkSlug}`,
        organizationId: companySlug || '',
        assignedAgents: ['analytics-agent'],
        lastLogin: '2024-01-14',
        status: 'active',
        createdAt: '2024-01-08'
      }
    ];
    
    setUsers(mockUsers);
    setStats(prev => ({ ...prev, totalUsers: mockUsers.length }));
    
    // Initialize user agent assignments
    const initialUserAssignments: {[userId: string]: string[]} = {};
    mockUsers.forEach(user => {
      initialUserAssignments[user.id] = user.assignedAgents;
    });
    setUserAgentAssignments(initialUserAssignments);
  };

  const loadAgents = async () => {
    // Mock agents data
    const mockAgents = [
      { id: 'briefing-agent', name: 'Briefing Agent', description: 'Summarizes documents', icon: '📄', category: 'Productivity', isEnabled: true, assignedUsers: 1 },
      { id: 'analytics-agent', name: 'Analytics Agent', description: 'Analyzes data', icon: '📊', category: 'Analytics', isEnabled: true, assignedUsers: 1 },
      { id: 'research-agent', name: 'Research Agent', description: 'Conducts research', icon: '🔍', category: 'Research', isEnabled: true, assignedUsers: 1 },
      { id: 'interview-agent', name: 'Interview Agent', description: 'Conducts interviews', icon: '🎤', category: 'HR', isEnabled: false, assignedUsers: 0 }
    ];
    
    setAgents(mockAgents);
    
    // Set network available agents (agents assigned to this network by Company Admin)
    const availableAgentIds = ['briefing-agent', 'analytics-agent', 'research-agent']; // Mock: from company admin assignments
    setNetworkAvailableAgents(availableAgentIds);
    
    setStats(prev => ({ 
      ...prev, 
      activeAgents: mockAgents.filter(a => a.isEnabled).length,
      totalInteractions: 127,
      pendingRequests: 2
    }));
  };

  const loadNewAgentRequests = async () => {
    if (!companySlug || !networkSlug) return;
    
    try {
      const requests = await getNetworkNewAgentRequests(companySlug, networkSlug);
      setNewAgentRequests(requests);
      setStats(prev => ({ ...prev, newAgentRequests: requests.length }));
    } catch (error) {
      console.error('Error loading new agent requests:', error);
      toast.error('Failed to load new agent requests');
    }
  };

  const handleReviewRequest = (request: NewAgentRequest) => {
    setSelectedRequest(request);
    setReviewNotes('');
    setIsReviewRequestModalOpen(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !userProfile) return;
    
    try {
      await updateNewAgentRequestStatus(
        selectedRequest.id!,
        'approved',
        userProfile.uid || '',
        userProfile.email || '',
        userProfile.displayName || '',
        reviewNotes
      );
      
      // Update local state
      setNewAgentRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'approved', reviewNotes, reviewedAt: new Date().toISOString() }
            : req
        )
      );
      
      toast.success(`Approved new agent request: ${selectedRequest.agentName}`);
      setIsReviewRequestModalOpen(false);
      setSelectedRequest(null);
      setReviewNotes('');
      
      // Reload stats
      loadNewAgentRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleDenyRequest = async () => {
    if (!selectedRequest || !userProfile) return;
    
    try {
      await updateNewAgentRequestStatus(
        selectedRequest.id!,
        'denied',
        userProfile.uid || '',
        userProfile.email || '',
        userProfile.displayName || '',
        reviewNotes
      );
      
      // Update local state
      setNewAgentRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'denied', reviewNotes, reviewedAt: new Date().toISOString() }
            : req
        )
      );
      
      toast.success(`Denied new agent request: ${selectedRequest.agentName}`);
      setIsReviewRequestModalOpen(false);
      setSelectedRequest(null);
      setReviewNotes('');
      
      // Reload stats
      loadNewAgentRequests();
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.displayName) {
      toast.error('Email and Display Name are required');
      return;
    }

    const user: NetworkUser = {
      id: `user-${Date.now()}`,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      networkId: `${companySlug}-${networkSlug}`,
      organizationId: companySlug || '',
      assignedAgents: [],
      lastLogin: 'Never',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setUsers([...users, user]);
    toast.success('Network user created successfully!');
    
    // Reset form
    setNewUser({ email: '', displayName: '', role: 'user' });
    setIsCreateUserModalOpen(false);
  };

  // User agent assignment functions
  const openUserAgentAssignmentModal = (user: NetworkUser) => {
    setSelectedUserForAgents(user);
    setIsAssignUserAgentsModalOpen(true);
  };

  const toggleUserAgentAssignment = (userId: string, agentId: string) => {
    setUserAgentAssignments(prev => {
      const currentAssignments = prev[userId] || [];
      const hasAgent = currentAssignments.includes(agentId);
      
      if (hasAgent) {
        // Remove agent
        return {
          ...prev,
          [userId]: currentAssignments.filter(id => id !== agentId)
        };
      } else {
        // Add agent
        return {
          ...prev,
          [userId]: [...currentAssignments, agentId]
        };
      }
    });
  };

  const saveUserAgentAssignments = () => {
    if (!selectedUserForAgents) return;
    
    // Update the users list with new assignments
    setUsers(users.map(user => 
      user.id === selectedUserForAgents.id 
        ? { ...user, assignedAgents: userAgentAssignments[user.id] || [] }
        : user
    ));
    
    const assignedCount = userAgentAssignments[selectedUserForAgents.id]?.length || 0;
    toast.success(`Updated agent assignments for ${selectedUserForAgents.displayName}! ${assignedCount} agents assigned.`);
    
    setIsAssignUserAgentsModalOpen(false);
    setSelectedUserForAgents(null);
  };

  const getAgentAssignmentType = (agentId: string) => {
    // Define which agents require approval vs direct assignment
    const directAssignAgents = ['briefing-agent', 'analytics-agent']; // Basic agents
    const approvalRequiredAgents = ['research-agent', 'interview-agent']; // Advanced agents
    
    if (directAssignAgents.includes(agentId)) {
      return 'direct';
    } else if (approvalRequiredAgents.includes(agentId)) {
      return 'approval';
    }
    return 'direct';
  };

  const handleNavigateToAgentLibrary = () => {
    // Check if company has only one network - if so, go to company agent library
    // Otherwise, go to network-specific agent library
    // For now, we'll simulate checking network count from the company
    const companyNetworkCount = 3; // This would come from API in production
    
    if (companyNetworkCount <= 1) {
      navigate(`/company/${companySlug}`);
    } else {
      navigate(`/company/${companySlug}/network/${networkSlug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-soft border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Network Not Found</h2>
          <p className="text-gray-600">The requested network could not be found.</p>
        </div>
      </div>
    );
  }

  return (
            <div className="min-h-screen bg-gray-50">
      {/* Library Sidebar */}
      <LibrarySidebar 
        currentLibrary="network"
        companySlug={companySlug}
        networkSlug={networkSlug}
      />
      
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
        {/* Header */}
        <div className="mb-8">
          {/* Company and Network Breadcrumb */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span>{companySlug}</span>
              <span>/</span>
              <MapIcon className="w-4 h-4" />
              <span className="font-medium text-gray-900">{network.name}</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              network.type === 'region' ? 'bg-blue-100 text-blue-800' :
              network.type === 'business_unit' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {network.type.replace('_', ' ')}
            </span>
          </div>
          
          {/* Company Logo and Network Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Company Logo */}
              {companyBranding?.logo ? (
                <div className="relative">
                  <img 
                    src={companyBranding.logo} 
                    alt={companyBranding.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-lg"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback initials */}
                  <div 
                    className="hidden w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, var(--company-primary), var(--company-secondary))`
                    }}
                  >
                    {companyBranding.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>
                </div>
              ) : (
                // Fallback initials when no logo
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{
                    background: companyBranding 
                      ? `linear-gradient(135deg, var(--company-primary), var(--company-secondary))`
                      : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  }}
                >
                  {companyBranding?.name?.split(' ').map(word => word[0]).join('').toUpperCase() || 'N'}
                </div>
              )}
              
              <div>
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{
                    color: companyBranding ? 'var(--company-primary)' : '#111827'
                  }}
                >
                  {network.name} Network Admin
                </h1>
                <p className="text-lg text-gray-600">
                  Manage users and agents for the {network.name} network
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNavigateToAgentLibrary}
              className="btn-primary flex items-center space-x-2"
              style={{
                background: companyBranding 
                  ? `linear-gradient(135deg, var(--company-primary), var(--company-secondary))`
                  : undefined
              }}
            >
              <CpuChipIcon className="w-5 h-5" />
              <span>Agent Library</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Network Users" 
            value={stats.totalUsers} 
            icon={<UsersIcon className="w-6 h-6" />} 
            color="text-blue-500" 
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Active Agents" 
            value={stats.activeAgents} 
            icon={<CpuChipIcon className="w-6 h-6" />} 
            color="text-purple-500" 
            bgColor="bg-purple-50"
          />
          <StatCard 
            title="Interactions" 
            value={stats.totalInteractions} 
            icon={<ChartBarIcon className="w-6 h-6" />} 
            color="text-green-500" 
            bgColor="bg-green-50"
          />
          <StatCard 
            title="New Agent Requests" 
            value={stats.newAgentRequests} 
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} 
            color="text-yellow-500" 
            bgColor="bg-yellow-50"
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
                Network Users
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
                Agent Access
              </button>
              <button
                onClick={() => setActiveTab('new_agent_requests')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'new_agent_requests'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
                New Agent Requests
                {stats.newAgentRequests > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    {stats.newAgentRequests}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5 inline mr-2" />
                Network Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search network users..."
                      className="input-field pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setIsCreateUserModalOpen(true)}
                    className="btn-primary flex items-center space-x-2 ml-4"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add User to Network</span>
                  </button>
                </div>

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
                              user.role === 'network_admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
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
                              onClick={() => openUserAgentAssignmentModal(user)}
                              className="text-brand-600 hover:text-brand-900 mr-4" 
                              title="Assign Agents"
                            >
                              <Cog6ToothIcon className="w-5 h-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Remove from Network">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Access Control</h3>
                  <p className="text-gray-600">Manage which agents are available to users in this network.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <div key={agent.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{agent.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                            <span className="text-sm text-gray-500">{agent.category}</span>
                          </div>
                        </div>
                        <button
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Agent Requests Tab */}
            {activeTab === 'new_agent_requests' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">New Agent Requests</h3>
                  <p className="text-gray-600">Review and manage requests for new AI agents from network users.</p>
                </div>

                {newAgentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No New Agent Requests</h3>
                    <p className="text-gray-600">Users haven't requested any new agents yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newAgentRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{request.agentName}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'denied' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                request.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.priority}
                              </span>
                            </div>
                            
                            {/* Submitter and Date Info - More Prominent */}
                            <div className="flex items-center space-x-4 mb-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <UsersIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  <span className="font-medium">Submitted by:</span> {request.userName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600">
                                  <span className="font-medium">Date:</span> {new Date(request.requestedAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Category:</span> {request.category || 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Target Users:</span> {request.targetUsers || 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Expected Usage:</span> {request.expectedUsage || 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {request.userEmail}
                              </div>
                            </div>
                          </div>
                          
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleReviewRequest(request)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Review Request
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Description</h5>
                            <p className="text-sm text-gray-600">{request.agentDescription}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Use Case</h5>
                            <p className="text-sm text-gray-600">{request.useCase}</p>
                          </div>
                          
                          {request.businessJustification && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-1">Business Justification</h5>
                              <p className="text-sm text-gray-600">{request.businessJustification}</p>
                            </div>
                          )}
                          

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Network Settings</h3>
                  <p className="text-gray-600">Configure settings for the {network.name} network.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Access Control</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Allow User Self-Registration</label>
                          <p className="text-sm text-gray-500">Users can join this network without admin approval</p>
                        </div>
                        <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          network.settings.allowUserSelfRegistration ? 'bg-brand-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            network.settings.allowUserSelfRegistration ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Require Agent Access Approval</label>
                          <p className="text-sm text-gray-500">Network admin must approve agent assignments</p>
                        </div>
                        <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          network.settings.requireApprovalForAgentAccess ? 'bg-brand-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            network.settings.requireApprovalForAgentAccess ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Limits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
                        <input 
                          type="number" 
                          className="input-field" 
                          value={network.settings.maxUsers || ''} 
                          placeholder="Unlimited"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Agents</label>
                        <input 
                          type="number" 
                          className="input-field" 
                          value={network.settings.maxAgents || ''} 
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="btn-primary">Save Network Settings</button>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add User to {network.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@company.com"
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
                <label className="block text-sm font-medium text-gray-700">Network Role</label>
                <select
                  className="input-field mt-1"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'network_admin'})}
                >
                  <option value="user">User</option>
                  <option value="network_admin">Network Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsCreateUserModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreateUser} className="btn-primary">Add to Network</button>
            </div>
          </div>
        </div>
      )}

      {/* User Agent Assignment Modal */}
      {isAssignUserAgentsModalOpen && selectedUserForAgents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assign Agents to {selectedUserForAgents.displayName}
            </h2>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-1">Network Admin User Management</p>
                  <p>Assign agents from your network's available agents to users. Some agents allow direct assignment while others require user approval.</p>
                </div>
              </div>
            </div>

            {/* Available Network Agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {networkAvailableAgents.map((agentId) => {
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
                              agentId === 'writing-agent' ? 'Content creation and writing assistance' : 'General purpose AI agent'
                };
                const isAssigned = userAgentAssignments[selectedUserForAgents.id]?.includes(agentId) || false;
                const assignmentType = getAgentAssignmentType(agentId);
                
                return (
                  <div key={agentId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{agent.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{agent.category}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              assignmentType === 'direct' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignmentType === 'direct' ? 'Direct Assign' : 'Requires Approval'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleUserAgentAssignment(selectedUserForAgents.id, agentId)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isAssigned
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : assignmentType === 'direct'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {isAssigned ? '✓ Assigned' : 
                         assignmentType === 'direct' ? 'Add to Library' : 
                         'Add (Approval Required)'}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                    
                    {assignmentType === 'approval' && (
                      <div className="bg-yellow-50 rounded p-3 mb-3">
                        <div className="text-xs text-yellow-700 mb-1">
                          <strong>Approval Required:</strong> User will receive request notification and must approve before agent is added to their library.
                        </div>
                      </div>
                    )}
                    
                    {isAssigned && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500 mb-2">Assignment Details:</div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>• Available in user library</span>
                          <span>• {assignmentType === 'direct' ? 'Immediate access' : 'Pending user approval'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {networkAvailableAgents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Available</h3>
                <p className="text-gray-600">
                  No agents have been assigned to this network yet. Contact your Company Admin to request agent access.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsAssignUserAgentsModalOpen(false)} 
                className="btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={saveUserAgentAssignments} 
                className="btn-primary"
              >
                Save User Agent Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {isReviewRequestModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review Agent Request: {selectedRequest.agentName}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add your review notes, feedback, or reason for approval/denial..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsReviewRequestModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDenyRequest}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Deny Request
                </button>
                <button
                  onClick={handleApproveRequest}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
