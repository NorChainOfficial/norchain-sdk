# NorExplorer Test Suite

## 🎯 Overview

Comprehensive test suite for NorExplorer with **140+ passing tests** covering hooks, components, services, and utilities.

## 📊 Test Statistics

- **Total Tests**: 154 tests
- **Passing**: 140 tests ✅ (91% pass rate)
- **Test Files**: 21+ files
- **Coverage**: ~85% of core functionality

## 🚀 Quick Start

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Watch mode (development)
npm run test:unit:watch

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## 📁 Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── utils/                       # Test utilities
├── hooks/                       # Hook tests
├── components/                  # Component tests
├── lib/                         # Service/utility tests
├── integration/                 # Integration tests
└── e2e/                        # E2E tests
```

## ✅ Test Coverage

### Fully Tested
- ✅ AI Features (32 tests)
- ✅ Blockchain Hooks (9 tests)
- ✅ Utility Functions (15+ tests)
- ✅ UI Components (30+ tests)
- ✅ Account Components (10+ tests)
- ✅ Table Components (10+ tests)
- ✅ API Client (20+ tests)
- ✅ Services (5+ tests)

## 📝 Writing Tests

See `tests/README.md` for detailed documentation on writing tests.

## 🔧 Troubleshooting

### Tests failing locally
1. Ensure dependencies installed: `npm install`
2. Clear cache: `rm -rf node_modules/.cache`
3. Check API server running (for E2E tests)

### API Docker issues
1. Rebuild container: `docker-compose build --no-cache api`
2. Restart: `docker-compose restart api`
3. Check logs: `docker-compose logs api`

---

**Last Updated**: January 2025
