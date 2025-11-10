# Supabase Database Setup Guide

**Date**: January 2025  
**Status**: ✅ **Configured and Ready**

---

## 🎯 Overview

The NorChain API is configured to use **Supabase** as the primary database. Supabase provides:
- ✅ Managed PostgreSQL database
- ✅ Built-in real-time subscriptions
- ✅ Auto-scaling infrastructure
- ✅ Global CDN
- ✅ Easy migrations

---

## 📋 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Fallback PostgreSQL (if not using Supabase)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=norchain_explorer
DB_SSL=false
```

### Getting Supabase Credentials

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for database to be provisioned

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Use the "Session" mode connection string

3. **Get API Keys**
   - Go to Project Settings → API
   - Copy the "Project URL" → `SUPABASE_URL`
   - Copy the "anon public" key → `SUPABASE_ANON_KEY`

---

## 🔧 Database Configuration

The API automatically detects Supabase configuration:

```typescript
// If USE_SUPABASE=true and SUPABASE_DB_URL is set
// → Uses Supabase PostgreSQL connection

// Otherwise
// → Falls back to regular PostgreSQL connection
```

**Location**: `apps/api/src/config/database.config.ts`

---

## 🚀 Features Enabled with Supabase

### 1. Real-Time Subscriptions ✅

The `SupabaseService` automatically subscribes to:
- **New Blocks** → Broadcasts via WebSocket
- **New Transactions** → Broadcasts to relevant addresses
- **Token Transfers** → Broadcasts to token holders
- **Token Holder Updates** → Real-time balance updates

**Location**: `apps/api/src/modules/supabase/supabase.service.ts`

### 2. Database Operations ✅

All TypeORM operations work seamlessly:
- ✅ CRUD operations
- ✅ Migrations
- ✅ Transactions
- ✅ Query builder
- ✅ Entity relationships

### 3. WebSocket Integration ✅

Real-time updates are automatically broadcast:
- Blocks → `/ws` → `block:new`
- Transactions → `/ws` → `transaction:new`
- Token Transfers → `/ws` → `token-transfer:new`

---

## 📊 Database Schema

The API uses these entities (automatically synced with Supabase):

- `blocks` - Blockchain blocks
- `transactions` - Transactions
- `transaction_logs` - Transaction event logs
- `token_transfers` - ERC-20 token transfers
- `nft_transfers` - NFT transfers
- `token_holders` - Token holder balances
- `contracts` - Smart contracts
- `token_metadata` - Token metadata
- `api_usage` - API usage statistics
- `users` - User accounts
- `api_keys` - API keys
- `notifications` - User notifications

---

## 🔄 Migration Strategy

### Option 1: TypeORM Migrations (Recommended)

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Option 2: Supabase SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Run your SQL migrations directly
3. TypeORM will detect schema changes

---

## 🧪 Testing with Supabase

### Local Development

1. **Use Supabase Local** (Optional):
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Start local Supabase
   supabase start

   # Get local connection string
   supabase status
   ```

2. **Use Supabase Cloud** (Recommended):
   - Create a development project
   - Use development project credentials
   - Test migrations and features

### CI/CD Testing

The CI/CD pipeline uses PostgreSQL for testing:
- Tests run against local PostgreSQL
- Production uses Supabase
- No changes needed to test code

---

## 🔒 Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use different projects for dev/staging/prod
- ✅ Rotate API keys regularly
- ✅ Use Row Level Security (RLS) in Supabase

### 2. Connection Security

- ✅ Always use SSL connections
- ✅ Use connection pooling
- ✅ Limit database access
- ✅ Use Supabase's built-in security features

### 3. API Keys

- ✅ Use `SUPABASE_ANON_KEY` for client-side (if needed)
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` only server-side (never expose)
- ✅ Store keys securely in environment variables

---

## 📈 Monitoring

### Supabase Dashboard

Monitor your database:
- **Database** → Tables → View data
- **Database** → Logs → Query performance
- **Database** → Connection Pooling → Monitor connections
- **API** → Logs → API usage

### Application Logs

The API logs Supabase events:
- Connection status
- Real-time subscription status
- Error messages
- Performance metrics

---

## 🐛 Troubleshooting

### Connection Issues

**Error**: `Connection refused`
- ✅ Check `SUPABASE_DB_URL` is correct
- ✅ Verify project is active
- ✅ Check network connectivity

**Error**: `SSL required`
- ✅ Ensure SSL is enabled in connection string
- ✅ Check Supabase project settings

### Real-Time Not Working

**Issue**: No WebSocket updates
- ✅ Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- ✅ Check SupabaseService logs
- ✅ Verify WebSocket gateway is running
- ✅ Check Supabase real-time is enabled

### Migration Issues

**Error**: Migration fails
- ✅ Check database permissions
- ✅ Verify connection string
- ✅ Check for conflicting migrations
- ✅ Review Supabase logs

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Connection string configured
- [ ] API keys set in `.env`
- [ ] `USE_SUPABASE=true` set
- [ ] Database migrations run
- [ ] Real-time subscriptions working
- [ ] WebSocket gateway running
- [ ] Health checks passing

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **TypeORM Docs**: https://typeorm.io
- **Real-Time Guide**: `apps/api/REALTIME_SETUP.md`
- **API Documentation**: `apps/api/README.md`

---

**Status**: ✅ **Ready for Production**

The API is fully configured to use Supabase. Set the environment variables and start using Supabase as your database!

