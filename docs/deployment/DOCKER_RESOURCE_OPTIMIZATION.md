# Docker Resource Optimization Guide

**Date**: January 2025  
**Status**: ✅ Optimized for Low Resource Usage

---

## 🎯 Problem: Increasing Resource Usage

If you notice Docker resource usage increasing:

### Symptoms
- CPU usage climbing above 100%
- Memory usage growing over time
- Containers consuming more resources than expected

### Causes
1. **Build processes** running in background
2. **Scheduled tasks** or polling mechanisms
3. **Memory leaks** in applications
4. **Too many services** running simultaneously
5. **Docker Desktop** resource limits too high

---

## 🚀 Quick Solutions

### 1. Use Minimal Configuration

```bash
# Start only essential services (reduces memory by ~60%)
docker-compose -f docker-compose.dev-minimal.yml up -d
```

**Memory Usage**: ~768MB (vs ~4.3GB for all services)

### 2. Stop Unused Services

```bash
# Stop specific services
docker-compose stop explorer landing docs nex-exchange

# Keep only API running
docker-compose up -d postgres redis api
```

### 3. Monitor Resource Usage

```bash
# Run monitoring script
./scripts/docker-monitor.sh

# Or manually
docker stats
```

### 4. Clean Up Resources

```bash
# Clean up unused resources
./scripts/docker-cleanup.sh

# Remove build cache (frees ~8GB)
docker builder prune -a
```

---

## 📊 Resource Comparison

### Full Stack (All Services)
- **Memory**: ~4.3GB
- **CPU**: ~2.75 cores
- **Services**: 7 containers

### Minimal Stack (API Only)
- **Memory**: ~768MB
- **CPU**: ~0.85 cores
- **Services**: 3 containers

### Development Stack (Recommended)
- **Memory**: ~1.5GB
- **CPU**: ~1.5 cores
- **Services**: 4 containers (postgres, redis, api, explorer)

---

## 🔧 Optimization Strategies

### 1. Reduce PostgreSQL Memory

**Current**: 512MB  
**Minimal**: 256MB  
**Ultra-Minimal**: 128MB

```yaml
deploy:
  resources:
    limits:
      memory: 256M  # Reduced from 512M
```

### 2. Reduce Redis Memory

**Current**: 256MB  
**Minimal**: 128MB  
**Ultra-Minimal**: 64MB

```yaml
command: >
  redis-server
  --maxmemory 100mb  # Reduced from 200mb
```

### 3. Reduce API Memory

**Current**: 512MB  
**Minimal**: 384MB  
**Ultra-Minimal**: 256MB

```yaml
deploy:
  resources:
    limits:
      memory: 384M  # Reduced from 512M
```

### 4. Disable Unnecessary Features

In `apps/api/src/main.ts`, consider disabling:
- Scheduled tasks (if not needed)
- WebSocket connections (if not used)
- Real-time subscriptions (if not needed)

---

## 📋 Recommended Configurations

### Development (Low Resources)

```bash
# Use minimal compose file
docker-compose -f docker-compose.dev-minimal.yml up -d
```

**Memory**: ~768MB  
**CPU**: ~0.85 cores  
**Services**: postgres, redis, api

### Development (Standard)

```bash
# Start core + explorer only
docker-compose up -d postgres redis api explorer
```

**Memory**: ~1.5GB  
**CPU**: ~1.5 cores  
**Services**: postgres, redis, api, explorer

### Production (Full Stack)

```bash
# Start all services
docker-compose up -d
```

**Memory**: ~4.3GB  
**CPU**: ~2.75 cores  
**Services**: All 7 services

---

## 🐛 Troubleshooting High Resource Usage

### Check What's Using Resources

```bash
# Real-time monitoring
docker stats

# Check specific container
docker stats norchain-api

# Check container processes
docker top norchain-api
```

### Identify Memory Leaks

```bash
# Monitor memory over time
watch -n 5 'docker stats --no-stream --format "{{.Container}} {{.MemUsage}}"'
```

### Check for Background Processes

```bash
# Check API logs for scheduled tasks
docker-compose logs api | grep -i "schedule\|cron\|interval\|poll"

# Check all container logs
docker-compose logs | grep -i "error\|warning"
```

### Restart Services

```bash
# Restart specific service
docker-compose restart api

# Restart all services
docker-compose restart
```

---

## ⚙️ Docker Desktop Settings

### Recommended Settings (Development)

- **Memory**: 4GB (minimum: 2GB)
- **CPUs**: 2 cores
- **Disk**: 60GB
- **Swap**: 1GB

### Recommended Settings (Production)

- **Memory**: 6-8GB
- **CPUs**: 4 cores
- **Disk**: 100GB
- **Swap**: 2GB

### How to Adjust

1. Open Docker Desktop
2. Go to **Settings** → **Resources**
3. Adjust **Memory**, **CPUs**, and **Disk Image Size**
4. Click **Apply & Restart**

---

## 📝 Best Practices

### 1. Start Only What You Need

```bash
# Development: Only API
docker-compose up -d postgres redis api

# Testing: Add Explorer
docker-compose up -d postgres redis api explorer

# Full Stack: All services
docker-compose up -d
```

### 2. Regular Cleanup

```bash
# Weekly cleanup
./scripts/docker-cleanup.sh

# Monthly deep cleanup
docker system prune -a --volumes
```

### 3. Monitor Resource Usage

```bash
# Set up monitoring
watch -n 10 './scripts/docker-monitor.sh'
```

### 4. Use Resource Limits

Always set memory and CPU limits in `docker-compose.yml` to prevent runaway processes.

---

## 🎯 Quick Reference

### Start Minimal Stack
```bash
docker-compose -f docker-compose.dev-minimal.yml up -d
```

### Monitor Resources
```bash
./scripts/docker-monitor.sh
```

### Clean Up
```bash
./scripts/docker-cleanup.sh
```

### Stop All
```bash
docker-compose down
```

### Check Status
```bash
docker-compose ps
docker stats
```

---

## ✅ Summary

**If resource usage is increasing:**

1. ✅ Use `docker-compose.dev-minimal.yml` for development
2. ✅ Stop unused services
3. ✅ Monitor with `./scripts/docker-monitor.sh`
4. ✅ Clean up regularly with `./scripts/docker-cleanup.sh`
5. ✅ Adjust Docker Desktop memory to 4-6GB
6. ✅ Check for memory leaks or background processes

**Current Optimizations:**
- ✅ All services have memory limits
- ✅ PostgreSQL optimized for low memory
- ✅ Redis has maxmemory limit with LRU eviction
- ✅ Minimal compose file available
- ✅ Monitoring script created
- ✅ Cleanup script available

---

**Last Updated**: January 2025

