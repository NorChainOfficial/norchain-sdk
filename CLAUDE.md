# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## NorChain Monorepo Architecture

This is a blockchain infrastructure monorepo focused on core blockchain services with the following applications:

- **Unified API** (`apps/api`) - NestJS backend serving all applications
- **Explorer** (`apps/explorer`) - Next.js blockchain explorer frontend  
- **Landing Page** (`apps/landing`) - Marketing website
- **NEX Exchange** (`apps/nex-exchange`) - DEX platform frontend
- **Documentation** (`apps/docs`) - Nextra documentation site

**Note**: Wallet applications have been moved to `backup/wallets/` for potential extraction into separate repositories. This allows wallets to support multiple blockchain networks independently.

### Unified Backend Pattern

All frontend applications connect to a single NestJS API (`apps/api`) which handles:
- Database operations (PostgreSQL via TypeORM)
- Redis caching
- Business logic for all ecosystem services
- Real-time WebSocket connections

Frontend applications are stateless and communicate only through API calls.

## Development Commands

### Root Level Commands
```bash
# Install all dependencies
npm install

# Run all services in development
npm run dev

# Build all workspaces
npm run build

# Test all workspaces  
npm test

# Lint all workspaces
npm run lint
```

### API Development (`apps/api`)
```bash
# Development server (with hot reload)
npm run api:dev

# Build for production
npm run api:build

# Run tests
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:integration  # Integration tests
npm run test:all          # All test suites
npm run test:cov          # Coverage report

# Linting and formatting
npm run lint
npm run format

# Database migrations
npm run migration:generate
npm run migration:run
npm run migration:revert

# Documentation
npm run docs:generate
npm run docs:dev
```

### Frontend Applications
```bash
# NEX Exchange
npm run nex:dev
npm run nex:build
npm run nex:check

# Explorer  
cd apps/explorer
npm run dev
npm run build
npm run test              # Playwright tests

# Documentation
npm run docs:dev
npm run docs:build
```

## Module Architecture (API)

The NestJS API follows a modular architecture with these key modules:

### Core Modules
- **AuthModule** - Authentication and authorization
- **AccountModule** - User account management  
- **TransactionModule** - Blockchain transaction handling
- **BlockModule** - Block data and indexing
- **TokenModule** - Token information and management

### Blockchain Modules
- **BlockchainModule** - Core blockchain services (StateRootService, ValidatorService, ConsensusService)
- **AIModule** - AI services (TransactionAnalysisService, ContractAuditService, GasPredictionService)
- **GasModule** - Gas price tracking and prediction
- **ProxyModule** - RPC proxy services
- **IndexerModule** - Blockchain data indexing

### Exchange Modules  
- **SwapModule** - DEX swap operations
- **OrdersModule** - Order management (limit, stop-loss, DCA)
- **AnalyticsModule** - Trading analytics

### Infrastructure Modules
- **SupabaseModule** - Database integration
- **WebSocketModule** - Real-time connections
- **CacheModule** - Redis caching (global, 5-minute TTL default)
- **NotificationsModule** - Push notifications
- **HealthModule** - Health checks and monitoring
- **MonitoringModule** - System monitoring

### Adding New Modules
1. Create module in `apps/api/src/modules/`
2. Add to imports in `apps/api/src/app.module.ts`
3. Frontend apps access via API client calls

## Testing Strategy

### API Testing
- Unit tests for all services (`.spec.ts` files)
- Integration tests in `test/` directory with specialized suites:
  - Blockchain integrity tests
  - Security and penetration tests  
  - Performance and stress tests
  - Compliance tests (GDPR, Sharia)
- E2E tests for API endpoints
- Comprehensive test coverage targeting 100%

### Frontend Testing
- **Explorer**: Playwright tests for UI interactions
- **NEX Exchange**: Jest unit tests + Playwright E2E + performance testing with k6
- Security audits with OWASP scanning

## Key Configuration

### Environment Setup
Each application requires environment configuration:

**API** (`.env.local`):
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT` - Redis cache
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` - Database integration
- Rate limiting: `THROTTLE_TTL`, `THROTTLE_LIMIT`

**Frontend Apps** (`.env.local`):
- `NEXT_PUBLIC_API_URL=http://localhost:4000` - API endpoint
- `NEXT_PUBLIC_NORCHAIN_RPC` - Blockchain RPC URL

### Ports
- API: 4000 (external), 3000 (internal)
- Explorer: 3002  
- NEX Exchange: 3001
- Landing/Docs: varies

## Development Workflow

1. Start with API development for new features
2. Add modules to API for business logic
3. Frontend applications consume API endpoints
4. Comprehensive testing at each layer
5. All applications share the PostgreSQL database through the unified API

## Wallet Applications (Backup)

Wallet applications have been moved to `backup/wallets/` to separate concerns:
- `backup/wallets/web-wallet/` - Next.js web wallet
- `backup/wallets/android-wallet/` - Android native wallet
- `backup/wallets/ios-wallet/` - iOS native wallet  
- `backup/wallets/chrome-extension/` - Chrome extension
- `backup/wallets/desktop-wallet/` - Desktop Tauri wallet
- `backup/wallets/wallet-core/` - Shared Rust core library

These can be extracted to separate repositories to support multiple blockchain networks independently from the core NorChain infrastructure.

The architecture ensures consistency, maintains a single source of truth for blockchain infrastructure, and enables independent deployment of frontend applications.