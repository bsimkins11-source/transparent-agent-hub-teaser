# Migration Guide: Firebase to Cloud Run

## Overview

This guide explains how to use the new service abstraction layer and migrate from Firebase to Cloud Run when you're ready to scale.

## Current Architecture

### Service Abstraction Layer

We've implemented a clean service abstraction layer that allows you to:

1. **Use Firebase for POC development** (fast, easy)
2. **Easily migrate to Cloud Run later** (scalable, enterprise-ready)
3. **Switch between implementations** via environment variables

### Key Components

- **Interfaces**: `IAgentService`, `ILibraryService` define the contract
- **Implementations**: `FirebaseAgentService`, `FirebaseLibraryService` implement Firebase logic
- **Service Factory**: `ServiceFactory` manages which implementation to use
- **Configuration**: Environment-based service selection

## How to Use

### 1. Get Services

```typescript
import { serviceFactory } from '../services/ServiceFactory';

// Get the appropriate service implementation
const agentService = serviceFactory.getAgentService();
const libraryService = serviceFactory.getLibraryService();

// Use services normally
const agents = await agentService.getAllAgents();
```

### 2. Configure Service Provider

Set environment variables in your `.env` file:

```bash
# For Firebase (POC development)
VITE_SERVICE_PROVIDER=firebase

# For Cloud Run (production)
VITE_SERVICE_PROVIDER=cloudrun
VITE_CLOUD_RUN_BASE_URL=https://your-service.run.app
VITE_CLOUD_RUN_API_KEY=your-api-key
```

### 3. Initialize Services

Call this in your app startup:

```typescript
import { initializeServices } from '../services/ServiceFactory';

// Initialize services based on environment
initializeServices();
```

## Migration Path

### Phase 1: POC Development (Current)
- ✅ Use Firebase for all services
- ✅ Build features with clean architecture
- ✅ Test business logic and user experience

### Phase 2: Cloud Run Implementation (Future)
- 🔄 Implement `CloudRunAgentService` and `CloudRunLibraryService`
- 🔄 Add HTTP client for Cloud Run API calls
- 🔄 Implement proper error handling and retry logic

### Phase 3: Migration (When Ready)
- 🔄 Update environment variables
- 🔄 Test Cloud Run implementation
- 🔄 Deploy and monitor

## Benefits

### For POC Development
- **Fast development** with Firebase
- **Clean architecture** that's easy to maintain
- **No vendor lock-in** - easy to switch later

### For Production Migration
- **Minimal code changes** required
- **Proven interfaces** that work
- **Gradual migration** possible (service by service)

## Example: Adding New Features

When adding new features, always:

1. **Add to the interface first**:
```typescript
// In IAgentService
export interface IAgentService {
  // ... existing methods
  newFeature(): Promise<void>; // Add here first
}
```

2. **Implement in Firebase service**:
```typescript
// In FirebaseAgentService
async newFeature(): Promise<void> {
  // Firebase-specific implementation
}
```

3. **Implement in Cloud Run service later**:
```typescript
// In CloudRunAgentService (when ready)
async newFeature(): Promise<void> {
  // HTTP call to Cloud Run
}
```

## Testing

### Unit Tests
- Test against interfaces, not implementations
- Mock services for component testing
- Test both Firebase and Cloud Run implementations

### Integration Tests
- Test Firebase implementation with real data
- Test Cloud Run implementation with mock endpoints
- Verify both implementations return same results

## Troubleshooting

### Common Issues

1. **Service not found**: Check environment variables
2. **Type errors**: Ensure interfaces match implementations
3. **Performance issues**: Monitor service factory configuration

### Debug Mode

Enable debug logging:

```typescript
// Check current service provider
console.log('Current provider:', serviceFactory.getCurrentProvider());
console.log('Is Firebase:', serviceFactory.isFirebase());
console.log('Is Cloud Run:', serviceFactory.isCloudRun());
```

## Next Steps

1. **Continue POC development** using Firebase
2. **Add new features** through the interface layer
3. **Plan Cloud Run implementation** when ready to scale
4. **Implement Cloud Run services** following the same patterns

## Support

For questions about the migration architecture, refer to:
- Service interfaces in `src/services/interfaces/`
- Firebase implementations in `src/services/implementations/`
- Service factory in `src/services/ServiceFactory.ts`
- Configuration in `src/config/services.ts`
