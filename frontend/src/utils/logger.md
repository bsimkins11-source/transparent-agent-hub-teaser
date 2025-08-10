# Logger Utility Documentation

## Overview

The Logger utility is a world-class, production-ready logging system designed for the Transparent AI Agent Hub frontend. It provides structured logging, performance monitoring, and environment-based configuration.

## Features

### 🚀 **Core Logging**
- **Environment-based log levels**: Automatically adjusts based on `VITE_LOG_LEVEL`
- **Structured logging**: Rich metadata including timestamps, components, and context
- **Performance monitoring**: Built-in timing and metrics collection
- **Error handling**: Graceful fallbacks and sanitization

### 🔧 **Configuration**
- **Log levels**: `debug`, `info`, `warn`, `error`
- **Environment variables**: Configurable via Vite environment variables
- **Data sanitization**: Automatic truncation of large objects
- **Production optimization**: Minimal console output in production

### 📊 **Performance Features**
- **Operation timing**: Start/stop timers for performance measurement
- **Metrics collection**: In-memory storage of performance data
- **Metadata support**: Rich context for performance analysis

## Environment Variables

```bash
# Log level (default: 'info')
VITE_LOG_LEVEL=debug

# Enable structured logging (default: false)
VITE_ENABLE_STRUCTURED_LOGGING=true

# Maximum log data size in characters (default: 1000)
VITE_MAX_LOG_DATA_SIZE=2000

# Enable performance logging (default: false)
VITE_ENABLE_PERFORMANCE_LOGGING=true
```

## Basic Usage

```typescript
import { logger } from '@/utils/logger';

// Basic logging
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// With data
logger.info('User action', { userId: '123', action: 'login' });

// With context
logger.info('Component updated', { props: { title: 'New Title' } }, {
  component: 'UserProfile',
  userId: '123'
});
```

## Convenience Methods

### Authentication Logging
```typescript
logger.authSuccess('User logged in successfully', { userId: '123' });
logger.authError('Login failed', { error: 'Invalid credentials' });
```

### API Logging
```typescript
logger.apiRequest('GET', '/api/users', { limit: 10 });
logger.apiResponse('GET', '/api/users', 200, { users: [] });
logger.apiResponse('GET', '/api/users', 404, { error: 'Not found' });
```

### Component Logging
```typescript
logger.componentMount('UserProfile', { props: { userId: '123' } });
logger.componentUnmount('UserProfile');
logger.componentError('UserProfile', error, { props: { userId: '123' } });
```

## Performance Monitoring

### Basic Timing
```typescript
const timerId = logger.startTimer('API Request', { endpoint: '/api/users' });

// ... perform operation ...

logger.endTimer(timerId, { result: 'success', count: 25 });
```

### Advanced Timing with Metadata
```typescript
const timerId = logger.startTimer('Complex Operation', {
  operationType: 'dataProcessing',
  inputSize: 1000
});

try {
  // ... perform operation ...
  logger.endTimer(timerId, { 
    result: 'success', 
    processedItems: 1000,
    errors: 0 
  });
} catch (error) {
  logger.endTimer(timerId, { 
    result: 'error', 
    error: error.message 
  });
}
```

## Context and Metadata

### LogContext Interface
```typescript
interface LogContext {
  userId?: string;        // Current user ID
  sessionId?: string;     // Session identifier
  correlationId?: string; // Request correlation ID
  component?: string;     // Component name
}
```

### Using Context
```typescript
const context = {
  userId: '123',
  component: 'UserProfile',
  correlationId: 'req_456'
};

logger.info('User action performed', { action: 'profile_update' }, context);
```

## Child Loggers

Create specialized loggers for specific components or features:

```typescript
const userLogger = logger.createChildLogger({ 
  component: 'UserService',
  userId: '123'
});

userLogger.info('User profile updated', { changes: ['email', 'avatar'] });
```

## Utility Methods

### Configuration
```typescript
// Get current log level
const currentLevel = logger.getLogLevel();

// Change log level dynamically
logger.setLogLevel('debug');

// Get performance metrics
const metrics = logger.getPerformanceMetrics();

// Clear performance metrics
logger.clearPerformanceMetrics();
```

## Best Practices

### 1. **Use Appropriate Log Levels**
- `debug`: Detailed information for debugging
- `info`: General information about application flow
- `warn`: Warning conditions that don't stop execution
- `error`: Error conditions that need attention

### 2. **Provide Rich Context**
```typescript
// Good
logger.error('API request failed', { 
  endpoint: '/api/users',
  status: 500,
  userId: '123'
}, { component: 'UserService' });

// Avoid
logger.error('API request failed');
```

### 3. **Sanitize Sensitive Data**
```typescript
// Good - sensitive data is automatically sanitized
logger.info('User login attempt', { 
  email: 'user@example.com',
  ip: '192.168.1.1'
});

// Avoid - never log passwords, tokens, etc.
logger.info('User login attempt', { 
  password: 'secret123', // ❌ Never log this!
  email: 'user@example.com'
});
```

### 4. **Use Performance Logging Sparingly**
```typescript
// Good - for critical operations
const timerId = logger.startTimer('Database Query', { table: 'users' });
const result = await db.query('SELECT * FROM users');
logger.endTimer(timerId, { rowCount: result.length });

// Avoid - for trivial operations
const timerId = logger.startTimer('String concatenation'); // ❌ Too granular
const result = 'Hello ' + 'World';
logger.endTimer(timerId);
```

## Error Handling

The logger includes comprehensive error handling:

- **Graceful fallbacks**: If logging fails, falls back to console methods
- **Data sanitization**: Automatically handles circular references and large objects
- **Memory management**: Prevents memory leaks from large log data
- **Performance protection**: Non-blocking logging operations

## Production Considerations

### 1. **Log Level Management**
- Production environments should use `info` or `warn` level
- Debug logging is automatically disabled in production
- Only errors and warnings are logged to console in production

### 2. **External Logging Services**
- Structured logging can be sent to external services (DataDog, LogRocket, etc.)
- Custom event emission for external log consumers
- Configurable via environment variables

### 3. **Performance Impact**
- Logging operations are non-blocking
- Data sanitization prevents memory issues
- Automatic truncation of large objects

## Migration Guide

### From Old Logger
```typescript
// Old way
logger.info('Message', data, 'ComponentName');

// New way
logger.info('Message', data, { component: 'ComponentName' });
```

### Adding Context
```typescript
// Old way
logger.authSuccess('Login successful', user);

// New way
logger.authSuccess('Login successful', user, { 
  userId: user.id,
  sessionId: session.id 
});
```

## Troubleshooting

### Common Issues

1. **Logs not appearing**
   - Check `VITE_LOG_LEVEL` environment variable
   - Verify console is open in browser DevTools

2. **Performance logging not working**
   - Ensure `VITE_ENABLE_PERFORMANCE_LOGGING=true`
   - Check that timer IDs are properly managed

3. **Large data objects causing issues**
   - Data is automatically truncated based on `VITE_MAX_LOG_DATA_SIZE`
   - Consider breaking large objects into smaller pieces

### Debug Mode
Enable debug logging to see internal logger operations:
```typescript
logger.setLogLevel('debug');
```

## Future Enhancements

- [ ] Integration with external logging services
- [ ] Log persistence and retrieval
- [ ] Advanced filtering and search capabilities
- [ ] Real-time log streaming
- [ ] Custom log formatters
- [ ] Log aggregation and analysis tools
