# Migration Guide

This API has been moved from `blockchain-v2/services/explorer-api-v2` to a standalone repository.

## New Location

```
/Volumes/Development/sahalat/norchain-explorer-api/
```

## What Changed

- ✅ **Standalone Repository** - Independent from blockchain-v2
- ✅ **Same Structure** - All code remains the same
- ✅ **Same Dependencies** - No changes to package.json
- ✅ **Same Configuration** - Environment variables unchanged

## Migration Steps

### 1. Update Environment Variables

If you have any scripts or CI/CD that reference the old path, update them:

**Old:**
```bash
cd blockchain-v2/services/explorer-api-v2
```

**New:**
```bash
cd norchain-explorer-api
```

### 2. Update Docker Compose (if applicable)

If you have docker-compose files referencing the old path:

```yaml
# Old
build: ./blockchain-v2/services/explorer-api-v2

# New
build: ./norchain-explorer-api
```

### 3. Update CI/CD Pipelines

Update any CI/CD workflows:

```yaml
# GitHub Actions example
- name: Build API
  run: |
    cd norchain-explorer-api
    npm install
    npm run build
```

### 4. Update Documentation Links

If you have documentation linking to the API:

- Old: `blockchain-v2/services/explorer-api-v2`
- New: `norchain-explorer-api`

## Benefits

1. **Better Organization** - API separated from blockchain infrastructure
2. **Independent Deployment** - Deploy API separately
3. **Clearer Structure** - Easier to find and maintain
4. **Version Control** - Can have separate Git repository if needed

## No Code Changes Required

✅ All code remains the same  
✅ All imports work as before  
✅ All configurations unchanged  
✅ All endpoints unchanged  

## Verification

After migration, verify:

```bash
# Check installation
cd norchain-explorer-api
npm install

# Check build
npm run build

# Check tests
npm test

# Start server
npm run start:dev
```

## Support

If you encounter any issues:

1. Check environment variables are set correctly
2. Verify database connection
3. Check Redis connection (if using)
4. Review logs for errors

---

**Migration complete!** 🎉

