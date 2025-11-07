# Nested Git Repository Cleanup

## Issue

The monorepo had nested git repositories (`.git` directories) within subdirectories, which can cause issues with version control and deployment.

## Found Nested Repositories

- `apps/api/.git` - Removed (was a separate repo before monorepo migration)

## Solution

### 1. Updated .gitignore

Added rules to prevent nested git repositories from being tracked:

```gitignore
# Nested Git Repositories
# Prevent nested .git directories from being tracked
**/.git/
**/.git
!/.git/
!/.git
```

### 2. Removed Nested Repositories

Removed the nested `.git` directory from `apps/api/` since it's now part of the monorepo.

## How to Check for Nested Git Repos

```bash
# Find all .git directories (excluding root)
find . -name ".git" -type d | grep -v "^\./\.git$"

# Check if any are tracked
git ls-files | grep "\.git/"
```

## If You Need to Keep a Separate Repository

If a subdirectory needs to remain a separate git repository, convert it to a git submodule:

```bash
# Remove the nested .git
rm -rf path/to/nested/.git

# Add as submodule
git submodule add <repository-url> path/to/nested

# Commit the submodule
git commit -m "Add submodule"
```

## Prevention

The `.gitignore` file now prevents nested git repositories from being accidentally committed. If you clone a repository into the monorepo, make sure to remove its `.git` directory first.

## Cleanup Steps Performed

1. **Removed nested .git directory**
   ```bash
   rm -rf apps/api/.git
   ```

2. **Removed submodule reference**
   ```bash
   git rm --cached apps/api
   ```

3. **Re-added as regular files**
   ```bash
   git add apps/api/
   ```

4. **Updated .gitignore**
   - Added rules to ignore nested `.git` directories
   - Prevents future nested repos from being tracked

5. **Verified cleanup**
   - Confirmed no nested git repositories remain
   - Verified files are tracked by root repository as regular files (not submodule)

## Status

✅ All nested git repositories have been removed  
✅ `.gitignore` updated to prevent future issues  
✅ Monorepo structure is clean  
✅ `apps/api` is now properly part of the monorepo

---

**Date**: November 2024  
**Status**: Complete ✅

