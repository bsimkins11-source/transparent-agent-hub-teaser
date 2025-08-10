import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CpuChipIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { AgentRequest, AgentAssignment, ApprovalAction } from '../types/requests';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organizationId: string;
  organizationName: string;
  networkId?: string;
  networkName?: string;
  assignedAgents: string[];
  lastLogin?: string;
  status: 'active' | 'suspended';
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'free' | 'premium' | 'enterprise';
  assignmentType: 'free' | 'direct' | 'approval';
}

interface UserAgentAssignmentProps {
  user: User;
  availableAgents: Agent[];
  pendingRequests: AgentRequest[];
  onAssignAgent: (userId: string, agentId: string, assignmentType: 'direct' | 'approved_request') => void;
  onApproveRequest: (requestId: string, action: 'approve' | 'deny', reason?: string) => void;
  adminLevel: 'network_admin' | 'company_admin' | 'super_admin';
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAgentAssignment({
  user,
  availableAgents,
  pendingRequests,
  onAssignAgent,
  onApproveRequest,
  adminLevel,
  isOpen,
  onClose
}: UserAgentAssignmentProps) {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'assign' | 'requests'>('assign');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [assignmentReason, setAssignmentReason] = useState('');
  const [denyReason, setDenyReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [denyError, setDenyError] = useState<string>('');

  // Filter agents based on user's current assignments
  const unassignedAgents = availableAgents.filter(agent => 
    !user.assignedAgents.includes(agent.id)
  );

  // Filter pending requests for this user
  const userRequests = pendingRequests.filter(request => 
    request.userId === user.id && request.status === 'pending'
  );

  const handleDirectAssignment = () => {
    if (selectedAgents.length === 0) {
      toast.error('Please select at least one agent to assign');
      return;
    }

    selectedAgents.forEach(agentId => {
      onAssignAgent(user.id, agentId, 'direct');
    });

    toast.success(`Assigned ${selectedAgents.length} agent(s) to ${user.displayName}`);
    setSelectedAgents([]);
    setAssignmentReason('');
  };

  const handleApproveRequest = (requestId: string) => {
    onApproveRequest(requestId, 'approve');
    toast.success('Agent request approved');
  };

  const handleDenyRequest = (requestId: string) => {
    if (!denyReason.trim()) {
      setDenyError('Please provide a reason for denial');
      return;
    }

    setDenyError('');
    onApproveRequest(requestId, 'deny', denyReason);
    toast.success('Agent request denied');
    setDenyReason('');
    setSelectedRequest(null);
  };

  const getAgentAssignmentType = (agent: Agent) => {
    // Based on agent tier and admin level, determine if direct assignment is allowed
    if (agent.tier === 'free' || agent.assignmentType === 'free') {
      return 'direct';
    }
    if (agent.tier === 'premium' && (adminLevel === 'company_admin' || adminLevel === 'super_admin')) {
      return 'direct';
    }
    if (agent.tier === 'enterprise' && adminLevel === 'super_admin') {
      return 'direct';
    }
    return 'approval'; // Requires escalation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Agent Management: {user.displayName}
              </h2>
              <p className="text-gray-600">{user.email} • {user.organizationName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('assign')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'assign'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <PlusIcon className="w-5 h-5 inline mr-2" />
              Direct Assignment ({unassignedAgents.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Pending Requests ({userRequests.length})
              {userRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {userRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'assign' && (
            <div className="space-y-6">
              {/* Assignment Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Reason (Optional)
                </label>
                <textarea
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="e.g., Required for Q4 project, Training purposes..."
                />
              </div>

              {/* Available Agents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Agents ({unassignedAgents.length})
                </h3>
                
                {unassignedAgents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CpuChipIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>All available agents are already assigned to this user.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {unassignedAgents.map((agent) => {
                      const assignmentType = getAgentAssignmentType(agent);
                      const canDirectAssign = assignmentType === 'direct';
                      const isSelected = selectedAgents.includes(agent.id);

                      return (
                        <div
                          key={agent.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : canDirectAssign
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-red-200 bg-red-50'
                          }`}
                          onClick={() => {
                            if (canDirectAssign) {
                              if (isSelected) {
                                setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                              } else {
                                setSelectedAgents([...selectedAgents, agent.id]);
                              }
                            }
                          }}
                        >
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
                            
                            {canDirectAssign ? (
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                          
                          {!canDirectAssign && (
                            <div className="bg-red-100 border border-red-200 rounded p-2">
                              <p className="text-xs text-red-700">
                                <strong>Requires Higher Authorization:</strong> This {agent.tier} agent requires {
                                  agent.tier === 'enterprise' ? 'Super Admin' : 'Company Admin'
                                } approval for assignment.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Actions */}
              {selectedAgents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">
                        Ready to assign {selectedAgents.length} agent(s) to {user.displayName}
                      </p>
                      <p className="text-sm text-blue-700">
                        Selected agents will be immediately available to the user.
                      </p>
                    </div>
                    <button
                      onClick={handleDirectAssignment}
                      className="btn-primary"
                    >
                      Assign Agents
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Agent Requests ({userRequests.length})
              </h3>

              {userRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending agent requests from this user.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.agentName}</h4>
                            <p className="text-sm text-gray-500">
                              Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          {request.priority} priority
                        </span>
                      </div>

                      {request.requestReason && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Request Reason:</strong> {request.requestReason}
                          </p>
                        </div>
                      )}

                      {request.metadata?.businessJustification && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Business Justification:</strong> {request.metadata.businessJustification}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setSelectedRequest(request.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Deny</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>Contact user</span>
                        </div>
                      </div>

                      {/* Deny Reason Modal */}
                      {selectedRequest === request.id && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <label className="block text-sm font-medium text-red-800 mb-2">
                            Reason for Denial *
                          </label>
                          <textarea
                            value={denyReason}
                            onChange={(e) => {
                              setDenyReason(e.target.value);
                              if (denyError) setDenyError('');
                            }}
                            className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={3}
                            placeholder="Please provide a clear reason for denying this request..."
                          />
                          {denyError && (
                            <div className="mt-2 text-sm text-red-600">
                              {denyError}
                            </div>
                          )}
                          <div className="flex items-center justify-end space-x-3 mt-3">
                            <button
                              onClick={() => {
                                setSelectedRequest(null);
                                setDenyReason('');
                              }}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDenyRequest(request.id)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Confirm Denial
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
