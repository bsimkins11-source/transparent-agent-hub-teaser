import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  StarIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { CreatorDashboard as CreatorDashboardType } from '../types/permissions';

interface CreatorDashboardProps {
  className?: string;
}

export default function CreatorDashboard({ className = '' }: CreatorDashboardProps) {
  const { userProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState<CreatorDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // TODO: Fetch creator dashboard data from service
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual service call
      const mockData: CreatorDashboardType = {
        creatorId: userProfile?.uid || '',
        agents: {
          total: 5,
          published: 3,
          draft: 1,
          underReview: 1,
          rejected: 0
        },
        usage: {
          totalCalls: 1247,
          totalUsers: 89,
          totalRevenue: 1247.50,
          averageRating: 4.6,
          last30Days: {
            calls: 156,
            users: 23,
            revenue: 156.00
          }
        },
        revenue: {
          total: 1247.50,
          thisMonth: 156.00,
          lastMonth: 189.50,
          byAgent: [
            { agentId: '1', agentName: 'AI Assistant Pro', revenue: 456.00, calls: 234 },
            { agentId: '2', agentName: 'Code Helper', revenue: 389.50, calls: 189 },
            { agentId: '3', agentName: 'Content Writer', revenue: 402.00, calls: 156 }
          ]
        },
        performance: {
          averageResponseTime: 1.2,
          successRate: 0.98,
          errorRate: 0.02,
          topPerformingAgents: [
            { agentId: '1', agentName: 'AI Assistant Pro', successRate: 0.99, averageRating: 4.8 },
            { agentId: '2', agentName: 'Code Helper', successRate: 0.97, averageRating: 4.6 },
            { agentId: '3', agentName: 'Content Writer', successRate: 0.96, averageRating: 4.5 }
          ]
        },
        feedback: {
          totalReviews: 67,
          averageRating: 4.6,
          recentReviews: [
            { userId: 'user1', agentId: '1', rating: 5, comment: 'Excellent AI assistant!', timestamp: '2024-01-15T10:30:00Z' },
            { userId: 'user2', agentId: '2', rating: 4, comment: 'Very helpful for coding', timestamp: '2024-01-14T15:45:00Z' },
            { userId: 'user3', agentId: '3', rating: 5, comment: 'Great content generation', timestamp: '2024-01-13T09:20:00Z' }
          ]
        }
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getRevenueTrend = (): 'up' | 'down' | 'neutral' => {
    if (!dashboardData) return 'neutral';
    const { thisMonth, lastMonth } = dashboardData.revenue;
    if (thisMonth > lastMonth * 1.1) return 'up';
    if (thisMonth < lastMonth * 0.9) return 'down';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>No dashboard data available</p>
        </div>
      </div>
    );
  }

  const revenueTrend = getRevenueTrend();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Creator Dashboard</h2>
          <p className="text-gray-600">Monitor your agents, revenue, and performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(dashboardData.revenue.total)}</p>
            </div>
            <div className={`p-3 rounded-full ${
              revenueTrend === 'up' ? 'bg-green-100 text-green-600' :
              revenueTrend === 'down' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>
                              {revenueTrend === 'up' && <ArrowTrendingUpIcon className="h-6 w-6" />}
                {revenueTrend === 'down' && <ArrowTrendingDownIcon className="h-6 w-6" />}
              {revenueTrend === 'neutral' && <ChartBarIcon className="h-6 w-6" />}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {revenueTrend === 'up' ? 'Revenue trending up' :
               revenueTrend === 'down' ? 'Revenue trending down' :
               'Revenue stable'}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.agents.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {dashboardData.agents.published} published, {dashboardData.agents.draft} draft
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(dashboardData.usage.totalUsers)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {formatNumber(dashboardData.usage.last30Days.users)} new this month
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.usage.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <StarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {dashboardData.feedback.totalReviews} reviews
            </p>
          </div>
        </motion.div>
      </div>

      {/* Agent Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dashboardData.agents.published}</div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dashboardData.agents.underReview}</div>
            <div className="text-sm text-blue-600">Under Review</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{dashboardData.agents.draft}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{dashboardData.agents.rejected}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Revenue by Agent */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Agent</h3>
        <div className="space-y-3">
          {dashboardData.revenue.byAgent.map((agent, index) => (
            <div key={agent.agentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div>
                  <p className="font-medium text-gray-900">{agent.agentName}</p>
                  <p className="text-sm text-gray-500">{formatNumber(agent.calls)} calls</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(agent.revenue)}</p>
                <p className="text-sm text-gray-500">
                  {agent.calls > 0 ? formatCurrency(agent.revenue / agent.calls) : formatCurrency(0)} per call
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className={`text-2xl font-bold ${
              dashboardData.performance.successRate >= 0.95 ? 'text-green-600' :
              dashboardData.performance.successRate >= 0.9 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {formatPercentage(dashboardData.performance.successRate)}
            </p>
            <div className="flex items-center justify-center mt-2">
              {dashboardData.performance.successRate >= 0.95 ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.performance.averageResponseTime}s
            </p>
            <div className="flex items-center justify-center mt-2">
              <ClockIcon className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(dashboardData.performance.errorRate)}
            </p>
            <div className="flex items-center justify-center mt-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
        <div className="space-y-3">
          {dashboardData.feedback.recentReviews.map((review, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
