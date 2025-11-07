# Port Configuration

All services now use unique, configurable ports to avoid conflicts.

## Port Mapping

| Service | Internal Port | Default External Port | Environment Variable |
|---------|--------------|---------------------|---------------------|
| Explorer API | 3000 | **4000** | `EXPLORER_API_PORT` |
| Explorer App | 3002 | **4002** | `EXPLORER_APP_PORT` |
| Landing Page | 3010 | **4010** | `LANDING_PORT` |
| Documentation | 3011 | **4011** | `DOCS_PORT` |
| NEX Exchange | 3001 | **4001** | `NEX_EXCHANGE_PORT` |
| PostgreSQL | 5432 | **5433** | `POSTGRES_PORT` |
| Redis | 6379 | **6380** | `REDIS_PORT` |

## Why These Ports?

- **4000+ range**: Avoids conflicts with common development ports (3000-3999)
- **5433 for PostgreSQL**: Avoids conflict with default PostgreSQL (5432)
- **6380 for Redis**: Avoids conflict with default Redis (6379)
- **All configurable**: Change via environment variables

## Configuration

### Default Ports (in `.env`)

```env
EXPLORER_API_PORT=4000
EXPLORER_APP_PORT=4002
LANDING_PORT=4010
DOCS_PORT=4011
NEX_EXCHANGE_PORT=4001
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Custom Ports

To use different ports, set them in `.env`:

```env
EXPLORER_API_PORT=5000
EXPLORER_APP_PORT=5002
# ... etc
```

Then update frontend URLs accordingly:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Access URLs

With default ports:

- **Explorer API**: http://localhost:4000
- **Explorer App**: http://localhost:4002
- **Landing Page**: http://localhost:4010
- **Documentation**: http://localhost:4011
- **NEX Exchange**: http://localhost:4001
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6380

## Internal Communication

Services communicate internally using internal ports:

- Explorer API: `http://explorer-api:3000`
- Explorer App: `http://explorer:3002`
- Landing Page: `http://landing:3010`
- Documentation: `http://docs:3011`
- NEX Exchange: `http://nex-exchange:3001`
- PostgreSQL: `postgres:5432`
- Redis: `redis:6379`

## Testing

The connectivity test script automatically uses configured ports:

```bash
./scripts/test-connectivity.sh
```

It reads port configuration from environment variables or uses defaults.

## Port Conflicts

If you have port conflicts, change them in `.env`:

```bash
# Check what's using a port
lsof -i :4000

# Change port in .env
EXPLORER_API_PORT=5000
```

## Notes

- Internal ports remain the same (for container-to-container communication)
- Only external ports are configurable (for host access)
- CORS is automatically configured with the correct ports
- All documentation updated to reflect new ports

