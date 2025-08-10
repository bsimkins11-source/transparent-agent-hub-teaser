import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

// Function to determine text color based on background brightness
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Validate hex color
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return '#ffffff' // Default to white for invalid colors
  }
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate brightness using YIQ formula
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  
  // Return black for light backgrounds, white for dark backgrounds
  return yiq >= 128 ? '#000000' : '#ffffff'
}
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SwatchIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyBrandingFromRoute } from '../contexts/CompanyBrandingContext';
import AgentAssignmentManager from '../components/AgentAssignmentManager';
import CompanyAgentLibraryManager from '../components/CompanyAgentLibraryManager';
import CompanyBrandingConfig from '../components/CompanyBrandingConfig';
import StatCard from '../components/StatCard';
import { canAccessCompanyAdmin } from '../utils/permissions';
import {
  getCompanyAvailableAgents,
  getCompanyAgentPermissions,
  grantAgentsToNetwork,
  getCompanyPermissionStats
} from '../services/hierarchicalPermissionService';
import { 
  getAgentRequests, 
  approveAgentRequest, 
  denyAgentRequest, 
  AgentRequest 
} from '../services/requestService';
import { addAgentToUserLibrary } from '../services/userLibraryService';
import { Agent } from '../types/agent';
import toast from 'react-hot-toast';
import { getCompanyUsers, getCompanyPendingRequests } from '../services/userManagementService';

interface CompanyNetwork {
  id: string;
  name: string;
  description: string;
  userCount: number;
  location?: string;
  agentCount?: number;
  adminName?: string;
  adminEmail?: string;
}

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  primaryColor?: string;
  networks: CompanyNetwork[];
}

export default function CompanyAdminDashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const { userProfile } = useAuth();
  const { companyBranding, loading: brandingLoading } = useCompanyBrandingFromRoute();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [currentPermissions, setCurrentPermissions] = useState<{ [agentId: string]: import('../services/hierarchicalPermissionService').AgentPermission }>({});
  const [stats, setStats] = useState<{
    totalAvailable: number;
    totalGranted: number;
    byTier: { [tier: string]: number };
  } | null>(null);
  const [networkAgentPermissions, setNetworkAgentPermissions] = useState<{[networkId: string]: {[agentId: string]: import('../services/hierarchicalPermissionService').AgentPermission}}>({});
  
  // Modal states
  const [isAgentAssignmentModalOpen, setIsAgentAssignmentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<CompanyNetwork | null>(null);
  const [isNetworkAgentModalOpen, setIsNetworkAgentModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBrandingConfigModalOpen, setIsBrandingConfigModalOpen] = useState(false);
  
  // Approval states
  const [pendingRequests, setPendingRequests] = useState<AgentRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showApprovalsSection, setShowApprovalsSection] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]); // Placeholder for company users
  const [pendingUserRequests, setPendingUserRequests] = useState<any[]>([]); // Placeholder for pending user requests
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'requests'

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
      loadAvailableAgents();
      loadPermissionStats();
      loadPendingRequests();
      loadCompanyUsers(); // Load company users
      loadPendingUserRequests(); // Load pending user requests
    } else {
      setLoading(false);
    }
  }, [companyId, companyBranding]);

  // Load network permissions when company data changes
  useEffect(() => {
    if (company && company.networks) {
      loadNetworkPermissions();
    }
  }, [company]);

  const loadCompanyData = () => {
    if (!companyId) {
      console.error('No companyId provided to CompanyAdminDashboard');
      setLoading(false);
      return;
    }

    // Use company branding context if available, otherwise fall back to mock data
    if (companyBranding) {
      const brandedCompany: Company = {
        id: companyId,
        name: companyBranding.name,
        domain: companyBranding.domain,
        logo: companyBranding.logo,
        primaryColor: companyBranding.primaryColor,
        networks: [
          {
            id: 'consulting',
            name: 'Consulting Division',
            description: 'Strategic consulting and advisory services',
            userCount: 25,
            location: 'New York',
            agentCount: 8,
            adminName: 'Sarah Johnson',
            adminEmail: 'sarah.johnson@company.com'
          },
          {
            id: 'operations',
            name: 'Operations Team',
            description: 'Internal operations and support',
            userCount: 15,
            location: 'Remote',
            agentCount: 5,
            adminName: 'Mike Chen',
            adminEmail: 'mike.chen@company.com'
          }
        ]
      };
      
      
      setCompany(brandedCompany);
      setLoading(false);
      return;
    }

    // Fallback to mock company data - in production this would come from Firestore
    const mockCompany: Company = {
      id: companyId,
      name: companyId === 'transparent-partners' ? 'Transparent Partners' : 'Sample Company',
      domain: companyId === 'transparent-partners' ? 'transparent.partners' : 'sample.com',
      logo: companyId === 'transparent-partners' ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&h=120&fit=crop&crop=center' : undefined,
      primaryColor: companyId === 'transparent-partners' ? '#2563eb' : '#6366f1',
      networks: [
        {
          id: 'consulting',
          name: 'Consulting Division',
          description: 'Strategic consulting and advisory services',
          userCount: 25,
          location: 'New York',
          agentCount: 8,
          adminName: 'Sarah Johnson',
          adminEmail: 'sarah.johnson@company.com'
        },
        {
          id: 'operations',
          name: 'Operations Team',
          description: 'Internal operations and support',
          userCount: 15,
          location: 'Remote',
          agentCount: 5,
          adminName: 'Mike Chen',
          adminEmail: 'mike.chen@company.com'
        }
      ]
    };
    
    
    setCompany(mockCompany);
    setLoading(false);
  };

  const loadAvailableAgents = async () => {
    if (!companyId) return;
    
    try {
      const agents = await getCompanyAvailableAgents(companyId);
      setAvailableAgents(agents);
      
      const permissions = await getCompanyAgentPermissions(companyId);
      setCurrentPermissions(permissions?.permissions || {});
    } catch (error) {
      console.error('Failed to load available agents:', error);
      toast.error('Failed to load available agents');
    }
  };

  const loadPermissionStats = async () => {
    if (!companyId) return;
    
    try {
      const statsData = await getCompanyPermissionStats(companyId);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load permission stats:', error);
    }
  };

  const loadNetworkPermissions = async () => {
    if (!companyId) return;
    
    try {
      const { getNetworkAgentPermissions } = await import('../services/hierarchicalPermissionService');
      const networkPermissions: {[networkId: string]: {[agentId: string]: import('../services/hierarchicalPermissionService').AgentPermission}} = {};
      
      // Load permissions for each network
      for (const network of company?.networks || []) {
        const permissions = await getNetworkAgentPermissions(companyId, network.id);
        if (permissions) {
          networkPermissions[network.id] = permissions.permissions;
        }
      }
      
      setNetworkAgentPermissions(networkPermissions);
    } catch (error) {
      console.error('Failed to load network permissions:', error);
    }
  };

  const handleNetworkAgentAssignment = async (
    permissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } }
  ) => {
    if (!selectedNetwork || !selectedNetwork.id || !companyId || !userProfile) return;
    
    try {
      await grantAgentsToNetwork(
        companyId,
        selectedNetwork.id,
        selectedNetwork.name,
        permissions,
        userProfile.uid,
        userProfile.displayName
      );
      
      setIsNetworkAgentModalOpen(false);
      setSelectedNetwork(null);
      toast.success(`Agent permissions updated for ${selectedNetwork.name}`);
    } catch (error) {
      console.error('Failed to update network agent permissions:', error);
      toast.error('Failed to update network agent permissions');
    }
  };

  const openNetworkAgentModal = (network: CompanyNetwork) => {
    setSelectedNetwork(network);
    setIsNetworkAgentModalOpen(true);
  };

  const loadPendingRequests = async () => {
    if (!userProfile?.uid || !companyId) return;
    
    // Only company admin and super admin should load company-level requests
    if (!canAccessCompanyAdmin(userProfile)) return;

    try {
      const approvalLevel = userProfile.role === 'super_admin' ? 'super_admin' : 'company_admin';
      const requests = await getAgentRequests(
        approvalLevel,
        companyId,
        undefined // No specific network for company admin
      );
      
      const pendingOnly = requests.filter(req => req.status === 'pending');
      setPendingRequests(pendingOnly);
      
      // Show approvals section if there are pending requests
      if (pendingOnly.length > 0) {
        setShowApprovalsSection(true);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const handleApprove = async (request: AgentRequest) => {
    if (!userProfile?.uid || !request?.id) return;

    try {
      setProcessingRequest(request.id);

      // Approve the request
      await approveAgentRequest(
        request.id,
        userProfile.uid,
        userProfile.email || '',
        userProfile.displayName || 'Company Admin',
        'Request approved by company admin'
      );

      // Add agent directly to user's library
      await addAgentToUserLibrary(
        request.userId,
        request.userEmail,
        request.userName,
        request.agentId,
        request.agentName,
        request.organizationId,
        request.organizationName,
        request.networkId,
        request.networkName,
        'Approved by company admin'
      );

      toast.success(`✅ Approved ${request.agentName} for ${request.userName}`);
      await loadPendingRequests(); // Refresh the list

    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeny = async (request: AgentRequest, reason?: string) => {
    if (!userProfile?.uid || !request?.id) return;

    try {
      setProcessingRequest(request.id);

      await denyAgentRequest(
        request.id,
        userProfile.uid,
        userProfile.email || '',
        userProfile.displayName || 'Company Admin',
        reason || 'Request denied by company admin'
      );

      toast.success(`❌ Denied ${request.agentName} request from ${request.userName}`);
      await loadPendingRequests(); // Refresh the list

    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const loadCompanyUsers = async () => {
    if (!companyId) return;
    try {
      const users = await getCompanyUsers(companyId);
      setCompanyUsers(users);
    } catch (error) {
      console.error('Failed to load company users:', error);
      toast.error('Failed to load company users');
    }
  };

  const loadPendingUserRequests = async () => {
    if (!companyId) return;
    try {
      const requests = await getCompanyPendingRequests(companyId);
      setPendingUserRequests(requests);
    } catch (error) {
      console.error('Failed to load pending user requests:', error);
      toast.error('Failed to load pending user requests');
    }
  };

  const handleApproveUserRequest = async (request: any) => {
    if (!userProfile?.uid || !request?.id) return;

    try {
      setProcessingRequest(request.id);

      await approveAgentRequest(
        request.id,
        userProfile.uid,
        userProfile.email || '',
        userProfile.displayName || 'Company Admin',
        'Request approved by company admin'
      );

      // Add agent directly to user's library
      await addAgentToUserLibrary(
        request.userId,
        request.userEmail,
        request.userName,
        request.agentId,
        request.agentName,
        request.organizationId,
        request.organizationName,
        request.networkId,
        request.networkName,
        'Approved by company admin'
      );

      toast.success(`✅ Approved ${request.agentName} for ${request.userName}`);
      await loadPendingUserRequests(); // Refresh the list

    } catch (error) {
      console.error('Error approving user request:', error);
      toast.error('Failed to approve user request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDenyUserRequest = async (request: any) => {
    if (!userProfile?.uid || !request?.id) return;

    try {
      setProcessingRequest(request.id);

      await denyAgentRequest(
        request.id,
        userProfile.uid,
        userProfile.email || '',
        userProfile.displayName || 'Company Admin',
        'Request denied by company admin'
      );

      toast.success(`❌ Denied ${request.agentName} request from ${request.userName}`);
      await loadPendingUserRequests(); // Refresh the list

    } catch (error) {
      console.error('Error denying user request:', error);
      toast.error('Failed to deny user request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRemoveUser = async (user: any) => {
    if (!userProfile?.uid || !companyId || !user?.id) return;

    try {
      setProcessingRequest(user.id);

      // In a real app, you would send a request to remove the user from the company
      // For this example, we'll just toast a success message
      toast.success(`User ${user.displayName} removed from company portal.`);
      await loadCompanyUsers(); // Refresh the list

    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    } finally {
      setProcessingRequest(null);
    }
  };


  // Wait for auth to load before checking access
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Additional safety check for userProfile properties
  if (!userProfile.uid || !userProfile.role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid User Profile</h2>
          <p className="text-gray-600 mb-4">User profile is missing required information.</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if companyId is available
  if (!companyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company ID Missing</h2>
          <p className="text-gray-600 mb-6">
            No company ID was provided. Please navigate to this page from the company selection portal.
          </p>
          <Link 
            to="/admin/super" 
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Super Admin
          </Link>
        </div>
      </div>
    );
  }

  // Access control - only super admin and company admin can access
  if (userProfile && !canAccessCompanyAdmin(userProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the Company Admin dashboard. 
            Only Super Admins and Company Admins can view this page.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Your current role: <span className="font-medium">{userProfile.role}</span></p>
            <p className="text-sm text-gray-500">Required roles: Super Admin or Company Admin</p>
          </div>
          <Link 
            to="/my-agents" 
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to My Agents
          </Link>
        </div>
      </div>
    );
  }

  if (loading || brandingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {brandingLoading ? 'Loading company branding...' : 'Loading company data...'}
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">The requested company could not be found.</p>
          <Link to="/admin/super" className="text-blue-600 hover:text-blue-700">
            Return to Super Admin
          </Link>
        </div>
      </div>
    );
  }

  // Final safety check - ensure all required data is available
  if (!company || !availableAgents || !currentPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/super"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-4">
                {/* Company Logo */}
                {company?.logo ? (
                  <div className="relative">
                    <img 
                      src={company.logo} 
                      alt={company.name}
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
                      className={`hidden w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                        companyBranding ? 'bg-gradient-to-br from-[var(--company-primary)] to-[var(--company-secondary)]' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}
                      style={{
                        color: companyBranding ? getContrastColor(getComputedStyle(document.documentElement).getPropertyValue('--company-primary').trim()) : '#ffffff'
                      }}
                    >
                      {company.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                    </div>
                  </div>
                ) : (
                  // Fallback initials when no logo
                  <div 
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                      companyBranding ? 'bg-gradient-to-br from-[var(--company-primary)] to-[var(--company-secondary)]' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}
                    style={{
                      color: companyBranding ? getContrastColor(getComputedStyle(document.documentElement).getPropertyValue('--company-primary').trim()) : '#ffffff'
                    }}
                  >
                    {company?.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>
                )}
                
                <div>
                  <h1 
                    className="text-3xl font-bold"
                    style={{
                      color: companyBranding ? 'var(--company-primary)' : '#111827'
                    }}
                  >
                    {company?.name}
                  </h1>
                  <p className="text-gray-600">Company Administration</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span 
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{
                  background: companyBranding 
                    ? `linear-gradient(135deg, var(--company-primary), var(--company-secondary))`
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: companyBranding ? getContrastColor(getComputedStyle(document.documentElement).getPropertyValue('--company-primary').trim()) : '#ffffff'
                }}
              >
                Company Admin
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Available Agents"
              value={availableAgents.length}
              icon={<CubeIcon className="w-8 h-8" />}
              color={companyBranding ? 'text-[var(--company-primary)]' : 'text-blue-600'}
              bgColor={companyBranding ? 'bg-[var(--company-primary-100)]' : 'bg-blue-100'}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Networks"
              value={company?.networks?.length || 0}
              icon={<BuildingOfficeIcon className="w-8 h-8" />}
              color={companyBranding ? 'text-[var(--company-secondary)]' : 'text-green-600'}
              bgColor={companyBranding ? 'bg-[var(--company-secondary-100)]' : 'bg-green-100'}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Total Users"
              value={company?.networks?.reduce((sum, network) => sum + network.userCount, 0) || 0}
              icon={<UsersIcon className="w-8 h-8" />}
              color={companyBranding ? 'text-[var(--company-primary)]' : 'text-purple-600'}
              bgColor={companyBranding ? 'bg-[var(--company-primary-100)]' : 'bg-purple-100'}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Granted Agents"
              value={stats?.totalGranted || 0}
              icon={<ChartBarIcon className="w-8 h-8" />}
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Company Agent Library */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
            style={{
              borderColor: companyBranding ? 'var(--company-primary-200)' : '#e5e7eb'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-xl font-semibold"
                style={{
                  color: companyBranding ? 'var(--company-primary)' : '#111827'
                }}
              >
                Company Agent Library
              </h3>
              <button 
                onClick={() => setIsAgentAssignmentModalOpen(true)}
                className="btn-secondary flex items-center space-x-2"
                style={{
                  background: companyBranding 
                    ? 'var(--company-primary-100)'
                    : undefined,
                  color: companyBranding 
                    ? 'var(--company-primary)'
                    : undefined,
                  borderColor: companyBranding 
                    ? 'var(--company-primary-200)'
                    : undefined
                }}
              >
                <CubeIcon className="w-5 h-5" />
                <span>Manage Distribution</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Agents assigned to your company by the super admin. You can distribute these to users and networks.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              {availableAgents.length} agents available • {stats?.totalGranted || 0} currently distributed
            </div>
            
            {/* Agent Distribution Status */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CubeIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900">Agent Distribution</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    These agents are pre-approved by the super admin. You can assign them to users and networks within your company.
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    <strong>Note:</strong> You cannot add new agents to the company library. Contact the super admin for additional agents.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
            style={{
              borderColor: companyBranding ? 'var(--company-secondary-200)' : '#e5e7eb'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-xl font-semibold"
                style={{
                  color: companyBranding ? 'var(--company-secondary)' : '#111827'
                }}
              >
                User Management
              </h3>
              <button 
                onClick={() => setIsUserManagementModalOpen(true)}
                className="btn-secondary flex items-center space-x-2"
                style={{
                  background: companyBranding 
                    ? 'var(--company-secondary-100)'
                    : undefined,
                  color: companyBranding 
                    ? 'var(--company-secondary)'
                    : undefined,
                  borderColor: companyBranding 
                    ? 'var(--company-secondary-200)'
                    : undefined
                }}
              >
                <UsersIcon className="w-5 h-5" />
                <span>Manage Users</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Add users to company portal, manage their agent libraries, and handle approval requests for agents from the company library.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              {companyUsers?.length || 0} company users • {pendingUserRequests?.length || 0} pending agent requests
            </div>
            
            {/* User Workflow Explanation */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-900">User Agent Workflow</h4>
                  <div className="text-sm text-green-700 mt-1 space-y-1">
                    <p>• <strong>New users</strong> get a dedicated agent library automatically</p>
                    <p>• <strong>Users can request</strong> agents from the company library</p>
                    <p>• <strong>Company admins approve/deny</strong> requests for premium agents</p>
                    <p>• <strong>Network users</strong> go through network admin approval first</p>
                    <p>• <strong>Approved agents</strong> are automatically added to user's library</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick User Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{
                    borderColor: companyBranding ? 'var(--company-secondary-200)' : '#e5e7eb'
                  }}
                >
                  <UserPlusIcon className="w-4 h-4" />
                  <span>Add User</span>
                </button>
                <button
                  onClick={() => setIsUserManagementModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{
                    borderColor: companyBranding ? 'var(--company-secondary-200)' : '#e5e7eb'
                  }}
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>View All Users</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pending Approvals Section */}
        {showApprovalsSection && pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="w-6 h-6 text-yellow-500 mr-2" />
                    Pending Agent Approvals
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {pendingRequests.length} user{pendingRequests.length !== 1 ? 's' : ''} waiting for agent access approval
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  {pendingRequests.length} pending
                </span>
              </div>
              
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <CubeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.agentName}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <span>{request.userName}</span>
                              <span className="text-gray-400">({request.userEmail})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-4">
                            <span><strong>Network:</strong> {request.networkName || 'Company-wide'}</span>
                            <span><strong>Requested:</strong> {new Date(request.requestedAt).toLocaleDateString()}</span>
                          </div>
                          {request.requestReason && (
                            <p className="mt-1"><strong>Reason:</strong> {request.requestReason}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Pending Review
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => handleDeny(request)}
                          disabled={processingRequest === request.id}
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processingRequest === request.id ? '...' : 'Deny'}
                        </button>
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={processingRequest === request.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processingRequest === request.id ? '...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {pendingRequests.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending approval requests</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Company Branding Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <SwatchIcon className="w-6 h-6 text-purple-500 mr-2" />
                Company Branding
              </h2>
              <p className="text-gray-600 mt-1">
                Configure company colors, logos, and UI settings. Networks and users will inherit these configurations.
              </p>
            </div>
            <button
              onClick={() => setIsBrandingConfigModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Configure Branding
            </button>
          </div>

          {/* Current Branding Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-gray-200">
                {company?.logo ? (
                  <img 
                    src={company.logo} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">Company Logo</p>
              <p className="text-xs text-gray-500">
                {company?.logo ? 'Logo configured' : 'No logo set'}
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-xl border-2 border-gray-200 flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: companyBranding?.primaryColor || company?.primaryColor || '#3b82f6'
                }}
              >
                Primary
              </div>
              <p className="text-sm font-medium text-gray-900">Primary Color</p>
              <p className="text-xs text-gray-500">
                {companyBranding?.primaryColor || company?.primaryColor || '#3b82f6'}
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-xl border-2 border-gray-200 flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: companyBranding?.secondaryColor || '#8b5cf6'
                }}
              >
                Secondary
              </div>
              <p className="text-sm font-medium text-gray-900">Secondary Color</p>
              <p className="text-xs text-gray-500">
                {companyBranding?.secondaryColor || '#8b5cf6'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Company Available Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <CubeIcon className="w-6 h-6 text-blue-500 mr-2" />
                Available Agents from Super Admin
              </h2>
              <p className="text-gray-600 mt-1">
                These agents have been assigned to your company by the super admin. You can distribute them to users and networks.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{availableAgents.length}</div>
              <div className="text-sm text-gray-500">Total Agents</div>
            </div>
          </div>

          {availableAgents.length === 0 ? (
            <div className="text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No agents assigned yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Contact the super admin to request agents for your company.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAgents.slice(0, 6).map((agent) => (
                <div key={agent.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{agent.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{agent.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          agent.metadata?.tier === 'premium' 
                            ? 'bg-purple-100 text-purple-800'
                            : agent.metadata?.tier === 'enterprise'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {agent.metadata?.tier || 'free'}
                        </span>
                        {agent.metadata?.permissionType === 'approval' && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Approval Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {availableAgents.length > 6 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <CubeIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      +{availableAgents.length - 6} more agents
                    </p>
                    <button 
                      onClick={() => setIsAgentAssignmentModalOpen(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Distribution Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{stats?.totalGranted || 0}</div>
                <div className="text-sm text-gray-500">Distributed to Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {availableAgents.filter(agent => agent.metadata?.permissionType === 'approval').length}
                </div>
                <div className="text-sm text-gray-500">Require Approval</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {availableAgents.filter(agent => agent.metadata?.tier === 'premium').length}
                </div>
                <div className="text-sm text-gray-500">Premium Agents</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Networks Grid */}
        <motion.div
          id="networks-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Networks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {company?.networks?.map((network, index) => (
              <motion.div
                key={network.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{network.name}</h3>
                      <p className="text-sm text-gray-600">{network.location || 'No location specified'}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{network.description || 'No description available'}</p>
                
                {/* Network Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{network.userCount || 0}</div>
                    <div className="text-xs text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{network.agentCount || 0}</div>
                    <div className="text-xs text-gray-500">Agents</div>
                  </div>
                </div>

                {/* Network Admin Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-900">Network Admin</div>
                  <div className="text-xs text-gray-600">{network.adminName || 'Not Assigned'}</div>
                  <div className="text-xs text-gray-500">{network.adminEmail || 'No email'}</div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    to={`/admin/network/${companyId}/${network.id}`}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    <span>📡 Manage Network</span>
                  </Link>
                  <button
                    onClick={() => openNetworkAgentModal(network)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <CubeIcon className="w-5 h-5" />
                    <span>🎯 Assign Agents</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Agent Library Modal */}
        {isAgentAssignmentModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto p-6">
              <AgentAssignmentManager
                title="Company Agent Library"
                description={`Agents available to ${company?.name || 'this company'}. These agents have been granted by the Super Admin.`}
                availableAgents={availableAgents || []}
                currentPermissions={currentPermissions || {}}
                onSavePermissions={async () => {
                  // Company admin can only view, not modify their own permissions
                  toast.success('Company agent permissions are managed by Super Admin');
                }}
                onClose={() => setIsAgentAssignmentModalOpen(false)}
                stats={stats || undefined}
              />
            </div>
          </div>
        )}

        {/* Network Agent Assignment Modal */}
        {isNetworkAgentModalOpen && selectedNetwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto p-6">
              <AgentAssignmentManager
                title={`${selectedNetwork?.name || 'Network'} - Agent Assignment`}
                description={`Assign agents from your company library to ${selectedNetwork?.name || 'this network'}. Only agents granted to your company can be assigned.`}
                availableAgents={availableAgents || []}
                currentPermissions={networkAgentPermissions[selectedNetwork.id] || {}}
                onSavePermissions={handleNetworkAgentAssignment}
                onClose={() => {
                  setIsNetworkAgentModalOpen(false);
                  setSelectedNetwork(null);
                }}
              />
            </div>
          </div>
        )}

        {/* User Management Modal */}
        {isUserManagementModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
                  <p className="text-gray-600">Manage users in your company portal, including adding new users, viewing their agent libraries, and handling approval requests.</p>
                </div>
                <button
                  onClick={() => setIsUserManagementModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* User Management Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'users' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Company Users ({companyUsers?.length || 0})
                  </button>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'requests' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Pending Requests ({pendingUserRequests?.length || 0})
                  </button>
                </nav>
              </div>

              {/* Company Users Section */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Company Users</h4>
                    <button
                      onClick={() => {
                        setIsUserManagementModalOpen(false);
                        setIsAddUserModalOpen(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Add User
                    </button>
                  </div>

                  {companyUsers?.length === 0 ? (
                    <div className="text-center py-12">
                      <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No users yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding your first user to the company portal.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Library</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {companyUsers?.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.status === 'active' 
                                    ? 'bg-green-100 text-green-800'
                                    : user.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                  View Library ({user.agentLibraryCount})
                                </button>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button 
                                  onClick={() => handleRemoveUser(user)}
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
                  )}
                </div>
              )}

              {/* Pending Requests Section */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Pending Agent Requests</h4>
                    <p className="text-sm text-gray-500">
                      Review and approve/deny requests for agents from the company library
                    </p>
                  </div>

                  {/* Approval Workflow Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900">Approval Workflow</h4>
                        <div className="text-sm text-blue-700 mt-1 space-y-1">
                          <p>• <strong>Company users:</strong> Requests go directly to company admin</p>
                          <p>• <strong>Network users:</strong> Requests go to network admin first, then company admin if approved</p>
                          <p>• <strong>Premium agents:</strong> Always require approval regardless of user type</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {pendingUserRequests?.length === 0 ? (
                    <div className="text-center py-12">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                      <p className="mt-1 text-sm text-gray-500">All agent requests have been processed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingUserRequests?.map((request) => (
                        <div key={request.id} className="bg-white rounded-lg shadow-sm border p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h5 className="text-sm font-medium text-gray-900">
                                  {request.userName} ({request.userEmail})
                                </h5>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  request.priority === 'urgent' 
                                    ? 'bg-red-100 text-red-800'
                                    : request.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800'
                                    : request.priority === 'normal'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {request.priority}
                                </span>
                                {request.networkName && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Network: {request.networkName}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Requesting:</strong> {request.agentName} 
                                <span className="text-xs text-gray-500 ml-2">
                                  (from company library)
                                </span>
                              </p>
                              {request.requestReason && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Reason:</strong> {request.requestReason}
                                </p>
                              )}
                              {request.businessJustification && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Business Case:</strong> {request.businessJustification}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Requested: {new Date(request.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveUserRequest(request)}
                                disabled={processingRequest === request.id}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {processingRequest === request.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleDenyUserRequest(request)}
                                disabled={processingRequest === request.id}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                {processingRequest === request.id ? 'Processing...' : 'Deny'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-xl font-semibold mb-4">Add New User</h3>
              <p className="text-gray-600 mb-4">Enter the email address of the user you want to add.</p>
              <input
                type="email"
                placeholder="User's email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                  if (emailInput && emailInput.value) {
                    // In a real app, you would send this email to a user management service
                    // For now, we'll just toast a success message
                    toast.success(`User invitation sent to ${emailInput.value}`);
                    setIsAddUserModalOpen(false);
                    emailInput.value = ''; // Clear input
                  } else {
                    toast.error('Please enter a valid email address.');
                  }
                }}
                className="mt-4 w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        )}

        {/* Company Branding Configuration Modal */}
        {isBrandingConfigModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto p-6">
              <CompanyBrandingConfig
                companyId={companyId || ''}
                onClose={() => setIsBrandingConfigModalOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error rendering CompanyAdminDashboard:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Render Error</h2>
          <p className="text-gray-600 mb-6">
            An error occurred while rendering the dashboard. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}