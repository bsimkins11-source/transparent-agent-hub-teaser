import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import toast from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  adminEmail: string;
  adminName: string;
  userCount: number;
  agentCount: number;
  createdAt: string;
  status: 'active' | 'suspended';
  networks?: CompanyNetwork[];
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

export default function SuperAdminDashboard() {
  const { userProfile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isAssignAdminModalOpen, setIsAssignAdminModalOpen] = useState(false);
  const [isAgentPermissionsModalOpen, setIsAgentPermissionsModalOpen] = useState(false);
  const [companyAgentPermissions, setCompanyAgentPermissions] = useState<{[companyId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}>({});
  
  // Network management state
  const [isNetworkPermissionsModalOpen, setIsNetworkPermissionsModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<{company: Company; network: CompanyNetwork} | null>(null);
  const [networkAgentPermissions, setNetworkAgentPermissions] = useState<{[companyId: string]: {[networkId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}}>({});
  
  // Global agent management state
  const [isGlobalAgentModalOpen, setIsGlobalAgentModalOpen] = useState(false);
  const [globalAgentSettings, setGlobalAgentSettings] = useState<{[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}}>({});
  
  // New company form state
  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    adminEmail: '',
    adminName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });

  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalAgents: 0,
    activeCompanies: 0
  });

  useEffect(() => {
    // Mock company data with networks
    const mockCompanies: Company[] = [
      {
        id: 'transparent-partners',
        name: 'Transparent Partners',
        domain: 'transparent.partners',
        logo: '/transparent-partners-logo.png',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        adminEmail: 'bryan.simkins@transparent.partners',
        adminName: 'Bryan Simkins',
        userCount: 15,
        agentCount: 8,
        createdAt: '2024-01-15',
        status: 'active',
        networks: [
          {
            id: 'consulting',
            name: 'Consulting Division',
            slug: 'consulting',
            type: 'business_unit',
            adminEmail: 'consulting.admin@transparent.partners',
            adminName: 'Sarah Johnson',
            description: 'Strategic consulting and advisory services',
            userCount: 8,
            agentCount: 5,
            status: 'active',
            createdAt: '2024-01-20'
          },
          {
            id: 'technology',
            name: 'Technology Division',
            slug: 'technology',
            type: 'business_unit',
            adminEmail: 'tech.admin@transparent.partners',
            adminName: 'Mike Chen',
            description: 'Technology development and innovation',
            userCount: 7,
            agentCount: 6,
            status: 'active',
            createdAt: '2024-01-25'
          }
        ]
      },
      {
        id: 'acme-corp',
        name: 'Acme Corporation',
        domain: 'acme.com',
        primaryColor: '#059669',
        secondaryColor: '#047857',
        adminEmail: 'admin@acme.com',
        adminName: 'John Smith',
        userCount: 25,
        agentCount: 12,
        createdAt: '2024-02-01',
        status: 'active',
        networks: [
          {
            id: 'north-america',
            name: 'North America',
            slug: 'north-america',
            type: 'region',
            adminEmail: 'na.admin@acme.com',
            adminName: 'Lisa Rodriguez',
            description: 'North American operations',
            userCount: 15,
            agentCount: 8,
            status: 'active',
            createdAt: '2024-02-05'
          },
          {
            id: 'manufacturing',
            name: 'Manufacturing',
            slug: 'manufacturing',
            type: 'department',
            adminEmail: 'mfg.admin@acme.com',
            adminName: 'Robert Taylor',
            description: 'Manufacturing and production',
            userCount: 10,
            agentCount: 4,
            status: 'active',
            createdAt: '2024-02-10'
          }
        ]
      }
    ];

    setCompanies(mockCompanies);
    
    // Initialize company agent permissions with assignment types (mock data)
    const initialPermissions: {[companyId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}} = {};
    mockCompanies.forEach(company => {
      initialPermissions[company.id] = {};
      if (company.id === 'transparent-partners') {
        // Transparent Partners gets access to multiple agents with different assignment types
        initialPermissions[company.id]['briefing-agent'] = { granted: true, assignmentType: 'free' };
        initialPermissions[company.id]['analytics-agent'] = { granted: true, assignmentType: 'direct' };
        initialPermissions[company.id]['research-agent'] = { granted: true, assignmentType: 'approval' };
        initialPermissions[company.id]['writing-agent'] = { granted: true, assignmentType: 'direct' };
        initialPermissions[company.id]['gemini-chat-agent'] = { granted: true, assignmentType: 'free' };
        initialPermissions[company.id]['imagen-agent'] = { granted: true, assignmentType: 'approval' };
      } else if (company.id === 'acme-corp') {
        // ACME Corp gets basic agents
        initialPermissions[company.id]['briefing-agent'] = { granted: true, assignmentType: 'free' };
        initialPermissions[company.id]['analytics-agent'] = { granted: true, assignmentType: 'direct' };
      } else {
        // Other companies get basic free agents
        initialPermissions[company.id]['briefing-agent'] = { granted: true, assignmentType: 'free' };
      }
    });
    setCompanyAgentPermissions(initialPermissions);
    
    // Initialize network agent permissions
    const initialNetworkPermissions: {[companyId: string]: {[networkId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}} = {};
    mockCompanies.forEach(company => {
      initialNetworkPermissions[company.id] = {};
      company.networks?.forEach(network => {
        initialNetworkPermissions[company.id][network.id] = {};
        if (company.id === 'transparent-partners') {
          if (network.id === 'consulting') {
            initialNetworkPermissions[company.id][network.id]['briefing-agent'] = { granted: true, assignmentType: 'free' };
            initialNetworkPermissions[company.id][network.id]['research-agent'] = { granted: true, assignmentType: 'direct' };
            initialNetworkPermissions[company.id][network.id]['gemini-chat-agent'] = { granted: true, assignmentType: 'free' };
          } else if (network.id === 'technology') {
            initialNetworkPermissions[company.id][network.id]['analytics-agent'] = { granted: true, assignmentType: 'direct' };
            initialNetworkPermissions[company.id][network.id]['gemini-chat-agent'] = { granted: true, assignmentType: 'free' };
            initialNetworkPermissions[company.id][network.id]['imagen-agent'] = { granted: true, assignmentType: 'approval' };
          }
        } else if (company.id === 'acme-corp') {
          initialNetworkPermissions[company.id][network.id]['briefing-agent'] = { granted: true, assignmentType: 'free' };
          if (network.id === 'north-america') {
            initialNetworkPermissions[company.id][network.id]['analytics-agent'] = { granted: true, assignmentType: 'direct' };
          }
        }
      });
    });
    setNetworkAgentPermissions(initialNetworkPermissions);
    
    // Initialize global agent settings
    const initialGlobalSettings: {[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}} = {
      'briefing-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
      'analytics-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
      'research-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'direct' },
      'writing-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
      'gemini-chat-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
      'imagen-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
      'interview-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
      'legal-agent': { enabled: false, defaultTier: 'enterprise', defaultAssignmentType: 'approval' },
      'finance-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
      'customer-service-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' }
    };
    setGlobalAgentSettings(initialGlobalSettings);
    
    const totalNetworks = mockCompanies.reduce((sum, c) => sum + (c.networks?.length || 0), 0);
    setStats({
      totalCompanies: mockCompanies.length,
      totalUsers: mockCompanies.reduce((sum, c) => sum + c.userCount, 0),
      totalAgents: mockCompanies.reduce((sum, c) => sum + c.agentCount, 0),
      activeCompanies: mockCompanies.filter(c => c.status === 'active').length
    });
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = () => {
    if (!newCompany.name || !newCompany.domain || !newCompany.adminEmail || !newCompany.adminName) {
      toast.error('All fields are required');
      return;
    }

    const company: Company = {
      id: newCompany.domain.replace('.', '-'),
      name: newCompany.name,
      domain: newCompany.domain,
      primaryColor: newCompany.primaryColor,
      secondaryColor: newCompany.secondaryColor,
      adminEmail: newCompany.adminEmail,
      adminName: newCompany.adminName,
      userCount: 1, // Admin user
      agentCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setCompanies([...companies, company]);
    toast.success(`Company "${newCompany.name}" created successfully!`);
    
    // Reset form
    setNewCompany({
      name: '',
      domain: '',
      adminEmail: '',
      adminName: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF'
    });
    setIsCreateCompanyModalOpen(false);
  };

  const handleDeleteCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (window.confirm(`Are you sure you want to delete "${company?.name}"? This action cannot be undone.`)) {
      setCompanies(companies.filter(c => c.id !== companyId));
      toast.success('Company deleted successfully');
    }
  };

  const openCustomizeModal = (company: Company) => {
    setSelectedCompany(company);
    setIsCustomizeModalOpen(true);
  };

  const openAssignAdminModal = (company: Company) => {
    setSelectedCompany(company);
    setIsAssignAdminModalOpen(true);
  };

  const openAgentPermissionsModal = (company: Company) => {
    setSelectedCompany(company);
    setIsAgentPermissionsModalOpen(true);
  };

  const openNetworkPermissionsModal = (company: Company, network: CompanyNetwork) => {
    setSelectedNetwork({ company, network });
    setIsNetworkPermissionsModalOpen(true);
  };

  const openGlobalAgentModal = () => {
    setIsGlobalAgentModalOpen(true);
  };

  const toggleAgentAccess = (companyId: string, agentId: string, assignmentType: 'free' | 'direct' | 'approval') => {
    setCompanyAgentPermissions(prev => {
      const companyPermissions = prev[companyId] || {};
      const currentAgent = companyPermissions[agentId];
      const hasAccess = currentAgent?.granted || false;
      
      return {
        ...prev,
        [companyId]: {
          ...companyPermissions,
          [agentId]: hasAccess 
            ? { granted: false, assignmentType: 'free' } // Remove access
            : { granted: true, assignmentType } // Grant access with specified type
        }
      };
    });
  };

  const toggleNetworkAgentAccess = (companyId: string, networkId: string, agentId: string, assignmentType: 'free' | 'direct' | 'approval') => {
    setNetworkAgentPermissions(prev => {
      const companyPermissions = prev[companyId] || {};
      const networkPermissions = companyPermissions[networkId] || {};
      const currentAgent = networkPermissions[agentId];
      const hasAccess = currentAgent?.granted || false;
      
      return {
        ...prev,
        [companyId]: {
          ...companyPermissions,
          [networkId]: {
            ...networkPermissions,
            [agentId]: hasAccess 
              ? { granted: false, assignmentType: 'free' } // Remove access
              : { granted: true, assignmentType } // Grant access with specified type
          }
        }
      };
    });
  };

  const toggleGlobalAgentSetting = (agentId: string, setting: 'enabled' | 'defaultTier' | 'defaultAssignmentType', value: any) => {
    setGlobalAgentSettings(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        [setting]: value
      }
    }));
  };

  const saveAgentPermissions = () => {
    if (!selectedCompany) return;
    
    // In production, this would make an API call to save permissions
    const companyPermissions = companyAgentPermissions[selectedCompany.id] || {};
    const assignedAgents = Object.entries(companyPermissions).filter(([_, permission]) => permission.granted);
    const agentsByType = assignedAgents.reduce((acc, [agentId, permission]) => {
      if (!acc[permission.assignmentType]) acc[permission.assignmentType] = [];
      acc[permission.assignmentType].push(agentId);
      return acc;
    }, {} as {[key: string]: string[]});
    
    const summary = Object.entries(agentsByType).map(([type, agents]) => 
      `${agents.length} ${type} agent${agents.length !== 1 ? 's' : ''}`
    ).join(', ');
    
    toast.success(`Agent permissions updated for ${selectedCompany.name}! Assigned ${assignedAgents.length} total agents: ${summary}.`);
    setIsAgentPermissionsModalOpen(false);
    setSelectedCompany(null);
  };

  const saveNetworkPermissions = () => {
    if (!selectedNetwork) return;
    
    const networkPermissions = networkAgentPermissions[selectedNetwork.company.id]?.[selectedNetwork.network.id] || {};
    const assignedAgents = Object.entries(networkPermissions).filter(([_, permission]) => permission.granted);
    
    toast.success(`Network permissions updated for ${selectedNetwork.network.name}! Assigned ${assignedAgents.length} agents.`);
    setIsNetworkPermissionsModalOpen(false);
    setSelectedNetwork(null);
  };

  const saveGlobalAgentSettings = () => {
    const enabledAgents = Object.entries(globalAgentSettings).filter(([_, settings]) => settings.enabled).length;
    const disabledAgents = Object.entries(globalAgentSettings).filter(([_, settings]) => !settings.enabled).length;
    
    toast.success(`Global agent settings updated! ${enabledAgents} agents enabled, ${disabledAgents} disabled.`);
    setIsGlobalAgentModalOpen(false);
  };

  const handleUpdateCompanyBranding = () => {
    if (selectedCompany) {
      setCompanies(companies.map(c => 
        c.id === selectedCompany.id ? selectedCompany : c
      ));
      toast.success(`${selectedCompany.name} branding updated!`);
      setIsCustomizeModalOpen(false);
    }
  };

  const extractBrandingFromWebsite = async (websiteUrl: string) => {
    if (!selectedCompany) return;
    
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
      
      setSelectedCompany({
        ...selectedCompany,
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

  const handleAssignAdmin = (adminEmail: string, adminName: string) => {
    if (selectedCompany) {
      setCompanies(companies.map(c => 
        c.id === selectedCompany.id 
          ? { ...c, adminEmail, adminName }
          : c
      ));
      toast.success(`${adminName} assigned as admin for ${selectedCompany.name}`);
      setIsAssignAdminModalOpen(false);
    }
  };

  if (!userProfile || userProfile.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-soft border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Super Admin access required.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage companies, admins, and global system settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Companies" 
            value={stats.totalCompanies} 
            icon={BuildingOfficeIcon} 
            iconColor="text-blue-500" 
          />
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={UsersIcon} 
            iconColor="text-green-500" 
          />
          <StatCard 
            title="Total Agents" 
            value={stats.totalAgents} 
            icon={Cog6ToothIcon} 
            iconColor="text-purple-500" 
          />
          <StatCard 
            title="Active Companies" 
            value={stats.activeCompanies} 
            icon={BuildingOfficeIcon} 
            iconColor="text-emerald-500" 
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Company Management */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Company Management</h3>
              <button
                onClick={() => setIsCreateCompanyModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Company</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">Manage organizations and assign company administrators</p>
            <div className="text-sm text-gray-500">
              {stats.totalCompanies} active companies • {stats.totalUsers} total users
            </div>
          </div>

          {/* Agent Permissions */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Global Agent Permissions</h3>
              <button 
                onClick={openGlobalAgentModal}
                className="btn-secondary flex items-center space-x-2"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Manage Permissions</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">Control which agents are available to companies and networks</p>
            <div className="text-sm text-gray-500">
              {Object.values(globalAgentSettings).filter(s => s.enabled).length} enabled agents • Global permission control
            </div>
          </div>
        </div>

        {/* Company Grid */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-medium transition-all duration-200"
              >
                {/* Company Header */}
                <div className="flex items-center justify-between mb-4">
                  <Link 
                    to={`/admin?company=${company.id}`}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg" />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: company.primaryColor }}
                      >
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500">{company.domain}</p>
                      <p className="text-xs text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to manage company →
                      </p>
                    </div>
                  </Link>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {company.status}
                  </span>
                </div>

                {/* Company Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{company.userCount}</div>
                    <div className="text-sm text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{company.agentCount}</div>
                    <div className="text-sm text-gray-500">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{company.networks?.length || 0}</div>
                    <div className="text-sm text-gray-500">Networks</div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Company Admin</div>
                  <div className="text-sm text-gray-600">{company.adminName}</div>
                  <div className="text-sm text-gray-500">{company.adminEmail}</div>
                </div>

                {/* Networks Section */}
                {company.networks && company.networks.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-2">Networks</div>
                    <div className="space-y-2">
                      {company.networks.slice(0, 2).map((network) => (
                        <div key={network.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-700">{network.name}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              network.type === 'business_unit' ? 'bg-blue-100 text-blue-800' :
                              network.type === 'region' ? 'bg-green-100 text-green-800' :
                              network.type === 'department' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {network.type.replace('_', ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => openNetworkPermissionsModal(company, network)}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Agents
                          </button>
                        </div>
                      ))}
                      {company.networks.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{company.networks.length - 2} more networks
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openAssignAdminModal(company)}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                    >
                      <UsersIcon className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                    <button
                      onClick={() => openCustomizeModal(company)}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                    >
                      <SwatchIcon className="w-4 h-4" />
                      <span>Brand</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => openAgentPermissionsModal(company)}
                    className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-1"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span>Manage Agent Access</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Create Company Modal */}
      {isCreateCompanyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Company</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  placeholder="Acme Corporation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCompany.domain}
                  onChange={(e) => setNewCompany({...newCompany, domain: e.target.value})}
                  placeholder="acme.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={newCompany.adminEmail}
                  onChange={(e) => setNewCompany({...newCompany, adminEmail: e.target.value})}
                  placeholder="admin@acme.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCompany.adminName}
                  onChange={(e) => setNewCompany({...newCompany, adminName: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded-lg border border-gray-300"
                    value={newCompany.primaryColor}
                    onChange={(e) => setNewCompany({...newCompany, primaryColor: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded-lg border border-gray-300"
                    value={newCompany.secondaryColor}
                    onChange={(e) => setNewCompany({...newCompany, secondaryColor: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsCreateCompanyModalOpen(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreateCompany} className="btn-primary">
                Create Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {isAssignAdminModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assign Admin for {selectedCompany.name}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const adminEmail = formData.get('adminEmail') as string;
              const adminName = formData.get('adminName') as string;
              handleAssignAdmin(adminEmail, adminName);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    name="adminEmail"
                    className="input-field"
                    defaultValue={selectedCompany.adminEmail}
                    placeholder="admin@company.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                  <input
                    type="text"
                    name="adminName"
                    className="input-field"
                    defaultValue={selectedCompany.adminName}
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsAssignAdminModalOpen(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Assign Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customize Company Modal */}
      {isCustomizeModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Customize {selectedCompany.name} Branding
            </h2>
            
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
                  Automatically extract colors and logo from the company website
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
                      placeholder="https://company.com"
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary px-6 py-2 text-sm whitespace-nowrap"
                    >
                      Extract Branding
                    </button>
                  </div>
                </form>
              </div>

              {/* Logo Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Logo Recommendations:</p>
                        <ul className="text-blue-700 space-y-1">
                          <li>• <strong>Size:</strong> 200x200px minimum (square format preferred)</li>
                          <li>• <strong>Format:</strong> PNG with transparent background or SVG</li>
                          <li>• <strong>File size:</strong> Under 500KB for best performance</li>
                          <li>• <strong>Style:</strong> Simple, high contrast designs work best</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <input
                    type="url"
                    className="input-field"
                    value={selectedCompany.logo || ''}
                    onChange={(e) => setSelectedCompany({
                      ...selectedCompany, 
                      logo: e.target.value
                    })}
                    placeholder="https://example.com/logo.png"
                  />
                  
                  {selectedCompany.logo && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Logo Preview</span>
                        <span className="text-xs text-gray-500">Auto-resized for optimal display</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Small size (header) */}
                        <div className="text-center">
                          <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                            <img 
                              src={selectedCompany.logo} 
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
                        
                        {/* Medium size (cards) */}
                        <div className="text-center">
                          <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                            <img 
                              src={selectedCompany.logo} 
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
                        
                        {/* Large size (dashboard) */}
                        <div className="text-center">
                          <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                            <img 
                              src={selectedCompany.logo} 
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Palette</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        value={selectedCompany.primaryColor}
                        onChange={(e) => setSelectedCompany({
                          ...selectedCompany, 
                          primaryColor: e.target.value
                        })}
                      />
                      <input
                        type="text"
                        className="input-field flex-1"
                        value={selectedCompany.primaryColor}
                        onChange={(e) => setSelectedCompany({
                          ...selectedCompany, 
                          primaryColor: e.target.value
                        })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        value={selectedCompany.secondaryColor}
                        onChange={(e) => setSelectedCompany({
                          ...selectedCompany, 
                          secondaryColor: e.target.value
                        })}
                      />
                      <input
                        type="text"
                        className="input-field flex-1"
                        value={selectedCompany.secondaryColor}
                        onChange={(e) => setSelectedCompany({
                          ...selectedCompany, 
                          secondaryColor: e.target.value
                        })}
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-4">
                    {selectedCompany.logo ? (
                      <img 
                        src={selectedCompany.logo} 
                        alt="Company logo" 
                        className="w-10 h-10 rounded-lg object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: selectedCompany.primaryColor }}
                      >
                        {selectedCompany.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedCompany.name}</h3>
                      <p className="text-sm text-gray-500">Company Portal</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 text-white rounded-lg font-medium"
                      style={{ backgroundColor: selectedCompany.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-4 py-2 text-white rounded-lg font-medium"
                      style={{ backgroundColor: selectedCompany.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsCustomizeModalOpen(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleUpdateCompanyBranding} className="btn-primary">
                Update Branding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Permissions Modal */}
      {isAgentPermissionsModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Agent Permissions for {selectedCompany.name}
            </h2>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Super Admin Permission Control</p>
                  <p>Choose how agents are made available to company users:</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Free:</strong> Users can add directly to their library without admin approval</li>
                    <li><strong>Direct:</strong> Company/Network admins can assign directly to users</li>
                    <li><strong>Approval:</strong> Users must request access, admin approval required</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Agent Permission Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'briefing-agent', name: 'Briefing Agent', icon: '📄', category: 'Productivity', description: 'Summarizes documents and creates briefings', tier: 'free' },
                { id: 'analytics-agent', name: 'Analytics Agent', icon: '📊', category: 'Analytics', description: 'Analyzes data and generates insights', tier: 'premium' },
                { id: 'research-agent', name: 'Research Agent', icon: '🔍', category: 'Research', description: 'Conducts comprehensive research', tier: 'free' },
                { id: 'writing-agent', name: 'Writing Agent', icon: '✍️', category: 'Productivity', description: 'Content creation and writing assistance', tier: 'free' },
                { id: 'gemini-chat-agent', name: 'Gemini Chat Agent', icon: '🤖', category: 'AI Chat', description: 'Conversational AI powered by Google Gemini', tier: 'free' },
                { id: 'imagen-agent', name: 'Google Imagen Agent', icon: '🎨', category: 'Creative', description: 'AI image generation powered by Google Imagen', tier: 'premium' },
                { id: 'interview-agent', name: 'Interview Agent', icon: '🎤', category: 'HR', description: 'Conducts structured interviews', tier: 'premium' },
                { id: 'legal-agent', name: 'Legal Agent', icon: '⚖️', category: 'Legal', description: 'Legal document analysis', tier: 'enterprise' },
                { id: 'finance-agent', name: 'Finance Agent', icon: '💰', category: 'Finance', description: 'Financial analysis and reporting', tier: 'premium' },
                { id: 'customer-service-agent', name: 'Customer Service Agent', icon: '🎧', category: 'Support', description: 'Customer support and service automation', tier: 'premium' }
              ].map((agent) => {
                const agentPermission = companyAgentPermissions[selectedCompany.id]?.[agent.id];
                const hasAccess = agentPermission?.granted || false;
                const currentAssignmentType = agentPermission?.assignmentType || 'free';
                return (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{agent.category}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            agent.tier === 'free' ? 'bg-green-100 text-green-800' :
                            agent.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {agent.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!hasAccess ? (
                        <button
                          onClick={() => toggleAgentAccess(selectedCompany.id, agent.id, 'free')}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Grant Access
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleAgentAccess(selectedCompany.id, agent.id, 'free')}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Remove Access
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                  
                  {hasAccess && (
                    <div className="space-y-3">
                      {/* Assignment Type Selection */}
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500 mb-2">Assignment Type:</div>
                        <div className="space-y-2">
                          {['free', 'direct', 'approval'].map((type) => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`assignment-${agent.id}`}
                                value={type}
                                checked={currentAssignmentType === type}
                                onChange={() => toggleAgentAccess(selectedCompany.id, agent.id, type as 'free' | 'direct' | 'approval')}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className={`text-xs font-medium ${
                                type === 'free' ? 'text-green-700' :
                                type === 'direct' ? 'text-blue-700' :
                                'text-yellow-700'
                              }`}>
                                {type === 'free' ? '🟢 Free' :
                                 type === 'direct' ? '🔵 Direct Assignment' :
                                 '🟡 Requires Approval'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Permission Summary */}
                      <div className="bg-blue-50 rounded p-3">
                        <div className="text-xs text-blue-700">
                          <strong>
                            {currentAssignmentType === 'free' && '🟢 Free Access: Users can add directly to their library'}
                            {currentAssignmentType === 'direct' && '🔵 Direct Assignment: Admins can assign to users instantly'}
                            {currentAssignmentType === 'approval' && '🟡 Approval Required: Users must request, admin approval needed'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsAgentPermissionsModalOpen(false)} 
                className="btn-secondary"
              >
                Close
              </button>
              <button onClick={saveAgentPermissions} className="btn-primary">
                Save Permission Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Permissions Modal */}
      {isNetworkPermissionsModalOpen && selectedNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Network Agent Permissions: {selectedNetwork.network.name}
            </h2>
            <div className="mb-4 text-sm text-gray-600">
              Company: {selectedNetwork.company.name} • Network Type: {selectedNetwork.network.type.replace('_', ' ')}
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Network-Level Agent Control</p>
                  <p>Assign specific agents to this network within {selectedNetwork.company.name}. Only agents already granted to the company can be assigned to networks.</p>
                </div>
              </div>
            </div>

            {/* Available Company Agents for Network Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'briefing-agent', name: 'Briefing Agent', icon: '📄', category: 'Productivity', description: 'Summarizes documents and creates briefings', tier: 'free' },
                { id: 'analytics-agent', name: 'Analytics Agent', icon: '📊', category: 'Analytics', description: 'Analyzes data and generates insights', tier: 'premium' },
                { id: 'research-agent', name: 'Research Agent', icon: '🔍', category: 'Research', description: 'Conducts comprehensive research', tier: 'free' },
                { id: 'writing-agent', name: 'Writing Agent', icon: '✍️', category: 'Productivity', description: 'Content creation and writing assistance', tier: 'free' },
                { id: 'gemini-chat-agent', name: 'Gemini Chat Agent', icon: '🤖', category: 'AI Chat', description: 'Conversational AI powered by Google Gemini', tier: 'free' },
                { id: 'imagen-agent', name: 'Google Imagen Agent', icon: '🎨', category: 'Creative', description: 'AI image generation powered by Google Imagen', tier: 'premium' }
              ].filter(agent => {
                // Only show agents that are granted to the company
                const companyPermission = companyAgentPermissions[selectedNetwork.company.id]?.[agent.id];
                return companyPermission?.granted;
              }).map((agent) => {
                const networkPermission = networkAgentPermissions[selectedNetwork.company.id]?.[selectedNetwork.network.id]?.[agent.id];
                const hasAccess = networkPermission?.granted || false;
                const currentAssignmentType = networkPermission?.assignmentType || 'free';
                return (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{agent.category}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            agent.tier === 'free' ? 'bg-green-100 text-green-800' :
                            agent.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {agent.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!hasAccess ? (
                        <button
                          onClick={() => toggleNetworkAgentAccess(selectedNetwork.company.id, selectedNetwork.network.id, agent.id, 'free')}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Grant Access
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleNetworkAgentAccess(selectedNetwork.company.id, selectedNetwork.network.id, agent.id, 'free')}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Remove Access
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                  
                  {hasAccess && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500 mb-2">Assignment Type:</div>
                        <div className="space-y-2">
                          {['free', 'direct', 'approval'].map((type) => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`network-assignment-${agent.id}`}
                                value={type}
                                checked={currentAssignmentType === type}
                                onChange={() => toggleNetworkAgentAccess(selectedNetwork.company.id, selectedNetwork.network.id, agent.id, type as 'free' | 'direct' | 'approval')}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className={`text-xs font-medium ${
                                type === 'free' ? 'text-green-700' :
                                type === 'direct' ? 'text-blue-700' :
                                'text-yellow-700'
                              }`}>
                                {type === 'free' ? '🟢 Free' :
                                 type === 'direct' ? '🔵 Direct Assignment' :
                                 '🟡 Requires Approval'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsNetworkPermissionsModalOpen(false)} 
                className="btn-secondary"
              >
                Close
              </button>
              <button onClick={saveNetworkPermissions} className="btn-primary">
                Save Network Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Agent Management Modal */}
      {isGlobalAgentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Global Agent Management
            </h2>
            
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-purple-700">
                  <p className="font-medium mb-1">Super Admin Global Control</p>
                  <p>Configure global agent availability, default tiers, and assignment types. These settings affect all companies and networks.</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Enabled:</strong> Whether the agent is available system-wide</li>
                    <li><strong>Default Tier:</strong> Free (no restrictions), Premium (company controlled), Enterprise (super admin only)</li>
                    <li><strong>Default Assignment:</strong> How agents are assigned by default</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(globalAgentSettings).map(([agentId, settings]) => {
                const agentInfo = {
                  'briefing-agent': { name: 'Briefing Agent', icon: '📄', category: 'Productivity', description: 'Summarizes documents and creates briefings' },
                  'analytics-agent': { name: 'Analytics Agent', icon: '📊', category: 'Analytics', description: 'Analyzes data and generates insights' },
                  'research-agent': { name: 'Research Agent', icon: '🔍', category: 'Research', description: 'Conducts comprehensive research' },
                  'writing-agent': { name: 'Writing Agent', icon: '✍️', category: 'Productivity', description: 'Content creation and writing assistance' },
                  'gemini-chat-agent': { name: 'Gemini Chat Agent', icon: '🤖', category: 'AI Chat', description: 'Conversational AI powered by Google Gemini' },
                  'imagen-agent': { name: 'Google Imagen Agent', icon: '🎨', category: 'Creative', description: 'AI image generation powered by Google Imagen' },
                  'interview-agent': { name: 'Interview Agent', icon: '🎤', category: 'HR', description: 'Conducts structured interviews' },
                  'legal-agent': { name: 'Legal Agent', icon: '⚖️', category: 'Legal', description: 'Legal document analysis' },
                  'finance-agent': { name: 'Finance Agent', icon: '💰', category: 'Finance', description: 'Financial analysis and reporting' },
                  'customer-service-agent': { name: 'Customer Service Agent', icon: '🎧', category: 'Support', description: 'Customer support and service automation' }
                }[agentId] || { name: agentId, icon: '🤖', category: 'Unknown', description: 'Agent description' };

                return (
                  <div key={agentId} className={`border-2 rounded-lg p-4 transition-all ${
                    settings.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{agentInfo.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{agentInfo.name}</h4>
                          <span className="text-sm text-gray-500">{agentInfo.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => toggleGlobalAgentSetting(agentId, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {settings.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{agentInfo.description}</p>
                    
                    {settings.enabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Default Tier</label>
                          <select
                            value={settings.defaultTier}
                            onChange={(e) => toggleGlobalAgentSetting(agentId, 'defaultTier', e.target.value as 'free' | 'premium' | 'enterprise')}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Default Assignment Type</label>
                          <select
                            value={settings.defaultAssignmentType}
                            onChange={(e) => toggleGlobalAgentSetting(agentId, 'defaultAssignmentType', e.target.value as 'free' | 'direct' | 'approval')}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="free">Free (Users can add directly)</option>
                            <option value="direct">Direct (Admin assigns directly)</option>
                            <option value="approval">Approval (Admin approval required)</option>
                          </select>
                        </div>
                        
                        <div className="bg-white rounded p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">
                            <strong>Current Config:</strong> {settings.defaultTier} tier, {settings.defaultAssignmentType} assignment
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsGlobalAgentModalOpen(false)} 
                className="btn-secondary"
              >
                Close
              </button>
              <button onClick={saveGlobalAgentSettings} className="btn-primary">
                Save Global Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
