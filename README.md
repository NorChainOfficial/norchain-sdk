# NorChain Monorepo

**Complete NorChain ecosystem in a single repository**

This monorepo contains:
- **Unified API** (`apps/api`) - NestJS backend API (handles all database operations for Explorer, Wallet, Exchange, and all services)
- **Explorer** (`apps/explorer`) - Blockchain explorer frontend
- **Landing Page** (`apps/landing`) - Marketing website
- **NEX Exchange** (`apps/nex-exchange`) - DEX platform frontend
- **Wallet** (`apps/wallet`) - Multi-platform cryptocurrency wallet web app
- **Wallet Android** (`apps/wallet-android`) - Android native wallet app (Kotlin/Compose)
- **Wallet iOS** (`apps/wallet-ios`) - iOS native wallet app (SwiftUI)
- **Documentation** (`apps/docs`) - Nextra documentation site

## 🏗️ Architecture

```
All Apps (Frontend) → Unified API (Backend) → PostgreSQL/Redis
```

- **All Frontend Apps**: Explorer, Landing, NEX Exchange, Wallet - call Unified API endpoints
- **Unified API**: Backend API, handles all database operations for entire ecosystem
- **Shared Database**: PostgreSQL used by Unified API, Redis for caching

## 🚀 Quick Start

### Install All Dependencies

```bash
npm install
```

### Configure Environment

**Unified API** (`apps/api/.env`):
```env
DATABASE_URL=postgresql://user:password@host:5432/norchain
PORT=3000
```

**Frontend Apps** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org
```

### Run All Services

```bash
# Run both services in parallel
npm run dev

# Or run individually
npm run api:dev         # Unified API on :4000
npm run nex:dev         # NEX Exchange on :4001
```

## 📦 Workspaces

### Unified API (`apps/api`)

NestJS backend API - **handles all database operations for Explorer, Wallet, Exchange, and all ecosystem services**.

**Port**: 4000 (external), 3000 (internal)  
**Docs**: http://localhost:4000/api-docs

**Endpoints**:
- `/api/swap/*` - Swap operations
- `/api/orders/*` - Order management (limit, stop-loss, DCA)
- `/api/prices` - Token prices
- `/api/portfolio` - Portfolio data
- `/api/account/*` - Account operations
- `/api/block/*` - Block data
- `/api/transaction/*` - Transaction data

### NEX Exchange (`apps/nex-exchange`)

Next.js frontend - **no database access, calls Explorer API**.

**Port**: 3001  
**URL**: http://localhost:3001

**Features**:
- Swap interface
- Order management UI
- Portfolio tracking
- Wallet connection

## 🔧 Development

### Adding New API Endpoints

1. Add module to `apps/api/src/modules/`
2. Register in `apps/api/src/app.module.ts`
3. Call from NEX Exchange using `api-client.ts`

### Shared Database

Both projects use the same Supabase database:
- **Explorer API** connects directly
- **NEX Exchange** accesses via API calls

See [SHARED_DATABASE.md](./SHARED_DATABASE.md) for details.

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture
- [Shared Database](./SHARED_DATABASE.md) - Database setup
- [Unified API README](./apps/api/README.md)
- [NEX Exchange README](./apps/nex-exchange/README.md)

## 🧪 Testing

```bash
# Test all workspaces
npm test

# Test specific workspace
npm test --workspace=@norchain/api
npm test --workspace=@norchain/nex-exchange
```

## 🚢 Deployment

Each workspace can be deployed independently:

**Explorer API**:
```bash
cd apps/api
npm run build
npm run start:prod
```

**NEX Exchange**:
```bash
cd apps/nex-exchange
npm run build
npm start
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run all services in development |
| `npm run build` | Build all workspaces |
| `npm test` | Run all tests |
| `npm run explorer:dev` | Run Explorer API only |
| `npm run nex:dev` | Run NEX Exchange only |
| `npm run check` | Run setup checks |

## 🔗 Links

- **Explorer API**: http://localhost:3000
- **NEX Exchange**: http://localhost:3001
- **API Docs**: http://localhost:3000/api-docs

---

**Status**: ✅ **MONOREPO WITH SHARED DATABASE COMPLETE**
