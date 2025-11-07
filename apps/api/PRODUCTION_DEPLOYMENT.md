# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured (optional)
- SSL certificate (for HTTPS)

## Quick Deploy with Docker

### 1. Clone/Setup

```bash
cd /Volumes/Development/sahalat/norchain-explorer-api
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with production values
```

**Important Production Settings:**

```env
NODE_ENV=production
JWT_SECRET=strong-random-secret-min-32-chars
DB_PASSWORD=strong-database-password
CORS_ORIGIN=https://yourdomain.com
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
docker-compose exec api npm run migration:run
```

### 5. Verify

```bash
curl http://localhost:3000/api/v1/health
```

## Deployment Options

### Option 1: Docker Compose (Single Server)

Best for: Small to medium deployments

```bash
docker-compose up -d
```

### Option 2: Kubernetes

Best for: Large scale, high availability

See `k8s/` directory for Kubernetes manifests.

### Option 3: PM2 (Node.js Process Manager)

Best for: Direct Node.js deployment

```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name norchain-api
pm2 save
pm2 startup
```

## Environment Variables

### Required

- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (min 32 characters)
- `RPC_URL`

### Recommended

- `REDIS_HOST`, `REDIS_PORT` (for caching)
- `CORS_ORIGIN` (restrict to your domain)
- `USE_SUPABASE=true` (for real-time features)

## Security Checklist

- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Strong database password
- [ ] HTTPS enabled (via reverse proxy)
- [ ] CORS restricted to your domain
- [ ] Rate limiting configured
- [ ] Security headers enabled (Helmet)
- [ ] Database backups configured
- [ ] Monitoring and logging setup

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.norchain.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.norchain.org;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### Health Checks

```bash
# Liveness
curl http://localhost:3000/api/v1/health/live

# Readiness
curl http://localhost:3000/api/v1/health/ready

# Full health
curl http://localhost:3000/api/v1/health
```

### Logs

```bash
# Docker logs
docker-compose logs -f api

# PM2 logs
pm2 logs norchain-api
```

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# Scale API service
docker-compose up -d --scale api=3
```

### Database Scaling

- Use read replicas for read-heavy workloads
- Connection pooling configured automatically
- Consider Supabase for managed scaling

## Backup

### Database Backup

```bash
# PostgreSQL
docker-compose exec postgres pg_dump -U postgres norchain_explorer > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres norchain_explorer < backup.sql
```

### Automated Backups

Set up cron job:

```bash
0 2 * * * docker-compose exec -T postgres pg_dump -U postgres norchain_explorer > /backups/norchain_$(date +\%Y\%m\%d).sql
```

## Performance Tuning

### Database

- Enable connection pooling (already configured)
- Add indexes for frequently queried fields
- Use read replicas for heavy read workloads

### Redis

- Configure memory limits
- Enable persistence (AOF)
- Use Redis cluster for high availability

### Application

- Enable compression (already enabled)
- Configure cache TTLs appropriately
- Monitor response times

## Troubleshooting

### API Not Starting

1. Check logs: `docker-compose logs api`
2. Verify environment variables
3. Check database connection
4. Verify port 3000 is available

### Database Connection Issues

1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check network connectivity
4. Review PostgreSQL logs

### High Memory Usage

1. Check for memory leaks
2. Reduce cache TTL
3. Limit connection pool size
4. Monitor with `docker stats`

---

**Production ready!** 🚀

