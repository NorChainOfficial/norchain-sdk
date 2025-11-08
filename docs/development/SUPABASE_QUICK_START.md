# Supabase Quick Start Guide
## Get Your Project Running with Supabase

**Supabase Project**: `acyilidfiyfeouzzfkzo`  
**Status**: ✅ Configured, Ready to Build

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Supabase Keys

1. **Service Role Key** (Required for API)
   - Go to: https://app.supabase.com/project/acyilidfiyfeouzzfkzo/settings/api
   - Copy the **service_role** key (secret, starts with `eyJ...`)
   - Add to `.env`:
     ```env
     SUPABASE_SERVICE_KEY=your-service-role-key-here
     ```

2. **Database Password** (Required for direct DB access)
   - Go to: https://app.supabase.com/project/acyilidfiyfeouzzfkzo/settings/database
   - Copy the database password
   - Update `.env`:
     ```env
     SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.acyilidfiyfeouzzfkzo.supabase.co:5432/postgres
     ```

### Step 2: Update Environment Files

Edit `.env` file and add:
```env
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:your-password@db.acyilidfiyfeouzzfkzo.supabase.co:5432/postgres
```

Also update `apps/api/.env` with the same values.

### Step 3: Build & Start

```bash
# Build all services
./scripts/build-with-supabase.sh

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

---

## ✅ Verification

### Test API Connection
```bash
curl http://localhost:4000/api/v1/health
```

### Test Supabase Connection
```bash
curl https://acyilidfiyfeouzzfkzo.supabase.co/rest/v1/ \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg"
```

### Access Services
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs
- **Explorer**: http://localhost:4002
- **Landing**: http://localhost:4010
- **Wallet**: http://localhost:4020
- **NEX Exchange**: http://localhost:4011

---

## 📚 Resources

- **Supabase Dashboard**: https://app.supabase.com/project/acyilidfiyfeouzzfkzo
- **API Settings**: https://app.supabase.com/project/acyilidfiyfeouzzfkzo/settings/api
- **Database Settings**: https://app.supabase.com/project/acyilidfiyfeouzzfkzo/settings/database
- **Documentation**: `docs/implementation/SUPABASE_SETUP.md`

---

**Ready to build!** 🚀

