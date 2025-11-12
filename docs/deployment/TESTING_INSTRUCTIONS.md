# Explorer API Integration Testing Instructions

**Date**: January 2025

---

## 🐳 Option 1: Docker Testing (Recommended)

### Prerequisites

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start (whale icon in menu bar)
   - Verify: `docker info` should work

### Step-by-Step Testing

#### 1. Start Docker Services

```bash
cd /Volumes/Development/sahalat/norchain-monorepo

# Start all services
./scripts/start-docker-services.sh

# Or manually:
docker-compose up -d postgres redis api explorer
```

#### 2. Wait for Services

```bash
# Check status
docker-compose ps

# Watch logs
docker-compose logs -f api explorer

# Wait until all services show "healthy" or "running"
```

#### 3. Run Automated Tests

```bash
# Run full test suite
./scripts/docker-test-explorer.sh

# This will test:
# - API endpoints (stats, blocks, transactions, accounts)
# - Explorer pages (homepage, blocks, transactions, accounts)
# - Internal API access
```

#### 4. Manual Testing

```bash
# Test API endpoints
curl http://localhost:4000/api/v1/stats
curl "http://localhost:4000/api/v1/blocks?page=1&per_page=5"
curl "http://localhost:4000/api/v1/transactions?page=1&limit=5"
curl "http://localhost:4000/api/v1/accounts?page=1&per_page=5"

# Test Explorer pages
curl http://localhost:4002
curl http://localhost:4002/blocks
curl http://localhost:4002/transactions
curl http://localhost:4002/accounts

# Open in browser
open http://localhost:4002
open http://localhost:4000/api-docs
```

---

## 💻 Option 2: Local Testing (Without Docker)

### Prerequisites

1. **Start Database Services**
   ```bash
   # PostgreSQL and Redis should be running
   # Or use Supabase (configured in .env)
   ```

2. **Start API**
   ```bash
   cd apps/api
   npm run start:dev
   # API will run on http://localhost:4000
   ```

3. **Start Explorer**
   ```bash
   cd apps/explorer
   npm run dev
   # Explorer will run on http://localhost:3002
   ```

### Testing

```bash
# Test API
curl http://localhost:4000/api/v1/stats
curl "http://localhost:4000/api/v1/blocks?page=1&per_page=5"

# Test Explorer
curl http://localhost:3002
curl http://localhost:3002/blocks

# Open in browser
open http://localhost:3002
```

---

## ✅ Expected Results

### API Endpoints Should Return:

**Stats** (`/api/v1/stats`):
```json
{
  "blockHeight": 12345,
  "totalTransactions": 0,
  "totalAccounts": 0,
  "gasPrice": "1000000000",
  "activeValidators": 5,
  "latest_block": {
    "height": 12345,
    "hash": "",
    "timestamp": "...",
    "transaction_count": 0
  }
}
```

**Blocks** (`/api/v1/blocks?page=1&per_page=5`):
```json
{
  "data": [...],
  "meta": {...},
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

**Transactions** (`/api/v1/transactions?page=1&limit=5`):
```json
{
  "transactions": [],
  "data": [],
  "meta": {...},
  "pagination": {...}
}
```

**Accounts** (`/api/v1/accounts?page=1&per_page=5`):
```json
{
  "data": [],
  "meta": {...},
  "pagination": {...}
}
```

### Explorer Pages Should:

- ✅ Load without errors
- ✅ Display stats on homepage
- ✅ Show blocks list (may be empty initially)
- ✅ Show transactions list (may be empty initially)
- ✅ Show accounts list (may be empty initially)
- ✅ Handle errors gracefully

---

## 🐛 Troubleshooting

### Docker Issues

**Problem**: Docker daemon not running
```bash
# Solution: Start Docker Desktop
# macOS: Open Docker Desktop app
# Linux: sudo systemctl start docker
```

**Problem**: Port conflicts
```bash
# Check what's using ports
lsof -i :4000
lsof -i :4002
lsof -i :5433
lsof -i :6380

# Stop conflicting services or change ports in docker-compose.yml
```

**Problem**: Containers won't start
```bash
# Check logs
docker-compose logs api
docker-compose logs explorer

# Rebuild containers
docker-compose build --no-cache api explorer
docker-compose up -d
```

### API Issues

**Problem**: API can't connect to database
```bash
# Check database is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres pg_isready

# Check API logs
docker-compose logs api | grep -i database
```

**Problem**: API returns errors
```bash
# Check API logs
docker-compose logs -f api

# Test health endpoint
curl http://localhost:4000/api/v1/health

# Check Swagger docs
open http://localhost:4000/api-docs
```

### Explorer Issues

**Problem**: Explorer can't connect to API
```bash
# Check API is running
docker-compose ps api
curl http://localhost:4000/api/v1/stats

# Check Explorer logs
docker-compose logs explorer

# Test internal API access
docker exec norchain-explorer wget -q -O- http://api:3000/api/v1/stats
```

**Problem**: Explorer shows errors
```bash
# Check browser console
# Check Explorer logs
docker-compose logs explorer

# Verify API URL
docker exec norchain-explorer env | grep NEXT_PUBLIC_API_URL
```

---

## 📊 Test Checklist

### Docker Testing
- [ ] Docker Desktop is running
- [ ] All containers start successfully
- [ ] API health check passes
- [ ] Explorer health check passes
- [ ] API endpoints return 200
- [ ] Explorer pages load successfully
- [ ] Internal API access works

### Local Testing
- [ ] Database is running (PostgreSQL/Supabase)
- [ ] Redis is running (if needed)
- [ ] API starts without errors
- [ ] Explorer starts without errors
- [ ] API endpoints work
- [ ] Explorer pages load

---

## 🎯 Quick Test Commands

```bash
# Quick health check
curl http://localhost:4000/api/v1/health && echo "✅ API OK" || echo "❌ API Failed"
curl http://localhost:4002 && echo "✅ Explorer OK" || echo "❌ Explorer Failed"

# Test all endpoints
for endpoint in "stats" "blocks?page=1&per_page=1" "transactions?page=1&limit=1" "accounts?page=1&per_page=1"; do
  echo "Testing /api/v1/$endpoint..."
  curl -s -o /dev/null -w "  Status: %{http_code}\n" "http://localhost:4000/api/v1/$endpoint"
done
```

---

**Ready to test!** Start Docker Desktop and run the test scripts. 🚀

