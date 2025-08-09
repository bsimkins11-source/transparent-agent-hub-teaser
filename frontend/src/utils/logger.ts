// Centralized logging utility with environment-based levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel: LogLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel || 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.component ? `[${entry.component}]` : '';
    return `${entry.timestamp} ${prefix} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: any, component?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component
    };

    const formattedMessage = this.formatMessage(entry);

    // In development, use console methods for better DevTools integration
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, data);
          break;
        case 'info':
          console.info(formattedMessage, data);
          break;
        case 'warn':
          console.warn(formattedMessage, data);
          break;
        case 'error':
          console.error(formattedMessage, data);
          break;
      }
    } else {
      // In production, you might want to send logs to a service
      // For now, only log errors and warnings
      if (level === 'error' || level === 'warn') {
        console[level](formattedMessage, data);
      }
    }
  }

  debug(message: string, data?: any, component?: string): void {
    this.log('debug', message, data, component);
  }

  info(message: string, data?: any, component?: string): void {
    this.log('info', message, data, component);
  }

  warn(message: string, data?: any, component?: string): void {
    this.log('warn', message, data, component);
  }

  error(message: string, data?: any, component?: string): void {
    this.log('error', message, data, component);
  }

  // Convenience methods for common patterns
  authSuccess(message: string, user?: any): void {
    this.info(`🔐 ${message}`, user, 'Auth');
  }

  authError(message: string, error?: any): void {
    this.error(`❌ ${message}`, error, 'Auth');
  }

  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`🌐 ${method} ${url}`, data, 'API');
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (status >= 400) {
      this.error(`🌐 ${method} ${url} - ${status}`, data, 'API');
    } else {
      this.debug(`🌐 ${method} ${url} - ${status}`, data, 'API');
    }
  }

  componentMount(componentName: string): void {
    this.debug(`🔧 ${componentName} mounted`, undefined, componentName);
  }

  componentUnmount(componentName: string): void {
    this.debug(`🔧 ${componentName} unmounted`, undefined, componentName);
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
