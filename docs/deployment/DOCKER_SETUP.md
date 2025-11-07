# Docker Setup Guide

Complete Docker configuration for the NorChain ecosystem.

## Quick Start

### Production Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Development Setup

```bash
# Start only database services
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run apps locally with hot reload
npm run dev
```

## Services

| Service | Internal Port | External Port | URL | Description |
|---------|--------------|---------------|-----|-------------|
| Explorer API | 3000 | 4000 | http://localhost:4000 | Backend API |
| Explorer App | 3002 | 4002 | http://localhost:4002 | Blockchain Explorer |
| Landing Page | 3010 | 4010 | http://localhost:4010 | Marketing Site |
| Documentation | 3011 | 4011 | http://localhost:4011 | Documentation |
| NEX Exchange | 3001 | 4001 | http://localhost:4001 | DEX Platform |
| PostgreSQL | 5432 | 5433 | localhost:5433 | Database |
| Redis | 6379 | 6380 | localhost:6380 | Cache |

**Note**: All external ports are configurable via environment variables. See `ENV_TEMPLATE.md` for details.

## Environment Variables

Create `.env` file in root directory:

```env
# Database
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key

# Blockchain
RPC_URL=https://rpc.norchain.org
CHAIN_ID=65001

# Service Ports (External - Host Machine)
EXPLORER_API_PORT=4000
EXPLORER_APP_PORT=4002
LANDING_PORT=4010
DOCS_PORT=4011
NEX_EXCHANGE_PORT=4001
POSTGRES_PORT=5433
REDIS_PORT=6380
```

## Docker Commands

### Build Services

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build explorer-api

# Build without cache
docker-compose build --no-cache
```

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d explorer-api

# Start with logs
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop explorer-api
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f explorer-api

# Last 100 lines
docker-compose logs --tail=100 explorer-api
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Check health
docker inspect --format='{{.State.Health.Status}}' norchain-explorer-api

# Test connectivity
./scripts/test-connectivity.sh
```

## Service Dependencies

```
PostgreSQL ──┐
             ├──> Explorer API ──┐
Redis ───────┘                   ├──> Explorer App
                                 ├──> Landing Page
                                 ├──> NEX Exchange
                                 └──> Documentation (no dependency)
```

## Networking

All services are on the `norchain-network` bridge network:

- **Internal**: Services can communicate using service names
  - `http://explorer-api:3000` (from other containers)
- **External**: Services exposed on host ports
  - `http://localhost:3000` (from host)

## Volumes

### Persistent Data

- `postgres-data`: PostgreSQL database files
- `redis-data`: Redis persistence files

### Backup Database

```bash
# Backup
docker exec norchain-postgres pg_dump -U postgres norchain_explorer > backup.sql

# Restore
docker exec -i norchain-postgres psql -U postgres norchain_explorer < backup.sql
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs explorer-api

# Check health
docker-compose ps

# Restart service
docker-compose restart explorer-api
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker exec -it norchain-postgres psql -U postgres -d norchain_explorer

# Check logs
docker-compose logs postgres
```

### Build Failures

```bash
# Clean build
docker-compose build --no-cache

# Remove old images
docker-compose down --rmi all

# Prune system
docker system prune -a
```

## Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Change database passwords
- [ ] Use strong passwords
- [ ] Enable SSL/TLS
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Use secrets management
- [ ] Enable logging and monitoring

### Scaling

```bash
# Scale Explorer API
docker-compose up -d --scale explorer-api=3

# Use load balancer (nginx/traefik)
# Configure in production environment
```

## Testing Connectivity

Run the connectivity test script:

```bash
./scripts/test-connectivity.sh
```

This will test:
- All service endpoints
- Health checks
- Database connectivity
- Redis connectivity

## Monitoring

### View Resource Usage

```bash
# Container stats
docker stats

# Service stats
docker-compose top
```

### Health Monitoring

All services have health checks configured:
- Explorer API: `/api/v1/health`
- Explorer App: `/api/health`
- Landing Page: `/`
- Documentation: `/`
- NEX Exchange: `/api/health`

## Next Steps

1. **Configure Environment**: Edit `.env` file
2. **Build Services**: `docker-compose build`
3. **Start Services**: `docker-compose up -d`
4. **Test Connectivity**: `./scripts/test-connectivity.sh`
5. **View Logs**: `docker-compose logs -f`
6. **Access Services**: Open URLs in browser
   - Explorer API: http://localhost:4000
   - Explorer App: http://localhost:4002
   - Landing Page: http://localhost:4010
   - Documentation: http://localhost:4011
   - NEX Exchange: http://localhost:4001

## Support

For issues:
- Check logs: `docker-compose logs`
- Check health: `docker-compose ps`
- Test connectivity: `./scripts/test-connectivity.sh`
- Review documentation: See individual app READMEs

