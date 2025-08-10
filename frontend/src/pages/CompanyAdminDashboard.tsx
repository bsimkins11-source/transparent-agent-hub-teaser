import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyBrandingFromRoute } from '../contexts/CompanyBrandingContext';
import AgentAssignmentManager from '../components/AgentAssignmentManager';
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
  const [currentPermissions, setCurrentPermissions] = useState<any>({});
  const [stats, setStats] = useState<any>(null);
  
  // Modal states
  const [isAgentAssignmentModalOpen, setIsAgentAssignmentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<CompanyNetwork | null>(null);
  const [isNetworkAgentModalOpen, setIsNetworkAgentModalOpen] = useState(false);
  
  // Approval states
  const [pendingRequests, setPendingRequests] = useState<AgentRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showApprovalsSection, setShowApprovalsSection] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
      loadAvailableAgents();
      loadPermissionStats();
      loadPendingRequests();
    } else {
      setLoading(false);
    }
  }, [companyId, companyBranding]);

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
      
      console.log('Setting branded company data:', brandedCompany);
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
    
    console.log('Setting mock company data:', mockCompany);
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
                      className={`hidden w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                        companyBranding ? 'bg-gradient-to-br from-[var(--company-primary)] to-[var(--company-secondary)]' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}
                    >
                      {company.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                    </div>
                  </div>
                ) : (
                  // Fallback initials when no logo
                  <div 
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                      companyBranding ? 'bg-gradient-to-br from-[var(--company-primary)] to-[var(--company-secondary)]' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}
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
                className="px-3 py-1 text-sm font-medium rounded-full text-white"
                style={{
                  background: companyBranding 
                    ? `linear-gradient(135deg, var(--company-primary), var(--company-secondary))`
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
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
                <span>View Library</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Manage agents available to your company and assign them to networks
            </p>
            <div className="text-sm text-gray-500">
              {availableAgents.length} agents available • {stats?.totalGranted || 0} currently granted
            </div>
          </motion.div>

          {/* Network Management */}
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
                Network Management
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const networksSection = document.getElementById('networks-section');
                    networksSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
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
                  <UserGroupIcon className="w-5 h-5" />
                  <span>View All Networks</span>
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your company's networks and assign network administrators
            </p>
            <div className="text-sm text-gray-500 mb-4">
              {company?.networks?.length || 0} networks • {company?.networks?.reduce((sum, network) => sum + (network?.userCount || 0), 0) || 0} total users
            </div>
            
            {/* Quick Network Access */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Access</h4>
              <div className="flex flex-wrap gap-2">
                {company?.networks?.slice(0, 3).map((network) => (
                  <Link
                    key={network.id}
                    to={`/admin/network/${companyId}/${network.id}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    style={{
                      borderColor: companyBranding ? 'var(--company-secondary-200)' : '#e5e7eb'
                    }}
                  >
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{
                        background: companyBranding 
                          ? `linear-gradient(135deg, var(--company-secondary), var(--company-primary))`
                          : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      }}
                    >
                      <UserGroupIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{network.name || 'Unnamed Network'}</span>
                  </Link>
                ))}
                {(company?.networks?.length || 0) > 3 && (
                  <button
                    onClick={() => {
                      const networksSection = document.getElementById('networks-section');
                      networksSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      background: companyBranding ? 'var(--company-secondary-50)' : '#eff6ff',
                      border: `1px solid ${companyBranding ? 'var(--company-secondary-200)' : '#bfdbfe'}`,
                      color: companyBranding ? 'var(--company-secondary)' : '#1d4ed8'
                    }}
                  >
                    <span>+{(company?.networks?.length || 0) - 3} more</span>
                  </button>
                )}
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
                currentPermissions={{}} // TODO: Load network-specific permissions
                onSavePermissions={handleNetworkAgentAssignment}
                onClose={() => {
                  setIsNetworkAgentModalOpen(false);
                  setSelectedNetwork(null);
                }}
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