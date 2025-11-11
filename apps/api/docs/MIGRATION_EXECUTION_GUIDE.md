# Database Migration Execution Guide

## 🚀 Quick Start

### Option 1: TypeORM CLI (Recommended)

```bash
npm run migration:run
```

### Option 2: Manual SQL Execution (Supabase)

1. Open Supabase SQL Editor
2. Copy SQL from `src/migrations/1738000000000-AddLedgerPaymentsMessagingModules.ts`
3. Execute the SQL statements
4. Verify tables created

### Option 3: TypeORM Synchronize (Development Only)

If `synchronize: true` is set in `database.config.ts`, tables will be auto-created from entities.

**⚠️ Warning**: Only use synchronize in development!

---

## 📋 Migration Details

### Migration File
- **Name**: `AddLedgerPaymentsMessagingModules1738000000000`
- **File**: `src/migrations/1738000000000-AddLedgerPaymentsMessagingModules.ts`
- **Tables Created**: 20

### Tables Created

#### Ledger Module (4 tables)
- `ledger_accounts`
- `journal_entries`
- `journal_lines`
- `period_closures`

#### Payments v2 Module (8 tables)
- `merchants`
- `products`
- `prices`
- `customers`
- `payment_methods`
- `checkout_sessions`
- `payments`
- `refunds`
- `subscriptions`
- `disputes`
- `webhook_endpoints`

#### Messaging Module (5 tables)
- `messaging_profiles`
- `conversations`
- `messages`
- `device_keys`
- `message_reactions`

---

## ✅ Verification

After running migration, verify tables exist:

```sql
-- Check all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'products', 'prices', 'customers', 'payment_methods',
  'checkout_sessions', 'payments', 'refunds', 'subscriptions', 'disputes',
  'webhook_endpoints', 'messaging_profiles', 'conversations', 'messages',
  'device_keys', 'message_reactions'
)
ORDER BY table_name;
```

---

## 🔄 Rollback

To rollback the migration:

```bash
npm run migration:revert
```

Or manually drop tables (see migration file `down()` method).

---

## 🐛 Troubleshooting

### Issue: Migration fails with connection error
**Solution**: Check database credentials in `.env` file

### Issue: Tables already exist
**Solution**: Migration is idempotent - safe to run multiple times

### Issue: Foreign key constraints fail
**Solution**: Ensure parent tables exist before child tables

---

## 📊 Post-Migration Checklist

- [ ] All 20 tables created successfully
- [ ] Indexes created
- [ ] Foreign keys established
- [ ] Constraints applied
- [ ] Test database connection
- [ ] Run test suite

---

**Status**: ✅ Migration Ready for Execution

