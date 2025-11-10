# API Integration Tests

Comprehensive integration tests for the NorChain API covering complete request/response cycles, database operations, and external service integrations.

## Test Structure

### 1. API Integration Tests (`api-integration.spec.ts`)

Full HTTP endpoint integration tests covering:
- **Health & Status**: Health check endpoints
- **Account Endpoints**: Balance, transactions, token lists
- **Block Endpoints**: Block queries, rewards, countdown
- **Transaction Endpoints**: Transaction info, receipts, status
- **Token Endpoints**: Supply, balance, info, transfers
- **Authentication Flow**: Registration, login, validation
- **Orders Endpoints**: Limit orders, stop-loss, DCA schedules
- **Swap Endpoints**: Quote generation, swap execution
- **Batch Endpoints**: Batch operations
- **Analytics Endpoints**: Portfolio, transactions, network stats
- **Notifications Endpoints**: Notification CRUD operations
- **Error Handling**: 404, 400, rate limiting
- **Caching**: Cache behavior and performance

### 2. Database Integration Tests (`database-integration.spec.ts`)

Database operation tests covering:
- **CRUD Operations**: Create, Read, Update, Delete for all entities
- **Entity Operations**: Block, Transaction, User, ApiKey, LimitOrder, Notification
- **Database Transactions**: Rollback on errors
- **Relationships**: Foreign key relationships
- **Constraints**: Unique constraints, foreign key constraints
- **Data Integrity**: Transaction consistency

### 3. External Services Integration Tests (`external-services-integration.spec.ts`)

External service integration tests covering:
- **RPC Service**: Blockchain node connectivity, block queries, balance checks
- **Cache Service**: Redis caching operations, TTL, expiration
- **Supabase Service**: Real-time subscriptions, broadcasting, presence
- **Supabase Auth**: User registration, login, session management
- **Supabase Storage**: File uploads, public/signed URLs
- **Error Handling**: Service connection errors, graceful degradation
- **Configuration**: Service configuration validation

## Running Tests

### Prerequisites

**Option 1: Local PostgreSQL Database (Recommended for Testing)**

Set up a local PostgreSQL database:

```bash
# Using Docker
docker run -d \
  --name norchain-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=norchain_test \
  -p 5432:5432 \
  postgres:15

# Or use existing local PostgreSQL
```

Then configure `.env.test`:
```env
USE_SUPABASE=false
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=norchain_test
```

**Option 2: Supabase Database**

If using Supabase, ensure you have:
1. A valid Supabase project
2. Correct connection string from Supabase Dashboard → Settings → Database
3. The connection string should use the pooler format:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

Configure `.env.test`:
```env
USE_SUPABASE=true
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Run All Integration Tests

```bash
cd apps/api
npm run test:integration
```

### Run Specific Test Suite

```bash
# API integration tests
npm run test:integration -- --testPathPattern="api/api-integration"

# Database integration tests
npm run test:integration -- --testPathPattern="api/database-integration"

# External services integration tests
npm run test:integration -- --testPathPattern="api/external-services-integration"
```

### Run with Coverage

```bash
npm run test:integration -- --coverage
```

## Database Connection Issues

### Common Issues

**1. DNS Resolution Error (`getaddrinfo ENOTFOUND`)**

This means the database hostname cannot be resolved. Solutions:

- **For Supabase**: Use the correct connection string from Supabase Dashboard
- **For Local**: Ensure PostgreSQL is running and accessible
- **Check**: Verify `DB_HOST` or `SUPABASE_DB_URL` is correct

**2. Connection Refused**

- Check if PostgreSQL is running: `docker ps | grep postgres`
- Verify port is correct: `netstat -an | grep 5432`
- Check firewall settings

**3. Authentication Failed**

- Verify username/password in connection string
- For Supabase: Use the password from Dashboard → Settings → Database

**4. Database Does Not Exist**

- Create the database: `CREATE DATABASE norchain_test;`
- Or use existing database name

### Testing Without Database

Some tests can run without a database connection:

```bash
# Run only external services tests (no database required)
npm run test:integration -- --testPathPattern="external-services-integration"

# Run unit tests (no database required)
npm test
```

## Test Data

Tests create and clean up their own test data:
- Test users with unique emails (timestamp-based)
- Test blocks with high block numbers (999999+)
- Test transactions linked to test blocks
- Test orders, notifications, API keys

All test data is cleaned up in `afterAll` hooks.

## Test Coverage

### API Endpoints Coverage

- ✅ Health endpoints (3/3)
- ✅ Account endpoints (8/8)
- ✅ Block endpoints (4/4)
- ✅ Transaction endpoints (3/3)
- ✅ Token endpoints (4/4)
- ✅ Authentication endpoints (4/4)
- ✅ Orders endpoints (6/6)
- ✅ Swap endpoints (3/3)
- ✅ Batch endpoints (3/3)
- ✅ Analytics endpoints (3/3)
- ✅ Notifications endpoints (3/3)
- ✅ Error handling (4/4)
- ✅ Caching (1/1)

### Database Operations Coverage

- ✅ Block CRUD operations
- ✅ Transaction CRUD operations
- ✅ User CRUD operations
- ✅ ApiKey CRUD operations
- ✅ LimitOrder CRUD operations
- ✅ Notification CRUD operations
- ✅ Database transactions (rollback)
- ✅ Relationships (foreign keys)
- ✅ Constraints (unique, foreign key)

### External Services Coverage

- ✅ RPC Service (6 operations)
- ✅ Cache Service (5 operations)
- ✅ Supabase Service (4 operations)
- ✅ Supabase Auth (4 operations)
- ✅ Supabase Storage (4 operations)
- ✅ Error handling (3 scenarios)
- ✅ Configuration (3 checks)

## Best Practices

1. **Isolation**: Each test suite is independent and cleans up after itself
2. **Real Services**: Tests use real database and external services (not mocks)
3. **Error Handling**: Tests verify both success and error scenarios
4. **Performance**: Tests verify caching behavior and response times
5. **Data Integrity**: Tests verify database constraints and relationships

## Troubleshooting

### Tests Failing Due to Database Connection

```bash
# Check database is running
docker ps | grep postgres

# Test connection manually
psql -h localhost -U postgres -d norchain_test

# Check connection string
echo $DATABASE_URL
echo $SUPABASE_DB_URL
```

### Tests Failing Due to RPC Connection

```bash
# Check RPC endpoint is accessible
curl -X POST https://rpc.norchain.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Tests Failing Due to Redis

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Tests Failing Due to Supabase

```bash
# Check Supabase configuration
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verify Supabase project exists
curl -I https://[PROJECT-REF].supabase.co
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Setup PostgreSQL
  run: |
    docker run -d \
      --name postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=norchain_test \
      -p 5432:5432 \
      postgres:15

- name: Run Integration Tests
  run: |
    cd apps/api
    npm run test:integration
  env:
    DB_HOST: localhost
    DB_PORT: 5432
    DB_USER: postgres
    DB_PASSWORD: postgres
    DB_NAME: norchain_test
    USE_SUPABASE: false
    RPC_URL: ${{ secrets.RPC_URL }}
```

## Related Documentation

- [E2E Tests](../app.e2e-spec.ts) - End-to-end API tests
- [Supabase Integration Tests](../supabase/supabase-integration.spec.ts) - Supabase-specific tests
- [Test Configuration](../../test/jest-integration.json) - Jest configuration
- [Database Configuration](../../src/config/database.config.ts) - Database setup

---

**Last Updated**: January 2025  
**Maintained By**: Testing Team
