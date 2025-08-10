# Services Architecture

## Overview

This directory contains the service layer for the Transparent AI Agent Hub. We've implemented a **service abstraction layer** that allows easy migration between Firebase (for POC development) and Cloud Run (for production scaling).

## Architecture

```
services/
├── interfaces/           # Service contracts
│   ├── IAgentService.ts
│   └── ILibraryService.ts
├── implementations/      # Concrete implementations
│   ├── FirebaseAgentService.ts
│   └── FirebaseLibraryService.ts
├── ServiceFactory.ts     # Service selection and management
├── agentManagementServiceAdapter.ts  # Backward compatibility
└── README.md            # This file
```

## Key Principles

### 1. Interface-First Design
- All services implement well-defined interfaces
- Easy to swap implementations without changing business logic
- Clear contracts for what each service must provide

### 2. Service Factory Pattern
- Centralized service management
- Environment-based service selection
- Easy to switch between Firebase and Cloud Run

### 3. Backward Compatibility
- Existing code continues to work
- Gradual migration possible
- No breaking changes to components

## How to Use

### For New Code

```typescript
import { serviceFactory } from '../services/ServiceFactory';

// Get the appropriate service
const agentService = serviceFactory.getAgentService();
const libraryService = serviceFactory.getLibraryService();

// Use normally
const agents = await agentService.getAllAgents();
```

### For Existing Code

```typescript
// Import from the adapter (same interface as before)
import { createAgent, getAllAgents } from '../services/agentManagementServiceAdapter';

// Use exactly as before
const agentId = await createAgent(agentData);
const agents = await getAllAgents();
```

## Service Selection

### Environment Variables

```bash
# .env file
VITE_SERVICE_PROVIDER=firebase        # For POC development
VITE_SERVICE_PROVIDER=cloudrun        # For production
VITE_CLOUD_RUN_BASE_URL=https://...  # Cloud Run endpoint
VITE_CLOUD_RUN_API_KEY=...           # Cloud Run API key
```

### Runtime Configuration

```typescript
import { serviceFactory } from '../services/ServiceFactory';

// Check current provider
console.log('Using:', serviceFactory.getCurrentProvider());

// Manual configuration (if needed)
serviceFactory.configure({
  provider: 'firebase'
});
```

## Adding New Services

### 1. Define the Interface

```typescript
// interfaces/INewService.ts
export interface INewService {
  newMethod(): Promise<void>;
}
```

### 2. Implement Firebase Version

```typescript
// implementations/FirebaseNewService.ts
export class FirebaseNewService implements INewService {
  async newMethod(): Promise<void> {
    // Firebase implementation
  }
}
```

### 3. Add to Service Factory

```typescript
// ServiceFactory.ts
public getNewService(): INewService {
  switch (this.config.provider) {
    case 'firebase':
      return new FirebaseNewService();
    case 'cloudrun':
      return new CloudRunNewService(); // Future implementation
  }
}
```

## Migration Path

### Phase 1: POC Development (Current)
- ✅ Use Firebase for all services
- ✅ Build features with clean architecture
- ✅ Test business logic

### Phase 2: Cloud Run Implementation (Future)
- 🔄 Implement Cloud Run versions of services
- 🔄 Add HTTP client and error handling
- 🔄 Test both implementations

### Phase 3: Production Migration
- 🔄 Update environment variables
- 🔄 Deploy and monitor
- 🔄 Rollback capability

## Benefits

### For Development
- **Fast iteration** with Firebase
- **Clean code** that's easy to maintain
- **No vendor lock-in**

### For Production
- **Easy migration** to Cloud Run
- **Proven interfaces** that work
- **Gradual migration** possible

## Testing

### Unit Tests
```typescript
// Test against interfaces, not implementations
import { IAgentService } from './interfaces/IAgentService';

// Mock the service
const mockAgentService: IAgentService = {
  getAllAgents: jest.fn().mockResolvedValue([])
};
```

### Integration Tests
```typescript
// Test both implementations
import { serviceFactory } from './ServiceFactory';

// Test Firebase
serviceFactory.configure({ provider: 'firebase' });
const firebaseResult = await serviceFactory.getAgentService().getAllAgents();

// Test Cloud Run (when ready)
serviceFactory.configure({ provider: 'cloudrun' });
const cloudRunResult = await serviceFactory.getAgentService().getAllAgents();
```

## Troubleshooting

### Common Issues

1. **Service not found**: Check environment variables
2. **Type errors**: Ensure interfaces match implementations
3. **Performance issues**: Monitor service factory configuration

### Debug Mode

```typescript
// Enable debug logging
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

For questions about the service architecture:
- Check the interfaces in `interfaces/`
- Review implementations in `implementations/`
- See the main `ServiceFactory.ts`
- Refer to `MIGRATION_GUIDE.md` in the project root
