# API Rename Complete ✅

## Summary

Successfully renamed `explorer-api` to `api` to reflect its role as the unified backend for the entire NorChain ecosystem.

## Changes Made

### 1. Directory Structure
- ✅ Renamed `apps/explorer-api/` → `apps/api/`
- ✅ Updated package name: `@norchain/explorer-api` → `@norchain/api`

### 2. Docker Configuration
- ✅ Updated `docker-compose.yml`:
  - Service name: `explorer-api` → `api`
  - Container name: `norchain-explorer-api` → `norchain-api`
  - Port variable: `EXPLORER_API_PORT` → `API_PORT`
  - Internal URLs: `explorer-api:3000` → `api:3000`
- ✅ Updated `docker-compose.dev.yml` with same changes
- ✅ Added wallet port to CORS configuration

### 3. Code Updates
- ✅ **Explorer App** (`apps/explorer/`):
  - Updated all API client files to use `http://localhost:4000`
  - Updated WebSocket client URL
- ✅ **NEX Exchange** (`apps/nex-exchange/`):
  - Updated API config to use unified API URL
  - Changed variable names from `EXPLORER_API_URL` to `API_URL`
- ✅ **Landing Page** (`apps/landing/`):
  - Updated NetworkStats component API URL
- ✅ **Unified API** (`apps/api/`):
  - Updated Swagger title and description
  - Updated package.json description

### 4. Scripts
- ✅ Updated `scripts/test-connectivity.sh`:
  - Changed `EXPLORER_API_PORT` → `API_PORT`
  - Updated test labels to "Unified API"
  - Added wallet port support

### 5. Package Management
- ✅ Updated root `package.json`:
  - `explorer:dev` → `api:dev`
  - `explorer:build` → `api:build`
  - Workspace reference updated

### 6. Documentation
- ✅ Updated `README.md` with new structure
- ✅ Updated API references throughout docs

## New Structure

```
norchain-monorepo/
├── apps/
│   ├── api/              # Unified API (was explorer-api)
│   ├── explorer/         # Blockchain Explorer
│   ├── landing/          # Landing Page
│   ├── nex-exchange/     # DEX Platform
│   ├── docs/             # Documentation
│   └── wallet/           # Wallet (to be added)
```

## API Responsibilities

The unified API (`apps/api`) now serves:

1. **Explorer** - Block, transaction, account data
2. **Wallet** - Wallet operations, transactions, balances
3. **Exchange** - Swap, orders, prices, portfolio
4. **All Services** - Single source of truth for backend operations

## Port Configuration

| Service | Internal Port | External Port | Variable |
|---------|--------------|---------------|----------|
| Unified API | 3000 | 4000 | `API_PORT` |
| Explorer App | 3002 | 4002 | `EXPLORER_APP_PORT` |
| Landing Page | 3010 | 4010 | `LANDING_PORT` |
| Documentation | 3011 | 4011 | `DOCS_PORT` |
| NEX Exchange | 3001 | 4001 | `NEX_EXCHANGE_PORT` |
| Wallet | 3010 | 4020 | `WALLET_PORT` |

## Environment Variables

### Unified API (`apps/api/.env`)
```env
DATABASE_URL=postgresql://...
PORT=3000
```

### Frontend Apps (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Migration Notes

### For Developers

1. **Update local environment**:
   ```bash
   # Old
   NEXT_PUBLIC_EXPLORER_API_URL=http://localhost:3000
   
   # New
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

2. **Update scripts**:
   ```bash
   # Old
   npm run explorer:dev
   
   # New
   npm run api:dev
   ```

3. **Docker commands**:
   ```bash
   # Old
   docker-compose logs explorer-api
   
   # New
   docker-compose logs api
   ```

### Breaking Changes

- ⚠️ Environment variable `EXPLORER_API_PORT` → `API_PORT`
- ⚠️ Docker service name `explorer-api` → `api`
- ⚠️ Package name `@norchain/explorer-api` → `@norchain/api`
- ⚠️ Default API URL changed from `:3000` → `:4000`

## Next Steps

1. ✅ API renamed and updated
2. ⏳ Add wallet app to monorepo
3. ⏳ Update wallet to use unified API
4. ⏳ Add wallet endpoints to API
5. ⏳ Update all documentation

## Verification

```bash
# Test API is running
curl http://localhost:4000/api/v1/health

# Test connectivity script
./scripts/test-connectivity.sh

# Check Docker services
docker-compose ps
```

All changes complete! The API is now positioned as the unified backend for the entire NorChain ecosystem.

