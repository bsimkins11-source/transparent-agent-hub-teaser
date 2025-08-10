import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { CreatorAgentSubmission } from '../types/permissions';

interface CreatorPortalProps {
  className?: string;
}

export default function CreatorPortal({ className = '' }: CreatorPortalProps) {
  const [submissions, setSubmissions] = useState<CreatorAgentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<CreatorAgentSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual service call to fetch submissions
      const mockSubmissions: CreatorAgentSubmission[] = [
        {
          id: '1',
          creatorId: 'creator1',
          agentName: 'AI Content Writer',
          agentDescription: 'An AI agent that helps create engaging content for blogs and social media',
          agentCategory: 'Content Creation',
          agentSubcategory: 'Writing',
          agentTags: ['content', 'writing', 'blog', 'social media'],
          model: 'GPT-4',
          provider: 'OpenAI',
          apiEndpoint: 'https://api.openai.com/v1/chat/completions',
          apiKeyRequired: true,
          pricingModel: 'per_call',
          basePrice: 0,
          pricePerCall: 0.05,
          pricePerUser: 0,
          monthlyPrice: 0,
          maxCallsPerDay: 1000,
          maxCallsPerMonth: 25000,
          maxConcurrentUsers: 100,
          promptTemplate: 'You are an AI content writer...',
          exampleInputs: ['Write a blog post about AI trends'],
          exampleOutputs: ['Here is a comprehensive blog post...'],
          safetyMeasures: ['Content filtering', 'Bias detection'],
          contentFilters: ['No harmful content', 'No misinformation'],
          ageRestriction: '13+',
          status: 'pending',
          submittedAt: new Date('2024-01-15').toISOString(),
          reviewedAt: null,
          reviewedBy: null,
          reviewNotes: '',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString(),
          version: '1.0.0'
        },
        {
          id: '2',
          creatorId: 'creator2',
          agentName: 'Data Analysis Bot',
          agentDescription: 'AI-powered data analysis and visualization tool',
          agentCategory: 'Data & Analytics',
          agentSubcategory: 'Analysis',
          agentTags: ['data', 'analytics', 'visualization', 'insights'],
          model: 'Claude-3',
          provider: 'Anthropic',
          apiEndpoint: 'https://api.anthropic.com/v1/messages',
          apiKeyRequired: true,
          pricingModel: 'monthly',
          basePrice: 0,
          pricePerCall: 0,
          pricePerUser: 0,
          monthlyPrice: 29.99,
          maxCallsPerDay: 500,
          maxCallsPerMonth: 15000,
          maxConcurrentUsers: 50,
          promptTemplate: 'You are a data analysis expert...',
          exampleInputs: ['Analyze this sales data'],
          exampleOutputs: ['Based on the data analysis...'],
          safetyMeasures: ['Data privacy', 'Secure processing'],
          contentFilters: ['No PII exposure', 'GDPR compliant'],
          ageRestriction: '18+',
          status: 'approved',
          submittedAt: new Date('2024-01-10').toISOString(),
          reviewedAt: new Date('2024-01-12').toISOString(),
          reviewedBy: 'admin1',
          reviewNotes: 'Approved after security review',
          createdAt: new Date('2024-01-10').toISOString(),
          updatedAt: new Date('2024-01-12').toISOString(),
          version: '1.0.0'
        }
      ];
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesSearch = submission.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.agentDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.agentCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const handleApprove = async (submissionId: string) => {
    // TODO: Implement approval logic
    console.log('Approving submission:', submissionId);
  };

  const handleReject = async (submissionId: string, reason: string) => {
    // TODO: Implement rejection logic
    console.log('Rejecting submission:', submissionId, 'Reason:', reason);
  };

  const handleViewDetails = (submission: CreatorAgentSubmission) => {
    setSelectedSubmission(submission);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Creator Portal</h1>
        <p className="mt-2 text-gray-600">Manage agent submissions from creators</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'approved').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter(s => s.status === 'rejected').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Submissions
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by agent name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Agent Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <motion.tr
                  key={submission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{submission.agentName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {submission.agentDescription}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">Creator {submission.creatorId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TagIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{submission.agentCategory}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(submission)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(submission.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(submission.id, 'Rejected by admin')}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Agent Information</h4>
                  <p className="text-sm text-gray-600">{selectedSubmission.agentName}</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.agentDescription}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Technical Details</h4>
                  <p className="text-sm text-gray-600">Model: {selectedSubmission.model}</p>
                  <p className="text-sm text-gray-600">Provider: {selectedSubmission.provider}</p>
                  <p className="text-sm text-gray-600">Version: {selectedSubmission.version}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Pricing</h4>
                  <p className="text-sm text-gray-600">Model: {selectedSubmission.pricingModel}</p>
                  {selectedSubmission.pricePerCall > 0 && (
                    <p className="text-sm text-gray-600">Per Call: ${selectedSubmission.pricePerCall}</p>
                  )}
                  {selectedSubmission.monthlyPrice > 0 && (
                    <p className="text-sm text-gray-600">Monthly: ${selectedSubmission.monthlyPrice}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Usage Limits</h4>
                  <p className="text-sm text-gray-600">Max Calls/Day: {selectedSubmission.maxCallsPerDay}</p>
                  <p className="text-sm text-gray-600">Max Calls/Month: {selectedSubmission.maxCallsPerMonth}</p>
                  <p className="text-sm text-gray-600">Max Concurrent Users: {selectedSubmission.maxConcurrentUsers}</p>
                </div>
                
                {selectedSubmission.status === 'pending' && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Approve Submission
                    </button>
                    <button
                      onClick={() => handleReject(selectedSubmission.id, 'Rejected by admin')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Reject Submission
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
