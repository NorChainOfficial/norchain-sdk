# Docker Quick Start

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 4000, 4001, 4002, 4010, 4011, 5433, 6380 available (configurable)

## Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd norchain-monorepo

# 2. Create environment file
cat > .env << EOF
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-me-in-production
RPC_URL=https://rpc.norchain.org
CHAIN_ID=65001
EXPLORER_API_PORT=4000
EXPLORER_APP_PORT=4002
LANDING_PORT=4010
DOCS_PORT=4011
NEX_EXCHANGE_PORT=4001
POSTGRES_PORT=5433
REDIS_PORT=6380
EOF

# 3. Start all services
docker-compose up -d

# 4. Wait for services to start (about 30 seconds)
sleep 30

# 5. Test connectivity
./scripts/test-connectivity.sh

# 6. Access services
# - Explorer API: http://localhost:4000
# - Explorer App: http://localhost:4002
# - Landing Page: http://localhost:4010
# - Documentation: http://localhost:4011
# - NEX Exchange: http://localhost:4001
```

## Service Status

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

```bash
# View logs for specific service
docker-compose logs -f explorer-api

# Restart service
docker-compose restart explorer-api

# Rebuild service
docker-compose build explorer-api
docker-compose up -d explorer-api
```

For detailed documentation, see `DOCKER_SETUP.md`.

