import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { ServiceFactory } from '../services/ServiceFactory';

interface CostData {
  date?: string;
  month?: string;
  agentId?: string;
  organizationId?: string;
  totalCost: number;
  invocationCount: number;
  uniqueAgents?: number;
  uniqueOrganizations?: number;
}

interface PerformanceData {
  totalInvocations: number;
  successfulInvocations: number;
  failedInvocations: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorTypes: Record<string, number>;
}

interface CostAnalyticsDashboardProps {
  organizationId?: string;
  networkId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function CostAnalyticsDashboard({ 
  organizationId, 
  networkId, 
  timeRange = '30d' 
}: CostAnalyticsDashboardProps) {
  const { userProfile } = useAuth();
  const [costData, setCostData] = useState<CostData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'agent' | 'organization'>('day');
  const [showCostBreakdown, setShowCostBreakdown] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  const observabilityService = ServiceFactory.getInstance().getPOCObservabilityService();

  useEffect(() => {
    loadAnalytics();
  }, [organizationId, networkId, timeRange, groupBy, selectedAgent]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load cost analytics
      const costAnalytics = await observabilityService.getCostAnalytics({
        organizationId,
        networkId,
        startDate: getStartDate(timeRange),
        endDate: new Date().toISOString().split('T')[0],
        groupBy
      });

      setCostData(costAnalytics);

      // Load performance analytics if agent is selected
      if (selectedAgent) {
        const performance = await observabilityService.getPerformanceAnalytics(selectedAgent);
        setPerformanceData(performance);
      }

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string): string => {
    const today = new Date();
    switch (range) {
      case '7d':
        return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '30d':
        return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '90d':
        return new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '1y':
        return new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default:
        return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
  };

  const calculateTotals = () => {
    if (!costData.length) return { totalCost: 0, totalInvocations: 0, uniqueAgents: 0 };
    
    return costData.reduce((acc, item) => ({
      totalCost: acc.totalCost + item.totalCost,
      totalInvocations: acc.totalInvocations + item.invocationCount,
      uniqueAgents: Math.max(acc.uniqueAgents, item.uniqueAgents || 0)
    }), { totalCost: 0, totalInvocations: 0, uniqueAgents: 0 });
  };

  const getCostTrend = () => {
    if (costData.length < 2) return 'neutral';
    const recent = costData.slice(0, 2);
    const recentAvg = recent.reduce((sum, item) => sum + item.totalCost, 0) / recent.length;
    const older = costData.slice(2, 4);
    const olderAvg = older.reduce((sum, item) => sum + item.totalCost, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'up';
    if (recentAvg < olderAvg * 0.9) return 'down';
    return 'neutral';
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

  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totals = calculateTotals();
  const costTrend = getCostTrend();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Analytics Dashboard</h2>
          <p className="text-gray-600">Monitor costs, performance, and usage across your AI agents</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">By Day</option>
            <option value="month">By Month</option>
            <option value="agent">By Agent</option>
            <option value="organization">By Organization</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.totalCost)}</p>
            </div>
            <div className={`p-3 rounded-full ${
              costTrend === 'up' ? 'bg-red-100 text-red-600' :
              costTrend === 'down' ? 'bg-green-100 text-green-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {costTrend === 'up' && <TrendingUpIcon className="h-6 w-6" />}
              {costTrend === 'down' && <TrendingDownIcon className="h-6 w-6" />}
              {costTrend === 'neutral' && <ChartBarIcon className="h-6 w-6" />}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {costTrend === 'up' ? 'Costs trending up' :
               costTrend === 'down' ? 'Costs trending down' :
               'Costs stable'}
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
              <p className="text-sm font-medium text-gray-600">Total Invocations</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(totals.totalInvocations)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Across {totals.uniqueAgents} active agents
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
              <p className="text-sm font-medium text-gray-600">Avg Cost per Invocation</p>
              <p className="text-3xl font-bold text-gray-900">
                {totals.totalInvocations > 0 
                  ? formatCurrency(totals.totalCost / totals.totalInvocations)
                  : formatCurrency(0)
                }
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Cost efficiency metric
            </p>
          </div>
        </motion.div>
      </div>

      {/* Cost Breakdown Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
        <button
          onClick={() => setShowCostBreakdown(!showCostBreakdown)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {showCostBreakdown ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          <span>{showCostBreakdown ? 'Hide' : 'Show'} breakdown</span>
        </button>
      </div>

      {/* Cost Breakdown Chart */}
      {showCostBreakdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="space-y-4">
            {costData.length > 0 ? (
              <div className="space-y-3">
                {costData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.date || item.month || item.agentId || item.organizationId || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.invocationCount} invocations
                          {item.uniqueAgents && ` • ${item.uniqueAgents} agents`}
                          {item.uniqueOrganizations && ` • ${item.uniqueOrganizations} orgs`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.totalCost)}</p>
                      <p className="text-sm text-gray-500">
                        {item.invocationCount > 0 
                          ? formatCurrency(item.totalCost / item.invocationCount)
                          : formatCurrency(0)
                        } per invocation
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No cost data available for the selected time range</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Performance Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <button
          onClick={() => setShowPerformance(!showPerformance)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {showPerformance ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          <span>{showPerformance ? 'Hide' : 'Show'} performance</span>
        </button>
      </div>

      {/* Performance Metrics */}
      {showPerformance && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          {performanceData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className={`text-2xl font-bold ${
                  performanceData.successRate >= 0.95 ? 'text-green-600' :
                  performanceData.successRate >= 0.9 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(performanceData.successRate * 100).toFixed(1)}%
                </p>
                <div className="flex items-center justify-center mt-2">
                  {performanceData.successRate >= 0.95 ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Avg Latency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatLatency(performanceData.averageLatency)}
                </p>
                <div className="flex items-center justify-center mt-2">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">P95 Latency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatLatency(performanceData.p95Latency)}
                </p>
                <div className="flex items-center justify-center mt-2">
                  <ChartBarIcon className="h-5 w-5 text-purple-500" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Invocations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(performanceData.totalInvocations)}
                </p>
                <div className="flex items-center justify-center mt-2">
                  <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Select an agent to view performance metrics</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Agent Selection for Performance */}
      {showPerformance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Agent for Performance Analysis
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Agents</option>
            {costData
              .filter(item => item.agentId)
              .map((item, index) => (
                <option key={index} value={item.agentId}>
                  {item.agentId} ({formatCurrency(item.totalCost)})
                </option>
              ))
            }
          </select>
        </div>
      )}
    </div>
  );
}
