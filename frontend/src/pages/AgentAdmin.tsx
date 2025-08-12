import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AgentSubmission {
  id: string;
  agentName: string;
  description: string;
  creatorName: string;
  creatorEmail: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  category: string;
  tier: 'free' | 'premium' | 'enterprise';
  qualityScore?: number;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  capabilities: string[];
  useCases: string[];
  pricing?: {
    free: boolean;
    premium: number;
    enterprise: number;
  };
}

export default function AgentAdmin() {
  const { userProfile, loading } = useAuth();
  const [submissions, setSubmissions] = useState<AgentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<AgentSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'premium' | 'enterprise'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<AgentSubmission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [qualityScore, setQualityScore] = useState(5);

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

  if (!userProfile || !userProfile.permissions.canManageUsers) {
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
    // Mock data - replace with actual API call
    const mockSubmissions: AgentSubmission[] = [
      {
        id: '1',
        agentName: 'AI Research Assistant',
        description: 'Advanced research assistant that can analyze papers, generate summaries, and provide insights',
        creatorName: 'Dr. Sarah Chen',
        creatorEmail: 'sarah.chen@research.ai',
        submittedAt: '2024-01-15T10:30:00Z',
        status: 'pending',
        category: 'Research',
        tier: 'premium',
        capabilities: ['Paper Analysis', 'Summary Generation', 'Insight Extraction'],
        useCases: ['Academic Research', 'Market Research', 'Policy Analysis'],
        pricing: {
          free: false,
          premium: 29,
          enterprise: 99
        }
      },
      {
        id: '2',
        agentName: 'Customer Support Bot',
        description: 'Intelligent customer support agent with multi-language capabilities',
        creatorName: 'Mike Johnson',
        creatorEmail: 'mike.johnson@support.ai',
        submittedAt: '2024-01-14T14:20:00Z',
        status: 'under_review',
        category: 'Customer Service',
        tier: 'enterprise',
        capabilities: ['Multi-language Support', 'Ticket Management', 'Knowledge Base'],
        useCases: ['E-commerce', 'SaaS Support', 'Enterprise Support'],
        pricing: {
          free: false,
          premium: 49,
          enterprise: 199
        },
        qualityScore: 8,
        reviewNotes: 'Good functionality, needs security review',
        reviewedBy: 'Admin User',
        reviewedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '3',
        agentName: 'Data Visualization Expert',
        description: 'Creates beautiful charts and dashboards from complex data',
        creatorName: 'Alex Rodriguez',
        creatorEmail: 'alex.rodriguez@viz.ai',
        submittedAt: '2024-01-13T16:45:00Z',
        status: 'approved',
        category: 'Data Analytics',
        tier: 'premium',
        capabilities: ['Chart Generation', 'Dashboard Creation', 'Data Processing'],
        useCases: ['Business Intelligence', 'Financial Reporting', 'Marketing Analytics'],
        pricing: {
          free: true,
          premium: 19,
          enterprise: 79
        },
        qualityScore: 9,
        reviewNotes: 'Excellent tool, highly recommended',
        reviewedBy: 'Admin User',
        reviewedAt: '2024-01-14T11:30:00Z'
      }
    ];

    setSubmissions(mockSubmissions);
    setFilteredSubmissions(mockSubmissions);
  }, []);

  useEffect(() => {
    let filtered = submissions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Apply tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(submission => submission.tier === tierFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, tierFilter]);

  const handleApprove = (submissionId: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, status: 'approved' as const, reviewedBy: userProfile.displayName || 'Admin', reviewedAt: new Date().toISOString() }
        : sub
    ));
    toast.success('Agent approved successfully!');
    setIsReviewModalOpen(false);
  };

  const handleReject = (submissionId: string) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }
    
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { 
            ...sub, 
            status: 'rejected' as const, 
            reviewNotes, 
            reviewedBy: userProfile.displayName || 'Admin', 
            reviewedAt: new Date().toISOString() 
          }
        : sub
    ));
    toast.success('Agent rejected');
    setIsReviewModalOpen(false);
    setReviewNotes('');
  };

  const openReviewModal = (submission: AgentSubmission) => {
    setSelectedSubmission(submission);
    setReviewNotes(submission.reviewNotes || '');
    setQualityScore(submission.qualityScore || 5);
    setIsReviewModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCount = (status: string) => {
    return submissions.filter(s => s.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Agent Admin Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Review and approve agent submissions for the marketplace
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  🔍 Agent Reviewer
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{getStatusCount('pending')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Under Review</p>
                <p className="text-2xl font-semibold text-gray-900">{getStatusCount('under_review')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{getStatusCount('approved')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{getStatusCount('rejected')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents, creators, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Tier Filter */}
              <div className="sm:w-48">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agent Submissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{submission.agentName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(submission.tier)}`}>
                        {submission.tier.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{submission.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        {submission.creatorName}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        {submission.category}
                      </div>
                    </div>

                    {/* Capabilities and Use Cases */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h4>
                        <div className="flex flex-wrap gap-1">
                          {submission.capabilities.map((capability, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Use Cases</h4>
                        <div className="flex flex-wrap gap-1">
                          {submission.useCases.map((useCase, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    {submission.pricing && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing</h4>
                        <div className="flex space-x-4 text-sm">
                          {submission.pricing.free && (
                            <span className="text-green-600 font-medium">Free</span>
                          )}
                          {submission.pricing.premium && (
                            <span className="text-blue-600">Premium: ${submission.pricing.premium}/month</span>
                          )}
                          {submission.pricing.enterprise && (
                            <span className="text-purple-600">Enterprise: ${submission.pricing.enterprise}/month</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Review Info */}
                    {submission.reviewedBy && (
                      <div className="text-sm text-gray-500">
                        Reviewed by {submission.reviewedBy} on {new Date(submission.reviewedAt!).toLocaleDateString()}
                        {submission.reviewNotes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <strong>Notes:</strong> {submission.reviewNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openReviewModal(submission)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Review
                        </button>
                      </>
                    )}
                    
                    {submission.status === 'under_review' && (
                      <button
                        onClick={() => openReviewModal(submission)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Continue Review
                      </button>
                    )}

                    {submission.status === 'approved' && (
                      <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Approved
                      </span>
                    )}

                    {submission.status === 'rejected' && (
                      <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md">
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review: {selectedSubmission.agentName}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Score (1-10)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => setQualityScore(score)}
                        className={`p-2 rounded-full ${
                          score <= qualityScore 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        } hover:text-yellow-400`}
                      >
                        <StarIcon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Score: {qualityScore}/10</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Provide detailed feedback about this agent..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission.id)}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedSubmission.id)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
