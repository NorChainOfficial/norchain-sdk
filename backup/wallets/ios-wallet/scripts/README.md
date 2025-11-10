# iOS Wallet Scripts

This directory contains iOS-specific automation scripts.

## Production Deployment

- `build-release.sh` - Build Release configuration
- `verify-production.sh` - Verify production configuration
- `archive-production.sh` - Create App Store archive
- `deploy-production.sh` - Complete deployment automation

## Development

- `install-on-simulator.sh` - Install app on iOS simulator
- `open-xcode.sh` - Open project in Xcode
- `setup-xcode.sh` - Setup Xcode project

## Maintenance

- `fix-package-completely.sh` - Fix Swift Package Manager issues
- `fix-xcode-package.sh` - Fix Xcode package resolution
- `fix-project-automatically.sh` - Fix project file issues
- `add-supabase-sdk.sh` - Add Supabase SDK to project
- `create-xcode-project.sh` - Create Xcode project

## Usage

All scripts are executable and can be run directly:

```bash
cd ios-wallet
./scripts/build-release.sh
```

