import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Agent, AgentReview } from '../types/agent';
import { getPendingAgents, reviewAgent, updateAgentStatus } from '../services/agentManagementService';
import toast from 'react-hot-toast';

interface AgentReviewDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface ReviewModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onReview: (review: AgentReview) => void;
}

const ReviewModal = ({ agent, isOpen, onClose, onReview }: ReviewModalProps) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [visibility, setVisibility] = useState(agent.visibility);
  const [allowedClients, setAllowedClients] = useState(agent.allowedClients?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comments.trim() && action !== 'approve') {
      toast.error('Please provide comments for rejection or change requests');
      return;
    }

    setIsSubmitting(true);
    try {
      const review: AgentReview = {
        agentId: agent.id,
        action,
        comments: comments.trim() || undefined,
        rejectionReason: action === 'reject' ? rejectionReason.trim() || comments.trim() : undefined,
        visibility: action === 'approve' ? visibility : undefined,
        allowedClients: action === 'approve' && allowedClients ? 
          allowedClients.split(',').map(s => s.trim()).filter(Boolean) : undefined
      };

      await onReview(review);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Review Agent</h2>
              <p className="text-blue-100">{agent.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Review Action *
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Approve</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-900">Reject</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value="request_changes"
                    checked={action === 'request_changes'}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                  />
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">Request Changes</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {action === 'approve' ? 'Approval Notes (Optional)' : 'Comments *'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={action === 'approve' ? 
                  'Optional notes about this approval...' : 
                  'Please provide detailed feedback...'
                }
              />
            </div>

            {/* Rejection Reason */}
            {action === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Specific reason for rejection..."
                />
              </div>
            )}

            {/* Visibility Settings (for approval) */}
            {action === 'approve' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility Level
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="global">Global Marketplace</option>
                    <option value="company">Company Only</option>
                    <option value="network">Network Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {(visibility === 'company' || visibility === 'network') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Client Organizations
                    </label>
                    <input
                      type="text"
                      value={allowedClients}
                      onChange={(e) => setAllowedClients(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter organization IDs separated by commas"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to allow all organizations in the {visibility}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  {action === 'approve' && <CheckCircleIcon className="w-4 h-4" />}
                  {action === 'reject' && <XCircleIcon className="w-4 h-4" />}
                  {action === 'request_changes' && <ExclamationTriangleIcon className="w-4 h-4" />}
                  <span>
                    {action === 'approve' ? 'Approve' : 
                     action === 'reject' ? 'Reject' : 'Request Changes'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AgentReviewDashboard({ isOpen, onClose, onRefresh }: AgentReviewDashboardProps) {
  const { userProfile } = useAuth();
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAgentDetails, setShowAgentDetails] = useState<Agent | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPendingAgents();
    }
  }, [isOpen]);

  const loadPendingAgents = async () => {
    try {
      setLoading(true);
      const agents = await getPendingAgents();
      setPendingAgents(agents);
    } catch (error) {
      console.error('Error loading pending agents:', error);
      toast.error('Failed to load pending agents');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (review: AgentReview) => {
    if (!userProfile) return;

    try {
      await reviewAgent(
        review,
        userProfile.uid,
        userProfile.email,
        userProfile.displayName || 'Unknown User'
      );

      toast.success(`Agent ${review.action === 'approve' ? 'approved' : review.action === 'reject' ? 'rejected' : 'sent back for changes'} successfully`);
      
      // Refresh the list
      await loadPendingAgents();
      onRefresh?.();
      
    } catch (error) {
      console.error('Error reviewing agent:', error);
      toast.error('Failed to review agent');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      deprecated: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || badges.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    const icons = {
      global: <GlobeAltIcon className="w-4 h-4" />,
      company: <BuildingOfficeIcon className="w-4 h-4" />,
      network: <BuildingOfficeIcon className="w-4 h-4" />,
      private: <LockClosedIcon className="w-4 h-4" />
    };
    
    return icons[visibility as keyof typeof icons] || <GlobeAltIcon className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Agent Review Dashboard</h2>
              <p className="text-blue-100">Review and approve pending agent submissions</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pending agents...</p>
            </div>
          ) : pendingAgents.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Reviews</h3>
              <p className="text-gray-600">All agent submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        {getStatusBadge(agent.status)}
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getVisibilityIcon(agent.visibility)}
                          <span className="text-sm capitalize">{agent.visibility}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{agent.submitterName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(agent.submissionDate || '').toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TagIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{agent.metadata.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{agent.metadata.tier}</span>
                        </div>
                      </div>
                      
                      {agent.metadata.tags && agent.metadata.tags.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {agent.metadata.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setShowAgentDetails(agent)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowReviewModal(true);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {pendingAgents.length} pending review{pendingAgents.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={loadPendingAgents}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedAgent && (
          <ReviewModal
            agent={selectedAgent}
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedAgent(null);
            }}
            onReview={handleReview}
          />
        )}
      </AnimatePresence>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {showAgentDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Agent Details</h3>
                  <button
                    onClick={() => setShowAgentDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Name:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Category:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.metadata.category}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Provider:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.provider}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Tier:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.metadata.tier}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Description:</span>
                        <p className="text-sm text-gray-900 mt-1">{showAgentDetails.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Route:</span>
                        <p className="text-sm text-gray-900 mt-1 font-mono">{showAgentDetails.route}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Execution Target:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.metadata.executionTarget}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Version:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.metadata.version}</p>
                        </div>
                        {showAgentDetails.metadata.promptTemplateId && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Prompt Template:</span>
                            <p className="text-sm text-gray-900">{showAgentDetails.metadata.promptTemplateId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Submission Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Submitted by:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.submitterName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Email:</span>
                          <p className="text-sm text-gray-900">{showAgentDetails.submitterEmail}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Submission Date:</span>
                          <p className="text-sm text-gray-900">
                            {new Date(showAgentDetails.submissionDate || '').toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Visibility:</span>
                          <p className="text-sm text-gray-900 capitalize">{showAgentDetails.visibility}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showAgentDetails.metadata.testConfig && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Test Configuration</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap">
                          {JSON.stringify(showAgentDetails.metadata.testConfig, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
