import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CpuChipIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { AgentRequest, ApprovalStats, ApprovalAction } from '../types/requests';
import StatCard from './StatCard';
import toast from 'react-hot-toast';

interface ApprovalDashboardProps {
  adminLevel: 'network_admin' | 'company_admin' | 'super_admin';
  pendingRequests: AgentRequest[];
  approvalStats: ApprovalStats;
  onApproveRequest: (requestId: string, action: 'approve' | 'deny' | 'escalate', reason?: string) => void;
  onBulkAction: (requestIds: string[], action: 'approve' | 'deny') => void;
}

export default function ApprovalDashboard({
  adminLevel,
  pendingRequests,
  approvalStats,
  onApproveRequest,
  onBulkAction
}: ApprovalDashboardProps) {
  const { userProfile } = useAuth();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'normal' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'user'>('date');
  const [showDenyModal, setShowDenyModal] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState<string | null>(null);
  const [escalationReason, setEscalationReason] = useState('');

  // Filter and sort requests
  const filteredRequests = pendingRequests
    .filter(request => {
      if (filterPriority === 'all') return true;
      return request.priority === filterPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'user':
          return a.userName.localeCompare(b.userName);
        case 'date':
        default:
          return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      }
    });

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(r => r.id));
    }
  };

  const handleSelectRequest = (requestId: string) => {
    if (selectedRequests.includes(requestId)) {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    } else {
      setSelectedRequests([...selectedRequests, requestId]);
    }
  };

  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) return;
    onBulkAction(selectedRequests, 'approve');
    setSelectedRequests([]);
    toast.success(`Approved ${selectedRequests.length} request(s)`);
  };

  const handleBulkDeny = () => {
    if (selectedRequests.length === 0) return;
    onBulkAction(selectedRequests, 'deny');
    setSelectedRequests([]);
    toast.success(`Denied ${selectedRequests.length} request(s)`);
  };

  const handleIndividualApprove = (requestId: string) => {
    onApproveRequest(requestId, 'approve');
    toast.success('Request approved');
  };

  const handleIndividualDeny = (requestId: string) => {
    if (!denyReason.trim()) {
      toast.error('Please provide a reason for denial');
      return;
    }
    onApproveRequest(requestId, 'deny', denyReason);
    setShowDenyModal(null);
    setDenyReason('');
    toast.success('Request denied');
  };

  const handleEscalate = (requestId: string) => {
    if (!escalationReason.trim()) {
      toast.error('Please provide a reason for escalation');
      return;
    }
    onApproveRequest(requestId, 'escalate', escalationReason);
    setShowEscalateModal(null);
    setEscalationReason('');
    toast.success('Request escalated to higher authority');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAdminLevelName = () => {
    switch (adminLevel) {
      case 'network_admin': return 'Network Admin';
      case 'company_admin': return 'Company Admin';
      case 'super_admin': return 'Super Admin';
      default: return 'Admin';
    }
  };

  const canEscalate = adminLevel !== 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Request Approvals</h2>
          <p className="text-gray-600">{getAdminLevelName()} Dashboard</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedRequests.length > 0 && (
            <>
              <button
                onClick={handleBulkApprove}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Approve ({selectedRequests.length})</span>
              </button>
              <button
                onClick={handleBulkDeny}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircleIcon className="w-4 h-4" />
                <span>Deny ({selectedRequests.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Pending"
          value={approvalStats.pending}
          icon={ClockIcon}
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Approved"
          value={approvalStats.approved}
          icon={CheckCircleIcon}
          iconColor="text-green-500"
        />
        <StatCard
          title="Denied"
          value={approvalStats.denied}
          icon={XCircleIcon}
          iconColor="text-red-500"
        />
        <StatCard
          title="Avg Response"
          value={`${approvalStats.avgResponseTime}h`}
          icon={CalendarIcon}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Oldest Pending"
          value={`${approvalStats.oldestPendingDays}d`}
          icon={ExclamationTriangleIcon}
          iconColor="text-orange-500"
        />
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="date">Request Date</option>
                <option value="priority">Priority</option>
                <option value="user">User Name</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Select All ({filteredRequests.length})</span>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">All agent requests have been processed.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                    className="mt-1 rounded border-gray-300"
                  />
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CpuChipIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.agentName}</h3>
                      <p className="text-sm text-gray-600">
                        Requested by {request.userName} ({request.userEmail})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.floor((new Date().getTime() - new Date(request.requestedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </span>
                </div>
              </div>

              {request.requestReason && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Request Reason:</strong> {request.requestReason}
                  </p>
                </div>
              )}

              {request.metadata?.businessJustification && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Business Justification:</strong> {request.metadata.businessJustification}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleIndividualApprove(request.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDenyModal(request.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    <span>Deny</span>
                  </button>

                  {canEscalate && (
                    <button
                      onClick={() => setShowEscalateModal(request.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                      <span>Escalate</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <UserIcon className="w-4 h-4" />
                  <span>{request.organizationName}</span>
                  {request.networkName && (
                    <>
                      <span>•</span>
                      <span>{request.networkName}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deny Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Denial *
                </label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  placeholder="Please provide a clear reason for denying this request..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDenyModal(null);
                    setDenyReason('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleIndividualDeny(showDenyModal)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Confirm Denial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalate Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Escalation *
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  rows={4}
                  placeholder="Why does this request need higher-level approval?"
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEscalateModal(null);
                    setEscalationReason('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEscalate(showEscalateModal)}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                >
                  Escalate Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
