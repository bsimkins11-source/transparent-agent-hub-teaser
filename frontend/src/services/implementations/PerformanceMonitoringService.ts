import { performance } from 'perf_hooks';

// Performance metrics interface
export interface PerformanceMetrics {
  readonly operation: string;
  readonly duration: number;
  readonly timestamp: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly success: boolean;
  readonly error?: string;
}

// Cache performance metrics
export interface CacheMetrics {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly evictions: number;
  readonly size: number;
  readonly maxSize: number;
}

// Database performance metrics
export interface DatabaseMetrics {
  readonly queryCount: number;
  readonly averageQueryTime: number;
  readonly slowQueries: number;
  readonly failedQueries: number;
  readonly connectionPoolSize: number;
  readonly activeConnections: number;
}

// Memory usage metrics
export interface MemoryMetrics {
  readonly used: number;
  readonly total: number;
  readonly available: number;
  readonly usagePercentage: number;
}

// Performance thresholds for alerting
export interface PerformanceThresholds {
  readonly slowOperationThreshold: number; // milliseconds
  readonly errorRateThreshold: number; // percentage
  readonly memoryUsageThreshold: number; // percentage
  readonly cacheHitRateThreshold: number; // percentage
}

// Performance alert
export interface PerformanceAlert {
  readonly type: 'slow_operation' | 'high_error_rate' | 'high_memory_usage' | 'low_cache_hit_rate';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly message: string;
  readonly timestamp: Date;
  readonly metrics: Readonly<Record<string, unknown>>;
}

// Enhanced performance monitoring service
export class PerformanceMonitoringService {
  private readonly metrics: PerformanceMetrics[] = [];
  private readonly alerts: PerformanceAlert[] = [];
  private readonly operationTimers = new Map<string, number>();
  private readonly thresholds: PerformanceThresholds;
  private readonly maxMetricsHistory = 10000;
  private readonly maxAlertsHistory = 1000;
  
  // Performance counters
  private totalOperations = 0;
  private successfulOperations = 0;
  private failedOperations = 0;
  private totalDuration = 0;
  private slowOperations = 0;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      slowOperationThreshold: 1000, // 1 second
      errorRateThreshold: 5, // 5%
      memoryUsageThreshold: 80, // 80%
      cacheHitRateThreshold: 70, // 70%
      ...thresholds
    };

    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  // Start monitoring an operation
  public startOperation(operation: string, metadata?: Record<string, unknown>): string {
    const operationId = this.generateOperationId();
    const startTime = performance.now();
    
    this.operationTimers.set(operationId, startTime);
    
    return operationId;
  }

  // End monitoring an operation
  public endOperation(operationId: string, success: boolean = true, error?: string): void {
    const startTime = this.operationTimers.get(operationId);
    if (!startTime) {
      console.warn(`Operation ${operationId} not found in timers`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Remove timer
    this.operationTimers.delete(operationId);
    
    // Record metrics
    this.recordMetrics(operationId, duration, success, error);
    
    // Update counters
    this.totalOperations++;
    this.totalDuration += duration;
    
    if (success) {
      this.successfulOperations++;
    } else {
      this.failedOperations++;
    }
    
    if (duration > this.thresholds.slowOperationThreshold) {
      this.slowOperations++;
      this.checkSlowOperationAlert(operationId, duration);
    }
    
    // Check error rate threshold
    this.checkErrorRateThreshold();
  }

  // Record cache performance
  public recordCacheMetrics(cacheName: string, metrics: CacheMetrics): void {
    this.recordMetrics(`cache_${cacheName}`, 0, true, undefined, {
      cacheName,
      ...metrics
    });
    
    // Check cache hit rate threshold
    if (metrics.hitRate < this.thresholds.cacheHitRateThreshold) {
      this.checkCacheHitRateAlert(cacheName, metrics.hitRate);
    }
  }

  // Record database performance
  public recordDatabaseMetrics(metrics: DatabaseMetrics): void {
    this.recordMetrics('database_performance', 0, true, undefined, metrics);
  }

  // Record memory usage
  public recordMemoryMetrics(metrics: MemoryMetrics): void {
    this.recordMetrics('memory_usage', 0, true, undefined, metrics);
    
    // Check memory usage threshold
    if (metrics.usagePercentage > this.thresholds.memoryUsageThreshold) {
      this.checkMemoryUsageAlert(metrics.usagePercentage);
    }
  }

  // Get performance summary
  public getPerformanceSummary(): Readonly<{
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    successRate: number;
    averageOperationTime: number;
    slowOperations: number;
    errorRate: number;
  }> {
    const successRate = this.totalOperations > 0 ? (this.successfulOperations / this.totalOperations) * 100 : 0;
    const averageOperationTime = this.totalOperations > 0 ? this.totalDuration / this.totalOperations : 0;
    const errorRate = this.totalOperations > 0 ? (this.failedOperations / this.totalOperations) * 100 : 0;
    
    return {
      totalOperations: this.totalOperations,
      successfulOperations: this.successfulOperations,
      failedOperations: this.failedOperations,
      successRate,
      averageOperationTime,
      slowOperations: this.slowOperations,
      errorRate
    };
  }

  // Get recent metrics
  public getRecentMetrics(limit: number = 100): Readonly<PerformanceMetrics[]> {
    return this.metrics.slice(-limit);
  }

  // Get metrics by operation type
  public getMetricsByOperation(operation: string): Readonly<PerformanceMetrics[]> {
    return this.metrics.filter(m => m.operation === operation);
  }

  // Get metrics by time range
  public getMetricsByTimeRange(startTime: Date, endTime: Date): Readonly<PerformanceMetrics[]> {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  // Get recent alerts
  public getRecentAlerts(limit: number = 100): Readonly<PerformanceAlert[]> {
    return this.alerts.slice(-limit);
  }

  // Get alerts by severity
  public getAlertsBySeverity(severity: PerformanceAlert['severity']): Readonly<PerformanceAlert[]> {
    return this.alerts.filter(a => a.severity === severity);
  }

  // Clear old metrics and alerts
  public cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Remove old metrics
    this.metrics.splice(0, this.metrics.length - this.maxMetricsHistory);
    
    // Remove old alerts
    this.alerts.splice(0, this.alerts.length - this.maxAlertsHistory);
    
    console.log(`Performance monitoring cleanup completed. Metrics: ${this.metrics.length}, Alerts: ${this.alerts.length}`);
  }

  // Export metrics for external monitoring systems
  public exportMetrics(): Readonly<{
    summary: ReturnType<typeof this.getPerformanceSummary>;
    recentMetrics: PerformanceMetrics[];
    recentAlerts: PerformanceAlert[];
    timestamp: Date;
  }> {
    return {
      summary: this.getPerformanceSummary(),
      recentMetrics: this.getRecentMetrics(1000),
      recentAlerts: this.getRecentAlerts(100),
      timestamp: new Date()
    };
  }

  // Reset all metrics (useful for testing)
  public reset(): void {
    this.metrics.length = 0;
    this.alerts.length = 0;
    this.operationTimers.clear();
    this.totalOperations = 0;
    this.successfulOperations = 0;
    this.failedOperations = 0;
    this.totalDuration = 0;
    this.slowOperations = 0;
    
    console.log('Performance monitoring service reset');
  }

  // Private methods
  private recordMetrics(
    operation: string, 
    duration: number, 
    success: boolean, 
    error?: string, 
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: new Date(),
      metadata: metadata || {},
      success,
      error
    };
    
    this.metrics.push(metric);
    
    // Maintain max history size
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  private checkSlowOperationAlert(operationId: string, duration: number): void {
    const severity = this.getSeverityForDuration(duration);
    
    const alert: PerformanceAlert = {
      type: 'slow_operation',
      severity,
      message: `Operation ${operationId} took ${duration.toFixed(2)}ms, exceeding threshold of ${this.thresholds.slowOperationThreshold}ms`,
      timestamp: new Date(),
      metrics: { operationId, duration, threshold: this.thresholds.slowOperationThreshold }
    };
    
    this.alerts.push(alert);
    this.logAlert(alert);
  }

  private checkErrorRateThreshold(): void {
    if (this.totalOperations === 0) return;
    
    const errorRate = (this.failedOperations / this.totalOperations) * 100;
    
    if (errorRate > this.thresholds.errorRateThreshold) {
      const severity = this.getSeverityForErrorRate(errorRate);
      
      const alert: PerformanceAlert = {
        type: 'high_error_rate',
        severity,
        message: `Error rate is ${errorRate.toFixed(2)}%, exceeding threshold of ${this.thresholds.errorRateThreshold}%`,
        timestamp: new Date(),
        metrics: { errorRate, threshold: this.thresholds.errorRateThreshold, totalOperations: this.totalOperations, failedOperations: this.failedOperations }
      };
      
      this.alerts.push(alert);
      this.logAlert(alert);
    }
  }

  private checkCacheHitRateAlert(cacheName: string, hitRate: number): void {
    const severity = this.getSeverityForCacheHitRate(hitRate);
    
    const alert: PerformanceAlert = {
      type: 'low_cache_hit_rate',
      severity,
      message: `Cache ${cacheName} hit rate is ${hitRate.toFixed(2)}%, below threshold of ${this.thresholds.cacheHitRateThreshold}%`,
      timestamp: new Date(),
      metrics: { cacheName, hitRate, threshold: this.thresholds.cacheHitRateThreshold }
    };
    
    this.alerts.push(alert);
    this.logAlert(alert);
  }

  private checkMemoryUsageAlert(usagePercentage: number): void {
    const severity = this.getSeverityForMemoryUsage(usagePercentage);
    
    const alert: PerformanceAlert = {
      type: 'high_memory_usage',
      severity,
      message: `Memory usage is ${usagePercentage.toFixed(2)}%, above threshold of ${this.thresholds.memoryUsageThreshold}%`,
      timestamp: new Date(),
      metrics: { usagePercentage, threshold: this.thresholds.memoryUsageThreshold }
    };
    
    this.alerts.push(alert);
    this.logAlert(alert);
  }

  private getSeverityForDuration(duration: number): PerformanceAlert['severity'] {
    if (duration > this.thresholds.slowOperationThreshold * 5) return 'critical';
    if (duration > this.thresholds.slowOperationThreshold * 3) return 'high';
    if (duration > this.thresholds.slowOperationThreshold * 2) return 'medium';
    return 'low';
  }

  private getSeverityForErrorRate(errorRate: number): PerformanceAlert['severity'] {
    if (errorRate > this.thresholds.errorRateThreshold * 5) return 'critical';
    if (errorRate > this.thresholds.errorRateThreshold * 3) return 'high';
    if (errorRate > this.thresholds.errorRateThreshold * 2) return 'medium';
    return 'low';
  }

  private getSeverityForCacheHitRate(hitRate: number): PerformanceAlert['severity'] {
    if (hitRate < this.thresholds.cacheHitRateThreshold * 0.5) return 'critical';
    if (hitRate < this.thresholds.cacheHitRateThreshold * 0.7) return 'high';
    if (hitRate < this.thresholds.cacheHitRateThreshold * 0.9) return 'medium';
    return 'low';
  }

  private getSeverityForMemoryUsage(usagePercentage: number): PerformanceAlert['severity'] {
    if (usagePercentage > this.thresholds.memoryUsageThreshold + 20) return 'critical';
    if (usagePercentage > this.thresholds.memoryUsageThreshold + 10) return 'high';
    if (usagePercentage > this.thresholds.memoryUsageThreshold + 5) return 'medium';
    return 'low';
  }

  private logAlert(alert: PerformanceAlert): void {
    const logLevel = alert.severity === 'critical' ? 'error' : 
                    alert.severity === 'high' ? 'warn' : 'info';
    
    console[logLevel](`[PERFORMANCE ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`, alert.metrics);
    
    // Maintain max alerts history size
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts.shift();
    }
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPeriodicMonitoring(): void {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const available = memory.jsHeapSizeLimit;
        const usagePercentage = (used / total) * 100;
        
        this.recordMemoryMetrics({
          used,
          total,
          available,
          usagePercentage
        });
      }
    }, 30000);

    // Cleanup every hour
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }
}

// Singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();

// Performance decorator for easy operation monitoring
export function monitorPerformance(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operation = operationName || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = async function (...args: any[]) {
      const operationId = performanceMonitoring.startOperation(operation, { args: args.length });
      
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitoring.endOperation(operationId, true);
        return result;
      } catch (error) {
        performanceMonitoring.endOperation(operationId, false, error instanceof Error ? error.message : String(error));
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Performance monitoring hook for React components
export function usePerformanceMonitoring(componentName: string) {
  const startOperation = (operation: string, metadata?: Record<string, unknown>) => {
    return performanceMonitoring.startOperation(`${componentName}.${operation}`, metadata);
  };
  
  const endOperation = (operationId: string, success: boolean = true, error?: string) => {
    performanceMonitoring.endOperation(operationId, success, error);
  };
  
  return { startOperation, endOperation };
}
