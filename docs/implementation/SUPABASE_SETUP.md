# Supabase Setup Guide
## Production Setup Checklist

**Date**: November 2024  
**Status**: Setup Guide

---

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in details:
   - **Name**: `norchain-production`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to users
   - **Pricing Plan**: Pro ($25/month)

### Step 2: Get API Keys

1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Get Database URL

1. Go to Project Settings → Database
2. Copy Connection String:
   - **Connection Pooling**: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`
   - **Direct Connection**: `postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres`

---

## 🔧 Environment Configuration

### API Service (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
USE_SUPABASE=true
```

### Wallet Web App (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Mobile Apps

#### iOS (Info.plist / xcconfig)
```xml
<key>SUPABASE_URL</key>
<string>https://xxxxx.supabase.co</string>
<key>SUPABASE_ANON_KEY</key>
<string>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</string>
```

#### Android (build.gradle.kts)
```kotlin
buildConfigField("String", "SUPABASE_URL", "\"https://xxxxx.supabase.co\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"")
```

---

## 📊 Database Setup

### Step 1: Run Migrations

```bash
# Connect to Supabase database
psql postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Or use Supabase CLI
supabase db push
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only see their own wallets"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own wallets"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Setup Indexes

```sql
-- Indexes for performance
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_hash ON transactions(hash);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
```

---

## 🔐 Authentication Setup

### Step 1: Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize:
   - Welcome email
   - Password reset
   - Email change

### Step 2: Configure Password Policy

1. Go to Authentication → Settings
2. Set:
   - **Min Password Length**: 8
   - **Require Uppercase**: Yes
   - **Require Numbers**: Yes
   - **Require Special Characters**: Optional

### Step 3: Enable OAuth (Optional)

1. Go to Authentication → Providers
2. Enable providers:
   - Google
   - Apple
   - GitHub

---

## 💾 Storage Setup

### Step 1: Create Buckets

1. Go to Storage
2. Create buckets:
   - `wallet-backups` (private)
   - `user-uploads` (public)
   - `static-assets` (public)

### Step 2: Configure Policies

```sql
-- Allow users to upload their own backups
CREATE POLICY "Users can upload their own backups"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wallet-backups' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own backups
CREATE POLICY "Users can read their own backups"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wallet-backups' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Step 3: Configure CORS

```json
{
  "allowedOrigins": [
    "https://wallet.norchain.org",
    "https://explorer.norchain.org"
  ],
  "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 3600
}
```

---

## 🔄 Real-time Setup

### Step 1: Enable Realtime

1. Go to Database → Replication
2. Enable replication for tables:
   - `blocks`
   - `transactions`
   - `token_transfers`
   - `wallets`

### Step 2: Configure API Service

The API service already has Supabase integration:
- `apps/api/src/modules/supabase/supabase.service.ts`
- Automatically subscribes to database changes
- Broadcasts via WebSocket

### Step 3: Test Real-time

```typescript
// Client-side subscription
const channel = supabase
  .channel('blocks')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'blocks'
  }, (payload) => {
    console.log('New block:', payload.new);
  })
  .subscribe();
```

---

## 📈 Monitoring Setup

### Step 1: Enable Monitoring

1. Go to Project Settings → Monitoring
2. Enable:
   - Database metrics
   - API metrics
   - Storage metrics

### Step 2: Setup Alerts

1. Go to Project Settings → Alerts
2. Configure:
   - **Database Size**: Alert at 7GB (8GB limit)
   - **Bandwidth**: Alert at 45GB (50GB limit)
   - **API Errors**: Alert on > 1% error rate

### Step 3: Dashboard

1. Go to Dashboard
2. Monitor:
   - Database size
   - API requests
   - Bandwidth usage
   - Active users

---

## 🔒 Security Checklist

### Database Security
- [ ] RLS enabled on all tables
- [ ] Policies configured correctly
- [ ] Service role key secured (server-side only)
- [ ] Anon key safe for client-side

### Network Security
- [ ] HTTPS only
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] API keys rotated regularly

### Authentication Security
- [ ] Strong password policy
- [ ] Email verification enabled
- [ ] 2FA available (if needed)
- [ ] Session timeout configured

---

## 📊 Cost Optimization

### Monitor Usage
- Track database size monthly
- Monitor bandwidth usage
- Watch for overage charges

### Optimize Queries
- Use indexes effectively
- Avoid N+1 queries
- Cache frequently accessed data

### Reduce Bandwidth
- Use CDN for static assets
- Compress responses
- Implement pagination

---

## ✅ Verification Checklist

### Setup Complete When:
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] RLS policies configured
- [ ] Storage buckets created
- [ ] Authentication working
- [ ] Real-time subscriptions active
- [ ] Monitoring configured
- [ ] Alerts setup
- [ ] Documentation updated

### Production Ready When:
- [ ] All apps connected
- [ ] Security policies reviewed
- [ ] Backups enabled
- [ ] Monitoring active
- [ ] Team trained
- [ ] Support plan in place

---

## 🆘 Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check database URL
   - Verify network connectivity
   - Check firewall rules

2. **RLS Blocking Queries**
   - Review RLS policies
   - Check user permissions
   - Verify auth.uid() is set

3. **Real-time Not Working**
   - Enable replication on tables
   - Check WebSocket connection
   - Verify channel subscriptions

4. **Storage Upload Fails**
   - Check bucket policies
   - Verify CORS configuration
   - Check file size limits

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

**Last Updated**: November 2024

