import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  CubeIcon,
  SwatchIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
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

interface AgentRequest {
  id: string;
  userName: string;
  userEmail: string;
  agentName: string;
  priority: 'low' | 'medium' | 'high';
  networkName?: string;
  requestReason: string;
  businessJustification: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'denied';
}

interface UserRequest {
  id: string;
  userName: string;
  userEmail: string;
  role: string;
  department: string;
  requestReason: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'denied';
}

export default function CompanyAdminDashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const effectiveCompanyId = companyId || 'transparent-partners';
  
  // Mock data for development
  const [networks] = useState<CompanyNetwork[]>([
    {
      id: 'leadership',
      name: 'Leadership Team',
      description: 'Executive leadership and strategic direction',
      userCount: 6,
      location: 'Chicago',
      agentCount: 3,
      adminName: 'Aaron Fetters',
      adminEmail: 'aaron.fetters@transparent.partners'
    },
    {
      id: 'ai-solutions',
      name: 'AI Solutions',
      description: 'AI and technical solutions development',
      userCount: 8,
      location: 'Chicago',
      agentCount: 4,
      adminName: 'Bryan Simkins',
      adminEmail: 'bryan.simkins@transparent.partners'
    },
    {
      id: 'client-services',
      name: 'Client Services',
      description: 'Client relationship and project management',
      userCount: 12,
      location: 'Chicago',
      agentCount: 3,
      adminName: 'Lindsey Daly',
      adminEmail: 'lindsey.daly@transparent.partners'
    },
    {
      id: 'analytics',
      name: 'Analytics & Insights',
      description: 'Data analytics and business intelligence',
      userCount: 9,
      location: 'Chicago',
      agentCount: 5,
      adminName: 'Josh Vincent',
      adminEmail: 'josh.vincent@transparent.partners'
    }
  ]);

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const [pendingAgentRequests] = useState<AgentRequest[]>([
    {
      id: 'req-1',
      userName: 'Oliver Amidei',
      userEmail: 'oliver.amidei@transparent.partners',
      agentName: 'Gemini Chat Agent',
      priority: 'high',
      networkName: 'AI Solutions',
      requestReason: 'Need AI assistance for client data strategy development',
      businessJustification: 'Will improve client delivery efficiency and enable more sophisticated analysis',
      requestedAt: new Date('2024-01-15'),
      status: 'pending'
    },
    {
      id: 'req-2',
      userName: 'Amanda Nianick',
      userEmail: 'amanda.nianick@transparent.partners',
      agentName: 'Imagen Agent',
      priority: 'medium',
      networkName: 'Client Services',
      requestReason: 'AI image generation for client presentations and marketing materials',
      businessJustification: 'Critical for creating engaging client deliverables and improving visual communication',
      requestedAt: new Date('2024-01-14'),
      status: 'pending'
    }
  ]);

  const [pendingUserRequests] = useState<UserRequest[]>([
    {
      id: 'user-req-1',
      userName: 'Rebecca Siems',
      userEmail: 'rebecca.siems@transparent.partners',
      role: 'Senior Analyst',
      department: 'Analytics & Insights',
      requestReason: 'New team member needs access to company library and AI agents',
      requestedAt: new Date('2024-01-13'),
      status: 'pending'
    }
  ]);

  useEffect(() => {
    if (effectiveCompanyId) {
      loadCompanyData();
    }
  }, [effectiveCompanyId]);

  const loadCompanyData = () => {
    const mockCompany: Company = {
      id: effectiveCompanyId,
              name: effectiveCompanyId === 'transparent-partners' ? 'Transparent Partners' : 'Transparent Partners',
        domain: effectiveCompanyId === 'transparent-partners' ? 'transparent.partners' : 'transparent.partners',
        logo: effectiveCompanyId === 'transparent-partners' ? '/transparent-partners-logo.png' : '/transparent-partners-logo.png',
        primaryColor: effectiveCompanyId === 'transparent-partners' ? '#8B5CF6' : '#2563EB',
      networks: networks
    };
    
    setCompany(mockCompany);
    setLoading(false);
  };

  const handleApproveAgentRequest = (requestId: string) => {
    toast.success('Agent request approved');
    // In production, this would update the database
  };

  const handleDenyAgentRequest = (requestId: string) => {
    toast.success('Agent request denied');
    // In production, this would update the database
  };

  const handleApproveUserRequest = (requestId: string) => {
    toast.success('User request approved');
    // In production, this would update the database
  };

  const handleDenyUserRequest = (requestId: string) => {
    toast.success('User request denied');
    // In production, this would update the database
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Company Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Company not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex items-center justify-between h-20 py-3">
            <div className="flex items-center space-x-8">
              {company.logo && (
                              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-14 w-48 rounded-xl shadow-lg object-contain"
              />
              )}
                              <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
                  <p className="text-sm text-gray-500">Company Admin Dashboard</p>
                </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* 1. Networks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Networks</h2>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Network
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {networks.map((network) => (
                  <div key={network.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{network.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {network.agentCount} Agents
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{network.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        {network.userCount} users
                      </div>
                      {network.location && (
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                          {network.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        {network.adminName} ({network.adminEmail})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 2. Add Users to Company Library Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Add Users to Company Library</h2>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New User
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* User Management Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{networks.reduce((sum, n) => sum + n.userCount, 0)}</div>
                  <div className="text-sm text-blue-700">Total Users</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{networks.length}</div>
                  <div className="text-sm text-green-700">Networks</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">{pendingUserRequests.length}</div>
                  <div className="text-sm text-purple-700">Pending Requests</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">{pendingAgentRequests.length}</div>
                  <div className="text-sm text-orange-700">Agent Requests</div>
                </div>
              </div>

              {/* Add New User Form */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Add New User</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select role...</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Network Assignment</label>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select network...</option>
                      {networks.map((network) => (
                        <option key={network.id} value={network.id}>
                          {network.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Add User to Company
                    </button>
                  </div>
                </div>
              </div>

              {/* Pending User Requests */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Pending User Requests</h4>
                {pendingUserRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingUserRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{request.userName}</h4>
                              <p className="text-sm text-gray-500">{request.userEmail}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {request.role}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.department}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{request.requestReason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested: {request.requestedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveUserRequest(request.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenyUserRequest(request.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No pending user requests</p>
                  </div>
                )}
              </div>

              {/* Active Users by Network */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Active Users by Network</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {networks.map((network) => (
                        <tr key={network.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UsersIcon className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{network.name}</div>
                                <div className="text-sm text-gray-500">{network.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {network.userCount} users
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {network.adminName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">View Users</button>
                            <button className="text-green-600 hover:text-green-900 mr-3">Manage</button>
                            <button className="text-red-600 hover:text-red-900">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. Agent Approval to Company Library Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CubeIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Agent Approval to Company Library</h2>
              </div>
            </div>
            
            <div className="p-6">
              {pendingAgentRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingAgentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{request.agentName}</h4>
                            <p className="text-sm text-gray-500">Requested by {request.userName}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.priority === 'high' ? 'bg-red-100 text-red-800' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.priority} priority
                          </span>
                          {request.networkName && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.networkName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{request.requestReason}</p>
                        <p className="text-sm text-gray-600 mt-1">{request.businessJustification}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {request.requestedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveAgentRequest(request.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyAgentRequest(request.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending agent requests</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* 4. Company Customization Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <SwatchIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Company Customization</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Brand Colors</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg border border-gray-300"
                          style={{ backgroundColor: company.primaryColor }}
                        ></div>
                        <input
                          type="color"
                          value={company.primaryColor}
                          className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                          readOnly
                        />
                        <span className="text-sm text-gray-500">{company.primaryColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Company Logo</h3>
                  <div className="space-y-4">
                    {company.logo ? (
                      <div className="flex items-center space-x-4">
                        <img 
                          src={company.logo} 
                          alt={`${company.name} logo`} 
                          className="w-16 h-16 rounded-lg border border-gray-300"
                        />
                        <div>
                          <p className="text-sm text-gray-600">Current logo</p>
                          <button className="text-sm text-blue-600 hover:text-blue-700">
                            Change logo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No logo uploaded</p>
                        <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
                          Upload logo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>



        </div>
      </div>
    </div>
  );
}