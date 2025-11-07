# API Testing & Verification Guide
## Phase 1: Complete API Testing

---

## Quick Start

### Run Complete API Workflow

```bash
# Complete API completion, testing, and verification
./scripts/api-complete.sh
```

### Individual Steps

```bash
# 1. Verify API setup
./scripts/api-verify.sh

# 2. Test all endpoints
./scripts/api-test.sh

# 3. Run unit tests
cd apps/api && npm test
```

---

## Testing Scripts

### 1. `scripts/api-verify.sh`

**Purpose**: Verifies API Docker setup and infrastructure

**Checks**:
- Docker build
- Docker compose configuration
- Service status
- Health checks
- Database connectivity
- Redis connectivity
- Port availability
- Performance
- Environment variables

**Usage**:
```bash
./scripts/api-verify.sh
```

**Expected Output**:
- ✓ All critical checks passed
- Warnings for optional checks

### 2. `scripts/api-test.sh`

**Purpose**: Tests all API endpoints

**Tests**:
- Health endpoints
- Account endpoints
- Block endpoints
- Transaction endpoints
- Token endpoints
- Contract endpoints
- Stats endpoints
- Gas endpoints
- Proxy endpoints
- Batch endpoints
- Analytics endpoints
- Auth endpoints
- Swagger documentation

**Usage**:
```bash
# Set API URL if different
export API_URL=http://localhost:4000
./scripts/api-test.sh
```

**Expected Output**:
- Test results for each endpoint
- Pass/fail status
- Summary with counts

### 3. `scripts/api-complete.sh`

**Purpose**: Complete workflow for API completion

**Steps**:
1. Review API structure
2. Build API Docker image
3. Start infrastructure (PostgreSQL, Redis)
4. Start API service
5. Verify API
6. Test API endpoints
7. Run unit tests

**Usage**:
```bash
./scripts/api-complete.sh
```

---

## Manual Testing

### Health Check

```bash
curl http://localhost:4000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-07T...",
  "service": "NorChain Unified API"
}
```

### Stats Endpoint

```bash
curl http://localhost:4000/api/v1/stats
```

### Account Balance

```bash
curl "http://localhost:4000/api/v1/account/0x0000000000000000000000000000000000000000/balance"
```

### Latest Blocks

```bash
curl "http://localhost:4000/api/v1/blocks?limit=10"
```

### Swagger Documentation

Open in browser:
```
http://localhost:4000/api-docs
```

---

## Unit Testing

### Run All Tests

```bash
cd apps/api
npm test
```

### Run with Coverage

```bash
npm run test:cov
```

### Run Specific Test

```bash
npm test -- account.service.spec.ts
```

### Watch Mode

```bash
npm run test:watch
```

---

## Integration Testing

### Test Database Connection

```bash
docker exec norchain-api node -e "
const {Client} = require('pg');
const client = new Client({
  host: 'postgres',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'norchain_explorer'
});
client.connect()
  .then(() => {
    console.log('✓ Database connected');
    client.end();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  });
"
```

### Test Redis Connection

```bash
docker exec norchain-api node -e "
const redis = require('redis');
const client = redis.createClient({host: 'redis', port: 6379});
client.connect()
  .then(() => {
    console.log('✓ Redis connected');
    client.ping()
      .then(() => {
        console.log('✓ Redis ping successful');
        client.quit();
      });
  })
  .catch(err => {
    console.error('✗ Redis connection failed:', err.message);
    process.exit(1);
  });
"
```

### Test RPC Connection

```bash
curl -X POST http://localhost:4000/api/v1/proxy/eth_blockNumber
```

---

## Performance Testing

### Response Time Test

```bash
time curl -s http://localhost:4000/api/v1/health > /dev/null
```

### Load Test (using Apache Bench)

```bash
# Install: brew install ab (macOS) or apt-get install apache2-utils (Linux)
ab -n 1000 -c 10 http://localhost:4000/api/v1/health
```

### Load Test (using wrk)

```bash
# Install: brew install wrk (macOS)
wrk -t4 -c100 -d30s http://localhost:4000/api/v1/health
```

---

## Debugging

### View API Logs

```bash
# All logs
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Since specific time
docker-compose logs --since 10m api
```

### Check Container Status

```bash
docker-compose ps api
```

### Check Container Health

```bash
docker inspect norchain-api | grep -A 10 Health
```

### Execute Commands in Container

```bash
# Shell access
docker exec -it norchain-api sh

# Run Node command
docker exec norchain-api node -e "console.log('test')"
```

### Check Environment Variables

```bash
docker exec norchain-api env | grep -E "^(DB_|REDIS_|RPC_|JWT_|PORT=)"
```

---

## Common Issues

### API Not Starting

1. **Check logs**:
   ```bash
   docker-compose logs api
   ```

2. **Check database connection**:
   ```bash
   docker-compose logs postgres
   ```

3. **Check port conflicts**:
   ```bash
   lsof -i :4000
   ```

### Database Connection Failed

1. **Check PostgreSQL is running**:
   ```bash
   docker-compose ps postgres
   ```

2. **Check connection string**:
   ```bash
   docker exec norchain-api env | grep DATABASE_URL
   ```

3. **Test connection manually**:
   ```bash
   docker exec -it norchain-postgres psql -U postgres -d norchain_explorer
   ```

### Redis Connection Failed

1. **Check Redis is running**:
   ```bash
   docker-compose ps redis
   ```

2. **Test connection**:
   ```bash
   docker exec -it norchain-redis redis-cli ping
   ```

### Endpoints Returning 500

1. **Check API logs**:
   ```bash
   docker-compose logs -f api
   ```

2. **Check database**:
   ```bash
   docker-compose logs postgres
   ```

3. **Check RPC connection**:
   ```bash
   curl -X POST http://localhost:4000/api/v1/proxy/eth_blockNumber
   ```

---

## Success Criteria

### API Verification Passes When:
- ✅ Docker build successful
- ✅ Service starts successfully
- ✅ Health check passes
- ✅ Database connects
- ✅ Redis connects
- ✅ Port is accessible

### API Tests Pass When:
- ✅ All endpoints respond
- ✅ All endpoints return correct status codes
- ✅ All endpoints return valid JSON
- ✅ Error handling works correctly

### Unit Tests Pass When:
- ✅ All tests pass
- ✅ Coverage > 80%
- ✅ No failing tests

---

## Next Steps

After API is complete and verified:

1. **Document API** - Complete Swagger docs
2. **Optimize Performance** - Fix slow endpoints
3. **Add Missing Tests** - Increase coverage
4. **Move to Phase 2** - Landing Page

---

**Last Updated**: November 2024

