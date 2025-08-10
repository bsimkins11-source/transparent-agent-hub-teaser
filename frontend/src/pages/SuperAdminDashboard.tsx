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
  PhotoIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AgentManagement from '../components/AgentManagement';
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
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isAssignAdminModalOpen, setIsAssignAdminModalOpen] = useState(false);
  const [isAgentPermissionsModalOpen, setIsAgentPermissionsModalOpen] = useState(false);
  const [isNetworkPermissionsModalOpen, setIsNetworkPermissionsModalOpen] = useState(false);
  const [isGlobalAgentModalOpen, setIsGlobalAgentModalOpen] = useState(false);
  const [isAgentManagementModalOpen, setIsAgentManagementModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalNetworks: 0,
    totalUsers: 0,
    totalAgents: 0,
    activeCompanies: 0
  });
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Additional state variables
  const [companySearchTerm, setCompanySearchTerm] = useState<string>('');
  const [expandedCompanies, setExpandedCompanies] = useState<{[companyId: string]: boolean}>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<{company: Company; network: CompanyNetwork} | null>(null);
  const [networkAgentPermissions, setNetworkAgentPermissions] = useState<{[companyId: string]: {[networkId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}}>({});
  const [companyAgentPermissions, setCompanyAgentPermissions] = useState<{[companyId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}>({});
  const [globalAgentSettings, setGlobalAgentSettings] = useState<{[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}}>({});
  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    adminEmail: '',
    adminName: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF'
  });

  // Check if user has access
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        
        // Load global agent settings from Firestore
        const { getGlobalAgentSettings } = await import('../services/hierarchicalPermissionService');
        const globalSettings = await getGlobalAgentSettings();
        
        if (globalSettings) {
          // Convert from Firestore format to component state format
          const convertedSettings: {[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}} = {};
          Object.entries(globalSettings.settings).forEach(([agentId, setting]) => {
            convertedSettings[agentId] = {
              enabled: setting.enabled,
              defaultTier: setting.defaultTier,
              defaultAssignmentType: setting.defaultAssignmentType
            };
          });
          setGlobalAgentSettings(convertedSettings);
        } else {
          // Initialize with default settings if no global settings exist
          const initialGlobalSettings: {[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}} = {
            // Real Agents (from Firestore)
            'gemini-chat-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
            'google-imagen-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
            
            // Fake Frontend Cards for Testing
            'briefing-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
            'analytics-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
            'research-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'direct' },
            'writing-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
            'code-review-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
            'data-scientist-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
            'social-media-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
            'email-marketing-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
            'seo-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
            'financial-advisor-agent': { enabled: false, defaultTier: 'enterprise', defaultAssignmentType: 'approval' },
            'legal-contract-agent': { enabled: false, defaultTier: 'enterprise', defaultAssignmentType: 'approval' },
            'hr-recruiter-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
            'customer-support-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
            'project-manager-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' }
          };
          setGlobalAgentSettings(initialGlobalSettings);
        }
        
      } catch (error) {
        console.error('Error loading global agent settings:', error);
        setError(`Failed to load global agent settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Set default settings on error
        const fallbackSettings: {[agentId: string]: {enabled: boolean; defaultTier: 'free' | 'premium' | 'enterprise'; defaultAssignmentType: 'free' | 'direct' | 'approval'}} = {
          'gemini-chat-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
          'google-imagen-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
          'briefing-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
          'analytics-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
          'research-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'direct' },
          'writing-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
          'code-review-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
          'data-scientist-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
          'social-media-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
          'email-marketing-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
          'seo-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' },
          'financial-advisor-agent': { enabled: false, defaultTier: 'enterprise', defaultAssignmentType: 'approval' },
          'legal-contract-agent': { enabled: false, defaultTier: 'enterprise', defaultAssignmentType: 'approval' },
          'hr-recruiter-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'approval' },
          'customer-support-agent': { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' },
          'project-manager-agent': { enabled: true, defaultTier: 'premium', defaultAssignmentType: 'direct' }
        };
        setGlobalAgentSettings(fallbackSettings);
      }
    };
    
    loadData();
    
    // Mock company data with networks
    const mockCompanies: Company[] = [
      {
        id: 'transparent-partners',
        name: 'Transparent Partners',
        domain: 'transparent.partners',
        logo: 'https://logo.clearbit.com/transparent.partners',
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
      },
      {
        id: 'acme-branch',
        name: 'Acme Corporation (Branch)',
        domain: 'acme-branch.com',
        logo: 'https://logo.clearbit.com/acme.com',
        primaryColor: '#10B981',
        secondaryColor: '#059669',
        adminEmail: 'admin@acme-branch.com',
        adminName: 'John Smith',
        userCount: 45,
        agentCount: 12,
        createdAt: '2024-01-10',
        status: 'active',
        networks: [
          {
            id: 'sales-team',
            name: 'Sales Team',
            slug: 'sales',
            type: 'department',
            adminEmail: 'sales.admin@acme-branch.com',
            adminName: 'Lisa Chen',
            description: 'Sales and business development',
            userCount: 15,
            agentCount: 4,
            status: 'active',
            icon: '💰'
          },
          {
            id: 'engineering',
            name: 'Engineering',
            slug: 'engineering',
            type: 'department',
            adminEmail: 'eng.admin@acme-branch.com',
            adminName: 'Mike Johnson',
            description: 'Product development and engineering',
            userCount: 25,
            agentCount: 6,
            status: 'active',
            icon: '⚙️'
          },
          {
            id: 'hr-department',
            name: 'HR Department',
            slug: 'hr',
            type: 'department',
            adminEmail: 'hr.admin@acme-branch.com',
            adminName: 'Sarah Wilson',
            description: 'Human resources and talent management',
            userCount: 5,
            agentCount: 2,
            status: 'active',
            icon: '👥'
          }
        ]
      },
      {
        id: 'global-tech',
        name: 'Global Tech Solutions',
        domain: 'globaltech.io',
        logo: 'https://logo.clearbit.com/globaltech.io',
        primaryColor: '#8B5CF6',
        secondaryColor: '#7C3AED',
        adminEmail: 'admin@globaltech.io',
        adminName: 'David Park',
        userCount: 120,
        agentCount: 25,
        createdAt: '2023-12-01',
        status: 'active',
        networks: [
          {
            id: 'north-america',
            name: 'North America',
            slug: 'na',
            type: 'region',
            adminEmail: 'na.admin@globaltech.io',
            adminName: 'Jennifer Lopez',
            description: 'North American operations',
            userCount: 40,
            agentCount: 8,
            status: 'active',
            icon: '🌎'
          },
          {
            id: 'europe',
            name: 'Europe',
            slug: 'eu',
            type: 'region',
            adminEmail: 'eu.admin@globaltech.io',
            adminName: 'Hans Mueller',
            description: 'European operations',
            userCount: 35,
            agentCount: 7,
            status: 'active',
            icon: '🌍'
          },
          {
            id: 'asia-pacific',
            name: 'Asia Pacific',
            slug: 'apac',
            type: 'region',
            adminEmail: 'apac.admin@globaltech.io',
            adminName: 'Kenji Tanaka',
            description: 'Asia Pacific operations',
            userCount: 30,
            agentCount: 6,
            status: 'active',
            icon: '🌏'
          },
          {
            id: 'research-dev',
            name: 'Research & Development',
            slug: 'rd',
            type: 'department',
            adminEmail: 'rd.admin@globaltech.io',
            adminName: 'Dr. Emily Chen',
            description: 'Innovation and research division',
            userCount: 15,
            agentCount: 4,
            status: 'active',
            icon: '🔬'
          }
        ]
      },
      {
        id: 'startup-inc',
        name: 'Startup Inc',
        domain: 'startup.inc',
        logo: null, // Test fallback to initial
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        adminEmail: 'founder@startup.inc',
        adminName: 'Alex Rodriguez',
        userCount: 8,
        agentCount: 3,
        createdAt: '2024-02-01',
        status: 'active',
        networks: [
          {
            id: 'product-team',
            name: 'Product Team',
            slug: 'product',
            type: 'team',
            adminEmail: 'product.admin@startup.inc',
            adminName: 'Maria Garcia',
            description: 'Product development team',
            userCount: 8,
            agentCount: 3,
            status: 'active',
            icon: '🚀'
          }
        ]
      }
    ];

    setCompanies(mockCompanies);
    
    // Calculate and set stats
    const totalNetworks = mockCompanies.reduce((sum, company) => 
      sum + (company.networks?.length || 0), 0
    );
    
    const calculatedStats = {
      totalCompanies: mockCompanies.length,
      totalNetworks: totalNetworks,
      totalUsers: mockCompanies.reduce((sum, c) => sum + c.userCount, 0),
      totalAgents: mockCompanies.reduce((sum, c) => sum + c.agentCount, 0),
      activeCompanies: mockCompanies.filter(c => c.status === 'active').length
    };
    
    setStats(calculatedStats);
    
    // Load real company agent permissions from Firestore
    const loadCompanyPermissions = async () => {
      try {
        const { getCompanyAgentPermissions } = await import('../services/hierarchicalPermissionService');
        const companyPermissions: {[companyId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}} = {};
        
        for (const company of mockCompanies) {
          const permissions = await getCompanyAgentPermissions(company.id);
          if (permissions) {
            // Convert from Firestore format to component state format
            companyPermissions[company.id] = {};
            Object.entries(permissions.permissions).forEach(([agentId, permission]) => {
              companyPermissions[company.id][agentId] = {
                granted: permission.granted,
                assignmentType: permission.assignmentType
              };
            });
          } else {
            // Initialize empty permissions if none exist
            companyPermissions[company.id] = {};
          }
        }
        
        setCompanyAgentPermissions(companyPermissions);
      } catch (error) {
        console.error('Error loading company permissions:', error);
        // Fall back to empty permissions
        const emptyPermissions: {[companyId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}} = {};
        mockCompanies.forEach(company => {
          emptyPermissions[company.id] = {};
        });
        setCompanyAgentPermissions(emptyPermissions);
      }
    };
    
    loadCompanyPermissions();
    
    // Load real network agent permissions from Firestore
    const loadNetworkPermissions = async () => {
      try {
        const { getNetworkAgentPermissions } = await import('../services/hierarchicalPermissionService');
        const networkPermissions: {[companyId: string]: {[networkId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}} = {};
        
        for (const company of mockCompanies) {
          networkPermissions[company.id] = {};
          if (company.networks) {
            for (const network of company.networks) {
              const permissions = await getNetworkAgentPermissions(company.id, network.id);
              if (permissions) {
                // Convert from Firestore format to component state format
                networkPermissions[company.id][network.id] = {};
                Object.entries(permissions.permissions).forEach(([agentId, permission]) => {
                  networkPermissions[company.id][network.id][agentId] = {
                    granted: permission.granted,
                    assignmentType: permission.assignmentType
                  };
                });
              } else {
                // Initialize empty permissions if none exist
                networkPermissions[company.id][network.id] = {};
              }
            }
          }
        }
        
        setNetworkAgentPermissions(networkPermissions);
      } catch (error) {
        console.error('Error loading network permissions:', error);
        // Fall back to empty permissions
        const emptyNetworkPermissions: {[companyId: string]: {[networkId: string]: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}}}} = {};
        mockCompanies.forEach(company => {
          emptyNetworkPermissions[company.id] = {};
          company.networks?.forEach(network => {
            emptyNetworkPermissions[company.id][network.id] = {};
          });
        });
        setNetworkAgentPermissions(emptyNetworkPermissions);
      }
    };
    
    loadNetworkPermissions();
    
        // Stats are already calculated and set above, no need to recalculate
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

  const setupTransparentPermissions = async () => {
    try {
      // Grant basic agents to Transparent Partners
      const { grantAgentsToCompany } = await import('../services/hierarchicalPermissionService');
      
      const agentPermissions = {
        'gemini-chat-agent': {
          granted: true,
          assignmentType: 'free' as const
        },
        'google-imagen-agent': {
          granted: true,
          assignmentType: 'approval' as const
        }
      };
      
      await grantAgentsToCompany(
        'transparent-partners',
        'Transparent Partners',
        agentPermissions,
        userProfile?.uid || 'super-admin',
        userProfile?.displayName || 'Super Admin'
      );
      
      toast.success('Transparent Partners permissions set up successfully!');
      
    } catch (error) {
      console.error('Error setting up Transparent permissions:', error);
      toast.error('Failed to set up permissions');
    }
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

  const toggleGlobalAgentSetting = (agentId: string, setting: 'enabled' | 'defaultTier' | 'defaultAssignmentType', value: boolean | 'free' | 'premium' | 'enterprise' | 'direct' | 'approval') => {
    setGlobalAgentSettings(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        [setting]: value
      }
    }));
  };

  const saveAgentPermissions = async () => {
    if (!selectedCompany || !userProfile) return;
    
    try {
      const { grantAgentsToCompany } = await import('../services/hierarchicalPermissionService');
      
      // Convert local state to the format expected by the service
      const companyPermissions = companyAgentPermissions[selectedCompany.id] || {};
      const agentPermissions: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}} = {};
      
      Object.entries(companyPermissions).forEach(([agentId, permission]) => {
        agentPermissions[agentId] = {
          granted: permission.granted,
          assignmentType: permission.assignmentType
        };
      });
      
      await grantAgentsToCompany(
        selectedCompany.id,
        selectedCompany.name,
        agentPermissions,
        userProfile.uid,
        userProfile.displayName || 'Super Admin'
      );
      
      const assignedAgents = Object.entries(companyPermissions).filter(([_, permission]) => permission.granted);
      const agentsByType = assignedAgents.reduce((acc, [agentId, permission]) => {
        if (!acc[permission.assignmentType]) acc[permission.assignmentType] = [];
        acc[permission.assignmentType].push(agentId);
        return acc;
      }, {} as {[key: string]: string[]});
      
      const summary = Object.entries(agentsByType).map(([type, agents]) => 
        `${agents.length} ${type} agent${agents.length !== 1 ? 's' : ''}`
      ).join(', ');
      
      toast.success(`Agent permissions saved to Firestore for ${selectedCompany.name}! Assigned ${assignedAgents.length} total agents: ${summary}.`);
      setIsAgentPermissionsModalOpen(false);
      setSelectedCompany(null);
      
    } catch (error) {
      console.error('Error saving agent permissions:', error);
      toast.error('Failed to save agent permissions. Please try again.');
    }
  };

  const saveNetworkPermissions = async () => {
    if (!selectedNetwork || !userProfile) return;
    
    try {
      const { grantAgentsToNetwork } = await import('../services/hierarchicalPermissionService');
      
      // Convert local state to the format expected by the service
      const networkPermissions = networkAgentPermissions[selectedNetwork.company.id]?.[selectedNetwork.network.id] || {};
      const agentPermissions: {[agentId: string]: {granted: boolean; assignmentType: 'free' | 'direct' | 'approval'}} = {};
      
      Object.entries(networkPermissions).forEach(([agentId, permission]) => {
        agentPermissions[agentId] = {
          granted: permission.granted,
          assignmentType: permission.assignmentType
        };
      });
      
      await grantAgentsToNetwork(
        selectedNetwork.company.id,
        selectedNetwork.network.id,
        selectedNetwork.network.name,
        agentPermissions,
        userProfile.uid,
        userProfile.displayName || 'Super Admin'
      );
      
      const assignedAgents = Object.entries(networkPermissions).filter(([_, permission]) => permission.granted);
      
      toast.success(`Network permissions saved to Firestore for ${selectedNetwork.network.name}! Assigned ${assignedAgents.length} agents.`);
      setIsNetworkPermissionsModalOpen(false);
      setSelectedNetwork(null);
      
    } catch (error) {
      console.error('Error saving network permissions:', error);
      toast.error('Failed to save network permissions. Please try again.');
    }
  };

  const saveGlobalAgentSettings = async () => {
    if (!userProfile) return;
    
    try {
      const { saveGlobalAgentSettings: saveSettings } = await import('../services/hierarchicalPermissionService');
      
      await saveSettings(
        globalAgentSettings,
        userProfile.uid,
        userProfile.displayName || 'Super Admin'
      );
      
      const enabledAgents = Object.entries(globalAgentSettings).filter(([_, settings]) => settings.enabled).length;
      const disabledAgents = Object.entries(globalAgentSettings).filter(([_, settings]) => !settings.enabled).length;
      
      toast.success(`Global agent settings saved to Firestore! ${enabledAgents} agents enabled, ${disabledAgents} disabled.`);
      setIsGlobalAgentModalOpen(false);
      
    } catch (error) {
      console.error('Error saving global agent settings:', error);
      toast.error('Failed to save global agent settings. Please try again.');
    }
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

  const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage the entire AI Agent Hub ecosystem
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  👑 Super Admin
                </span>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Companies" 
            value={stats.totalCompanies} 
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            color="text-blue-500"
            bgColor="bg-blue-100"
          />
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<UsersIcon className="w-6 h-6" />}
            color="text-green-500"
            bgColor="bg-green-100"
          />
          <StatCard 
            title="Total Agents" 
            value={stats.totalAgents} 
            icon={<Cog6ToothIcon className="w-6 h-6" />}
            color="text-purple-500"
            bgColor="bg-purple-100"
          />
          <StatCard 
            title="Active Companies" 
            value={stats.activeCompanies} 
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            color="text-emerald-500"
            bgColor="bg-emerald-100"
          />
        </div>

        {/* Main Dashboard Sections */}
        <div className="space-y-8">
          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions across the platform</p>
            </div>
            <div className="p-6">
              {/* ... existing user management content ... */}
            </div>
          </div>

          {/* Agent Registry Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Agent Registry</h2>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage the global agent registry</p>
            </div>
            <div className="p-6">
              {/* ... existing agent registry content ... */}
            </div>
          </div>

          {/* System Health Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
              <p className="text-sm text-gray-600 mt-1">Monitor system performance and health metrics</p>
            </div>
            <div className="p-6">
              {/* ... existing system health content ... */}
            </div>
          </div>

          {/* Compliance & Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Compliance & Security</h2>
              <p className="text-sm text-gray-600 mt-1">Manage compliance requirements and security policies</p>
            </div>
            <div className="p-6">
              {/* ... existing compliance content ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
