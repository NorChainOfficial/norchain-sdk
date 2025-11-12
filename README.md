# NorChain

**Core NorChain blockchain infrastructure in a single repository**

This monorepo contains:
- **Unified API** (`apps/api`) - NestJS backend API (handles all database operations for Explorer, Exchange, and blockchain services)
- **Explorer** (`apps/explorer`) - World-class blockchain explorer (production-ready, competing with Etherscan/BSCscan)
- **Landing Page** (`apps/landing`) - Marketing website
- **NEX Exchange** (`apps/nex-exchange`) - DEX platform frontend
- **Documentation** (`apps/docs`) - Nextra documentation site

> **Note**: Wallet applications have been moved to `backup/wallets/` for potential extraction into separate repositories, allowing them to support multiple blockchain networks independently.

## 🌟 Explorer - Production Ready

**NorExplorer** is a dedicated blockchain explorer focused on transparency, verification, and developer tools. It has been fully refactored and enhanced to compete with world-class explorers like Etherscan, BSCscan, and PolygonScan.

### Key Features

**Core Explorer Capabilities:**
- ✅ **Blocks Explorer** - Paginated block list with advanced filtering, export, and analytics
- ✅ **Transactions Explorer** - Full transaction details with advanced filtering, internal transactions, and export
- ✅ **Accounts/Addresses** - Balance tracking, token holdings, transaction history, and analytics
- ✅ **Contracts** - Contract verification (multi-file, JSON input, library linking), ABI viewer, source code viewer
- ✅ **Tokens** - Token details, holders list, transfers history, and price integration
- ✅ **Network Analytics** - Real-time network statistics, performance metrics, and health monitoring
- ✅ **Validators** - Validator network information and performance metrics

**Advanced Features:**
- ✅ **Universal Search** - Intelligent search for blocks, transactions, accounts, contracts, and tokens
- ✅ **Address Labels** - User-defined address labels for better organization
- ✅ **API Documentation** - Comprehensive API docs with interactive examples
- ✅ **API Key Management** - Developer portal for API key registration and management
- ✅ **Mobile Responsive** - Fully optimized for mobile, tablet, and desktop
- ✅ **Performance Optimized** - API caching, loading skeletons, and optimized rendering

**Developer Tools:**
- ✅ REST API with comprehensive endpoints
- ✅ GraphQL API for flexible queries
- ✅ WebSocket support for real-time updates
- ✅ API key registration and management
- ✅ Rate limiting and usage statistics
- ✅ Export tools (CSV/JSON)

**Port**: 4002 (external), 3002 (internal)  
**URL**: http://localhost:4002  
**API Docs**: http://localhost:4002/api  
**Status**: ✅ **PRODUCTION READY**

## 🏗️ Architecture

```
Frontend Apps → Unified API (Backend) → PostgreSQL/Redis
```

- **Frontend Apps**: Explorer, Landing, NEX Exchange - call Unified API endpoints
- **Unified API**: Backend API, handles all database operations for blockchain infrastructure
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
npm run explorer:dev    # Explorer on :4002
npm run nex:dev         # NEX Exchange on :3001
npm run docs:dev        # Documentation on :3000
```

## 📦 Workspaces

### Unified API (`apps/api`)

NestJS backend API - **handles all database operations for Explorer, Exchange, and all blockchain infrastructure services**.

**Port**: 4000 (external), 3000 (internal)  
**Docs**: http://localhost:4000/api-docs

**Key Endpoints**:
- `/api/block/*` - Block data and blockchain operations
- `/api/transaction/*` - Transaction data and analysis
- `/api/account/*` - Account operations and balances
- `/api/swap/*` - DEX swap operations
- `/api/orders/*` - Order management (limit, stop-loss, DCA)
- `/api/token/*` - Token information and metadata
- `/api/stats/*` - Network statistics and analytics

### Explorer (`apps/explorer`)

Next.js blockchain explorer frontend - **production-ready, world-class explorer**.

**Port**: 4002 (external), 3002 (internal)  
**URL**: http://localhost:4002

**Features**:
- Blocks, transactions, accounts, contracts, and tokens exploration
- Advanced filtering and search capabilities
- Contract verification with multi-file support
- Network analytics and real-time statistics
- API documentation and developer tools
- Mobile-responsive design
- Performance optimized with caching

### NEX Exchange (`apps/nex-exchange`)

Next.js DEX frontend - **no database access, calls Unified API**.

**Port**: 3001  
**URL**: http://localhost:3001

**Features**:
- Token swap interface
- Advanced order management (limit, stop-loss, DCA)
- Trading analytics and portfolio tracking
- Multi-wallet integration support

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
- [Explorer Specification](./docs/product/NOREXPLORER_SPECIFICATION.md) - Explorer features and capabilities
- [Explorer Implementation Plan](./docs/product/NOREXPLORER_IMPLEMENTATION_PLAN.md) - Implementation details
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

**Unified API**:
```bash
cd apps/api
npm run build
npm run start:prod
```

**Explorer**:
```bash
cd apps/explorer
npm run build
npm start
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
| `npm run api:dev` | Run Unified API only |
| `npm run explorer:dev` | Run Explorer only |
| `npm run nex:dev` | Run NEX Exchange only |
| `npm run docs:dev` | Run documentation site |
| `npm run check` | Run setup checks |

## 🔗 Links

- **Unified API**: http://localhost:4000
- **Explorer**: http://localhost:4002
- **Explorer API Docs**: http://localhost:4002/api
- **NEX Exchange**: http://localhost:3001
- **API Docs**: http://localhost:4000/api-docs
- **Documentation**: http://localhost:3000

## 📱 Wallet Applications (Backup)

Wallet applications have been moved to `backup/wallets/` to achieve better separation of concerns:

- `backup/wallets/web-wallet/` - Next.js web wallet
- `backup/wallets/android-wallet/` - Android native wallet (Kotlin/Compose)
- `backup/wallets/ios-wallet/` - iOS native wallet (SwiftUI)
- `backup/wallets/chrome-extension/` - Chrome extension wallet
- `backup/wallets/desktop-wallet/` - Desktop Tauri wallet
- `backup/wallets/wallet-core/` - Shared Rust core library

These can be extracted to separate repositories to:
- Support multiple blockchain networks (not just NorChain)
- Have independent development and deployment cycles
- Reduce coupling between blockchain infrastructure and wallet applications

See `backup/wallets/README.md` for extraction guidance.

---

**Status**: ✅ **BLOCKCHAIN INFRASTRUCTURE MONOREPO COMPLETE**
