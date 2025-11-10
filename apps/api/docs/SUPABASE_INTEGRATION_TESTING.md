# Supabase Integration Testing Guide

## Overview

This guide explains how to run integration tests against Supabase for the NorChain API.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with:
   - Project URL
   - Anon Key
   - Service Role Key (optional, for admin operations)
   - Database URL (if using Supabase database)

2. **Environment Variables**: Set the following in `.env` or `.env.test`:
   ```env
   USE_SUPABASE=true
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Running Integration Tests

### Option 1: Direct Test Execution

Run tests directly (requires Supabase to be accessible):

```bash
cd apps/api
npm run test:integration -- --testPathPattern="supabase"
```

### Option 2: Docker Compose (Recommended)

Use the provided Docker Compose setup for isolated testing:

```bash
cd apps/api
./scripts/run-integration-tests.sh
```

Or manually:

```bash
# Start services
docker-compose -f docker-compose.integration.yml up -d

# Wait for services to be ready
sleep 15

# Run tests
npm run test:integration -- --testPathPattern="supabase"

# Cleanup
docker-compose -f docker-compose.integration.yml down -v
```

## Test Coverage

The integration tests cover:

### 1. Supabase Configuration
- ✅ Supabase URL configuration
- ✅ Anon key configuration
- ✅ Client initialization

### 2. Real-time Features
- ✅ Subscription initialization
- ✅ Custom channel subscriptions
- ✅ Event broadcasting
- ✅ Presence tracking
- ✅ Channel cleanup

### 3. Authentication
- ✅ User registration
- ✅ User login
- ✅ Session management
- ✅ Password reset
- ✅ OAuth providers

### 4. Storage
- ✅ File uploads
- ✅ File downloads
- ✅ Public URLs
- ✅ Signed URLs
- ✅ Bucket management

### 5. Notifications Integration
- ✅ Notification creation with Supabase broadcast
- ✅ Real-time notification delivery
- ✅ User notification subscriptions

## Test Structure

```
test/supabase/
└── supabase-integration.spec.ts
```

## Troubleshooting

### Database Connection Errors

If you see `getaddrinfo ENOTFOUND db.xxx.supabase.co`:
- Check that `SUPABASE_DB_URL` is correct
- Verify network connectivity to Supabase
- Ensure Supabase project is active

### Missing Environment Variables

If tests skip with "not configured":
- Ensure `.env` or `.env.test` exists
- Verify all required Supabase variables are set
- Check that `USE_SUPABASE=true` is set

### Docker Build Failures

If Docker build fails:
- Ensure `package-lock.json` exists
- Run `npm install` locally first
- Check Docker daemon is running

## Notes

- Integration tests require a valid Supabase connection
- Tests will skip gracefully if Supabase is not configured
- Some tests may fail if Supabase project is not properly set up
- Database operations require proper RLS (Row Level Security) policies

## Next Steps

1. Set up Supabase project
2. Configure environment variables
3. Run integration tests
4. Verify all tests pass
5. Set up CI/CD pipeline with Supabase credentials

