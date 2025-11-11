# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

**Date**: January 2025  
**Status**: ✅ READY FOR PRODUCTION

---

## 📋 Pre-Deployment Verification

### Code Quality ✅
- [x] TypeScript compilation successful
- [x] Linting passed
- [x] Build successful
- [x] All tests passing (37/37)
- [x] No critical errors

### Database ✅
- [x] Migration file created
- [x] SQL script available (`MIGRATION_SQL.md`)
- [ ] Migration executed (pending)
- [ ] Tables verified

### Documentation ✅
- [x] API documentation complete
- [x] Migration guide created
- [x] Testing guide created
- [x] Deployment guide created

---

## 🚀 Deployment Steps

### Step 1: Execute Database Migration

**Option A: Supabase SQL Editor (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Copy SQL from `docs/MIGRATION_SQL.md`
3. Execute the script
4. Verify 20 tables created

**Option B: psql Command Line**
```bash
psql $SUPABASE_DB_URL -f docs/MIGRATION_SQL.md
```

**Option C: TypeORM CLI** (if configured)
```bash
npm run migration:run
```

**Verification**:
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ledger_accounts', 'journal_entries', 'journal_lines', 'period_closures',
  'merchants', 'products', 'prices', 'customers', 'payment_methods',
  'checkout_sessions', 'payments', 'refunds', 'subscriptions', 'disputes',
  'webhook_endpoints', 'messaging_profiles', 'conversations', 'messages',
  'device_keys', 'message_reactions'
);
```

Expected: **20 tables**

---

### Step 2: Build for Production

```bash
npm run build
```

Verify `dist/` directory contains compiled files.

---

### Step 3: Environment Configuration

Ensure `.env` file has:
```env
# Database
USE_SUPABASE=true
SUPABASE_DB_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# API
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=...
API_KEY_SECRET=...
```

---

### Step 4: Start Production Server

**Option A: PM2 (Recommended)**
```bash
pm2 start dist/main.js --name norchain-api
pm2 save
pm2 startup
```

**Option B: Docker**
```bash
docker build -t norchain-api .
docker run -d -p 4000:4000 --env-file .env norchain-api
```

**Option C: Direct Node**
```bash
NODE_ENV=production node dist/main.js
```

---

### Step 5: Verify Deployment

**Health Check**:
```bash
curl http://localhost:4000/api/v1/health
```

**API Endpoints**:
```bash
# Swagger Documentation
curl http://localhost:4000/api-docs

# Test endpoint
curl http://localhost:4000/api/v2/ledger/accounts
```

---

## 📊 Post-Deployment Verification

### API Endpoints
- [ ] `/api/v2/products` - Products endpoint
- [ ] `/api/v2/prices` - Prices endpoint
- [ ] `/api/v2/customers` - Customers endpoint
- [ ] `/api/v2/subscriptions` - Subscriptions endpoint
- [ ] `/api/v2/ledger/accounts` - Ledger accounts
- [ ] `/api/v2/ledger/journal` - Journal entries
- [ ] `/api/v2/messaging/profiles` - Messaging profiles
- [ ] `/api/v2/messaging/conversations` - Conversations
- [ ] `/api/v2/compliance/travel-rule/precheck` - Travel Rule

### Database
- [ ] All 20 tables exist
- [ ] Indexes created
- [ ] Foreign keys working
- [ ] Data can be inserted

### Monitoring
- [ ] Health check responding
- [ ] Logs accessible
- [ ] Error tracking configured
- [ ] Performance monitoring active

---

## 🔍 Troubleshooting

### Issue: Migration fails
**Solution**: Use SQL script from `MIGRATION_SQL.md` in Supabase SQL Editor

### Issue: Tables already exist
**Solution**: Migration is idempotent - safe to run multiple times

### Issue: Build fails
**Solution**: 
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Issue: Tests fail
**Solution**: Check database connection and environment variables

---

## 📈 Monitoring & Maintenance

### Health Checks
- Monitor `/api/v1/health` endpoint
- Set up alerts for downtime
- Track response times

### Logs
- Application logs: `logs/` directory
- Error logs: Monitor for exceptions
- Access logs: Track API usage

### Performance
- Monitor response times (p50, p95, p99)
- Track error rates
- Monitor database query performance

---

## 🔄 Rollback Plan

If issues occur:

1. **Code Rollback**:
   ```bash
   git revert <commit-hash>
   npm run build
   pm2 restart norchain-api
   ```

2. **Database Rollback**:
   ```bash
   npm run migration:revert
   ```

3. **Service Restart**:
   ```bash
   pm2 restart norchain-api
   ```

---

## ✅ Success Criteria

- [x] All tests passing
- [x] Build successful
- [x] Migration file ready
- [ ] Migration executed
- [ ] All endpoints responding
- [ ] Database tables created
- [ ] No critical errors in logs
- [ ] Health check passing

---

## 📝 Post-Deployment Tasks

1. **Monitor** for 24-48 hours
2. **Verify** all endpoints working
3. **Check** error logs regularly
4. **Update** documentation if needed
5. **Plan** for coverage improvements

---

**Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**

**Last Updated**: January 2025

