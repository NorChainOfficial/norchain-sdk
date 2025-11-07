# Gitignore Configuration Guide

## Overview

The monorepo uses a comprehensive `.gitignore` file to exclude build artifacts, dependencies, and temporary files from version control.

## What's Ignored

### Dependencies
- `node_modules/` - All npm/yarn/pnpm dependencies
- `.pnp.*` - Yarn PnP files
- `.yarn/` - Yarn cache and state

### Build Artifacts
- `dist/` - Compiled output
- `build/` - Build directories
- `.next/` - Next.js build output
- `out/` - Next.js export output
- `.turbo/` - Turborepo cache

### TypeScript
- `*.tsbuildinfo` - TypeScript incremental build info
- `*.d.ts.map` - TypeScript declaration maps

### Testing
- `coverage/` - Test coverage reports
- `.nyc_output/` - NYC coverage output
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright reports

### Environment Files
- `.env` - Environment variables
- `.env*.local` - Local environment overrides

### IDE Files
- `.idea/` - IntelliJ IDEA
- `.vscode/` - VS Code (optional, can be committed)
- `*.swp`, `*.swo` - Vim swap files

### OS Files
- `.DS_Store` - macOS
- `Thumbs.db` - Windows
- `Desktop.ini` - Windows

### Mobile Builds
- `apps/wallet-android/app/build/` - Android build output
- `apps/wallet-android/.gradle/` - Gradle cache
- `apps/wallet-ios/build/` - iOS build output
- `apps/wallet-ios/DerivedData/` - Xcode derived data
- `apps/wallet-ios/Pods/` - CocoaPods dependencies

### Rust Builds
- `packages/wallet-core/core-rust/target/` - Rust build output
- `packages/wallet-core/core-rust/Cargo.lock` - Rust lock file

### Package Manager Lock Files

**Note**: Lock files are currently tracked. To ignore them, uncomment the relevant lines in `.gitignore`:

```gitignore
# Uncomment to ignore lock files
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
```

**Recommendation**: Keep lock files committed for consistency across environments.

## App-Specific Ignores

Each app may have its own `.gitignore` for app-specific ignores:

- `apps/explorer/.gitignore`
- `apps/landing/.gitignore`
- `apps/api/.gitignore`
- `apps/nex-exchange/.gitignore`
- `apps/wallet/.gitignore`
- `apps/docs/.gitignore`

## Checking What's Ignored

```bash
# Check if a file/directory is ignored
git check-ignore -v path/to/file

# List all ignored files
git status --ignored

# Check what would be committed
git status --short
```

## Common Issues

### Files Still Showing Up

If files are still tracked after adding to `.gitignore`:

1. **Files were already tracked**: Remove from git cache
   ```bash
   git rm --cached path/to/file
   git commit -m "Remove tracked file"
   ```

2. **Check parent directories**: Ensure parent directories aren't tracked

3. **Check app-specific .gitignore**: Some apps have their own ignores

### Build Artifacts in Repo

If build artifacts are committed:

```bash
# Remove all build artifacts
git rm -r --cached dist/ build/ .next/ out/ coverage/
git commit -m "Remove build artifacts"
```

### Lock Files

Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) are currently tracked. This is recommended for consistency, but you can ignore them if needed.

## Best Practices

1. **Keep lock files**: Commit lock files for consistency
2. **Ignore build artifacts**: Never commit `dist/`, `build/`, `.next/`
3. **Ignore dependencies**: Never commit `node_modules/`
4. **Ignore environment files**: Never commit `.env` files
5. **Use .gitattributes**: For line ending normalization

## Related Files

- `.gitignore` - Root gitignore file
- `.gitattributes` - Git attributes for line endings
- `apps/*/.gitignore` - App-specific ignores

---

**Last Updated**: November 2024

