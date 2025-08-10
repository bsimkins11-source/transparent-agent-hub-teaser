import { 
  IPOCObservabilityService, 
  POCLogContext, 
  POCMetricTags, 
  Timer, 
  HealthStatus 
} from '../interfaces/IObservabilityService';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Enhanced POC-Ready Firebase Observability Service
export class FirebasePOCObservabilityService implements IPOCObservabilityService {
  private logLevel: 'debug' | 'info' | 'warning' | 'error' | 'critical' = 'info';
  private environment: string = 'development';
  private serviceName: string = 'transparent-ai-agent-hub';
  private version: string = '1.0.0';

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Log service initialization
      await this.logInfo('Firebase POC Observability Service initialized', {
        serviceName: this.serviceName,
        version: this.version,
        environment: this.environment
      });
    } catch (error) {
      console.error('Failed to initialize Firebase POC Observability Service:', error);
    }
  }

  // Essential logging for POC
  async logInfo(message: string, context: POCLogContext): Promise<void> {
    if (this.shouldLog('info')) {
      await this.writeLog('info', message, context);
    }
  }

  async logError(message: string, context: POCLogContext, error?: Error): Promise<void> {
    if (this.shouldLog('error')) {
      const enhancedContext = {
        ...context,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorName: error?.name
      };
      await this.writeLog('error', message, enhancedContext);
    }
  }

  // Enhanced cost tracking and performance monitoring
  async recordAgentInvocation(agentId: string, context: {
    userId: string;
    organizationId?: string;
    networkId?: string;
    inputTokens: number;
    outputTokens: number;
    latency: number;
    success: boolean;
    errorType?: string;
    costEstimate: number;
    modelUsed: string;
    provider: string;
  }): Promise<void> {
    try {
      const invocationData = {
        agentId,
        userId: context.userId,
        organizationId: context.organizationId,
        networkId: context.networkId,
        timestamp: serverTimestamp(),
        inputTokens: context.inputTokens,
        outputTokens: context.outputTokens,
        totalTokens: context.inputTokens + context.outputTokens,
        latency: context.latency,
        success: context.success,
        errorType: context.errorType,
        costEstimate: context.costEstimate,
        modelUsed: context.modelUsed,
        provider: context.provider,
        environment: this.environment,
        serviceName: this.serviceName,
        version: this.version
      };

      // Log the invocation
      await addDoc(collection(db, 'agent_invocations'), invocationData);

      // Update cost tracking
      await this.updateCostTracking(agentId, context);

      // Update performance metrics
      await this.updatePerformanceMetrics(agentId, context);

      // Log for audit purposes
      await this.logInfo('Agent invocation recorded', {
        agentId,
        userId: context.userId,
        cost: context.costEstimate,
        latency: context.latency,
        success: context.success
      });

    } catch (error) {
      console.error('Failed to record agent invocation:', error);
      // Fallback logging
      await this.logError('Failed to record agent invocation', { agentId }, error);
    }
  }

  // Cost tracking and analytics
  async updateCostTracking(agentId: string, context: {
    costEstimate: number;
    organizationId?: string;
    networkId?: string;
  }): Promise<void> {
    try {
      const costData = {
        agentId,
        cost: context.costEstimate,
        organizationId: context.organizationId,
        networkId: context.networkId,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        year: new Date().getFullYear().toString()
      };

      // Record individual cost entry
      await addDoc(collection(db, 'cost_tracking'), costData);

      // Update daily cost summary
      await this.updateDailyCostSummary(agentId, context.costEstimate, context.organizationId);

      // Update monthly cost summary
      await this.updateMonthlyCostSummary(agentId, context.costEstimate, context.organizationId);

    } catch (error) {
      console.error('Failed to update cost tracking:', error);
    }
  }

  private async updateDailyCostSummary(agentId: string, cost: number, organizationId?: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const summaryId = `${agentId}_${today}_${organizationId || 'global'}`;
      
      const summaryRef = doc(db, 'daily_cost_summaries', summaryId);
      
      await runTransaction(db, async (transaction) => {
        const summaryDoc = await transaction.get(summaryRef);
        
        if (summaryDoc.exists()) {
          // Update existing summary
          transaction.update(summaryRef, {
            totalCost: increment(cost),
            invocationCount: increment(1),
            lastUpdated: serverTimestamp()
          });
        } else {
          // Create new summary
          transaction.set(summaryRef, {
            agentId,
            date: today,
            organizationId: organizationId || 'global',
            totalCost: cost,
            invocationCount: 1,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
        }
      });
    } catch (error) {
      console.error('Failed to update daily cost summary:', error);
    }
  }

  private async updateMonthlyCostSummary(agentId: string, cost: number, organizationId?: string): Promise<void> {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const summaryId = `${agentId}_${month}_${organizationId || 'global'}`;
      
      const summaryRef = doc(db, 'monthly_cost_summaries', summaryId);
      
      await runTransaction(db, async (transaction) => {
        const summaryDoc = await transaction.get(summaryRef);
        
        if (summaryDoc.exists()) {
          // Update existing summary
          transaction.update(summaryRef, {
            totalCost: increment(cost),
            invocationCount: increment(1),
            lastUpdated: serverTimestamp()
          });
        } else {
          // Create new summary
          transaction.set(summaryRef, {
            agentId,
            month,
            organizationId: organizationId || 'global',
            totalCost: cost,
            invocationCount: 1,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
        }
      });
    } catch (error) {
      console.error('Failed to update monthly cost summary:', error);
    }
  }

  // Performance metrics tracking
  async updatePerformanceMetrics(agentId: string, context: {
    latency: number;
    success: boolean;
    errorType?: string;
  }): Promise<void> {
    try {
      const performanceData = {
        agentId,
        timestamp: serverTimestamp(),
        latency: context.latency,
        success: context.success,
        errorType: context.errorType,
        environment: this.environment
      };

      // Record individual performance entry
      await addDoc(collection(db, 'performance_metrics'), performanceData);

      // Update rolling performance summary
      await this.updateRollingPerformanceSummary(agentId, context);

    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  private async updateRollingPerformanceSummary(agentId: string, context: {
    latency: number;
    success: boolean;
  }): Promise<void> {
    try {
      const summaryRef = doc(db, 'performance_summaries', agentId);
      
      await runTransaction(db, async (transaction) => {
        const summaryDoc = await transaction.get(summaryRef);
        
        if (summaryDoc.exists()) {
          const current = summaryDoc.data();
          const newCount = current.totalInvocations + 1;
          const newSuccessCount = current.successfulInvocations + (context.success ? 1 : 0);
          
          // Calculate rolling averages
          const newAvgLatency = ((current.averageLatency * current.totalInvocations) + context.latency) / newCount;
          const newSuccessRate = newSuccessCount / newCount;
          
          transaction.update(summaryRef, {
            totalInvocations: newCount,
            successfulInvocations: newSuccessCount,
            averageLatency: newAvgLatency,
            successRate: newSuccessRate,
            lastUpdated: serverTimestamp(),
            lastLatency: context.latency
          });
        } else {
          // Create new summary
          transaction.set(summaryRef, {
            agentId,
            totalInvocations: 1,
            successfulInvocations: context.success ? 1 : 0,
            averageLatency: context.latency,
            successRate: context.success ? 1 : 0,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            lastLatency: context.latency
          });
        }
      });
    } catch (error) {
      console.error('Failed to update rolling performance summary:', error);
    }
  }

  // Enhanced metrics recording
  async recordMetric(name: string, value: number, tags: POCMetricTags): Promise<void> {
    try {
      const metricData = {
        name,
        value,
        tags,
        timestamp: serverTimestamp(),
        environment: this.environment,
        serviceName: this.serviceName,
        version: this.version
      };

      await addDoc(collection(db, 'metrics'), metricData);
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  async incrementCounter(name: string, tags: POCMetricTags): Promise<void> {
    try {
      // For POC, we'll use a simple counter approach
      const counterData = {
        name: `${name}_counter`,
        value: 1,
        tags,
        timestamp: serverTimestamp(),
        environment: this.environment,
        serviceName: this.serviceName,
        version: this.version
      };

      await addDoc(collection(db, 'counters'), counterData);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    }
  }

  // Enhanced timer functionality
  startTimer(name: string): Timer {
    const startTime = Date.now();
    
    return {
      name,
      startTime,
      stop: async (tags: POCMetricTags = {}) => {
        const duration = Date.now() - startTime;
        await this.recordMetric(`${name}_duration`, duration, {
          ...tags,
          timer: name,
          unit: 'milliseconds'
        });
        return duration;
      }
    };
  }

  // Enhanced health checking
  async recordHealthCheck(name: string, status: HealthStatus): Promise<void> {
    try {
      const healthData = {
        name,
        status,
        timestamp: serverTimestamp(),
        environment: this.environment,
        serviceName: this.serviceName,
        version: this.version
      };

      await addDoc(collection(db, 'health_checks'), healthData);
    } catch (error) {
      console.error('Failed to record health check:', error);
    }
  }

  // Enhanced audit logging
  async logAuditEvent(event: Omit<any, 'timestamp'>): Promise<void> {
    try {
      const auditData = {
        ...event,
        timestamp: serverTimestamp(),
        environment: this.environment,
        serviceName: this.serviceName,
        version: this.version
      };

      await addDoc(collection(db, 'audit_logs'), auditData);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Enhanced cost analytics
  async getCostAnalytics(filters: {
    agentId?: string;
    organizationId?: string;
    networkId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'month' | 'agent' | 'organization';
  }): Promise<any> {
    try {
      let queryRef = collection(db, 'cost_tracking');
      let constraints = [];

      if (filters.agentId) {
        constraints.push(where('agentId', '==', filters.agentId));
      }
      if (filters.organizationId) {
        constraints.push(where('organizationId', '==', filters.organizationId));
      }
      if (filters.networkId) {
        constraints.push(where('networkId', '==', filters.networkId));
      }
      if (filters.startDate) {
        constraints.push(where('date', '>=', filters.startDate));
      }
      if (filters.endDate) {
        constraints.push(where('date', '<=', filters.endDate));
      }

      constraints.push(orderBy('timestamp', 'desc'));
      constraints.push(limit(1000));

      const querySnapshot = await getDocs(query(queryRef, ...constraints));
      const costs = querySnapshot.docs.map(doc => doc.data());

      // Group and aggregate based on groupBy
      if (filters.groupBy === 'day') {
        return this.groupCostsByDay(costs);
      } else if (filters.groupBy === 'month') {
        return this.groupCostsByMonth(costs);
      } else if (filters.groupBy === 'agent') {
        return this.groupCostsByAgent(costs);
      } else if (filters.groupBy === 'organization') {
        return this.groupCostsByOrganization(costs);
      }

      return costs;
    } catch (error) {
      console.error('Failed to get cost analytics:', error);
      return [];
    }
  }

  private groupCostsByDay(costs: any[]): any {
    const grouped = costs.reduce((acc, cost) => {
      const date = cost.date;
      if (!acc[date]) {
        acc[date] = { totalCost: 0, invocationCount: 0, agents: new Set() };
      }
      acc[date].totalCost += cost.cost;
      acc[date].invocationCount += 1;
      acc[date].agents.add(cost.agentId);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, data]: [string, any]) => ({
      date,
      totalCost: data.totalCost,
      invocationCount: data.invocationCount,
      uniqueAgents: data.agents.size
    }));
  }

  private groupCostsByMonth(costs: any[]): any {
    const grouped = costs.reduce((acc, cost) => {
      const month = cost.month;
      if (!acc[month]) {
        acc[month] = { totalCost: 0, invocationCount: 0, agents: new Set() };
      }
      acc[month].totalCost += cost.cost;
      acc[month].invocationCount += 1;
      acc[month].agents.add(cost.agentId);
      return acc;
    }, {});

    return Object.entries(grouped).map(([month, data]: [string, any]) => ({
      month,
      totalCost: data.totalCost,
      invocationCount: data.invocationCount,
      uniqueAgents: data.agents.size
    }));
  }

  private groupCostsByAgent(costs: any[]): any {
    const grouped = costs.reduce((acc, cost) => {
      const agentId = cost.agentId;
      if (!acc[agentId]) {
        acc[agentId] = { totalCost: 0, invocationCount: 0, organizations: new Set() };
      }
      acc[agentId].totalCost += cost.cost;
      acc[agentId].invocationCount += 1;
      if (cost.organizationId) {
        acc[agentId].organizations.add(cost.organizationId);
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([agentId, data]: [string, any]) => ({
      agentId,
      totalCost: data.totalCost,
      invocationCount: data.invocationCount,
      uniqueOrganizations: data.organizations.size
    }));
  }

  private groupCostsByOrganization(costs: any[]): any {
    const grouped = costs.reduce((acc, cost) => {
      const orgId = cost.organizationId || 'global';
      if (!acc[orgId]) {
        acc[orgId] = { totalCost: 0, invocationCount: 0, agents: new Set() };
      }
      acc[orgId].totalCost += cost.cost;
      acc[orgId].invocationCount += 1;
      acc[orgId].agents.add(cost.agentId);
      return acc;
    }, {});

    return Object.entries(grouped).map(([orgId, data]: [string, any]) => ({
      organizationId: orgId,
      totalCost: data.totalCost,
      invocationCount: data.invocationCount,
      uniqueAgents: data.agents.size
    }));
  }

  // Enhanced performance analytics
  async getPerformanceAnalytics(agentId?: string): Promise<any> {
    try {
      let queryRef = collection(db, 'performance_metrics');
      let constraints = [orderBy('timestamp', 'desc'), limit(1000)];

      if (agentId) {
        constraints.unshift(where('agentId', '==', agentId));
      }

      const querySnapshot = await getDocs(query(queryRef, ...constraints));
      const metrics = querySnapshot.docs.map(doc => doc.data());

      return this.analyzePerformanceMetrics(metrics);
    } catch (error) {
      console.error('Failed to get performance analytics:', error);
      return {};
    }
  }

  private analyzePerformanceMetrics(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const totalInvocations = metrics.length;
    const successfulInvocations = metrics.filter(m => m.success).length;
    const failedInvocations = totalInvocations - successfulInvocations;

    const latencies = metrics.map(m => m.latency).filter(l => l > 0);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const sortedLatencies = latencies.sort((a, b) => a - b);
    const p95Latency = sortedLatencies.length > 0 ? sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] : 0;
    const p99Latency = sortedLatencies.length > 0 ? sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] : 0;

    const errorTypes = metrics
      .filter(m => !m.success && m.errorType)
      .reduce((acc, m) => {
        acc[m.errorType] = (acc[m.errorType] || 0) + 1;
        return acc;
      }, {});

    return {
      totalInvocations,
      successfulInvocations,
      failedInvocations,
      successRate: totalInvocations > 0 ? successfulInvocations / totalInvocations : 0,
      averageLatency: avgLatency,
      p95Latency,
      p99Latency,
      errorTypes,
      timeRange: {
        start: metrics[metrics.length - 1]?.timestamp,
        end: metrics[0]?.timestamp
      }
    };
  }

  // Utility methods
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warning: 2, error: 3, critical: 4 };
    return levels[level] >= levels[this.logLevel];
  }

  private async writeLog(level: string, message: string, context: POCLogContext): Promise<void> {
    try {
      const logData = {
        level,
        message,
        context,
        timestamp: serverTimestamp(),
        environment: this.environment,
        serviceName: this.serviceName,
        version: this.version
      };

      await addDoc(collection(db, 'logs'), logData);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  // Configuration methods
  setLogLevel(level: 'debug' | 'info' | 'warning' | 'error' | 'critical'): void {
    this.logLevel = level;
  }

  setEnvironment(environment: string): void {
    this.environment = environment;
  }

  setServiceName(serviceName: string): void {
    this.serviceName = serviceName;
  }

  setVersion(version: string): void {
    this.version = version;
  }

  // Enhanced data retrieval methods
  async getRecentLogs(limit: number = 100): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'logs'),
          orderBy('timestamp', 'desc'),
          limit(limit)
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get recent logs:', error);
      return [];
    }
  }

  async getMetricsByName(name: string, timeRange: string = '24h'): Promise<any[]> {
    try {
      const cutoffTime = this.parseTimeRange(timeRange);
      
      const querySnapshot = await getDocs(
        query(
          collection(db, 'metrics'),
          where('name', '==', name),
          where('timestamp', '>=', new Date(cutoffTime)),
          orderBy('timestamp', 'desc')
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get metrics by name:', error);
      return [];
    }
  }

  async getHealthStatus(): Promise<any> {
    try {
      const recentChecks = await getDocs(
        query(
          collection(db, 'health_checks'),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
      );

      const checks = recentChecks.docs.map(doc => doc.data());
      const overallHealth = this.calculateOverallHealth(checks);

      return {
        overall: overallHealth,
        checks: checks,
        lastUpdated: checks[0]?.timestamp || null
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return { overall: 'unknown', checks: [], lastUpdated: null };
    }
  }

  private parseTimeRange(timeRange: string): number {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;

    switch (timeRange) {
      case '1h': return now - hour;
      case '6h': return now - 6 * hour;
      case '24h': return now - day;
      case '7d': return now - week;
      case '30d': return now - month;
      default: return now - day; // Default to 24h
    }
  }

  private calculateOverallHealth(healthChecks: any[]): HealthStatus {
    if (healthChecks.length === 0) return 'unknown';

    const recentChecks = healthChecks.slice(0, 5); // Last 5 checks
    const healthyCount = recentChecks.filter(check => check.status === 'healthy').length;
    const totalCount = recentChecks.length;

    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount >= totalCount * 0.8) return 'degraded';
    return 'unhealthy';
  }
}
