# TypeORM Entity Loading Issue

**Date**: January 2025  
**Status**: ⚠️ Known Issue - Workaround Available

---

## 🐛 Problem

TypeORM is encountering a "Maximum call stack size exceeded" error when loading entities, both with:
- Direct entity imports (array of entity classes)
- Path-based loading (`src/**/*.entity.ts` or `dist/**/*.entity.js`)

**Error**:
```
RangeError: Maximum call stack size exceeded
at /app/node_modules/typeorm/util/DirectoryExportedClassesLoader.js:27:45
```

---

## 🔍 Root Cause

This typically indicates:
1. **Circular dependency** in entity imports
2. **Entity file** importing itself indirectly
3. **TypeORM loader** encountering a problematic directory structure

---

## ✅ Current Workaround

The codebase uses **direct entity imports** in `apps/api/src/config/database.config.ts`:

```typescript
const entities = [
  Block,
  Transaction,
  // ... all entities explicitly listed
];
```

This approach:
- ✅ Avoids path-based loading issues
- ✅ Explicitly controls which entities are loaded
- ✅ Works in both development and production

---

## 🔧 Potential Solutions

### Option 1: Check for Circular Dependencies

```bash
# Find entity files with circular imports
cd apps/api/src
find . -name "*.entity.ts" -exec grep -l "import.*entity" {} \;
```

### Option 2: Use Entity Factories

Create an `entities/index.ts` file that exports all entities:

```typescript
// apps/api/src/entities/index.ts
export * from '../modules/block/entities/block.entity';
export * from '../modules/transaction/entities/transaction.entity';
// ... etc
```

Then import:
```typescript
import * as entities from './entities';
```

### Option 3: Lazy Load Entities

Use NestJS's `TypeOrmModule.forFeature()` in each module instead of global loading.

### Option 4: Check Build Output

Ensure all entity files are properly compiled to `dist/**/*.entity.js`:

```bash
# Check if entity files exist in dist
find apps/api/dist -name "*.entity.js" | wc -l
```

---

## 📋 Next Steps

1. **Investigate circular dependencies** in entity files
2. **Check build output** to ensure entities are compiled correctly
3. **Consider module-based entity loading** instead of global loading
4. **Test with a minimal entity set** to identify problematic entities

---

## 💡 Temporary Solution

For now, the API can run with:
- Direct entity imports (current approach)
- Entities explicitly listed in `database.config.ts`
- `autoLoadEntities: false` to prevent automatic discovery

**Note**: The API may need to be rebuilt if entity files change.

---

**Last Updated**: January 2025

