// Observability Service Interface for Enterprise Monitoring
export interface IObservabilityService {
  // Structured Logging
  log(level: LogLevel, message: string, context: LogContext): Promise<void>;
  logInfo(message: string, context: LogContext): Promise<void>;
  logWarning(message: string, context: LogContext): Promise<void>;
  logError(message: string, context: LogContext, error?: Error): Promise<void>;
  logDebug(message: string, context: LogContext): Promise<void>;
  
  // Metrics Collection
  recordMetric(name: string, value: number, tags: MetricTags): Promise<void>;
  incrementCounter(name: string, tags: MetricTags, value?: number): Promise<void>;
  recordHistogram(name: string, value: number, tags: MetricTags): Promise<void>;
  recordGauge(name: string, value: number, tags: MetricTags): Promise<void>;
  
  // Performance Monitoring
  startTimer(name: string): Timer;
  recordPerformance(name: string, duration: number, tags: MetricTags): Promise<void>;
  
  // Distributed Tracing
  startSpan(name: string, context: TraceContext): Span;
  addSpanEvent(spanId: string, event: SpanEvent): Promise<void>;
  endSpan(spanId: string, status: SpanStatus): Promise<void>;
  
  // Health Checks
  recordHealthCheck(name: string, status: HealthStatus, details?: any): Promise<void>;
  getHealthStatus(): Promise<HealthSummary>;
  
  // Audit Logging
  logAuditEvent(event: AuditEvent): Promise<void>;
  getAuditLogs(filters: AuditLogFilters): Promise<AuditLogEntry[]>;
  
  // Error Tracking
  captureException(error: Error, context: ErrorContext): Promise<void>;
  captureMessage(message: string, level: LogLevel, context: ErrorContext): Promise<void>;
  
  // Configuration
  setLogLevel(level: LogLevel): void;
  setEnvironment(environment: string): void;
  setServiceName(serviceName: string): void;
  setVersion(version: string): void;
}

// Core Types
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface LogContext {
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  requestId?: string;
  agentId?: string;
  action?: string;
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  [key: string]: any;
}

export interface MetricTags {
  userId?: string;
  tenantId?: string;
  agentId?: string;
  category?: string;
  provider?: string;
  environment?: string;
  version?: string;
  [key: string]: string | number | boolean;
}

export interface Timer {
  id: string;
  name: string;
  startTime: number;
  stop(): Promise<number>;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  userId?: string;
  tenantId?: string;
  agentId?: string;
  requestId?: string;
}

export interface Span {
  id: string;
  name: string;
  startTime: number;
  context: TraceContext;
  addEvent(event: SpanEvent): void;
  setStatus(status: SpanStatus): void;
  end(): void;
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes: Record<string, any>;
}

export interface SpanStatus {
  code: 'ok' | 'error' | 'unset';
  message?: string;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthSummary {
  overall: HealthStatus;
  checks: HealthCheckResult[];
  timestamp: Date;
}

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  responseTime: number;
  details?: any;
  lastChecked: Date;
}

export interface AuditEvent {
  eventType: string;
  userId: string;
  tenantId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogFilters {
  userId?: string;
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditLogEntry extends AuditEvent {
  id: string;
  sessionId?: string;
  requestId?: string;
}

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  agentId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  additionalData?: Record<string, any>;
}

// POC-Ready Simplified Interfaces
export interface POCLogContext {
  userId?: string;
  tenantId?: string;
  action?: string;
  [key: string]: any;
}

export interface POCMetricTags {
  userId?: string;
  tenantId?: string;
  agentId?: string;
  [key: string]: string | number;
}

// Simplified Observability Service for POC
export interface IPOCObservabilityService {
  // Essential logging for POC
  logInfo(message: string, context: POCLogContext): Promise<void>;
  logError(message: string, context: POCLogContext, error?: Error): Promise<void>;
  
  // Basic metrics for POC
  recordMetric(name: string, value: number, tags: POCMetricTags): Promise<void>;
  incrementCounter(name: string, tags: POCMetricTags): Promise<void>;
  
  // Simple performance tracking
  startTimer(name: string): Timer;
  
  // Basic health checks
  recordHealthCheck(name: string, status: HealthStatus): Promise<void>;
  
  // Simple audit logging
  logAuditEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void>;
}
