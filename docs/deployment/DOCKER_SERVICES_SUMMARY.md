# Docker Services Summary

**Date**: January 2025  
**Status**: ✅ Optimized & Ready

---

## 📋 All Services

### Currently Running (3/7)

| Service | Container | Status | Port | Memory Limit |
|---------|-----------|--------|------|--------------|
| ✅ PostgreSQL | `norchain-postgres` | Running | 5433 | 512MB |
| ✅ Redis | `norchain-redis` | Running | 6380 | 256MB |
| ✅ API | `norchain-api` | Running | 4000 | 512MB |

### Available but Not Running (4/7)

| Service | Container | Port | Memory Limit | Status |
|---------|-----------|------|--------------|--------|
| ⏸️ Explorer | `norchain-explorer` | 4002 | 1GB | Not Started |
| ⏸️ Landing | `norchain-landing` | 4010 | 512MB | Not Started |
| ⏸️ Docs | `norchain-docs` | 4011 | 512MB | Not Started |
| ⏸️ NEX Exchange | `norchain-nex-exchange` | 4001 | 1GB | Not Started |

---

## 🚀 Starting All Services

### Quick Start

```bash
# Start all services
./scripts/docker-start-all.sh

# Or manually
docker-compose up -d
```

### Start Specific Services

```bash
# Start only core services
docker-compose up -d postgres redis api

# Start Explorer
docker-compose up -d explorer

# Start all frontend apps
docker-compose up -d explorer landing docs nex-exchange
```

---

## 📊 Resource Usage Summary

### Total Memory Limits

| Category | Memory | CPU |
|----------|--------|-----|
| **Infrastructure** | 768MB | 0.75 cores |
| - PostgreSQL | 512MB | 0.5 cores |
| - Redis | 256MB | 0.25 cores |
| **Backend** | 512MB | 1.0 core |
| - API | 512MB | 1.0 core |
| **Frontend** | 3GB | 1.0 core |
| - Explorer | 1GB | 1.0 core |
| - Landing | 512MB | - |
| - Docs | 512MB | - |
| - NEX Exchange | 1GB | - |
| **Total** | **~4.3GB** | **~2.75 cores** |

### Recommended Docker Desktop Settings

- **Memory**: 4-6GB (minimum: 4GB)
- **CPUs**: 2-4 cores
- **Disk**: 60-80GB

---

## 🧹 Cleanup & Optimization

### Free Up Space

```bash
# Run cleanup script
./scripts/docker-cleanup.sh

# Or manually
docker-compose down
docker system prune -a
```

### Check Resource Usage

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Service status
docker-compose ps
```

---

## 🔧 Troubleshooting

### Services Not Starting

1. **Check Docker Desktop resources**:
   - Memory should be at least 4GB
   - CPUs should be at least 2

2. **Check logs**:
   ```bash
   docker-compose logs <service-name>
   ```

3. **Rebuild services**:
   ```bash
   docker-compose build <service-name>
   docker-compose up -d <service-name>
   ```

### High Memory Usage

1. **Stop unused services**:
   ```bash
   docker-compose stop <service-name>
   ```

2. **Reduce memory limits** in `docker-compose.yml` (if needed)

3. **Increase Docker Desktop memory** to 6-8GB

### Volume Issues

1. **Check volume directories exist**:
   ```bash
   ls -la .docker/
   ```

2. **Recreate volumes** (⚠️ deletes data):
   ```bash
   docker-compose down -v
   rm -rf .docker/*
   docker-compose up -d
   ```

---

## 📝 Service Details

### PostgreSQL

- **Image**: `postgres:14-alpine`
- **Memory**: 512MB limit, 256MB reservation
- **CPU**: 0.5 cores limit, 0.25 cores reservation
- **Optimizations**: Low memory settings, optimized for small datasets
- **Data**: `.docker/postgres-data`

### Redis

- **Image**: `redis:7-alpine`
- **Memory**: 256MB limit, 128MB reservation, 200MB maxmemory
- **CPU**: 0.25 cores limit, 0.1 cores reservation
- **Optimizations**: LRU eviction, periodic saves
- **Data**: `.docker/redis-data`

### API

- **Build**: `apps/api/Dockerfile`
- **Memory**: 512MB limit, 256MB reservation
- **CPU**: 1.0 core limit, 0.5 cores reservation
- **Dependencies**: PostgreSQL, Redis

### Explorer

- **Build**: `apps/explorer/Dockerfile`
- **Memory**: 1GB limit, 512MB reservation
- **CPU**: 1.0 core limit, 0.5 cores reservation
- **Dependencies**: API

### Landing

- **Build**: `apps/landing/Dockerfile`
- **Memory**: 512MB limit, 256MB reservation
- **Dependencies**: API

### Docs

- **Build**: `apps/docs/Dockerfile`
- **Memory**: 512MB limit, 256MB reservation
- **Dependencies**: None

### NEX Exchange

- **Build**: `apps/nex-exchange/Dockerfile`
- **Memory**: 1GB limit, 512MB reservation
- **Dependencies**: API

---

## ✅ Next Steps

1. **Start all services**:
   ```bash
   ./scripts/docker-start-all.sh
   ```

2. **Verify all services are running**:
   ```bash
   docker-compose ps
   ```

3. **Check resource usage**:
   ```bash
   docker stats
   ```

4. **Access services**:
   - API: http://localhost:4000
   - Explorer: http://localhost:4002
   - Landing: http://localhost:4010
   - Docs: http://localhost:4011
   - NEX Exchange: http://localhost:4001

---

**Last Updated**: January 2025

