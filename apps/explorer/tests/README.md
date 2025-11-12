# NorExplorer Test Suite

Comprehensive test suite for NorExplorer AI features and core functionality.

## Test Structure

```
tests/
├── setup.ts                    # Vitest configuration and global mocks
├── utils/
│   └── test-utils.tsx          # Test utilities and helpers
├── hooks/
│   └── useAI.test.ts          # Unit tests for AI hooks
├── components/
│   └── ai/
│       ├── TransactionAI.test.tsx
│       ├── AddressAI.test.tsx
│       ├── AISidebar.test.tsx
│       └── GasPredictionWidget.test.tsx
├── integration/
│   └── api-client-ai.test.ts  # Integration tests for API client
└── e2e/
    └── ai-features.e2e.spec.ts # E2E tests using Playwright
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Coverage

### Unit Tests
- ✅ AI Hooks (`useAI.ts`)
  - `useAnalyzeTransaction`
  - `useAuditContract`
  - `usePredictGas`
  - `useDetectAnomalies`
  - `useOptimizePortfolio`
  - `useNorAIChat`
  - Combined hooks (`useTransactionAI`, `useAddressAI`, `useContractAI`)

### Component Tests
- ✅ `TransactionAI` - Transaction analysis component
- ✅ `AddressAI` - Address risk and portfolio optimization
- ✅ `AISidebar` - Context-aware chat assistant
- ✅ `GasPredictionWidget` - Gas price prediction widget

### Integration Tests
- ✅ API Client AI methods
  - Request/response handling
  - Error handling
  - Parameter validation

### E2E Tests
- ✅ Transaction AI on transaction pages
- ✅ Address AI on address pages
- ✅ Contract AI on contract pages
- ✅ AI Sidebar functionality
- ✅ Gas prediction widget
- ✅ Error handling
- ✅ Performance benchmarks

## Test Utilities

### `test-utils.tsx`
Provides:
- Custom render function with QueryClient provider
- Mock API responses
- Mock fetch helper
- Mock API client factory

### Mock Data
All mock responses are defined in `test-utils.tsx`:
- `mockAIResponses.analyzeTransaction`
- `mockAIResponses.auditContract`
- `mockAIResponses.predictGas`
- `mockAIResponses.detectAnomalies`
- `mockAIResponses.optimizePortfolio`
- `mockAIResponses.chat`

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalyzeTransaction } from '@/hooks/useAI';

describe('useAnalyzeTransaction', () => {
  it('should fetch transaction analysis', async () => {
    const { result } = renderHook(
      () => useAnalyzeTransaction('0x123', true),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';
import { render as customRender } from '../utils/test-utils';

describe('MyComponent', () => {
  it('should render correctly', () => {
    customRender(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should display AI analysis', async ({ page }) => {
  await page.goto('/transactions/0x123');
  await expect(page.locator('text=/AI Analysis/i')).toBeVisible();
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies (API, router, etc.)
3. **Cleanup**: Use `afterEach` to clean up state
4. **Descriptive Names**: Use clear test descriptions
5. **Arrange-Act-Assert**: Structure tests clearly
6. **Wait for Async**: Always wait for async operations
7. **Error Cases**: Test both success and error paths

## CI/CD Integration

Tests run automatically in CI/CD pipeline:
- Unit tests run on every commit
- E2E tests run on pull requests
- Coverage reports generated automatically

## Troubleshooting

### Tests failing locally
1. Ensure API server is running (for E2E tests)
2. Check that all dependencies are installed
3. Clear test cache: `rm -rf node_modules/.cache`

### E2E tests timing out
1. Increase timeout in `playwright.config.ts`
2. Check network conditions
3. Verify API endpoints are accessible

### Mock issues
1. Ensure mocks are reset in `beforeEach`
2. Check mock return values match expected types
3. Verify mock functions are called correctly

## Coverage Goals

- **Unit Tests**: >80% coverage
- **Component Tests**: All AI components covered
- **Integration Tests**: All API client methods covered
- **E2E Tests**: All critical user flows covered

---

**Last Updated**: January 2025

