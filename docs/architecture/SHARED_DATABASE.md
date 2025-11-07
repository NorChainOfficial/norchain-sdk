# Shared Database Architecture

## Overview

Both **Explorer API** and **NEX Exchange** share the same **Supabase/PostgreSQL** database.

- **Explorer API**: Backend API (NestJS) - handles all database operations
- **NEX Exchange**: Frontend only (Next.js) - calls Explorer API endpoints

## Database Schema

The shared database includes tables for:

### Explorer API Tables
- `blocks` - Block data
- `transactions` - Transaction data
- `accounts` - Account information
- `tokens` - Token metadata
- `contracts` - Contract information

### NEX Exchange Tables (via Explorer API)
- `limit_orders` - Limit orders
- `stop_loss_orders` - Stop-loss orders
- `dca_schedules` - DCA schedules
- `trades` - Trade history
- `portfolio_snapshots` - Portfolio analytics
- `price_history` - Price charts

## Configuration

### Explorer API

Uses Supabase connection in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/norchain
# OR Supabase connection string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### NEX Exchange

No direct database connection. All operations go through Explorer API:

```env
NEXT_PUBLIC_EXPLORER_API_URL=http://localhost:3000
```

## API Endpoints

NEX Exchange calls Explorer API:

- `POST /api/swap/quote` - Get swap quote
- `POST /api/swap/execute` - Execute swap
- `POST /api/orders/limit` - Create limit order
- `GET /api/orders/limit?user=0x...` - Get limit orders
- `POST /api/orders/stop-loss` - Create stop-loss order
- `POST /api/orders/dca` - Create DCA schedule
- `GET /api/prices` - Get token prices
- `GET /api/portfolio?address=0x...` - Get portfolio

## Benefits

✅ **Single Source of Truth** - One database for all data  
✅ **Consistent Data** - No sync issues  
✅ **Simplified Frontend** - No database logic in frontend  
✅ **Better Security** - Database access only through API  
✅ **Easier Scaling** - API can scale independently  

## Migration

To use shared database:

1. **Explorer API**: Already configured with Supabase
2. **NEX Exchange**: Remove direct DB access, use API calls
3. **Database**: Run migrations from Explorer API

---

**Status**: ✅ **SHARED DATABASE ARCHITECTURE COMPLETE**

