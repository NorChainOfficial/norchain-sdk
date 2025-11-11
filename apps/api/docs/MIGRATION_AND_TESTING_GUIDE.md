# Migration and Testing Guide

## 📋 Database Migration

### Migration File Created
- `src/migrations/1738000000000-AddLedgerPaymentsMessagingModules.ts`

### Tables Created (20 tables)

**Ledger Module (4 tables)**:
- `ledger_accounts`
- `journal_entries`
- `journal_lines`
- `period_closures`

**Payments v2 Module (8 tables)**:
- `merchants`
- `products`
- `prices`
- `customers`
- `payment_methods`
- `checkout_sessions`
- `payments`
- `refunds`
- `subscriptions`
- `disputes`
- `webhook_endpoints`

**Messaging Module (5 tables)**:
- `messaging_profiles`
- `conversations`
- `messages`
- `device_keys`
- `message_reactions`

---

## 🚀 Running Migrations

### Option 1: TypeORM CLI
```bash
# Run migration
npm run migration:run

# Revert migration
npm run migration:revert

# Generate new migration (if entities change)
npm run migration:generate -- src/migrations/NewMigration
```

### Option 2: Supabase SQL Editor
1. Copy SQL from `DATABASE_MIGRATIONS.md`
2. Execute in Supabase SQL Editor
3. Verify tables created

### Option 3: Synchronize (Development Only)
```bash
# Set synchronize=true in database.config.ts (development only!)
# Tables will be auto-created from entities
```

---

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### With Coverage Report
```bash
npm run test:cov
```

### Specific Modules
```bash
# Ledger tests
npm test -- --testPathPattern="ledger"

# Payments tests
npm test -- --testPathPattern="payments"

# Messaging tests
npm test -- --testPathPattern="messaging"
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📊 Test Coverage

### Current Test Files

**Ledger Module**:
- `ledger.service.spec.ts` - Service unit tests
- `ledger.controller.spec.ts` - Controller unit tests
- `ledger.integration.spec.ts` - Integration tests

**Payments v2 Module**:
- `payments-v2-enhanced.service.spec.ts` - Service unit tests
- `payments-v2-enhanced.controller.spec.ts` - Controller unit tests

**Messaging Module**:
- `messaging.service.spec.ts` - Service unit tests
- `messaging.controller.spec.ts` - Controller unit tests

---

## ✅ Test Coverage Checklist

### Ledger Module
- [x] Account creation
- [x] Account validation (duplicate codes)
- [x] Journal entry creation
- [x] Double-entry validation
- [x] Period closure
- [x] Error handling

### Payments Module
- [x] Product creation
- [x] Price creation
- [x] Customer creation
- [x] Subscription creation
- [x] Subscription cancellation
- [x] Dispute creation
- [x] Error handling

### Messaging Module
- [x] Profile creation/update
- [x] Conversation creation
- [x] Message sending
- [x] Reactions (add/remove/get)
- [x] Media upload URLs
- [x] Error handling

---

## 🎯 Coverage Goals

**Target**: 80%+ coverage across all modules

**Current Status**: Test suites created, coverage measurement in progress

---

## 🔧 Test Configuration

### Jest Configuration
- Test environment: `node`
- Coverage reporters: `text`, `html`, `lcov`
- Coverage thresholds: TBD

### Integration Test Setup
- Uses real database connection
- Cleans up after tests
- Isolated test data

---

## 📝 Next Steps

1. ✅ Migration file created
2. ✅ Test suites created
3. 🚧 Run migrations on test database
4. 🚧 Execute all tests
5. 🚧 Measure coverage
6. 🚧 Add additional tests to reach 80%+
7. 🚧 Fix any failing tests

---

**Status**: ✅ Migration & Test Suites Ready - Execution Pending

