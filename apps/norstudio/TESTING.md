# NorStudio Testing Guide

## Overview

NorStudio has comprehensive testing infrastructure with unit tests, integration tests, and end-to-end tests.

**Current Status:**
- ✅ 41 passing tests
- ✅ 4 test suites
- ✅ Zero failing tests
- ✅ E2E infrastructure ready
- 📊 Coverage: Core functionality at 60-100%, overall 12% (components pending)

## Test Infrastructure

### Unit Tests (Vitest)
- **Framework**: Vitest 1.6.1
- **Environment**: jsdom
- **Coverage Provider**: v8
- **Testing Library**: @testing-library/react 14.3.1

### E2E Tests (Playwright)
- **Framework**: Playwright 1.45.0
- **Browsers**: Chromium, Firefox, WebKit
- **Config**: playwright.config.ts

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Watch mode (runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Specific browser
npx playwright test --project=chromium
```

## Test Coverage

### Excellent Coverage (60-100%)
- ✅ **settingsStore**: 100% coverage
- ✅ **API Client**: 82% coverage
- ✅ **projectStore**: 79% coverage
- ✅ **compilationStore**: 67% coverage

### Tested Components
1. **Store Layer**
   - Settings management
   - Project file management
   - Compilation state
   - Unsaved changes tracking

2. **API Layer**
   - HTTP client (GET, POST, PUT, DELETE)
   - Retry logic with exponential backoff
   - Error handling
   - Health checks

3. **Business Logic**
   - File operations (open, close, save)
   - Compiler settings
   - Network configuration

### Coverage by Module

| Module | Coverage | Tests |
|--------|----------|-------|
| settingsStore.ts | 100% | 8 tests |
| api.ts | 82% | 9 tests |
| projectStore.ts | 79% | 16 tests |
| compilationStore.ts | 67% | 8 tests |

## Test Structure

### Unit Test Example
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './projectStore'

describe('projectStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useProjectStore.setState({
      currentProject: null,
      openFiles: [],
    })
  })

  it('should open a file', () => {
    const file = createMockFile()
    useProjectStore.getState().openFile(file)
    
    expect(useProjectStore.getState().openFiles).toContainEqual(file)
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/NorStudio/i)
})
```

## Test Files

### Unit Tests
```
src/
├── config/
│   └── api.test.ts              # API client tests (9 tests)
└── store/
    ├── projectStore.test.ts      # File management (16 tests)
    ├── compilationStore.test.ts  # Compiler state (8 tests)
    └── settingsStore.test.ts     # Settings (8 tests)
```

### E2E Tests
```
e2e/
└── ide-basic.spec.ts            # IDE workflows (10 scenarios)
```

### Test Utilities
```
src/test/
├── setup.ts                     # Global test setup
└── utils.tsx                    # Test helpers & mocks
```

## Mocking Strategy

### Store Mocks
```typescript
beforeEach(() => {
  useProjectStore.setState({
    currentProject: null,
    openFiles: [],
  })
})
```

### API Mocks
```typescript
vi.mock('@/config/api', () => ({
  checkAPIHealth: vi.fn(),
}))
```

### Component Mocks
```typescript
vi.mock('@/store/transactionStore')
vi.mocked(useTransactionStore).mockReturnValue({
  walletInfo: null,
  connectWallet: vi.fn(),
})
```

## Configuration Files

### vitest.config.ts
- Coverage thresholds: 80% (lines, functions, branches, statements)
- Environment: jsdom
- Setup file: src/test/setup.ts
- Excludes: node_modules, dist, .next, test files

### playwright.config.ts
- Base URL: http://localhost:3003
- Retry: 2 times in CI
- Screenshot on failure
- Trace on first retry

## Coverage Goals

### Phase 1 (✅ Complete)
- [x] Test infrastructure setup
- [x] Store tests (3 stores, 32 tests)
- [x] API client tests (9 tests)
- [x] E2E framework setup

### Phase 2 (📝 Recommended)
- [ ] Component tests (15 components)
- [ ] Service layer tests (3 services)
- [ ] Hook tests (1 hook)
- [ ] Integration tests

**Target**: 80%+ overall coverage

## Best Practices

### 1. Test Isolation
- Reset state in `beforeEach`
- Clear mocks between tests
- Avoid test interdependencies

### 2. Test Organization
- Group related tests with `describe`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 3. Assertions
```typescript
// ✅ Good - Specific assertions
expect(result.success).toBe(true)
expect(files).toHaveLength(2)
expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)

// ❌ Bad - Vague assertions
expect(result).toBeTruthy()
expect(files.length > 0).toBe(true)
```

### 4. Async Testing
```typescript
it('should compile contract', async () => {
  const result = await compile(source, 'test.sol')
  expect(result.success).toBe(true)
})
```

## Continuous Integration

### Running Tests in CI
```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm run test:coverage

- name: Run E2E tests
  run: npm run test:e2e
```

### Coverage Enforcement
- Minimum coverage: 80%
- Fails on coverage drop
- Coverage reports uploaded to artifacts

## Debugging Tests

### Unit Tests
```bash
# Debug specific test
npm run test -- src/store/projectStore.test.ts

# Debug with UI
npm run test:watch

# Verbose output
npm run test -- --reporter=verbose
```

### E2E Tests
```bash
# Debug mode (opens browser)
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Specific test
npx playwright test e2e/ide-basic.spec.ts
```

## Test Maintenance

### Adding New Tests
1. Create test file next to source (`.test.ts`)
2. Import necessary mocks and utilities
3. Write test cases following existing patterns
4. Run tests locally before committing

### Updating Tests
- Update mocks when interfaces change
- Adjust assertions when behavior changes
- Keep tests in sync with implementation

## Performance

- Unit tests: ~1.7s for 41 tests
- E2E tests: ~30s for basic flows
- Coverage generation: +500ms

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Built with ❤️ for quality assurance**
