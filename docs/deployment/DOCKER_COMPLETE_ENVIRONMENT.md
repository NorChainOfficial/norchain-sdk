# Complete Docker Environment Guide
## Unified Docker Setup for NorChain Ecosystem

**Last Updated**: November 2024

---

## Overview

This guide covers the complete Docker environment setup for the entire NorChain ecosystem, including all services, verification, and testing.

---

## Quick Start

### 1. Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd norchain-monorepo

# Copy environment template
cp .env.example .env

# Edit .env with your values (optional - defaults work for development)
nano .env

# Run complete setup
./scripts/docker-setup.sh
```

### 2. Manual Setup

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Verify setup
./scripts/docker-verify.sh

# Test connectivity
./scripts/docker-test.sh
```

---

## Services Included

| Service | Container Name | Internal Port | External Port | URL |
|---------|---------------|--------------|---------------|-----|
| Unified API | `norchain-api` | 3000 | 4000 | http://localhost:4000 |
| Explorer App | `norchain-explorer` | 3002 | 4002 | http://localhost:4002 |
| Landing Page | `norchain-landing` | 3010 | 4010 | http://localhost:4010 |
| Documentation | `norchain-docs` | 3011 | 4011 | http://localhost:4011 |
| NEX Exchange | `norchain-nex-exchange` | 3001 | 4001 | http://localhost:4001 |
| Wallet Web | `norchain-wallet` | 4020 | 4020 | http://localhost:4020 |
| PostgreSQL | `norchain-postgres` | 5432 | 5433 | localhost:5433 |
| Redis | `norchain-redis` | 6379 | 6380 | localhost:6380 |

---

## Environment Variables

### Required Variables

```env
# Database
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=postgres

# Security
JWT_SECRET=your-secret-key-change-in-production

# Blockchain
RPC_URL=https://rpc.norchain.org
CHAIN_ID=65001
```

### Optional Port Configuration

All ports are configurable via environment variables:

```env
API_PORT=4000
EXPLORER_APP_PORT=4002
LANDING_PORT=4010
DOCS_PORT=4011
NEX_EXCHANGE_PORT=4001
WALLET_PORT=4020
POSTGRES_PORT=5433
REDIS_PORT=6380
```

---

## Docker Compose Files

### Production (`docker-compose.yml`)

- All services in production mode
- Optimized builds
- Health checks enabled
- Restart policies

### Development (`docker-compose.dev.yml`)

- Hot reload for API
- Volume mounts for source code
- Development environment variables

---

## Verification Scripts

### 1. `scripts/docker-verify.sh`

Verifies Docker environment:
- Docker and Docker Compose installation
- Running services
- Port availability
- Networks and volumes
- Dockerfiles existence

**Usage**:
```bash
./scripts/docker-verify.sh
```

### 2. `scripts/docker-test.sh`

Tests all services:
- API endpoints
- Health checks
- Database connectivity
- Redis connectivity
- Inter-service communication

**Usage**:
```bash
./scripts/docker-test.sh
```

### 3. `scripts/test-connectivity.sh`

Quick connectivity test:
- All service endpoints
- Health endpoints
- Database and Redis (if tools available)

**Usage**:
```bash
./scripts/test-connectivity.sh
```

### 4. `scripts/docker-setup.sh`

Complete setup script:
- Checks prerequisites
- Creates .env if needed
- Builds images
- Starts services
- Runs verification and tests

**Usage**:
```bash
./scripts/docker-setup.sh
```

---

## Service Dependencies

```
PostgreSQL ──┐
             ├──> Unified API ──┬──> Explorer App
Redis ───────┘                  ├──> Landing Page
                                ├──> Documentation
                                ├──> NEX Exchange
                                └──> Wallet Web
```

**Start Order**:
1. PostgreSQL and Redis (infrastructure)
2. Unified API (depends on PostgreSQL and Redis)
3. All frontend apps (depend on API)

---

## Health Checks

All services have health checks configured:

### API Health Check
```bash
curl http://localhost:4000/api/v1/health
```

### Frontend Health Checks
- Explorer: `http://localhost:4002/api/health`
- Landing: `http://localhost:4010`
- Docs: `http://localhost:4011`
- NEX: `http://localhost:4001/api/health`
- Wallet: `http://localhost:4020/api/health`

---

## Common Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api

# Start with logs
docker-compose up
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Rebuild Services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build api

# Rebuild without cache
docker-compose build --no-cache api
```

### Service Status
```bash
# List running services
docker-compose ps

# Detailed status
docker-compose ps -a
```

---

## Troubleshooting

### Services Not Starting

1. **Check logs**:
   ```bash
   docker-compose logs <service-name>
   ```

2. **Check port conflicts**:
   ```bash
   lsof -i :4000  # Check if port is in use
   ```

3. **Verify environment variables**:
   ```bash
   docker-compose config
   ```

### Database Connection Issues

1. **Check PostgreSQL is running**:
   ```bash
   docker-compose ps postgres
   ```

2. **Test connection**:
   ```bash
   docker exec -it norchain-postgres psql -U postgres -d norchain_explorer
   ```

3. **Check environment variables**:
   ```bash
   docker-compose exec api env | grep DB_
   ```

### API Not Responding

1. **Check API logs**:
   ```bash
   docker-compose logs -f api
   ```

2. **Check health endpoint**:
   ```bash
   curl http://localhost:4000/api/v1/health
   ```

3. **Restart API**:
   ```bash
   docker-compose restart api
   ```

### Frontend Apps Not Loading

1. **Check if API is accessible**:
   ```bash
   curl http://localhost:4000/api/v1/health
   ```

2. **Check frontend logs**:
   ```bash
   docker-compose logs -f explorer
   ```

3. **Verify environment variables**:
   ```bash
   docker-compose exec explorer env | grep NEXT_PUBLIC
   ```

---

## Development Workflow

### Using Development Compose

```bash
# Start only infrastructure
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run apps locally with hot reload
npm run dev
```

### Using Production Compose

```bash
# Build and start everything
docker-compose up -d

# Make changes and rebuild
docker-compose build <service>
docker-compose up -d <service>
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change `JWT_SECRET` to secure value
- [ ] Update `DB_PASSWORD` to strong password
- [ ] Configure `CORS_ORIGIN` with production domains
- [ ] Set `NODE_ENV=production`
- [ ] Review security settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Set up monitoring and logging
- [ ] Configure backups

### Production Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<strong-password>
CORS_ORIGIN=https://yourdomain.com
```

---

## Monitoring

### Service Health

```bash
# Check all service health
docker-compose ps

# Check specific service health
docker inspect norchain-api | grep Health -A 10
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats norchain-api
```

---

## Backup and Restore

### Database Backup

```bash
# Backup
docker exec norchain-postgres pg_dump -U postgres norchain_explorer > backup.sql

# Restore
docker exec -i norchain-postgres psql -U postgres norchain_explorer < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v norchain-monorepo_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## Security Considerations

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong passwords** - Especially for database
3. **Rotate JWT secrets** - Regularly in production
4. **Limit CORS origins** - Only allow trusted domains
5. **Use secrets management** - For production (Docker secrets, etc.)
6. **Keep images updated** - Regularly update base images
7. **Scan for vulnerabilities** - Use `docker scan`

---

## Performance Optimization

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Build Optimization

- Use multi-stage builds (already implemented)
- Leverage Docker layer caching
- Use `.dockerignore` files
- Build in parallel when possible

---

## Related Documentation

- [Docker Setup](./DOCKER_SETUP.md) - Basic setup guide
- [Port Configuration](./PORTS_CONFIGURATION.md) - Port mapping details
- [Environment Variables](../development/ENV_TEMPLATE.md) - Complete env reference

---

**Last Updated**: November 2024

