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
  const [isAgentAssignmentModalOpen, setIsAgentAssignmentModalOpen] = useState(false);
  const [isCompanyLibraryModalOpen, setIsCompanyLibraryModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isNetworkAssignmentModalOpen, setIsNetworkAssignmentModalOpen] = useState(false);
  const [isRequestApprovalModalOpen, setIsRequestApprovalModalOpen] = useState(false);
  
  // Mock data for development
  const [mockCompanyLibraries, setMockCompanyLibraries] = useState<{[companyId: string]: string[]}>({
    'transparent-partners': ['gemini-chat-agent', 'imagen-agent', 'custom-agent-1', 'custom-agent-2']
  });
  const [mockNetworkLibraries, setMockNetworkLibraries] = useState<{[companyId: string]: {[networkId: string]: string[]}}>({
    'transparent-partners': {
      'ai-solutions': ['gemini-chat-agent', 'custom-agent-1'],
      'analytics': ['custom-agent-2', 'analytics-agent'],
      'client-services': ['gemini-chat-agent', 'customer-support-agent'],
      'leadership': ['project-manager-agent', 'briefing-agent']
    }
  });
  const [mockCompanyUsers, setMockCompanyUsers] = useState<{[companyId: string]: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }>}>({
    'transparent-partners': [
      {
        id: 'user-1',
        firstName: 'Aaron',
        lastName: 'Fetters',
        email: 'aaron.fetters@transparent.partners',
        role: 'admin',
        status: 'active'
      },
      {
        id: 'user-2',
        firstName: 'Darren',
        lastName: 'Rankine',
        email: 'darren.rankine@transparent.partners',
        role: 'admin',
        status: 'active'
      },
      {
        id: 'user-3',
        firstName: 'Lindsey',
        lastName: 'Daly',
        email: 'lindsey.daly@transparent.partners',
        role: 'admin',
        status: 'active'
      },
      {
        id: 'user-4',
        firstName: 'Wes',
        lastName: 'Waterston',
        email: 'wes.waterston@transparent.partners',
        role: 'admin',
        status: 'active'
      },
      {
        id: 'user-5',
        firstName: 'Josh',
        lastName: 'Vincent',
        email: 'josh.vincent@transparent.partners',
        role: 'manager',
        status: 'active'
      },
      {
        id: 'user-6',
        firstName: 'Bryan',
        lastName: 'Simkins',
        email: 'bryan.simkins@transparent.partners',
        role: 'manager',
        status: 'active'
      },
      {
        id: 'user-7',
        firstName: 'Chris',
        lastName: 'Marshall',
        email: 'chris.marshall@transparent.partners',
        role: 'manager',
        status: 'active'
      },
      {
        id: 'user-8',
        firstName: 'John',
        lastName: 'Lillard',
        email: 'john.lillard@transparent.partners',
        role: 'manager',
        status: 'active'
      },
      {
        id: 'user-9',
        firstName: 'Kaela',
        lastName: 'Carey Cifonelli',
        email: 'kaela.carey@transparent.partners',
        role: 'manager',
        status: 'active'
      },
      {
        id: 'user-10',
        firstName: 'Oliver',
        lastName: 'Amidei',
        email: 'oliver.amidei@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-11',
        firstName: 'Amanda',
        lastName: 'Nianick',
        email: 'amanda.nianick@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-12',
        firstName: 'Hannah',
        lastName: 'Ventola',
        email: 'hannah.ventola@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-13',
        firstName: 'MacKayla',
        lastName: 'McClure',
        email: 'mackayla.mcclure@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-14',
        firstName: 'Andrew',
        lastName: 'Fix',
        email: 'andrew.fix@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-15',
        firstName: 'Arnav',
        lastName: 'Mitra',
        email: 'arnav.mitra@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-16',
        firstName: 'Riya',
        lastName: 'Dekate',
        email: 'riya.dekate@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-17',
        firstName: 'Rebecca',
        lastName: 'Siems',
        email: 'rebecca.siems@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-18',
        firstName: 'Lauren',
        lastName: 'McCune',
        email: 'lauren.mccune@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-19',
        firstName: 'Nitay',
        lastName: 'Kenigsztein',
        email: 'nitay.kenigsztein@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-20',
        firstName: 'Aayushi',
        lastName: 'Gandhi',
        email: 'aayushi.gandhi@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-21',
        firstName: 'Mary',
        lastName: 'Doman',
        email: 'mary.doman@transparent.partners',
        role: 'user',
        status: 'active'
      },
      {
        id: 'user-22',
        firstName: 'Benjamin',
        lastName: 'Deng',
        email: 'benjamin.deng@transparent.partners',
        role: 'user',
        status: 'active'
      }
    ]
  });
  const [mockPendingRequests, setMockPendingRequests] = useState<Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    companyName: string;
    networkName: string;
    agentName: string;
    requestReason: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'denied';
  }>>([
    {
      id: 'req-1',
      userId: 'user-1',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@company.com',
      companyName: 'Acme Corp',
      networkName: 'Customer Support',
      agentName: 'Gemini Chat Agent',
      requestReason: 'Access to Gemini Chat Agent for customer support team',
      requestedAt: '2 hours ago',
      status: 'pending'
    },
    {
      id: 'req-2',
      userId: 'user-2',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@company.com',
      companyName: 'TechStart Inc',
      networkName: 'Marketing',
      agentName: 'Imagen Agent',
      requestReason: 'Access to Imagen Agent for marketing content creation',
      requestedAt: '1 day ago',
      status: 'pending'
    }
  ]);

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
        logo: '/transparent-partners-logo.png',
        primaryColor: '#8B5CF6',
        secondaryColor: '#7C3AED',
        adminEmail: 'aaron.fetters@transparent.partners',
        adminName: 'Aaron Fetters',
        userCount: 22,
        agentCount: 15,
        createdAt: '2024-01-01',
        status: 'active',
        networks: [
          {
            id: 'leadership',
            name: 'Leadership Team',
            slug: 'leadership',
            type: 'department',
            adminEmail: 'aaron.fetters@transparent.partners',
            adminName: 'Aaron Fetters',
            description: 'Executive leadership and strategic direction',
            userCount: 6,
            agentCount: 3,
            status: 'active',
            createdAt: '2024-01-01'
          },
          {
            id: 'ai-solutions',
            name: 'AI Solutions',
            slug: 'ai-solutions',
            type: 'department',
            adminEmail: 'bryan.simkins@transparent.partners',
            adminName: 'Bryan Simkins',
            description: 'AI and technical solutions development',
            userCount: 8,
            agentCount: 4,
            status: 'active',
            createdAt: '2024-01-05'
          },
          {
            id: 'client-services',
            name: 'Client Services',
            slug: 'client-services',
            type: 'department',
            adminEmail: 'lindsey.daly@transparent.partners',
            adminName: 'Lindsey Daly',
            description: 'Client relationship and project management',
            userCount: 12,
            agentCount: 3,
            status: 'active',
            createdAt: '2024-01-10'
          },
          {
            id: 'analytics',
            name: 'Analytics & Insights',
            slug: 'analytics',
            type: 'department',
            adminEmail: 'josh.vincent@transparent.partners',
            adminName: 'Josh Vincent',
            description: 'Data analytics and strategic insights',
            userCount: 9,
            agentCount: 5,
            status: 'active',
            createdAt: '2024-01-15'
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
        id: 'tccc',
        name: 'TCCC',
        domain: 'tccc.com',
        logo: 'https://logo.clearbit.com/coca-cola.com',
        primaryColor: '#DC2626',
        secondaryColor: '#B91C1C',
        adminEmail: 'admin@tccc.com',
        adminName: 'TCCC Admin',
        userCount: 45,
        agentCount: 12,
        createdAt: '2024-01-10',
        status: 'active',
        networks: [
          {
            id: 'beverage-operations',
            name: 'Beverage Operations',
            slug: 'beverage',
            type: 'business_unit',
            adminEmail: 'beverage.admin@tccc.com',
            adminName: 'Lisa Chen',
            description: 'Beverage production and distribution',
            userCount: 20,
            agentCount: 5,
            status: 'active',
            icon: '🥤'
          },
          {
            id: 'marketing-branding',
            name: 'Marketing & Branding',
            slug: 'marketing',
            type: 'business_unit',
            adminEmail: 'marketing.admin@tccc.com',
            adminName: 'Mike Johnson',
            description: 'Marketing campaigns and brand management',
            userCount: 15,
            agentCount: 4,
            status: 'active',
            icon: '🎯'
          },
          {
            id: 'corporate-services',
            name: 'Corporate Services',
            slug: 'corporate',
            type: 'business_unit',
            adminEmail: 'corporate.admin@tccc.com',
            adminName: 'Sarah Wilson',
            description: 'HR, finance, and corporate operations',
            userCount: 10,
            agentCount: 3,
            status: 'active',
            icon: '🏢'
          }
        ]
      },
      {
        id: 'global-tech',
        name: 'Global Tech Solutions',
        domain: 'globaltech.io',
        logo: undefined,
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

  // Mock functions for development
  const handleAddAgentToCompanyLibrary = (companyId: string, agentId: string) => {
    const newLibraries = { ...mockCompanyLibraries };
    if (!newLibraries[companyId]) {
      newLibraries[companyId] = [];
    }
    if (!newLibraries[companyId].includes(agentId)) {
      newLibraries[companyId].push(agentId);
      setMockCompanyLibraries(newLibraries);
      toast.success(`Agent added to company library!`);
    }
  };

  const handleAddAgentToNetworkLibrary = (companyId: string, networkId: string, agentId: string) => {
    const newNetworkLibraries = { ...mockNetworkLibraries };
    if (!newNetworkLibraries[companyId]) {
      newNetworkLibraries[companyId] = {};
    }
    if (!newNetworkLibraries[companyId][networkId]) {
      newNetworkLibraries[companyId][networkId] = [];
    }
    if (!newNetworkLibraries[companyId][networkId].includes(agentId)) {
      newNetworkLibraries[companyId][networkId].push(agentId);
      setMockNetworkLibraries(newNetworkLibraries);
      toast.success(`Agent added to network library!`);
    }
  };

  const handleAddUserToCompany = (companyId: string, userData: { firstName: string; lastName: string; email: string; role: string }) => {
    const newUsers = { ...mockCompanyUsers };
    if (!newUsers[companyId]) {
      newUsers[companyId] = [];
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      status: 'active'
    };
    
    newUsers[companyId].push(newUser);
    setMockCompanyUsers(newUsers);
    toast.success(`User ${userData.firstName} ${userData.lastName} added to company!`);
  };

  const handleApproveRequest = (requestId: string) => {
    const newRequests = mockPendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    );
    setMockPendingRequests(newRequests);
    toast.success('Request approved successfully!');
  };

  const handleDenyRequest = (requestId: string) => {
    const newRequests = mockPendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'denied' as const } : req
    );
    setMockPendingRequests(newRequests);
    toast.success('Request denied successfully!');
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

        {/* Featured Company Libraries */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-red-900">Featured Company Libraries</h2>
              <p className="text-red-700 mt-1">Quick access to key company agent libraries</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                🎯 Presentation Ready
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Coca-Cola Library - Prominent */}
            <Link
              to="/company/tccc"
              className="p-4 bg-white border border-red-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img src="/coca-cola-logo.png" alt="Coca-Cola" className="w-10 h-10 rounded-lg" />
                <div>
                  <h3 className="font-bold text-red-900 text-lg">Coca-Cola Library</h3>
                  <p className="text-sm text-red-600">Marketing & Branding</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Access Project Harmony & Symphony marketing agents with full Coca-Cola branding</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600 font-medium">🎨 Coke Red Theme</span>
                <span className="text-xs text-red-600 font-medium">→ View Library</span>
              </div>
            </Link>

            {/* Transparent Partners Library */}
            <Link
              to="/company/transparent-partners"
              className="p-4 bg-white border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img src="/transparent-partners-logo.png" alt="Transparent Partners" className="w-10 h-10 rounded-lg" />
                <div>
                  <h3 className="font-bold text-purple-900 text-lg">Global Library</h3>
                  <p className="text-sm text-purple-600">All Available Agents</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Access the complete Transparent Partners agent library with all available agents</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-600 font-medium">🌐 Global Access</span>
                <span className="text-xs text-purple-600 font-medium">→ View Library</span>
              </div>
            </Link>

            {/* Acme Corp Library */}
            <Link
              to="/company/acme-corp"
              className="p-4 bg-white border border-green-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Acme Corp Library</h3>
                  <p className="text-sm text-green-600">Manufacturing & Ops</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">Access manufacturing and operations agents for Acme Corporation</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">🏭 Manufacturing</span>
                <span className="text-xs text-green-600 font-medium">→ View Library</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Company Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Company Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage companies, networks, and agent assignments</p>
              </div>
              <button
                onClick={() => setIsCreateCompanyModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Company
              </button>
            </div>
          </div>
          
          {/* Company Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Company List */}
          <div className="divide-y divide-gray-200">
            {companies
              .filter(company => 
                company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                company.domain.toLowerCase().includes(companySearchTerm.toLowerCase())
              )
              .map((company) => (
                <div key={company.id} className="p-6">
                  {/* Company Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-20 h-12 rounded-lg object-contain bg-gray-50 p-1" />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: company.primaryColor }}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500">{company.domain}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {company.userCount} users • {company.agentCount} agents
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {company.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedCompanies(prev => ({ ...prev, [company.id]: !prev[company.id] }))}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {expandedCompanies[company.id] ? 'Collapse' : 'Expand'}
                      </button>
                      <button
                        onClick={() => openCustomizeModal(company)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <SwatchIcon className="w-4 h-4 mr-2" />
                        Branding
                      </button>
                      <button
                        onClick={() => openAssignAdminModal(company)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Admin
                      </button>
                      <button
                        onClick={() => openAgentPermissionsModal(company)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CubeIcon className="w-4 h-4 mr-2" />
                        Agents
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Company Details */}
                  {expandedCompanies[company.id] && (
                    <div className="mt-6 space-y-6">
                      {/* Networks Section */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Networks</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {company.networks?.map((network) => (
                            <div key={network.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-900">{network.name}</h5>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  network.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {network.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">{network.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{network.userCount} users</span>
                                <span>{network.agentCount} agents</span>
                              </div>
                              <div className="mt-2">
                                <button
                                  onClick={() => openNetworkPermissionsModal(company, network)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Manage Permissions
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/company/${company.id}`}
                          className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                        >
                          📚 View Company Library
                        </Link>
                        <Link
                          to={`/company-admin`}
                          className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-colors"
                        >
                          ⚙️ Company Admin
                        </Link>
                        <button
                          onClick={() => openAgentPermissionsModal(company)}
                          className="inline-flex items-center px-4 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-colors"
                        >
                          🔐 Manage Agent Permissions
                        </button>
                      </div>

                      {/* Special Actions for TCCC (Coca-Cola) */}
                      {company.id === 'tccc' && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <img src="/coca-cola-logo.png" alt="Coca-Cola" className="w-6 h-6 rounded" />
                              <h4 className="text-md font-semibold text-red-900">Coca-Cola Special Access</h4>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              🎯 Presentation Ready
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Link
                              to="/company/tccc"
                              className="inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transition-colors"
                            >
                              🎨 View Coca-Cola Library
                            </Link>
                            <Link
                              to="/company-admin"
                              className="inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transition-colors"
                            >
                              ⚙️ Coca-Cola Admin
                            </Link>
                          </div>
                          <p className="text-xs text-red-600 mt-2">
                            Access Project Harmony & Symphony agents with full Coca-Cola branding and Coke Red theme
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Agent Assignment Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Agent Assignment Management</h2>
                <p className="text-sm text-gray-600 mt-1">Assign agents to companies and manage access permissions</p>
              </div>
              <button
                onClick={() => setIsAgentAssignmentModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Assign Agents
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Quick Assignment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Companies with Agents</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {companies.filter(c => c.agentCount > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Cog6ToothIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Total Agent Assignments</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {companies.reduce((total, c) => total + c.agentCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Active Assignments</p>
                    <p className="text-2xl font-semibold text-purple-600">
                      {companies.filter(c => c.status === 'active' && c.agentCount > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Agent Assignment Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Agents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="h-10 w-16 rounded-lg object-cover" />
                            ) : (
                              <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: company.primaryColor }}
                              >
                                {company.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.agentCount} agents</div>
                        <div className="text-sm text-gray-500">
                          {company.agentCount > 0 ? 'Active assignments' : 'No agents assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          company.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openAgentPermissionsModal(company)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                          >
                            Manage Agents
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setIsAgentAssignmentModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                          >
                            Add Agents
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Company Library Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Company Library Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage company libraries, users, and network assignments</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCompanyLibraryModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Manage Libraries
                </button>
                <button
                  onClick={() => setIsUserManagementModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Manage Users
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Access to Company Libraries */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-3">Quick Access to Company Libraries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Transparent Partners Library */}
              <Link
                to="/company/transparent-partners"
                className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img src="/transparent-partners-logo.png" alt="Transparent Partners" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h4 className="font-medium text-purple-900">Transparent Partners</h4>
                    <p className="text-sm text-purple-600">Global Agent Library</p>
                  </div>
                </div>
                <p className="text-sm text-purple-700">Access the main Transparent Partners agent library with all available agents</p>
              </Link>

              {/* Coca-Cola Library */}
              <Link
                to="/company/tccc"
                className="p-4 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg hover:border-red-300 hover:from-red-100 hover:to-pink-100 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img src="/coca-cola-logo.png" alt="Coca-Cola" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h4 className="font-medium text-red-900">Coca-Cola (TCCC)</h4>
                    <p className="text-sm text-red-600">Marketing & Branding Library</p>
                  </div>
                </div>
                <p className="text-sm text-red-700">Access the Coca-Cola branded library with Project Harmony & Symphony agents</p>
              </Link>

              {/* Acme Corp Library */}
              <Link
                to="/company/acme-corp"
                className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:border-green-300 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Acme Corporation</h4>
                    <p className="text-sm text-green-600">Manufacturing Library</p>
                  </div>
                </div>
                <p className="text-sm text-green-700">Access the Acme Corp library with manufacturing and operations agents</p>
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-indigo-900">Company Libraries</p>
                    <p className="text-2xl font-semibold text-indigo-600">{companies.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CubeIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Network Libraries</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {companies.reduce((total, c) => total + (c.networks?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Total Users</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {companies.reduce((total, c) => total + c.userCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Cog6ToothIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Pending Requests</p>
                    <p className="text-2xl font-semibold text-purple-600">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setIsCompanyLibraryModalOpen(true)}
                className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg hover:border-indigo-300 hover:from-indigo-100 hover:to-blue-100 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
                  <PlusIcon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Company Libraries</h3>
                <p className="text-sm text-indigo-700">Assign agents to company libraries and manage access</p>
              </button>

              <button
                onClick={() => setIsUserManagementModalOpen(true)}
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:border-green-300 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <UsersIcon className="h-8 w-8 text-green-600" />
                  <PlusIcon className="h-5 w-5 text-green-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">User Management</h3>
                <p className="text-sm text-green-700">Add and manage users in company libraries</p>
              </button>

              <button
                onClick={() => setIsNetworkAssignmentModalOpen(true)}
                className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:border-blue-300 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                  <PlusIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Network Assignment</h3>
                <p className="text-sm text-blue-700">Assign agents to specific networks within companies</p>
              </button>

              <button
                onClick={() => setIsRequestApprovalModalOpen(true)}
                className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Cog6ToothIcon className="h-8 w-8 text-purple-600" />
                  <svg className="h-5 w-5 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Request Approval</h3>
                <p className="text-sm text-purple-700">Review and approve agent access requests</p>
              </button>
            </div>
          </div>
        </div>

        {/* Global Agent Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Global Agent Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage system-wide agent settings and permissions</p>
              </div>
              <button
                onClick={openGlobalAgentModal}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <CubeIcon className="w-4 h-4 mr-2" />
                Manage Agents
              </button>
            </div>
          </div>
          <div className="p-6">
            <AgentManagement />
          </div>
        </div>
      </div>

      {/* Agent Assignment Modal */}
      {isAgentAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCompany ? `Assign Agents to ${selectedCompany.name}` : 'Assign Agents to Company'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select agents to assign and set their access permissions
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAgentAssignmentModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Company Selection (if not pre-selected) */}
            {!selectedCompany && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company
                </label>
                <select
                  onChange={(e) => {
                    const company = companies.find(c => c.id === e.target.value);
                    setSelectedCompany(company || null);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.domain})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Agent Assignment Interface */}
            {selectedCompany && (
              <div className="space-y-6">
                {/* Company Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {selectedCompany.logo ? (
                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-12 h-12 rounded-lg" />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: selectedCompany.primaryColor }}
                        >
                          {selectedCompany.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedCompany.name}</h4>
                      <p className="text-sm text-gray-500">{selectedCompany.domain}</p>
                      <p className="text-sm text-gray-600">
                        Currently has {selectedCompany.agentCount} agents assigned
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Agents */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Agents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {[
                      {
                        id: 'gemini-chat-agent',
                        name: 'Gemini Chat Agent',
                        description: 'Google Gemini AI chat assistant',
                        provider: 'google',
                        tier: 'free',
                        currentAssignment: companyAgentPermissions[selectedCompany.id]?.['gemini-chat-agent']?.granted || false
                      },
                      {
                        id: 'imagen-agent',
                        name: 'Imagen Agent',
                        description: 'Google Imagen AI image generation',
                        provider: 'google',
                        tier: 'premium',
                        currentAssignment: companyAgentPermissions[selectedCompany.id]?.['imagen-agent']?.granted || false
                      }
                    ].map((agent) => (
                      <div
                        key={agent.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          agent.currentAssignment
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{agent.name}</h5>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                agent.tier === 'free' ? 'bg-green-100 text-green-800' :
                                agent.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {agent.tier}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                            <p className="text-xs text-gray-500 capitalize">Provider: {agent.provider}</p>
                          </div>
                          <div className="ml-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={agent.currentAssignment}
                                onChange={(e) => {
                                  const newPermissions = { ...companyAgentPermissions };
                                  if (!newPermissions[selectedCompany.id]) {
                                    newPermissions[selectedCompany.id] = {};
                                  }
                                  newPermissions[selectedCompany.id][agent.id] = {
                                    granted: e.target.checked,
                                    assignmentType: e.target.checked ? 'direct' : 'free'
                                  };
                                  setCompanyAgentPermissions(newPermissions);
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {agent.currentAssignment ? 'Assigned' : 'Assign'}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment Type Selection */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Assignment Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="assignmentType"
                        value="free"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Free Access</div>
                        <div className="text-xs text-gray-500">Users can add directly</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="assignmentType"
                        value="direct"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Direct Assignment</div>
                        <div className="text-xs text-gray-500">Automatically available</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                              <input
                          type="radio"
                          name="assignmentType"
                          value="approval"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">Approval Required</div>
                        <div className="text-xs text-gray-500">Admin approval needed</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsAgentAssignmentModalOpen(false);
                      setSelectedCompany(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Save the agent permissions
                        await saveAgentPermissions();
                        toast.success(`Agents assigned to ${selectedCompany.name} successfully!`);
                        setIsAgentAssignmentModalOpen(false);
                        setSelectedCompany(null);
                      } catch (error) {
                        console.error('Error assigning agents:', error);
                        toast.error('Failed to assign agents. Please try again.');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Assign Selected Agents
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Library Management Modal */}
      {isCompanyLibraryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Company Library Management</h3>
                <p className="text-sm text-gray-600 mt-1">Assign agents to company libraries and manage access permissions</p>
              </div>
              <button
                onClick={() => setIsCompanyLibraryModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Company Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
              <select
                onChange={(e) => {
                  const company = companies.find(c => c.id === e.target.value);
                  setSelectedCompany(company || null);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.domain})
                  </option>
                ))}
              </select>
            </div>

            {/* Company Library Interface */}
            {selectedCompany && (
              <div className="space-y-6">
                {/* Company Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {selectedCompany.logo ? (
                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-20 h-12 rounded-lg object-contain bg-gray-50 p-1" />
                      ) : (
                        <div 
                          className="w-20 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: selectedCompany.primaryColor }}
                        >
                          {selectedCompany.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedCompany.name}</h4>
                      <p className="text-sm text-gray-500">{selectedCompany.domain}</p>
                      <p className="text-sm text-gray-600">
                        Library: {selectedCompany.agentCount} agents • {selectedCompany.userCount} users
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Agents Grid */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Agents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {[
                      { id: 'gemini-chat-agent', name: 'Gemini Chat Agent', description: 'Google Gemini AI chat assistant', provider: 'google', tier: 'free' },
                      { id: 'imagen-agent', name: 'Imagen Agent', description: 'Google Imagen AI image generation', provider: 'google', tier: 'premium' },
                      { id: 'custom-agent-1', name: 'Custom Agent 1', description: 'Custom AI assistant for business', provider: 'custom', tier: 'enterprise' },
                      { id: 'custom-agent-2', name: 'Custom Agent 2', description: 'Specialized workflow automation', provider: 'custom', tier: 'premium' }
                    ].map((agent) => (
                      <div key={agent.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{agent.name}</h5>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                agent.tier === 'free' ? 'bg-green-100 text-green-800' :
                                agent.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {agent.tier}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                            <p className="text-xs text-gray-500 capitalize">Provider: {agent.provider}</p>
                          </div>
                                                     <div className="ml-4">
                             <label className="flex items-center">
                               <input
                                 type="checkbox"
                                 checked={mockCompanyLibraries[selectedCompany.id]?.includes(agent.id) || false}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     handleAddAgentToCompanyLibrary(selectedCompany.id, agent.id);
                                   }
                                 }}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                               />
                               <span className="ml-2 text-sm text-gray-700">
                                 {mockCompanyLibraries[selectedCompany.id]?.includes(agent.id) ? 'In Library' : 'Add to Library'}
                               </span>
                             </label>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsCompanyLibraryModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Company library updated for ${selectedCompany.name}!`);
                      setIsCompanyLibraryModalOpen(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Library
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {isUserManagementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600 mt-1">Add and manage users in company libraries</p>
              </div>
              <button
                onClick={() => setIsUserManagementModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Company Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
              <select
                onChange={(e) => {
                  const company = companies.find(c => c.id === e.target.value);
                  setSelectedCompany(company || null);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.domain})
                  </option>
                ))}
              </select>
            </div>

            {/* User Management Interface */}
            {selectedCompany && (
              <div className="space-y-6">
                {/* Company Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {selectedCompany.logo ? (
                        <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-20 h-12 rounded-lg object-contain bg-gray-50 p-1" />
                      ) : (
                        <div 
                          className="w-20 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: selectedCompany.primaryColor }}
                        >
                          {selectedCompany.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedCompany.name}</h4>
                      <p className="text-sm text-gray-500">{selectedCompany.domain}</p>
                      <p className="text-sm text-gray-600">
                        Current users: {selectedCompany.userCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New User Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Add New User</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                       <input
                         id="firstName"
                         type="text"
                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="Enter first name"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                       <input
                         id="lastName"
                         type="text"
                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="Enter last name"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                       <input
                         id="email"
                         type="email"
                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="Enter email address"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                       <select id="role" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                         <option value="">Select role...</option>
                         <option value="user">User</option>
                         <option value="admin">Admin</option>
                         <option value="manager">Manager</option>
                       </select>
                     </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => {
                        const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
                        const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
                        const email = (document.getElementById('email') as HTMLInputElement)?.value;
                        const role = (document.getElementById('role') as HTMLSelectElement)?.value;
                        
                        if (firstName && lastName && email && role) {
                          handleAddUserToCompany(selectedCompany.id, { firstName, lastName, email, role });
                          // Clear form
                          (document.getElementById('firstName') as HTMLInputElement).value = '';
                          (document.getElementById('lastName') as HTMLInputElement).value = '';
                          (document.getElementById('email') as HTMLInputElement).value = '';
                          (document.getElementById('role') as HTMLSelectElement).value = '';
                        } else {
                          toast.error('Please fill in all fields');
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add User
                    </button>
                  </div>
                </div>

                {/* Add User to Network Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Assign Company User to Network</h4>
                  <p className="text-sm text-gray-600 mb-4">Users must already be company members. This assigns them to specific business units/networks.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Company User</label>
                      <select 
                        id="networkUserSelect"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a company user...</option>
                        {mockCompanyUsers[selectedCompany.id]?.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Network</label>
                      <select 
                        id="networkSelect"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a network...</option>
                        {selectedCompany.networks?.map((network) => (
                          <option key={network.id} value={network.id}>
                            {network.name} ({network.userCount} users)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Network Role</label>
                      <select 
                        id="networkRole"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select role...</option>
                        <option value="member">Member</option>
                        <option value="contributor">Contributor</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Network Access Level</label>
                      <select 
                        id="networkAccess"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select access...</option>
                        <option value="read">Read Only</option>
                        <option value="write">Read & Write</option>
                        <option value="admin">Full Access</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => {
                        const userId = (document.getElementById('networkUserSelect') as HTMLSelectElement)?.value;
                        const networkId = (document.getElementById('networkSelect') as HTMLSelectElement)?.value;
                        const role = (document.getElementById('networkRole') as HTMLSelectElement)?.value;
                        const access = (document.getElementById('networkAccess') as HTMLSelectElement)?.value;
                        
                        if (userId && networkId && role && access) {
                          // Mock function to add user to network
                          const user = mockCompanyUsers[selectedCompany.id]?.find(u => u.id === userId);
                          if (user) {
                            toast.success(`Assigned ${user.firstName} ${user.lastName} to network with ${role} role and ${access} access`);
                            // Clear form
                            (document.getElementById('networkUserSelect') as HTMLSelectElement).value = '';
                            (document.getElementById('networkSelect') as HTMLSelectElement).value = '';
                            (document.getElementById('networkRole') as HTMLSelectElement).value = '';
                            (document.getElementById('networkAccess') as HTMLSelectElement).value = '';
                          }
                        } else {
                          toast.error('Please fill in all fields');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Assign to Network
                    </button>
                  </div>
                </div>

                                {/* Company Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Company Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{mockCompanyUsers[selectedCompany.id]?.length || 0}</div>
                      <div className="text-sm text-blue-700">Total Users</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">4</div>
                      <div className="text-sm text-green-700">Networks</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">15</div>
                      <div className="text-sm text-purple-700">Total Agents</div>
                    </div>
                  </div>
                </div>

                {/* Company User Management Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Company User Management</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    User approvals and management are handled at the company level. 
                    Navigate to the Company Admin dashboard to approve users and manage company members.
                  </p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        // Navigate to company admin
                        window.location.href = `/company-admin/${selectedCompany.id}`;
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Go to Company Admin
                    </button>
                    <button 
                      onClick={() => {
                        toast.info('User management is handled by company administrators');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      View Company Users
                    </button>
                  </div>
                </div>

                {/* Active Users List */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Active Company Users</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mockCompanyUsers[selectedCompany.id]?.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => {
                                  toast.success(`Marked ${user.firstName} ${user.lastName} as active`);
                                }}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                Active
                              </button>
                              <button 
                                onClick={() => {
                                  toast.error(`Removed ${user.firstName} ${user.lastName} from company`);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                              No active users found. Add your first user above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsUserManagementModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Network Assignment Modal */}
      {isNetworkAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Network Agent Assignment</h3>
                <p className="text-sm text-gray-600 mt-1">Assign agents to specific networks within companies</p>
              </div>
              <button
                onClick={() => setIsNetworkAssignmentModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Company and Network Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
                <select
                  onChange={(e) => {
                    const company = companies.find(c => c.id === e.target.value);
                    setSelectedCompany(company || null);
                    setSelectedNetwork(null);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a company...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.domain})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Network</label>
                <select
                  onChange={(e) => {
                    if (selectedCompany) {
                      const network = selectedCompany.networks?.find(n => n.id === e.target.value);
                      setSelectedNetwork(network ? { company: selectedCompany, network } : null);
                    }
                  }}
                  disabled={!selectedCompany}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Choose a network...</option>
                  {selectedCompany?.networks?.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.name} ({network.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Network Assignment Interface */}
            {selectedCompany && selectedNetwork && (
              <div className="space-y-6">
                {/* Network Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <CubeIcon className="h-12 w-12 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-blue-900">{selectedNetwork.network.name}</h4>
                      <p className="text-sm text-blue-700 capitalize">{selectedNetwork.network.type} Network</p>
                      <p className="text-sm text-blue-600">
                        {selectedNetwork.network.description} • {selectedNetwork.network.userCount} users • {selectedNetwork.network.agentCount} agents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Agents for Network */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Assign Agents to Network</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {[
                      { id: 'gemini-chat-agent', name: 'Gemini Chat Agent', description: 'Google Gemini AI chat assistant', provider: 'google', tier: 'free' },
                      { id: 'imagen-agent', name: 'Imagen Agent', description: 'Google Imagen AI image generation', provider: 'google', tier: 'premium' },
                      { id: 'custom-agent-1', name: 'Custom Agent 1', description: 'Custom AI assistant for business', provider: 'custom', tier: 'enterprise' }
                    ].map((agent) => (
                      <div key={agent.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{agent.name}</h5>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                agent.tier === 'free' ? 'bg-green-100 text-green-800' :
                                agent.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {agent.tier}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                            <p className="text-xs text-gray-500 capitalize">Provider: {agent.provider}</p>
                          </div>
                                                     <div className="ml-4">
                             <label className="flex items-center">
                               <input
                                 type="checkbox"
                                 checked={mockNetworkLibraries[selectedCompany.id]?.[selectedNetwork.network.id]?.includes(agent.id) || false}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     handleAddAgentToNetworkLibrary(selectedCompany.id, selectedNetwork.network.id, agent.id);
                                   }
                                 }}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                               />
                               <span className="ml-2 text-sm text-gray-700">
                                 {mockNetworkLibraries[selectedCompany.id]?.[selectedNetwork.network.id]?.includes(agent.id) ? 'Assigned' : 'Assign'}
                               </span>
                             </label>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsNetworkAssignmentModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Agents assigned to ${selectedNetwork.network.name} network successfully!`);
                      setIsNetworkAssignmentModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Assign to Network
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Approval Modal */}
      {isRequestApprovalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Agent Request Approval</h3>
                <p className="text-sm text-gray-600 mt-1">Review and approve agent access requests from users</p>
              </div>
              <button
                onClick={() => setIsRequestApprovalModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Request List */}
            <div className="space-y-4">
              {mockPendingRequests.filter(req => req.status === 'pending').map((request) => (
                <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {request.userName.split(' ').map(n => n.charAt(0)).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{request.userName}</h4>
                          <p className="text-xs text-gray-500">{request.userEmail}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="ml-13">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Request:</strong> {request.requestReason}
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Company:</strong> {request.companyName} • <strong>Network:</strong> {request.networkName} • <strong>Requested:</strong> {request.requestedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="mt-3 flex space-x-2">
                      <button 
                        onClick={() => handleApproveRequest(request.id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDenyRequest(request.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Deny
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Request Info
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {mockPendingRequests.filter(req => req.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending requests at the moment.</p>
                  <p className="text-sm">All requests have been processed.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => setIsRequestApprovalModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">Comprehensive analytics for user and agent usage across all companies</p>
            </div>
            <button
              onClick={() => {
                // Navigate to analytics admin
                window.location.href = '/analytics-admin';
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Go to Analytics Admin
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-blue-700">Total Active Users</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-green-700">Total AI Agents</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-purple-600">89.2%</div>
                  <div className="text-sm text-purple-700">Agent Utilization</div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-orange-600">24.5hrs</div>
                  <div className="text-sm text-orange-700">Avg Session Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Activity Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily Active Users</span>
                  <span className="text-sm font-medium text-gray-900">1,847</span>
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weekly Active Users</span>
                  <span className="text-sm font-medium text-gray-900">2,156</span>
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Active Users</span>
                  <span className="text-sm font-medium text-gray-900">2,847</span>
                  <span className="text-sm text-green-600">+15.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New User Registrations</span>
                  <span className="text-sm font-medium text-gray-900">234</span>
                  <span className="text-sm text-green-600">+22.1%</span>
                </div>
              </div>
            </div>

            {/* Agent Performance Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Used Agent</span>
                  <span className="text-sm font-medium text-gray-900">Gemini Chat</span>
                  <span className="text-sm text-blue-600">89.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm font-medium text-gray-900">1.2s</span>
                  <span className="text-sm text-green-600">-15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900">94.7%</span>
                  <span className="text-sm text-green-600">+2.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Interactions</span>
                  <span className="text-sm font-medium text-gray-900">1.2M</span>
                  <span className="text-sm text-green-600">+18.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Usage Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Usage Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img className="h-8 w-8 rounded-full object-contain bg-gray-50" src="/transparent-partners-logo.png" alt="Transparent Partners" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Transparent Partners</div>
                          <div className="text-sm text-gray-500">transparent.partners</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        22 users
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 agents</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">28.5 hrs</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600">+18.2%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          <img className="h-6 w-6 rounded-full object-contain bg-gray-50" src="https://logo.clearbit.com/coca-cola.com" alt="TCCC" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">TCCC</div>
                          <div className="text-sm text-gray-500">tccc.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        156 users
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">23 agents</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">42.1 hrs</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600">+12.7%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">G</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Global Tech Solutions</div>
                          <div className="text-sm text-gray-500">globaltech.io</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        89 users
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18 agents</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">31.8 hrs</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600">+9.4%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Analytics Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-blue-900">Generate Reports</div>
                  <div className="text-sm text-blue-600">Export analytics data</div>
                </div>
              </div>
            </button>
            
            <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-green-900">Performance Insights</div>
                  <div className="text-sm text-green-600">Agent optimization tips</div>
                </div>
              </div>
            </button>
            
            <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-purple-900">Usage Alerts</div>
                  <div className="text-sm text-purple-600">Set monitoring rules</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
