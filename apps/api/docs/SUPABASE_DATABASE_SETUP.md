# Supabase Database Setup Guide

## Overview

This guide explains how to clean up, migrate, and set up the Supabase database for the NorChain API.

## Prerequisites

1. **Supabase Project**: Active Supabase project
2. **Database URL**: Valid `SUPABASE_DB_URL` in `.env`
3. **Network Access**: Ability to connect to Supabase database

## Available Scripts

### 1. Database Cleanup
```bash
npm run db:cleanup
```
Drops all tables in the database. Requires confirmation unless `--force` flag is used.

**Warning**: This will delete all data!

### 2. Database Setup (Simple)
```bash
npm run db:setup:simple
```
Creates tables directly from entities using synchronize mode. This is the recommended approach for initial setup.

### 3. Database Setup (With Migrations)
```bash
npm run db:setup
```
Sets up database using TypeORM migrations. Requires migrations to be generated first.

### 4. Complete Reset
```bash
npm run db:reset
```
Performs cleanup, generates migrations, and sets up the database in one command.

## Setup Process

### Step 1: Verify Configuration

Check your `.env` file has:
```env
USE_SUPABASE=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Step 2: Test Database Connection

Verify you can connect to the database:
```bash
# Test connection
node -e "
const { AppDataSource } = require('./dist/config/data-source.js');
AppDataSource.initialize()
  .then(() => { console.log('✅ Connected'); process.exit(0); })
  .catch((e) => { console.error('❌ Failed:', e.message); process.exit(1); });
"
```

### Step 3: Setup Database

**Option A: Simple Setup (Recommended)**
```bash
npm run db:setup:simple
```

**Option B: With Migrations**
```bash
# Generate migrations
npm run migration:generate -- src/migrations/InitialMigration

# Run migrations
npm run migration:run
```

## Troubleshooting

### Database Connection Errors

**Error**: `getaddrinfo ENOTFOUND db.xxx.supabase.co`

**Solutions**:
1. Verify `SUPABASE_DB_URL` is correct in `.env`
2. Check if Supabase project is active (not paused)
3. Verify network connectivity
4. Check if database password is correct

**Error**: `password authentication failed`

**Solutions**:
1. Verify database password in `SUPABASE_DB_URL`
2. Reset database password in Supabase dashboard
3. Update `.env` with new password

### Migration Errors

**Error**: `Cannot find module '@/modules/...'`

**Solution**: Use simple setup mode instead:
```bash
npm run db:setup:simple
```

### Path Alias Issues

If TypeORM CLI can't resolve path aliases, use the simple setup:
```bash
npm run db:setup:simple
```

## Database Tables

After setup, the following tables should be created:

- `blocks` - Blockchain blocks
- `transactions` - Blockchain transactions
- `transaction_logs` - Transaction event logs
- `token_transfers` - Token transfer records
- `nft_transfers` - NFT transfer records
- `token_holders` - Token holder balances
- `token_metadata` - Token metadata
- `contracts` - Smart contract information
- `api_usage` - API usage statistics
- `users` - User accounts
- `api_keys` - API key management
- `notifications` - User notifications
- `limit_orders` - Limit order records
- `dca_schedules` - DCA schedule records
- `stop_loss_orders` - Stop loss order records
- `migrations` - Migration tracking

## Post-Setup Tasks

### 1. Enable Real-Time

In Supabase dashboard, enable real-time for tables that need it:
- `blocks`
- `transactions`
- `token_transfers`
- `notifications`

### 2. Set Up Row Level Security (RLS)

Enable RLS policies for user-specific data:
- `users` - Users can only see/update their own data
- `api_keys` - Users can only manage their own keys
- `notifications` - Users can only see their own notifications

### 3. Create Storage Buckets

If using Supabase Storage:
- `avatars` - User avatars (public)
- `documents` - User documents (private)
- `contracts` - Contract source code (public)

### 4. Create Indexes

Consider adding indexes for frequently queried columns:
- `transactions.from_address`
- `transactions.to_address`
- `blocks.number`
- `token_holders.token_address`

## Verification

After setup, verify tables exist:

```bash
node -e "
const { AppDataSource } = require('./dist/config/data-source.js');
AppDataSource.initialize()
  .then(async (ds) => {
    const tables = await ds.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    \`);
    console.log('Tables:', tables.map(t => t.table_name).join(', '));
    await ds.destroy();
  });
"
```

## Notes

- **Synchronize Mode**: Simple setup uses `synchronize: true` which creates tables from entities
- **Migrations**: For production, use migrations instead of synchronize
- **Data Loss**: Cleanup scripts will delete all data - use with caution
- **Backup**: Always backup your database before running cleanup scripts

