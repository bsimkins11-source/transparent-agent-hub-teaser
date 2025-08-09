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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AgentAssignmentManager from '../components/AgentAssignmentManager';
import StatCard from '../components/StatCard';
import {
  getCompanyAvailableAgents,
  getCompanyAgentPermissions,
  grantAgentsToNetwork,
  getCompanyPermissionStats
} from '../services/hierarchicalPermissionService';
import { Agent } from '../types/agent';
import toast from 'react-hot-toast';

interface CompanyNetwork {
  id: string;
  name: string;
  description: string;
  userCount: number;
  location?: string;
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
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [currentPermissions, setCurrentPermissions] = useState<any>({});
  const [stats, setStats] = useState<any>(null);
  
  // Modal states
  const [isAgentAssignmentModalOpen, setIsAgentAssignmentModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<CompanyNetwork | null>(null);
  const [isNetworkAgentModalOpen, setIsNetworkAgentModalOpen] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
      loadAvailableAgents();
      loadPermissionStats();
    }
  }, [companyId]);

  const loadCompanyData = () => {
    // Mock company data - in production this would come from Firestore
    const mockCompany: Company = {
      id: companyId!,
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
          location: 'New York'
        },
        {
          id: 'operations',
          name: 'Operations Team',
          description: 'Internal operations and support',
          userCount: 15,
          location: 'Remote'
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

  const handleNetworkAgentAssignment = async (
    permissions: { [agentId: string]: { granted: boolean; assignmentType: 'free' | 'direct' | 'approval' } }
  ) => {
    if (!selectedNetwork || !companyId || !userProfile) return;
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                {company.logo && (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-600">Company Administration</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
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
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Networks"
              value={company.networks.length}
              icon={<BuildingOfficeIcon className="w-8 h-8" />}
              color="text-green-600"
              bgColor="bg-green-100"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Total Users"
              value={company.networks.reduce((sum, network) => sum + network.userCount, 0)}
              icon={<UsersIcon className="w-8 h-8" />}
              color="text-purple-600"
              bgColor="bg-purple-100"
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
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Company Agent Library</h3>
              <button 
                onClick={() => setIsAgentAssignmentModalOpen(true)}
                className="btn-secondary flex items-center space-x-2"
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

          {/* Company Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Company Branding</h3>
              <button className="btn-secondary flex items-center space-x-2">
                <SwatchIcon className="w-5 h-5" />
                <span>Customize</span>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Customize your company's branding, colors, and logo
            </p>
            <div className="flex items-center space-x-4">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt="Company Logo"
                  className="w-8 h-8 rounded object-cover"
                />
              )}
              <div 
                className="w-6 h-6 rounded"
                style={{ backgroundColor: company.primaryColor }}
              ></div>
              <span className="text-sm text-gray-500">{company.domain}</span>
            </div>
          </motion.div>
        </div>

        {/* Networks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Networks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {company.networks.map((network, index) => (
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
                      <p className="text-sm text-gray-600">{network.location}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{network.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4 inline mr-1" />
                    {network.userCount} users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openNetworkAgentModal(network)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Agents
                    </button>
                    <Link
                      to={`/admin/network/${companyId}/${network.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage
                    </Link>
                  </div>
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
                description={`Agents available to ${company.name}. These agents have been granted by the Super Admin.`}
                availableAgents={availableAgents}
                currentPermissions={currentPermissions}
                onSavePermissions={async () => {
                  // Company admin can only view, not modify their own permissions
                  toast.info('Company agent permissions are managed by Super Admin');
                }}
                onClose={() => setIsAgentAssignmentModalOpen(false)}
                stats={stats}
              />
            </div>
          </div>
        )}

        {/* Network Agent Assignment Modal */}
        {isNetworkAgentModalOpen && selectedNetwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto p-6">
              <AgentAssignmentManager
                title={`${selectedNetwork.name} - Agent Assignment`}
                description={`Assign agents from your company library to ${selectedNetwork.name}. Only agents granted to your company can be assigned.`}
                availableAgents={availableAgents}
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
}