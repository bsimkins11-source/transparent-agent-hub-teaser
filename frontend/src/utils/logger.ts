// Centralized logging utility with environment-based levels and structured logging
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
}

export interface LoggerConfig {
  logLevel: LogLevel;
  isDevelopment: boolean;
  enableStructuredLogging: boolean;
  maxDataSize: number;
  enablePerformanceLogging: boolean;
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  component?: string;
}

// Performance measurement interface
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Vite environment types
interface ImportMetaEnv {
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_ENABLE_STRUCTURED_LOGGING?: string;
  readonly VITE_MAX_LOG_DATA_SIZE?: string;
  readonly VITE_ENABLE_PERFORMANCE_LOGGING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

class Logger {
  private readonly config: LoggerConfig;
  private readonly levels: Record<LogLevel, number>;
  private readonly performanceMetrics: Map<string, PerformanceMetric> = new Map();
  private readonly sessionId: string;

  constructor() {
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    this.sessionId = this.generateSessionId();
    
    this.config = {
      logLevel: this.parseLogLevel((import.meta as any).env?.VITE_LOG_LEVEL),
      isDevelopment: (import.meta as any).env?.DEV || false,
      enableStructuredLogging: (import.meta as any).env?.VITE_ENABLE_STRUCTURED_LOGGING === 'true',
      maxDataSize: parseInt((import.meta as any).env?.VITE_MAX_LOG_DATA_SIZE || '1000', 10),
      enablePerformanceLogging: (import.meta as any).env?.VITE_ENABLE_PERFORMANCE_LOGGING === 'true'
    };
  }

  private parseLogLevel(level: string | undefined): LogLevel {
    if (level && this.isValidLogLevel(level)) {
      return level as LogLevel;
    }
    return 'info';
  }

  private isValidLogLevel(level: string): level is LogLevel {
    return Object.keys(this.levels).includes(level);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.config.logLevel];
  }

  private sanitizeData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    try {
      const dataString = JSON.stringify(data);
      if (dataString.length > this.config.maxDataSize) {
        return {
          _truncated: true,
          _originalSize: dataString.length,
          _truncatedSize: this.config.maxDataSize,
          data: dataString.substring(0, this.config.maxDataSize) + '...'
        };
      }
      return data;
    } catch (error) {
      return {
        _error: 'Failed to serialize data',
        _type: typeof data,
        _constructor: data?.constructor?.name
      };
    }
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.component ? `[${entry.component}]` : '';
    const context = this.buildContextString(entry);
    return `${entry.timestamp} ${prefix} ${entry.message}${context}`;
  }

  private buildContextString(entry: LogEntry): string {
    const contextParts: string[] = [];
    
    if (entry.userId) contextParts.push(`user:${entry.userId}`);
    if (entry.sessionId) contextParts.push(`session:${entry.sessionId}`);
    if (entry.correlationId) contextParts.push(`corr:${entry.correlationId}`);
    
    return contextParts.length > 0 ? ` | ${contextParts.join(' | ')}` : '';
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    data?: unknown, 
    context?: LogContext
  ): LogEntry {
    return {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      component: context?.component,
      userId: context?.userId,
      sessionId: context?.sessionId || this.sessionId,
      correlationId: context?.correlationId
    };
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    try {
      const entry = this.createLogEntry(level, message, data, context);
      const formattedMessage = this.formatMessage(entry);

      if (this.config.isDevelopment) {
        this.logToConsole(level, formattedMessage, entry.data);
      } else {
        this.logToProduction(level, formattedMessage, entry);
      }

      // Emit custom event for external log consumers
      this.emitLogEvent(entry);
    } catch (error) {
      // Fallback logging if our logger fails
      console.error('Logger error:', error);
      console[level](message, data);
    }
  }

  private logToConsole(level: LogLevel, message: string, data?: unknown): void {
    const consoleMethod = console[level] as (message: string, data?: unknown) => void;
    
    if (data !== undefined) {
      consoleMethod(message, data);
    } else {
      consoleMethod(message);
    }
  }

  private logToProduction(level: LogLevel, message: string, entry: LogEntry): void {
    // In production, only log errors and warnings by default
    if (level === 'error' || level === 'warn') {
      console[level](message, entry.data);
    }

    // TODO: Implement production logging service integration
    // This could send logs to services like DataDog, LogRocket, or custom backend
    if (this.config.enableStructuredLogging) {
      this.sendToLoggingService(entry);
    }
  }

  private emitLogEvent(entry: LogEntry): void {
    try {
      const event = new CustomEvent('logger:entry', {
        detail: entry,
        bubbles: true
      });
      window.dispatchEvent(event);
    } catch (error) {
      // Silently fail if event emission fails
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // TODO: Implement actual logging service integration
    // This is a placeholder for future implementation
    if (this.config.isDevelopment) {
      console.debug('Would send to logging service:', entry);
    }
  }

  // Public logging methods with proper typing
  debug(message: string, data?: unknown, context?: LogContext): void {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: unknown, context?: LogContext): void {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: unknown, context?: LogContext): void {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: unknown, context?: LogContext): void {
    this.log('error', message, data, context);
  }

  // Performance logging methods
  startTimer(operation: string, metadata?: Record<string, unknown>): string {
    if (!this.config.enablePerformanceLogging) return '';

    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.performanceMetrics.set(timerId, {
      operation,
      duration: 0,
      timestamp: new Date().toISOString(),
      metadata
    });

    return timerId;
  }

  endTimer(timerId: string, additionalMetadata?: Record<string, unknown>): void {
    if (!this.config.enablePerformanceLogging || !timerId) return;

    const metric = this.performanceMetrics.get(timerId);
    if (!metric) return;

    const endTime = performance.now();
    const startTime = new Date(metric.timestamp).getTime();
    metric.duration = endTime - startTime;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    this.info(`Performance: ${metric.operation} completed in ${metric.duration.toFixed(2)}ms`, metric, {
      component: 'Performance'
    });

    this.performanceMetrics.delete(timerId);
  }

  // Convenience methods for common patterns with better typing
  authSuccess(message: string, user?: Record<string, unknown>): void {
    this.info(`🔐 ${message}`, user, { component: 'Auth' });
  }

  authError(message: string, error?: unknown): void {
    this.error(`❌ ${message}`, error, { component: 'Auth' });
  }

  apiRequest(method: string, url: string, data?: unknown, context?: LogContext): void {
    this.debug(`🌐 ${method} ${url}`, data, { ...context, component: 'API' });
  }

  apiResponse(method: string, url: string, status: number, data?: unknown, context?: LogContext): void {
    const logContext = { ...context, component: 'API' };
    
    if (status >= 400) {
      this.error(`🌐 ${method} ${url} - ${status}`, data, logContext);
    } else {
      this.debug(`🌐 ${method} ${url} - ${status}`, data, logContext);
    }
  }

  componentMount(componentName: string, props?: Record<string, unknown>): void {
    this.debug(`🔧 ${componentName} mounted`, props, { component: componentName });
  }

  componentUnmount(componentName: string): void {
    this.debug(`🔧 ${componentName} unmounted`, undefined, { component: componentName });
  }

  componentError(componentName: string, error: unknown, props?: Record<string, unknown>): void {
    this.error(`🔧 ${componentName} error`, { error, props }, { component: componentName });
  }

  // Utility methods
  setLogLevel(level: LogLevel): void {
    if (this.isValidLogLevel(level)) {
      this.config.logLevel = level;
      this.info(`Log level changed to: ${level}`, undefined, { component: 'Logger' });
    } else {
      this.warn(`Invalid log level: ${level}`, undefined, { component: 'Logger' });
    }
  }

  getLogLevel(): LogLevel {
    return this.config.logLevel;
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return Array.from(this.performanceMetrics.values());
  }

  clearPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  // Method to create a child logger with specific context
  createChildLogger(context: LogContext): Logger {
    const childLogger = new Logger();
    // Inherit configuration but allow context overrides
    Object.assign(childLogger.config, this.config);
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
