# NorStudio Docker Deployment Guide

This guide covers Docker deployment for NorStudio, the AI-powered smart contract IDE for NorChain.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Building the Image](#building-the-image)
- [Running Standalone](#running-standalone)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Monorepo Integration](#monorepo-integration)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

NorStudio uses a multi-stage Docker build for optimal image size and security:

- **Stage 1 (deps):** Production dependencies only
- **Stage 2 (builder):** Full build with all dependencies
- **Stage 3 (runner):** Minimal runtime with standalone Next.js output

**Image Details:**
- Base: `node:18-alpine`
- Runtime: Next.js standalone mode
- Security: Non-root user (nextjs:nodejs)
- Health checks: Built-in endpoint at `/api/health`

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+ (for orchestration)
- 1GB+ available memory
- Port 3003 available (or configure alternate port)

## Quick Start

### 1. Build and Run Locally

```bash
# Build the image
docker build -t norchain/norstudio:latest .

# Run the container
docker run -d \
  -p 3003:3003 \
  --name norstudio \
  -e NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 \
  -e NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org \
  -e NEXT_PUBLIC_CHAIN_ID=65001 \
  norchain/norstudio:latest

# Check health
curl http://localhost:3003/api/health
```

### 2. Using Docker Compose

```bash
# Run standalone
docker-compose up -d

# Check logs
docker-compose logs -f norstudio

# Stop
docker-compose down
```

## Building the Image

### Standard Build

```bash
cd apps/norstudio
docker build -t norchain/norstudio:latest .
```

### Build with Custom Tag

```bash
docker build -t norchain/norstudio:v1.0.0 .
```

### Build Arguments

The Dockerfile supports the following build arguments:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://api:3000/api/v1 \
  --build-arg NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org \
  --build-arg NEXT_PUBLIC_CHAIN_ID=65001 \
  -t norchain/norstudio:latest .
```

### Build Performance

- **First build:** ~3-5 minutes (downloads dependencies)
- **Subsequent builds:** ~30-60 seconds (cached layers)
- **Image size:** ~400-500MB (optimized)

## Running Standalone

### Basic Run

```bash
docker run -d \
  -p 3003:3003 \
  --name norstudio \
  norchain/norstudio:latest
```

### With Environment Variables

```bash
docker run -d \
  -p 3003:3003 \
  --name norstudio \
  -e NODE_ENV=production \
  -e PORT=3003 \
  -e NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 \
  -e NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org \
  -e NEXT_PUBLIC_CHAIN_ID=65001 \
  -e NEXT_PUBLIC_ENABLE_AI_FEATURES=true \
  norchain/norstudio:latest
```

### With Resource Limits

```bash
docker run -d \
  -p 3003:3003 \
  --name norstudio \
  --memory="1g" \
  --cpus="1.0" \
  norchain/norstudio:latest
```

### View Logs

```bash
# Follow logs
docker logs -f norstudio

# Last 100 lines
docker logs --tail 100 norstudio

# With timestamps
docker logs -t norstudio
```

### Container Management

```bash
# Stop container
docker stop norstudio

# Start container
docker start norstudio

# Restart container
docker restart norstudio

# Remove container
docker rm -f norstudio
```

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Node environment | `production` | `production` |
| `PORT` | Internal port | `3003` | `3003` |

### API Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | - | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_NORCHAIN_RPC` | Blockchain RPC URL | - | `https://rpc.norchain.org` |
| `NEXT_PUBLIC_CHAIN_ID` | Blockchain chain ID | - | `65001` |

### Feature Flags

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_ENABLE_AI_FEATURES` | Enable AI features | `false` | `true` |

### Example .env File

```env
# Production environment
NODE_ENV=production
PORT=3003

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org
NEXT_PUBLIC_CHAIN_ID=65001

# Features
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

## Health Checks

### Health Check Endpoint

The container exposes a health check endpoint at `/api/health`:

```bash
curl http://localhost:3003/api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T12:00:00.000Z",
  "service": "norstudio",
  "version": "1.0.0",
  "uptime": 123.45,
  "memory": {
    "used": 150,
    "total": 200
  }
}
```

### Docker Health Check

The Dockerfile includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1
```

**Configuration:**
- **Interval:** 30 seconds between checks
- **Timeout:** 10 seconds per check
- **Start Period:** 40 seconds grace period
- **Retries:** 3 failed checks before unhealthy

### Check Container Health

```bash
# View health status
docker inspect --format='{{.State.Health.Status}}' norstudio

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' norstudio
```

## Monorepo Integration

### Using Monorepo Docker Compose

From the monorepo root:

```bash
# Start NorStudio (with dependencies)
cd /path/to/norchain-monorepo
docker-compose up norstudio

# Start all services
docker-compose up

# Start specific services
docker-compose up api explorer norstudio
```

### Monorepo Configuration

The monorepo `docker-compose.yml` includes:

```yaml
norstudio:
  build:
    context: ./apps/norstudio
    dockerfile: Dockerfile
  ports:
    - "${NORSTUDIO_PORT:-4003}:3003"
  environment:
    - NEXT_PUBLIC_API_URL=http://api:3000/api/v1
    - NEXT_PUBLIC_NORCHAIN_RPC=${RPC_URL:-https://rpc.norchain.org}
    - NEXT_PUBLIC_CHAIN_ID=${CHAIN_ID:-65001}
  depends_on:
    api:
      condition: service_healthy
  networks:
    - norchain-network
```

### Service Dependencies

NorStudio depends on:
- **API Service:** Backend API (required)
- **Postgres:** Database via API
- **Redis:** Cache via API

## Production Deployment

### Production Best Practices

1. **Use specific version tags**
   ```bash
   docker build -t norchain/norstudio:1.0.0 .
   docker tag norchain/norstudio:1.0.0 norchain/norstudio:latest
   ```

2. **Set resource limits**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1G
         cpus: '1.0'
       reservations:
         memory: 512M
         cpus: '0.5'
   ```

3. **Configure restart policy**
   ```yaml
   restart: unless-stopped
   ```

4. **Use secrets for sensitive data**
   ```bash
   docker secret create api_key /path/to/secret
   ```

5. **Enable logging**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

### Production Docker Compose

```yaml
version: '3.8'

services:
  norstudio:
    image: norchain/norstudio:1.0.0
    container_name: norstudio-prod
    restart: unless-stopped
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.norchain.org/api/v1
      - NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org
      - NEXT_PUBLIC_CHAIN_ID=65001
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3003/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "com.norchain.service=norstudio"
      - "com.norchain.version=1.0.0"
```

### Scaling

```bash
# Scale to 3 instances
docker-compose up -d --scale norstudio=3

# Behind a load balancer
docker-compose up -d nginx norstudio
```

### Monitoring

```bash
# Container stats
docker stats norstudio

# Resource usage
docker inspect norstudio | jq '.[0].HostConfig.Memory'

# Disk usage
docker system df
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**
```
bind: address already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :3003

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3033:3003 ...
```

#### 2. Build Failures

**Error: Missing dependencies**

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t norchain/norstudio:latest .
```

**Error: Tailwind CSS issues**

Ensure `tailwind.config.ts` includes CSS variable support:

```typescript
colors: {
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  // ... other CSS variables
}
```

#### 3. Container Crashes

**Check logs:**
```bash
docker logs norstudio
```

**Common causes:**
- Missing environment variables
- Insufficient memory
- Port conflicts
- Health check failures

**Solutions:**
```bash
# Increase memory
docker run --memory="2g" ...

# Disable health check temporarily
docker run --no-healthcheck ...

# Check container status
docker inspect norstudio
```

#### 4. Health Check Failing

**Debug health check:**
```bash
# Manual health check
docker exec norstudio wget -O- http://localhost:3003/api/health

# Check container logs
docker logs norstudio | grep health

# Inspect health status
docker inspect --format='{{json .State.Health}}' norstudio | jq
```

#### 5. Slow Performance

**Check resources:**
```bash
docker stats norstudio
```

**Increase limits:**
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '2.0'
```

### Debug Mode

```bash
# Run with debug logging
docker run -e DEBUG=* -p 3003:3003 norchain/norstudio:latest

# Interactive shell
docker exec -it norstudio /bin/sh

# Check process
docker top norstudio
```

### Clean Up

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

## Additional Resources

- [NorStudio Documentation](./README.md)
- [Testing Guide](./TESTING.md)
- [NorChain Documentation](../../docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)

## Support

For issues or questions:
- GitHub Issues: [norchain-monorepo/issues](https://github.com/norchain/monorepo/issues)
- Documentation: [docs.norchain.org](https://docs.norchain.org)
- Community: [Discord](https://discord.gg/norchain)

---

**Version:** 1.0.0
**Last Updated:** 2025-11-13
**Maintained by:** NorChain Development Team
