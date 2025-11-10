# Supabase Complete Setup Guide

## ✅ Current Status

### Database Connection
- ✅ **Connected**: Supabase PostgreSQL database is connected
- ✅ **Tables Created**: All 15 tables created successfully
- ✅ **Connection String**: Properly configured with URL-encoded password

### Row Level Security (RLS)
- ⚠️ **Status**: RLS policies need to be applied manually
- 📋 **SQL File**: `scripts/setup-rls-policies-direct.sql`
- 🔗 **Location**: Supabase Dashboard → SQL Editor

### Real-time
- ⚠️ **Status**: Real-time needs to be enabled manually
- 📋 **SQL File**: `scripts/enable-realtime-direct.sql`
- 🔗 **Location**: Supabase Dashboard → Database → Replication

### Migrations
- ✅ **Migration Created**: `src/migrations/1700000000000-InitialSchema.ts`
- ⚠️ **Status**: Using `synchronize=true` for development (migrations optional)

## 🚀 Complete Setup Steps

### 1. Apply RLS Policies

**Option A: Via SQL Editor (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/setup-rls-policies-direct.sql`
3. Paste and run

**Option B: Via Script**
```bash
npm run db:setup-rls
```
Note: This requires service role key and may need manual application.

### 2. Enable Real-time

**Option A: Via Dashboard (Recommended)**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for:
   - `blocks`
   - `transactions`
   - `token_transfers`
   - `notifications`

**Option B: Via SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/enable-realtime-direct.sql`
3. Paste and run

### 3. Verify Setup

```bash
# Test database connection
npm run db:test

# Check real-time status
npm run db:check-realtime

# Verify complete setup
npm run db:verify
```

## 📊 Supabase Features Utilization

### ✅ Currently Using
- **PostgreSQL Database**: Full database with all tables
- **Authentication**: Supabase Auth service integrated
- **Storage**: Supabase Storage service available
- **Real-time**: Infrastructure ready (needs enabling)

### ⚠️ Needs Configuration
- **RLS Policies**: Must be applied manually
- **Real-time Replication**: Must be enabled manually
- **Storage Buckets**: Create if using file storage

### 🔄 Available but Not Fully Utilized
- **Edge Functions**: Not yet implemented
- **Database Functions**: Can be added for complex queries
- **PostgREST API**: Available but using NestJS API instead
- **Storage Policies**: Can be added for fine-grained access control

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Database Tests
```bash
npm run db:test
```

## 📝 Migration Strategy

### Development (Current)
- Using `synchronize=true` for automatic schema updates
- Migrations are optional but available

### Production (Recommended)
- Disable `synchronize`
- Use explicit migrations:
  ```bash
  npm run migration:generate -- src/migrations/MigrationName
  npm run migration:run
  ```

## 🔒 Security Checklist

- [x] Database connection secured (SSL)
- [ ] RLS policies applied
- [ ] Service role key secured (not in client code)
- [ ] Anon key properly configured
- [ ] Storage buckets configured (if using)
- [ ] Real-time access controlled (if needed)

## 🎯 Next Steps

1. **Apply RLS Policies**: Run `setup-rls-policies-direct.sql` in SQL Editor
2. **Enable Real-time**: Enable replication in Dashboard or run SQL
3. **Create Storage Buckets**: If using file storage features
4. **Test Everything**: Run all tests to verify setup
5. **Review Policies**: Adjust RLS policies as needed for your use case

## 📚 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)

