# NorChain Monorepo Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NEX Exchange                         │
│              (Next.js Frontend Only)                    │
│                                                         │
│  - UI Components                                        │
│  - Wallet Connection                                    │
│  - API Client (calls Explorer API)                      │
│  - No Database Access                                   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API
                   │
┌──────────────────▼──────────────────────────────────────┐
│                 Explorer API                            │
│              (NestJS Backend)                           │
│                                                         │
│  - REST API Endpoints                                   │
│  - Business Logic                                       │
│  - Database Access (Supabase/PostgreSQL)               │
│  - Caching (Redis)                                      │
│  - Authentication                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Supabase/PostgreSQL                        │
│              (Shared Database)                          │
│                                                         │
│  - Blocks, Transactions                                 │
│  - Accounts, Tokens                                    │
│  - Orders, Trades                                       │
│  - Portfolio Data                                       │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. NEX Exchange (Frontend)

**Location**: `apps/nex-exchange/`

**Technology**: Next.js 14 + TypeScript

**Responsibilities**:
- User interface
- Wallet connection (Wagmi)
- API calls to Explorer API
- Client-side state management
- No direct database access

**Port**: 3001 (or next available)

### 2. Explorer API (Backend)

**Location**: `apps/explorer-api/`

**Technology**: NestJS + TypeScript

**Responsibilities**:
- REST API endpoints
- Business logic
- Database operations
- Authentication
- Caching
- Rate limiting

**Port**: 3000

**Endpoints**:
- `/api/swap/*` - Swap operations
- `/api/orders/*` - Order management
- `/api/prices` - Price data
- `/api/portfolio` - Portfolio data
- `/api/account/*` - Account operations
- `/api/block/*` - Block data
- `/api/transaction/*` - Transaction data

### 3. Shared Database

**Technology**: Supabase/PostgreSQL

**Access**: Only through Explorer API

**Tables**:
- Explorer API tables (blocks, transactions, etc.)
- NEX Exchange tables (orders, trades, etc.)

## Data Flow

### Swap Flow

```
User → NEX Exchange UI
  ↓
NEX Exchange calls Explorer API
  ↓ POST /api/swap/quote
Explorer API queries database/cache
  ↓
Explorer API aggregates prices from DEXs
  ↓
Returns quote to NEX Exchange
  ↓
User confirms → POST /api/swap/execute
Explorer API executes swap
  ↓
Saves to database
  ↓
Returns result to NEX Exchange
```

### Order Flow

```
User → NEX Exchange UI
  ↓
Creates limit order
  ↓ POST /api/orders/limit
Explorer API saves to database
  ↓
Returns order ID
  ↓
NEX Exchange displays order
```

## Configuration

### Environment Variables

**Explorer API** (`.env`):
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
PORT=3000
```

**NEX Exchange** (`.env.local`):
```env
NEXT_PUBLIC_EXPLORER_API_URL=http://localhost:3000
NEXT_PUBLIC_NORCHAIN_RPC=https://rpc.norchain.org
```

## Benefits

✅ **Separation of Concerns** - Frontend and backend clearly separated  
✅ **Single Database** - No data sync issues  
✅ **API-First** - Frontend can be replaced easily  
✅ **Better Security** - Database access only through API  
✅ **Easier Testing** - Test API independently  
✅ **Scalability** - Scale API and frontend independently  

---

**Status**: ✅ **ARCHITECTURE COMPLETE**

