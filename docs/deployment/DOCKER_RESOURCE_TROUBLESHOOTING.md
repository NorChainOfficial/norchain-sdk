# Docker Resource Usage Troubleshooting

**Date**: January 2025  
**Issue**: Increasing CPU/Memory Usage

---

## 🚨 Immediate Actions

### If Resource Usage is Increasing:

1. **Stop All Services**:
   ```bash
   docker-compose down
   ```

2. **Use Minimal Stack** (Saves ~3.5GB):
   ```bash
   docker-compose -f docker-compose.dev-minimal.yml up -d
   ```

3. **Reduce Docker Desktop Memory**:
   - Open Docker Desktop
   - Settings → Resources → Memory
   - Set to **4GB** (from 7.47GB)
   - Click **Apply & Restart**

4. **Clean Up Resources**:
   ```bash
   ./scripts/docker-cleanup.sh
   ```

---

## 🔍 Identifying the Issue

### Check Current Usage

```bash
# Real-time monitoring
docker stats

# Check specific container
docker stats norchain-api --no-stream

# Monitor over time
watch -n 5 'docker stats --no-stream'
```

### Check for Memory Leaks

```bash
# Watch memory growth
watch -n 10 'docker stats --no-stream --format "{{.Container}} {{.MemUsage}}"'
```

### Check Container Logs

```bash
# Check for errors or warnings
docker-compose logs api | tail -100

# Check for scheduled tasks
docker-compose logs api | grep -i "schedule\|cron\|interval"
```

---

## 🐛 Common Causes

### 1. Background Processes

**Found**: `setInterval` in streaming controller (heartbeat every 30s)  
**Impact**: Low (only when SSE connections active)

**Found**: Performance monitor storing metrics (reduced from 10k to 1k)  
**Impact**: Medium (was storing too many metrics)

### 2. Too Many Services Running

**Solution**: Use minimal stack or stop unused services

### 3. Docker Desktop Memory Too High

**Current**: 7.47GB  
**Recommended**: 4-6GB  
**Minimal**: 2-4GB

### 4. Build Processes

**Solution**: Clean build cache
```bash
docker builder prune -a
```

---

## ✅ Optimizations Applied

1. ✅ **Performance Monitor**: Reduced maxMetrics from 10k to 1k
2. ✅ **Memory Limits**: All services have limits set
3. ✅ **CPU Limits**: Critical services have CPU limits
4. ✅ **PostgreSQL**: Optimized for low memory (128MB shared_buffers)
5. ✅ **Redis**: Maxmemory 200MB with LRU eviction
6. ✅ **Minimal Compose**: Created `docker-compose.dev-minimal.yml`

---

## 📊 Resource Comparison

| Configuration | Memory | CPU | Services |
|---------------|--------|-----|----------|
| **Full Stack** | ~4.3GB | ~2.75 cores | 7 services |
| **Standard** | ~1.5GB | ~1.5 cores | 4 services |
| **Minimal** | ~768MB | ~0.85 cores | 3 services |

---

## 🎯 Recommended Actions

### For Development

```bash
# Use minimal stack
docker-compose -f docker-compose.dev-minimal.yml up -d
```

### For Testing

```bash
# Start only API + Explorer
docker-compose up -d postgres redis api explorer
```

### For Production

```bash
# Start all services (with limits)
docker-compose up -d
```

---

## 🔧 Advanced Troubleshooting

### Check Container Processes

```bash
# See what's running inside container
docker top norchain-api

# Check resource usage per process
docker exec norchain-api ps aux
```

### Restart Specific Service

```bash
# Restart API to reset memory
docker-compose restart api

# Restart all services
docker-compose restart
```

### Check for Memory Leaks

```bash
# Monitor memory over 5 minutes
for i in {1..12}; do
  echo "=== Minute $i ==="
  docker stats --no-stream --format "{{.Container}} {{.MemUsage}}"
  sleep 30
done
```

---

## 📝 Best Practices

1. **Always use resource limits** in docker-compose.yml
2. **Start only what you need** for development
3. **Monitor regularly** with `./scripts/docker-monitor.sh`
4. **Clean up weekly** with `./scripts/docker-cleanup.sh`
5. **Set Docker Desktop memory** to 4-6GB (not 7.47GB)

---

## 🚀 Quick Fixes

### Fix 1: Reduce Docker Desktop Memory
- Settings → Resources → Memory → 4GB → Apply & Restart

### Fix 2: Use Minimal Stack
```bash
docker-compose down
docker-compose -f docker-compose.dev-minimal.yml up -d
```

### Fix 3: Clean Up
```bash
./scripts/docker-cleanup.sh
```

### Fix 4: Stop Unused Services
```bash
docker-compose stop explorer landing docs nex-exchange
```

---

**Last Updated**: January 2025

