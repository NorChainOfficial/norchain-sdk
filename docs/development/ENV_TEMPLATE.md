# Environment Variables Template

Copy this to `.env` file and customize:

```env
# Database Configuration
DB_NAME=norchain_explorer
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Blockchain RPC
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

# Frontend API URLs (for browser access)
# These should use the external ports
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_EXPLORER_API_URL=http://localhost:4000
NEXT_PUBLIC_RPC_URL=https://rpc.norchain.org
NEXT_PUBLIC_CHAIN_ID=65001
```

## Port Mapping

| Service | Internal Port | Default External Port | Configurable |
|---------|--------------|---------------------|--------------|
| Explorer API | 3000 | 4000 | EXPLORER_API_PORT |
| Explorer App | 3002 | 4002 | EXPLORER_APP_PORT |
| Landing Page | 3010 | 4010 | LANDING_PORT |
| Documentation | 3011 | 4011 | DOCS_PORT |
| NEX Exchange | 3001 | 4001 | NEX_EXCHANGE_PORT |
| PostgreSQL | 5432 | 5433 | POSTGRES_PORT |
| Redis | 6379 | 6380 | REDIS_PORT |

## Why Unique Ports?

- **4000+ range**: Avoids conflicts with common development ports (3000-3999)
- **5433 for PostgreSQL**: Avoids conflict with default PostgreSQL (5432)
- **6380 for Redis**: Avoids conflict with default Redis (6379)
- **Configurable**: All ports can be changed via environment variables

## Customization

To use different ports, set them in `.env`:

```env
EXPLORER_API_PORT=5000
EXPLORER_APP_PORT=5002
# ... etc
```

Then update `NEXT_PUBLIC_API_URL` accordingly:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

