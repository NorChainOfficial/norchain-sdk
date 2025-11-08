# Dependency Installation Fix

## Issue
The API build is failing due to missing `@nestjs/axios` and `axios` packages, even though they are listed in `package.json`.

## Root Cause
npm install is failing due to a `nextra@^3.4.0` dependency issue in the root workspace (docs app).

## Solution

### Option 1: Install packages directly (Recommended)
```bash
cd apps/api
npm install '@nestjs/axios@^3.0.1' 'axios@^1.6.2' --legacy-peer-deps
```

### Option 2: Fix nextra dependency first
1. Check `apps/docs/package.json` for nextra version
2. Update to a valid version or remove if not needed
3. Run `npm install` from root

### Option 3: Manual installation
If npm install continues to fail:
1. Navigate to `apps/api/node_modules`
2. Manually install packages:
   ```bash
   cd apps/api
   mkdir -p node_modules/@nestjs
   npm install @nestjs/axios@^3.0.1 axios@^1.6.2 --prefix node_modules/@nestjs/axios
   ```

### Option 4: Use yarn instead
```bash
cd apps/api
yarn add @nestjs/axios@^3.0.1 axios@^1.6.2
```

## Verification
After installation, verify:
```bash
cd apps/api
npm run build  # Should succeed
npm run test   # AI service tests should pass
```

## Current Status
- ✅ Packages listed in `package.json`
- ❌ Packages not installed in `node_modules`
- ❌ Build failing with 9 TypeScript errors
- ✅ All other functionality working

