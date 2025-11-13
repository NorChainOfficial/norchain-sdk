# Docker Optimization Guide

**Date**: January 2025  
**Status**: ✅ Optimized

---

## 🎯 Resource Optimization Summary

### Memory Limits (Total: ~3.5GB)

| Service | Memory Limit | Reservation | CPU Limit |
|---------|--------------|-------------|-----------|
| PostgreSQL | 512MB | 256MB | 0.5 cores |
| Redis | 256MB | 128MB | 0.25 cores |
| API | 512MB | 256MB | 1.0 core |
| Explorer | 1GB | 512MB | 1.0 core |
| Landing | 512MB | 256MB | - |
| Docs | 512MB | 256MB | - |
| NEX Exchange | 1GB | 512MB | - |
| **Total** | **~4.3GB** | **~2.1GB** | **~2.75 cores** |

---

## 📦 Volume Optimization

### Volume Storage Locations

- **PostgreSQL**: `.docker/postgres-data` (bind mount, limited size)
- **Redis**: `.docker/redis-data` (bind mount, limited size)

### Benefits

- ✅ Volumes stored in project directory (easy to find/backup)
- ✅ Can be easily removed with project cleanup
- ✅ No orphaned volumes consuming space

---

## 🚀 Docker Desktop Settings

### Recommended Settings

1. **Memory**: 4-6GB (minimum: 4GB)
2. **CPUs**: 2-4 cores
3. **Disk Image Size**: 60-80GB
4. **Swap**: 1GB

### How to Adjust

1. Open Docker Desktop
2. Go to Settings → Resources
3. Adjust Memory, CPUs, and Disk Image Size
4. Click "Apply & Restart"

---

## 🧹 Cleanup Scripts

### Quick Cleanup

```bash
# Run cleanup script
./scripts/docker-cleanup.sh
```

This will:
- Stop all containers
- Remove stopped containers
- Remove unused images
- Remove unused volumes (with confirmation)
- Remove unused networks
- Remove build cache

### Manual Cleanup

```bash
# Stop all services
docker-compose down

# Remove unused resources
docker system prune -a

# Remove volumes (careful - deletes data!)
docker volume prune

# Check disk usage
docker system df
```

---

## 📊 Monitoring Resource Usage

### Check Container Stats

```bash
# Real-time stats
docker stats

# One-time snapshot
docker stats --no-stream
```

### Check Disk Usage

```bash
# Overall usage
docker system df

# Detailed breakdown
docker system df -v
```

### Check Volume Sizes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume-name>
```

---

## ⚙️ PostgreSQL Optimization

### Memory Settings (Already Configured)

- `shared_buffers`: 128MB
- `effective_cache_size`: 256MB
- `maintenance_work_mem`: 64MB
- `work_mem`: 4MB
- `wal_buffers`: 16MB

### Benefits

- ✅ Reduced memory footprint
- ✅ Optimized for small datasets
- ✅ Faster checkpoint completion

---

## 🔴 Redis Optimization

### Memory Settings (Already Configured)

- `maxmemory`: 200MB
- `maxmemory-policy`: allkeys-lru (evict least recently used)
- `save`: 60 1000 (save every 60 seconds if 1000+ keys changed)

### Benefits

- ✅ Automatic eviction when memory limit reached
- ✅ Prevents Redis from consuming too much memory
- ✅ Periodic saves for persistence

---

## 🎯 Best Practices

### 1. Start Only Needed Services

```bash
# Start specific services only
docker-compose up -d postgres redis api explorer

# Stop specific services
docker-compose stop landing docs nex-exchange
```

### 2. Use Development Mode for Local Work

```bash
# Use docker-compose.dev.yml for development
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Regular Cleanup

```bash
# Weekly cleanup
./scripts/docker-cleanup.sh

# Monthly deep cleanup
docker system prune -a --volumes
```

### 4. Monitor Resource Usage

```bash
# Set up monitoring
watch -n 5 docker stats
```

---

## 🐛 Troubleshooting

### High Memory Usage

1. **Check running containers**:
   ```bash
   docker ps
   docker stats
   ```

2. **Stop unused services**:
   ```bash
   docker-compose stop <service-name>
   ```

3. **Reduce memory limits** in `docker-compose.yml` (if needed)

### High Disk Usage

1. **Check disk usage**:
   ```bash
   docker system df
   ```

2. **Remove unused images**:
   ```bash
   docker image prune -a
   ```

3. **Remove build cache**:
   ```bash
   docker builder prune -a
   ```

### Volume Growing Too Large

1. **Check volume sizes**:
   ```bash
   docker volume ls
   du -sh .docker/*
   ```

2. **Clean PostgreSQL data** (if safe):
   ```bash
   docker-compose down
   rm -rf .docker/postgres-data/*
   docker-compose up -d
   ```

---

## 📝 Summary

✅ **All services have memory limits**  
✅ **CPU limits set for critical services**  
✅ **Volumes optimized with bind mounts**  
✅ **PostgreSQL and Redis optimized for low memory**  
✅ **Cleanup scripts available**  
✅ **Monitoring tools provided**

**Total Memory Usage**: ~4.3GB (with limits)  
**Recommended Docker Memory**: 4-6GB  
**Recommended Docker Disk**: 60-80GB

---

**Last Updated**: January 2025

