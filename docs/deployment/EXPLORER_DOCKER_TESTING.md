# Explorer Docker Testing Guide

**Date**: January 2025  
**Status**: Ready for Docker Testing

---

## 🐳 Docker Setup

The Explorer and API are configured to run via Docker Compose. All services are defined in the root `docker-compose.yml`.

---

## 🚀 Quick Start

### 1. Start All Services

```bash
# Start all services (PostgreSQL, Redis, API, Explorer)
docker-compose up -d

# Or start specific services
docker-compose up -d postgres redis api explorer
```

### 2. Check Service Status

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f api
docker-compose logs -f explorer
```

### 3. Run Integration Tests

```bash
# Run automated test script
./scripts/docker-test-explorer.sh

# Or test manually
curl http://localhost:4000/api/v1/stats
curl http://localhost:4000/api/v1/blocks?page=1&per_page=5
curl http://localhost:4002
```

---

## 📋 Service Configuration

### API Service

- **Container**: `norchain-api`
- **Port**: `4000` (external) → `3000` (internal)
- **Health Check**: `http://localhost:4000/api/v1/health`
- **Depends On**: PostgreSQL, Redis

### Explorer Service

- **Container**: `norchain-explorer`
- **Port**: `4002` (external) → `3002` (internal)
- **Health Check**: `http://localhost:4002`
- **Depends On**: API
- **API URL**: `http://api:3000/api/v1` (internal Docker network)

### Database Services

- **PostgreSQL**: Port `5433` (external) → `5432` (internal)
- **Redis**: Port `6380` (external) → `6379` (internal)

---

## 🧪 Testing Endpoints

### API Endpoints

```bash
# Stats
curl http://localhost:4000/api/v1/stats

# Blocks
curl http://localhost:4000/api/v1/blocks?page=1&per_page=5
curl http://localhost:4000/api/v1/blocks/latest
curl http://localhost:4000/api/v1/blocks/12345

# Transactions
curl http://localhost:4000/api/v1/transactions?page=1&limit=5
curl http://localhost:4000/api/v1/transactions/0x123...

# Accounts
curl http://localhost:4000/api/v1/accounts?page=1&per_page=5
curl http://localhost:4000/api/v1/accounts/0x123...
curl http://localhost:4000/api/v1/accounts/0x123.../transactions
```

### Explorer Pages

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

## 🔍 Debugging

### Check Container Logs

```bash
# API logs
docker-compose logs -f api

# Explorer logs
docker-compose logs -f explorer

# All logs
docker-compose logs -f
```

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

### Access Container Shell

```bash
# API container
docker exec -it norchain-api sh

# Explorer container
docker exec -it norchain-explorer sh

# Test internal API access from Explorer
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
```

---

## 🐛 Common Issues

### Issue: Explorer can't connect to API

**Symptoms**: Explorer shows API errors, 502/503 errors

**Solutions**:
1. Check API is running: `docker-compose ps api`
2. Check API health: `curl http://localhost:4000/api/v1/health`
3. Verify network: `docker network inspect norchain-monorepo_norchain-network`
4. Check Explorer logs: `docker-compose logs explorer`

### Issue: API can't connect to database

**Symptoms**: API logs show database connection errors

**Solutions**:
1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Check database health: `docker-compose exec postgres pg_isready`
3. Verify environment variables: `docker-compose exec api env | grep DB_`
4. Check database logs: `docker-compose logs postgres`

### Issue: Explorer build fails

**Symptoms**: Docker build fails for Explorer

**Solutions**:
1. Check Next.js config: `apps/explorer/next.config.js`
2. Verify standalone output is enabled
3. Check build logs: `docker-compose build explorer 2>&1 | tail -50`
4. Try building locally: `cd apps/explorer && npm run build`

### Issue: Port conflicts

**Symptoms**: Port already in use errors

**Solutions**:
1. Check what's using the port: `lsof -i :4000` or `lsof -i :4002`
2. Change ports in `.env` or `docker-compose.yml`
3. Stop conflicting services

---

## 📊 Performance Testing

### Load Testing

```bash
# Test API response times
time curl http://localhost:4000/api/v1/stats
time curl http://localhost:4000/api/v1/blocks?page=1&per_page=20

# Test Explorer page load times
time curl http://localhost:4002
time curl http://localhost:4002/blocks
```

### Resource Usage

```bash
# Check container resource usage
docker stats norchain-api norchain-explorer

# Check specific container
docker stats norchain-api --no-stream
```

---

## 🔄 Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart explorer

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## ✅ Test Checklist

- [ ] All containers start successfully
- [ ] API health check passes
- [ ] Explorer health check passes
- [ ] API endpoints return 200
- [ ] Explorer pages load successfully
- [ ] Internal API access works (Explorer → API)
- [ ] External API access works (localhost → API)
- [ ] External Explorer access works (localhost → Explorer)
- [ ] Database connection works
- [ ] Redis connection works
- [ ] Logs show no errors

---

## 🚀 Production Deployment

For production deployment:

1. **Set Environment Variables**: Create `.env` file with production values
2. **Update CORS**: Set `CORS_ORIGIN` to production domains
3. **Enable HTTPS**: Use reverse proxy (Nginx/Traefik)
4. **Set Secrets**: Use Docker secrets or environment files
5. **Monitor**: Set up logging and monitoring

---

**Status**: Ready for Docker testing! 🐳

