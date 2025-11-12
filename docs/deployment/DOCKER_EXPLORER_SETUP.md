# Docker Setup for Explorer & API Testing

**Date**: January 2025  
**Status**: ✅ Ready for Docker Testing

---

## 🐳 Quick Start

### 1. Start Docker Services

```bash
# Start all required services
docker-compose up -d postgres redis api explorer

# Or start everything
docker-compose up -d
```

### 2. Wait for Services to be Ready

```bash
# Check service status
docker-compose ps

# Watch logs
docker-compose logs -f api explorer
```

### 3. Run Automated Tests

```bash
# Run integration test script
./scripts/docker-test-explorer.sh

# Or test manually
curl http://localhost:4000/api/v1/stats
curl http://localhost:4002
```

---

## 📋 Service Ports

| Service | External Port | Internal Port | URL |
|---------|--------------|---------------|-----|
| API | 4000 | 3000 | http://localhost:4000 |
| Explorer | 4002 | 3002 | http://localhost:4002 |
| PostgreSQL | 5433 | 5432 | localhost:5433 |
| Redis | 6380 | 6379 | localhost:6380 |

---

## 🧪 Testing Endpoints

### API Endpoints (via Docker)

```bash
# Stats
curl http://localhost:4000/api/v1/stats

# Blocks
curl "http://localhost:4000/api/v1/blocks?page=1&per_page=5"
curl http://localhost:4000/api/v1/blocks/latest
curl http://localhost:4000/api/v1/blocks/12345

# Transactions
curl "http://localhost:4000/api/v1/transactions?page=1&limit=5"
curl http://localhost:4000/api/v1/transactions/0x123...

# Accounts
curl "http://localhost:4000/api/v1/accounts?page=1&per_page=5"
curl http://localhost:4000/api/v1/accounts/0x123...
curl "http://localhost:4000/api/v1/accounts/0x123.../transactions"
```

### Explorer Pages (via Docker)

```bash
# Homepage
curl http://localhost:4002

# Blocks Page
curl http://localhost:4002/blocks

# Transactions Page
curl http://localhost:4002/transactions

# Accounts Page
curl http://localhost:4002/accounts
```

---

## 🔍 Debugging Commands

### Check Container Status

```bash
# List all containers
docker-compose ps

# Check specific container
docker ps | grep norchain

# Check container health
docker inspect norchain-api | grep -A 10 Health
docker inspect norchain-explorer | grep -A 10 Health
```

### View Logs

```bash
# API logs
docker-compose logs -f api

# Explorer logs
docker-compose logs -f explorer

# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 api explorer
```

### Access Container Shell

```bash
# API container
docker exec -it norchain-api sh

# Explorer container
docker exec -it norchain-explorer sh

# Test internal API access from Explorer container
docker exec norchain-explorer wget -q -O- http://api:3000/api/v1/stats
```

### Rebuild Containers

```bash
# Rebuild API
docker-compose build api

# Rebuild Explorer
docker-compose build explorer

# Rebuild and restart
docker-compose up -d --build api explorer

# Force rebuild without cache
docker-compose build --no-cache api explorer
```

---

## ✅ Test Checklist

Run these tests to verify everything works:

- [ ] All containers start successfully
- [ ] API health check: `curl http://localhost:4000/api/v1/health`
- [ ] Stats endpoint: `curl http://localhost:4000/api/v1/stats`
- [ ] Blocks endpoint: `curl http://localhost:4000/api/v1/blocks?page=1&per_page=5`
- [ ] Transactions endpoint: `curl http://localhost:4000/api/v1/transactions?page=1&limit=5`
- [ ] Accounts endpoint: `curl http://localhost:4000/api/v1/accounts?page=1&per_page=5`
- [ ] Explorer homepage: `curl http://localhost:4002`
- [ ] Explorer blocks page: `curl http://localhost:4002/blocks`
- [ ] Explorer transactions page: `curl http://localhost:4002/transactions`
- [ ] Explorer accounts page: `curl http://localhost:4002/accounts`
- [ ] Internal API access works (Explorer → API via Docker network)

---

## 🐛 Troubleshooting

### Issue: Containers won't start

**Solution**:
```bash
# Check Docker is running
docker info

# Check for port conflicts
lsof -i :4000
lsof -i :4002
lsof -i :5433
lsof -i :6380

# Remove old containers
docker-compose down
docker-compose up -d
```

### Issue: API can't connect to database

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database connection
docker-compose exec postgres pg_isready -U postgres

# Check API logs
docker-compose logs api | grep -i database
```

### Issue: Explorer can't connect to API

**Solution**:
```bash
# Check API is running
docker-compose ps api

# Test API from host
curl http://localhost:4000/api/v1/stats

# Test API from Explorer container
docker exec norchain-explorer wget -q -O- http://api:3000/api/v1/stats

# Check network
docker network inspect norchain-monorepo_norchain-network
```

### Issue: Build fails

**Solution**:
```bash
# Check build logs
docker-compose build api 2>&1 | tail -50
docker-compose build explorer 2>&1 | tail -50

# Clean build
docker-compose build --no-cache api explorer

# Check Dockerfile syntax
docker build -t test-api ./apps/api
docker build -t test-explorer ./apps/explorer
```

---

## 📊 Performance Testing

### Response Time Tests

```bash
# Test API response times
time curl -s http://localhost:4000/api/v1/stats > /dev/null
time curl -s "http://localhost:4000/api/v1/blocks?page=1&per_page=20" > /dev/null

# Test Explorer page load times
time curl -s http://localhost:4002 > /dev/null
time curl -s http://localhost:4002/blocks > /dev/null
```

### Resource Usage

```bash
# Monitor container resources
docker stats norchain-api norchain-explorer

# Check specific container
docker stats norchain-api --no-stream
```

---

## 🔄 Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec api sh
docker-compose exec explorer sh
```

---

**Ready for Docker testing!** 🐳

