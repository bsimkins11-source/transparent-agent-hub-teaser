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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Debug Information */}
      {import.meta.env.DEV && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Debug Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>User Profile:</strong> {userProfile ? 'Loaded' : 'Not loaded'}</p>
                <p><strong>User Role:</strong> {userProfile?.role || 'None'}</p>
                <p><strong>User Email:</strong> {userProfile?.email || 'None'}</p>
                <p><strong>Companies Loaded:</strong> {companies.length}</p>
                <p><strong>Stats:</strong> {JSON.stringify(stats)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fallback if no companies loaded */}
      {companies.length === 0 && (
        <div className="text-center p-8 bg-white rounded-xl shadow-soft border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Companies...</h2>
          <p className="text-gray-600">Please wait while we load company data.</p>
        </div>
      )}
      
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Company Management */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Company Management</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const companiesSection = document.getElementById('companies-section');
                    companiesSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <BuildingOfficeIcon className="w-5 h-5" />
                  <span>View All Companies</span>
                </button>
                <button
                  onClick={() => setIsCreateCompanyModalOpen(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Company</span>
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Manage organizations and assign company administrators</p>
            <div className="text-sm text-gray-500 mb-4">
              {stats.totalCompanies} active companies • {stats.totalUsers} total users
            </div>
            
            {/* Quick Company Access */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Access</h4>
              <div className="flex flex-wrap gap-2">
                {companies.slice(0, 3).map((company) => (
                  <Link
                    key={company.id}
                    to={`/admin/company/${company.id}`}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-5 h-5 rounded" />
                    ) : (
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: company.primaryColor }}
                      >
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-gray-700">{company.name}</span>
                  </Link>
                ))}
                {companies.length > 3 && (
                  <button
                    onClick={() => {
                      const companiesSection = document.getElementById('companies-section');
                      companiesSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm text-blue-700"
                  >
                    <span>+{companies.length - 3} more</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Master Agent Library - Consolidated */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Master Agent Library</h3>
              <button 
                onClick={openGlobalAgentModal}
                className="btn-primary flex items-center space-x-2"
              >
                <CubeIcon className="w-5 h-5" />
                <span>Manage Library</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">Create, configure, and control all agents and their global availability</p>
            <div className="text-sm text-gray-500">
              {Object.values(globalAgentSettings).filter(s => s.enabled).length} enabled agents • {Object.keys(globalAgentSettings).length} total agents
            </div>
          </div>
        </div>

        {/* Agent Assignment Section */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Agent Assignments</h3>
              <p className="text-gray-600 text-sm">
                Control which agents are available to companies and networks
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                onChange={(e) => {
                  const company = companies.find(c => c.id === e.target.value);
                  if (company) openAgentPermissionsModal(company);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Select Company to Assign Agents</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    🎯 Assign to {company.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => openAgentPermissionsModal(companies.find(c => c.id === 'transparent-partners')!)}
                className="btn-primary flex items-center space-x-2"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Quick: Transparent Partners</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Global to Company */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Company Assignments</h4>
                  <p className="text-sm text-gray-600">Assign agents from Master Library to companies</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Click "Manage Agent Access" on any company card below to assign agents
              </div>
              <div className="text-xs text-blue-600 font-medium">
                Master Library → Company Libraries
              </div>
            </div>

            {/* Company to Network */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Network Assignments</h4>
                  <p className="text-sm text-gray-600">Assign company agents to specific networks</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Click "Agents" button on network cards to assign agents to networks
              </div>
              <div className="text-xs text-green-600 font-medium">
                Company Libraries → Network Libraries
              </div>
            </div>

            {/* Assignment Flow */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Assignment Flow</h4>
                  <p className="text-sm text-gray-600">Hierarchical permission waterfall</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-700">Master Library (All Agents)</span>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-gray-400">↓</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Company Libraries</span>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-gray-400">↓</span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-700">Network Libraries</span>
                </div>
                <div className="flex items-center space-x-2 ml-6">
                  <span className="text-gray-400">↓</span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-gray-700">User Libraries</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Grid */}
        <div id="companies-section" className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="col-span-full p-4 bg-yellow-100 border border-yellow-300 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> Found {filteredCompanies.length} companies. 
              {filteredCompanies.length > 0 ? ` First company: ${filteredCompanies[0].name} (ID: ${filteredCompanies[0].id})` : ' No companies loaded'}
            </p>
          </div>
            {filteredCompanies.map((company) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:shadow-md relative z-10 cursor-pointer hover:border-blue-300"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    try {
                      navigate(`/admin/company/${company.id}`);
                    } catch (error) {
                      console.error('Navigation failed:', error);
                    }
                  }}
                >
                {/* Company Header */}
                <div className="flex items-center justify-between mb-4 group">
                  <div className="flex items-center gap-3">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg" />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ 
                          backgroundColor: company.primaryColor,
                          color: getContrastColor(company.primaryColor)
                        }}
                      >
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base m-0 !text-gray-900">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600 m-0 mt-1 !text-gray-600">
                        {company.domain}
                      </p>
                      <p className="text-xs text-cyan-600 opacity-0 m-0 mt-1 transition-opacity duration-200 group-hover:opacity-100">
                        Click to manage company →
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    company.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.status}
                  </span>
                </div>

                {/* Company Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {company.userCount}
                    </div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {company.agentCount}
                    </div>
                    <div className="text-sm text-gray-600">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {company.networks?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Networks</div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Company Admin</div>
                  <div className="text-sm text-gray-700">{company.adminName}</div>
                  <div className="text-sm text-gray-600">{company.adminEmail}</div>
                </div>

                {/* Networks Section */}
                {company.networks && company.networks.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-2">Networks</div>
                    <div className="flex flex-col gap-2">
                      {company.networks.slice(0, 2).map((network) => (
                        <div key={network.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-700">{network.name}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              network.type === 'business_unit' ? 'bg-blue-100 text-blue-800' :
                              network.type === 'region' ? 'bg-green-100 text-green-800' :
                              network.type === 'department' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {network.type.replace('_', ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => openNetworkPermissionsModal(company, network)}
                            className="text-xs text-cyan-600 font-medium bg-none border-none cursor-pointer hover:text-cyan-700 transition-colors"
                          >
                            Agents
                          </button>
                        </div>
                      ))}
                      {company.networks.length > 2 && (
                        <div className="text-xs text-gray-600">
                          +{company.networks.length - 2} more networks
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openAssignAdminModal(company)}
                      className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
                    >
                      <UsersIcon className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                    <button
                      onClick={() => openCustomizeModal(company)}
                      className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
                    >
                      <SwatchIcon className="w-4 h-4" />
                      <span>Brand</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="px-3 py-2 text-red-600 bg-none border-none rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/admin/company/${company.id}`}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium text-sm py-3 px-4 rounded-lg no-underline transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <BuildingOfficeIcon className="w-5 h-5" />
                      <span>🏢 Manage Company</span>
                    </Link>
                    <button
                      onClick={() => openAgentPermissionsModal(company)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-sm py-3 px-4 rounded-lg border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>🎯 Assign Agents</span>
                    </button>
                  </div>
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
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: selectedCompany.primaryColor,
                        color: getContrastColor(selectedCompany.primaryColor)
                      }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: selectedCompany.secondaryColor,
                        color: getContrastColor(selectedCompany.secondaryColor)
                      }}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Assign Agents to {selectedCompany.name}
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Master Library → Company Library
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Company Agent Assignment</p>
                  <p>Grant agents from the Master Library to {selectedCompany.name}. Choose assignment types:</p>
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
                // Real Agents (from Firestore)
                { id: 'gemini-chat-agent', name: 'Gemini Chat Agent', icon: '🤖', category: 'AI Chat', description: 'Conversational AI powered by Google Gemini', tier: 'free' },
                { id: 'google-imagen-agent', name: 'Google Imagen Agent', icon: '🎨', category: 'Creative', description: 'AI image generation powered by Google Imagen', tier: 'premium' },
                
                // Fake Frontend Cards for Testing
                { id: 'briefing-agent', name: 'Briefing Agent', icon: '📄', category: 'Productivity', description: 'Summarizes documents and creates briefings', tier: 'free' },
                { id: 'analytics-agent', name: 'Analytics Agent', icon: '📊', category: 'Analytics', description: 'Analyzes data and generates insights', tier: 'premium' },
                { id: 'research-agent', name: 'Research Agent', icon: '🔍', category: 'Research', description: 'Conducts comprehensive research and market analysis', tier: 'free' },
                { id: 'writing-agent', name: 'Content Writer Agent', icon: '✍️', category: 'Productivity', description: 'Professional content creation and copywriting', tier: 'free' },
                { id: 'code-review-agent', name: 'Code Review Agent', icon: '💻', category: 'Development', description: 'Automated code review and optimization suggestions', tier: 'premium' },
                { id: 'data-scientist-agent', name: 'Data Science Agent', icon: '🧪', category: 'Analytics', description: 'Advanced data analysis and machine learning insights', tier: 'premium' },
                { id: 'social-media-agent', name: 'Social Media Agent', icon: '📱', category: 'Marketing', description: 'Social media content creation and strategy', tier: 'free' },
                { id: 'email-marketing-agent', name: 'Email Marketing Agent', icon: '📧', category: 'Marketing', description: 'Automated email campaign creation and optimization', tier: 'premium' },
                { id: 'seo-agent', name: 'SEO Optimization Agent', icon: '🔍', category: 'Marketing', description: 'Search engine optimization and content analysis', tier: 'premium' },
                { id: 'financial-advisor-agent', name: 'Financial Advisor Agent', icon: '💰', category: 'Finance', description: 'Investment analysis and financial planning assistance', tier: 'enterprise' },
                { id: 'legal-contract-agent', name: 'Legal Contract Agent', icon: '⚖️', category: 'Legal', description: 'Contract analysis and legal document review', tier: 'enterprise' },
                { id: 'hr-recruiter-agent', name: 'HR Recruiter Agent', icon: '👥', category: 'HR', description: 'Resume screening and candidate evaluation', tier: 'premium' },
                { id: 'customer-support-agent', name: 'Customer Support Agent', icon: '🎧', category: 'Support', description: 'Automated customer service and ticket resolution', tier: 'free' },
                { id: 'project-manager-agent', name: 'Project Manager Agent', icon: '📋', category: 'Management', description: 'Project planning and task management assistance', tier: 'premium' }
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
                          className="px-4 py-3 rounded-lg text-sm font-bold transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          ✅ ASSIGN TO COMPANY
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleAgentAccess(selectedCompany.id, agent.id, 'free')}
                          className="px-4 py-3 rounded-lg text-sm font-bold transition-all bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          ❌ REMOVE FROM COMPANY
                        </button>
                      )}
                      <div className="text-xs text-center font-medium">
                        {hasAccess ? (
                          <span className="text-green-600">✓ Currently Assigned</span>
                        ) : (
                          <span className="text-gray-500">○ Not Assigned</span>
                        )}
                      </div>
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
                Save Agent Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Permissions Modal */}
      {isNetworkPermissionsModalOpen && selectedNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Assign Agents to {selectedNetwork.network.name}
                </h2>
                <div className="text-sm text-gray-600">
                  Company: {selectedNetwork.company.name} • Network Type: {selectedNetwork.network.type.replace('_', ' ')}
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Company Library → Network Library
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-1">Network Agent Assignment</p>
                  <p>Assign agents from {selectedNetwork.company.name}'s library to the {selectedNetwork.network.name} network. Only agents already granted to the company can be assigned to networks.</p>
                </div>
              </div>
            </div>

            {/* Available Company Agents for Network Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                // Real Agents (from Firestore)
                { id: 'gemini-chat-agent', name: 'Gemini Chat Agent', icon: '🤖', category: 'AI Chat', description: 'Conversational AI powered by Google Gemini', tier: 'free' },
                { id: 'google-imagen-agent', name: 'Google Imagen Agent', icon: '🎨', category: 'Creative', description: 'AI image generation powered by Google Imagen', tier: 'premium' },
                
                // Fake Frontend Cards for Testing
                { id: 'briefing-agent', name: 'Briefing Agent', icon: '📄', category: 'Productivity', description: 'Summarizes documents and creates briefings', tier: 'free' },
                { id: 'analytics-agent', name: 'Analytics Agent', icon: '📊', category: 'Analytics', description: 'Analyzes data and generates insights', tier: 'premium' },
                { id: 'research-agent', name: 'Research Agent', icon: '🔍', category: 'Research', description: 'Conducts comprehensive research and market analysis', tier: 'free' },
                { id: 'writing-agent', name: 'Content Writer Agent', icon: '✍️', category: 'Productivity', description: 'Professional content creation and copywriting', tier: 'free' },
                { id: 'code-review-agent', name: 'Code Review Agent', icon: '💻', category: 'Development', description: 'Automated code review and optimization suggestions', tier: 'premium' },
                { id: 'data-scientist-agent', name: 'Data Science Agent', icon: '🧪', category: 'Analytics', description: 'Advanced data analysis and machine learning insights', tier: 'premium' },
                { id: 'social-media-agent', name: 'Social Media Agent', icon: '📱', category: 'Marketing', description: 'Social media content creation and strategy', tier: 'free' },
                { id: 'email-marketing-agent', name: 'Email Marketing Agent', icon: '📧', category: 'Marketing', description: 'Automated email campaign creation and optimization', tier: 'premium' },
                { id: 'customer-support-agent', name: 'Customer Support Agent', icon: '🎧', category: 'Support', description: 'Automated customer service and ticket resolution', tier: 'free' },
                { id: 'project-manager-agent', name: 'Project Manager Agent', icon: '📋', category: 'Management', description: 'Project planning and task management assistance', tier: 'premium' }
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
                          className="px-4 py-3 rounded-lg text-sm font-bold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          ✅ ASSIGN TO NETWORK
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleNetworkAgentAccess(selectedNetwork.company.id, selectedNetwork.network.id, agent.id, 'free')}
                          className="px-4 py-3 rounded-lg text-sm font-bold transition-all bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          ❌ REMOVE FROM NETWORK
                        </button>
                      )}
                      <div className="text-xs text-center font-medium">
                        {hasAccess ? (
                          <span className="text-blue-600">✓ Currently Assigned</span>
                        ) : (
                          <span className="text-gray-500">○ Not Assigned</span>
                        )}
                      </div>
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
                Save Network Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Agent Library Management Modal */}
      {isGlobalAgentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Master Agent Library
              </h2>
              <div className="flex space-x-3">
                <button 
                  onClick={setupTransparentPermissions}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Setup TP Permissions</span>
                </button>
                <button 
                  onClick={() => setIsAgentManagementModalOpen(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add New Agent</span>
                </button>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Master Agent Library Management</p>
                  <p>Control all agents in the system - create new agents, configure availability, and set default behaviors.</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Enabled:</strong> Whether the agent is available system-wide</li>
                    <li><strong>Default Tier:</strong> Free (no restrictions), Premium (company controlled), Enterprise (super admin only)</li>
                    <li><strong>Assignment Type:</strong> How agents are assigned by default (Free, Direct, Approval)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(globalAgentSettings).map(([agentId, settings]) => {
                const agentInfo = {
                  // Real Agents (from Firestore)
                  'gemini-chat-agent': { name: 'Gemini Chat Agent', icon: '🤖', category: 'AI Chat', description: 'Conversational AI powered by Google Gemini' },
                  'google-imagen-agent': { name: 'Google Imagen Agent', icon: '🎨', category: 'Creative', description: 'AI image generation powered by Google Imagen' },
                  
                  // Fake Frontend Cards for Testing
                  'briefing-agent': { name: 'Briefing Agent', icon: '📄', category: 'Productivity', description: 'Summarizes documents and creates briefings' },
                  'analytics-agent': { name: 'Analytics Agent', icon: '📊', category: 'Analytics', description: 'Analyzes data and generates insights' },
                  'research-agent': { name: 'Research Agent', icon: '🔍', category: 'Research', description: 'Conducts comprehensive research and market analysis' },
                  'writing-agent': { name: 'Content Writer Agent', icon: '✍️', category: 'Productivity', description: 'Professional content creation and copywriting' },
                  'code-review-agent': { name: 'Code Review Agent', icon: '💻', category: 'Development', description: 'Automated code review and optimization suggestions' },
                  'data-scientist-agent': { name: 'Data Science Agent', icon: '🧪', category: 'Analytics', description: 'Advanced data analysis and machine learning insights' },
                  'social-media-agent': { name: 'Social Media Agent', icon: '📱', category: 'Marketing', description: 'Social media content creation and strategy' },
                  'email-marketing-agent': { name: 'Email Marketing Agent', icon: '📧', category: 'Marketing', description: 'Automated email campaign creation and optimization' },
                  'seo-agent': { name: 'SEO Optimization Agent', icon: '🔍', category: 'Marketing', description: 'Search engine optimization and content analysis' },
                  'financial-advisor-agent': { name: 'Financial Advisor Agent', icon: '💰', category: 'Finance', description: 'Investment analysis and financial planning assistance' },
                  'legal-contract-agent': { name: 'Legal Contract Agent', icon: '⚖️', category: 'Legal', description: 'Contract analysis and legal document review' },
                  'hr-recruiter-agent': { name: 'HR Recruiter Agent', icon: '👥', category: 'HR', description: 'Resume screening and candidate evaluation' },
                  'customer-support-agent': { name: 'Customer Support Agent', icon: '🎧', category: 'Support', description: 'Automated customer service and ticket resolution' },
                  'project-manager-agent': { name: 'Project Manager Agent', icon: '📋', category: 'Management', description: 'Project planning and task management assistance' }
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
                        
                        <div className="bg-white rounded p-3 border border-gray-200 mb-3">
                          <div className="text-xs text-gray-600">
                            <strong>Current Config:</strong> {settings.defaultTier} tier, {settings.defaultAssignmentType} assignment
                          </div>
                        </div>
                        
                        {/* Multi-Destination Assignment Interface */}
                        <div className="space-y-4 border-t border-gray-200 pt-4">
                          <div className="text-xs font-medium text-gray-700 mb-3">🎯 Deploy Agent To:</div>
                          
                          {/* Master Library Toggle */}
                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-600">🌍</span>
                              <span className="text-sm font-medium text-blue-900">Master Library (Global)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(e) => {
                                  setGlobalAgentSettings(prev => ({
                                    ...prev,
                                    [agentId]: { ...settings, enabled: e.target.checked }
                                  }));
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Scalable Company & Network Selection */}
                          <div className="space-y-3">
                            <div className="text-xs font-medium text-gray-600">📢 Companies & Networks:</div>
                            
                            {/* Company Search */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search companies..."
                                value={companySearchTerm || ''}
                                onChange={(e) => setCompanySearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-8"
                              />
                              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>

                            {/* Company Deployment Menu */}
                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {companies
                                .filter(company => 
                                  !companySearchTerm || 
                                  company.name.toLowerCase().includes((companySearchTerm || '').toLowerCase()) ||
                                  company.domain.toLowerCase().includes((companySearchTerm || '').toLowerCase())
                                )
                                .map((company) => {
                                  const hasCompanyAccess = companyAgentPermissions[company.id]?.[agentId]?.granted || false;
                                  const isExpanded = expandedCompanies[company.id] || false;
                                  const networks = company.networks || [];
                                  
                                  // Check if all networks are selected
                                  const allNetworksSelected = networks.length > 0 && networks.every(network => 
                                    networkAgentPermissions[company.id]?.[network.id]?.[agentId]?.granted || false
                                  );
                                  
                                  // Check if some networks are selected
                                  const someNetworksSelected = networks.some(network => 
                                    networkAgentPermissions[company.id]?.[network.id]?.[agentId]?.granted || false
                                  );
                                  
                                  return (
                                    <div key={company.id} className="border border-gray-200 rounded-lg">
                                      {/* Company Header - Just for opening menu */}
                                      <div 
                                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                          setExpandedCompanies(prev => ({
                                            ...prev,
                                            [company.id]: !prev[company.id]
                                          }));
                                        }}
                                      >
                                        {/* Company Logo */}
                                        {company.logo ? (
                                          <img 
                                            src={company.logo} 
                                            alt={`${company.name} logo`}
                                            className="w-8 h-8 rounded object-cover"
                                            onError={(e) => {
                                              // Fallback to company initial if logo fails to load
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div 
                                          className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-sm font-bold"
                                          style={{ display: company.logo ? 'none' : 'flex' }}
                                        >
                                          {company.name.charAt(0).toUpperCase()}
                                        </div>
                                        
                                        {/* Company Info */}
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">{company.name}</span>
                                            {hasCompanyAccess && (
                                              <span className="text-xs text-blue-600 font-medium">🏢 Company-wide</span>
                                            )}
                                            {!hasCompanyAccess && someNetworksSelected && (
                                              <span className="text-xs text-green-600 font-medium">📡 {networks.filter(n => networkAgentPermissions[company.id]?.[n.id]?.[agentId]?.granted).length} Networks</span>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">{company.domain}</div>
                                        </div>
                                        
                                        {/* Network Count & Expand Arrow */}
                                        <div className="flex items-center space-x-2">
                                          <div className="text-xs text-gray-500">
                                            {networks.length} network{networks.length !== 1 ? 's' : ''}
                                          </div>
                                          <svg 
                                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Deployment Options (Expandable) */}
                                      {isExpanded && (
                                        <div className="border-t border-gray-100 bg-gray-50">
                                          <div className="px-6 py-3">
                                            <div className="text-xs text-gray-500 mb-3">🎯 Deploy to {company.name}:</div>
                                            <div className="space-y-2">
                                              
                                              {/* Company-wide Option */}
                                              <label className="flex items-center space-x-3 p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100">
                                                <input
                                                  type="checkbox"
                                                  checked={hasCompanyAccess}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      toggleAgentAccess(company.id, agentId, settings.defaultAssignmentType);
                                                    } else {
                                                      toggleAgentAccess(company.id, agentId, settings.defaultAssignmentType);
                                                    }
                                                  }}
                                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                                <span className="text-base">🏢</span>
                                                <div className="flex-1">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-900">Company-wide Access</span>
                                                    {hasCompanyAccess && (
                                                      <span className="text-xs text-blue-600">✓ Active</span>
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-gray-600">Deploy to entire {company.name} organization</div>
                                                </div>
                                              </label>

                                              {/* All Networks Option */}
                                              {networks.length > 0 && (
                                                <label className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100">
                                                  <input
                                                    type="checkbox"
                                                    checked={allNetworksSelected}
                                                    onChange={(e) => {
                                                      // Toggle all networks
                                                      networks.forEach(network => {
                                                        if (e.target.checked) {
                                                          if (!(networkAgentPermissions[company.id]?.[network.id]?.[agentId]?.granted)) {
                                                            toggleNetworkAgentAccess(company.id, network.id, agentId, settings.defaultAssignmentType);
                                                          }
                                                        } else {
                                                          if (networkAgentPermissions[company.id]?.[network.id]?.[agentId]?.granted) {
                                                            toggleNetworkAgentAccess(company.id, network.id, agentId, settings.defaultAssignmentType);
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                                  />
                                                  <span className="text-base">📡</span>
                                                  <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-sm font-medium text-gray-900">All Networks</span>
                                                      {allNetworksSelected && (
                                                        <span className="text-xs text-green-600">✓ All Selected</span>
                                                      )}
                                                      {!allNetworksSelected && someNetworksSelected && (
                                                        <span className="text-xs text-yellow-600">◐ Partial</span>
                                                      )}
                                                    </div>
                                                    <div className="text-xs text-gray-600">Deploy to all {networks.length} networks in {company.name}</div>
                                                  </div>
                                                </label>
                                              )}

                                              {/* Individual Networks */}
                                              {networks.length > 0 && (
                                                <div className="ml-4 space-y-1">
                                                  <div className="text-xs text-gray-500 mb-2">Individual Networks:</div>
                                                  {networks.map(network => {
                                                    const hasNetworkAccess = networkAgentPermissions[company.id]?.[network.id]?.[agentId]?.granted || false;
                                                    
                                                    return (
                                                      <label 
                                                        key={network.id} 
                                                        className="flex items-center space-x-3 p-2 bg-white border border-gray-100 rounded cursor-pointer hover:bg-gray-50"
                                                      >
                                                        <input
                                                          type="checkbox"
                                                          checked={hasNetworkAccess}
                                                          onChange={(e) => {
                                                            if (e.target.checked) {
                                                              toggleNetworkAgentAccess(company.id, network.id, agentId, settings.defaultAssignmentType);
                                                            } else {
                                                              toggleNetworkAgentAccess(company.id, network.id, agentId, settings.defaultAssignmentType);
                                                            }
                                                          }}
                                                          className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                                                        />
                                                        <span className="text-base">{network.icon}</span>
                                                        <div className="flex-1">
                                                          <div className="flex items-center space-x-2">
                                                            <span className="text-sm text-gray-700">{network.name}</span>
                                                            {hasNetworkAccess && (
                                                              <span className="text-xs text-green-600">✓</span>
                                                            )}
                                                          </div>
                                                          <div className="text-xs text-gray-500">{network.description}</div>
                                                        </div>
                                                      </label>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          {/* Save All Assignments Button */}
                          <button
                            onClick={async () => {
                              try {
                                // Save global settings
                                const { saveGlobalAgentSettings, grantAgentsToCompany, grantAgentsToNetwork } = await import('../services/hierarchicalPermissionService');
                                await saveGlobalAgentSettings(globalAgentSettings, userProfile?.uid || 'super-admin', userProfile?.displayName || 'Super Admin');
                                
                                // Save company permissions
                                
                                for (const company of companies) {
                                  const permissions = companyAgentPermissions[company.id];
                                  if (permissions && Object.keys(permissions).length > 0) {
                                    await grantAgentsToCompany(
                                      company.id,
                                      company.name,
                                      permissions,
                                      userProfile?.uid || 'super-admin',
                                      userProfile?.displayName || 'Super Admin'
                                    );
                                  }
                                }
                                
                                // Save network permissions
                                for (const company of companies) {
                                  for (const network of company.networks || []) {
                                    const permissions = networkAgentPermissions[company.id]?.[network.id];
                                    if (permissions && Object.keys(permissions).length > 0) {
                                      await grantAgentsToNetwork(
                                        company.id,
                                        company.name,
                                        network.id,
                                        network.name,
                                        permissions,
                                        userProfile?.uid || 'super-admin',
                                        userProfile?.displayName || 'Super Admin'
                                      );
                                    }
                                  }
                                }
                                
                                toast.success(`${agentInfo.name} assignments saved across all selected destinations!`);
                              } catch (error) {
                                console.error('Error saving multi-destination assignments:', error);
                                toast.error('Failed to save assignments. Please try again.');
                              }
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            💾 Save All Assignments
                          </button>
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
                Save Master Library Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Management Modal */}
      {isAgentManagementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto">
            <AgentManagement onClose={() => setIsAgentManagementModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
