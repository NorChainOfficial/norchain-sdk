# Wallet Applications Backup

This directory contains all wallet applications that were previously part of the main NorChain monorepo. They have been moved here to achieve better separation of concerns and enable independent development.

## 📁 Directory Structure

```
backup/wallets/
├── web-wallet/           # Next.js web wallet application
├── android-wallet/       # Android native wallet (Kotlin/Compose)
├── ios-wallet/          # iOS native wallet (SwiftUI)
├── chrome-extension/    # Chrome extension wallet
├── desktop-wallet/      # Desktop Tauri wallet
├── wallet-core/         # Shared Rust core library
└── README.md           # This file
```

## 🎯 Why This Separation?

### Problems with Previous Structure
1. **Tight Coupling**: Wallets were tightly coupled to NorChain infrastructure
2. **Monorepo Bloat**: Wallet applications have different lifecycles than blockchain infrastructure
3. **Network Limitation**: Wallets could only work with NorChain
4. **Maintenance Overhead**: Multiple wallet implementations in one repo created complexity
5. **Development Conflicts**: Infrastructure changes affected wallet development

### Benefits of Separation
✅ **Multi-Network Support** - Wallets can support Ethereum, BSC, Polygon, etc.  
✅ **Independent Development** - Wallet team can work independently  
✅ **Faster Deployment** - Wallet updates don't affect core infrastructure  
✅ **Reduced Complexity** - Core blockchain team focuses on infrastructure  
✅ **Better Testing** - Separate test suites and quality gates  

## 🚀 Extraction Guide

### Option 1: Single Multi-Platform Wallet Repository

Create a new repository `norchain-wallet` containing all platforms:

```bash
# Create new repository
git clone <new-wallet-repo-url>
cd norchain-wallet

# Copy wallet applications
cp -r /path/to/norchain-monorepo/backup/wallets/* .

# Restructure for multi-platform development
mkdir -p platforms/
mv web-wallet platforms/web
mv android-wallet platforms/android  
mv ios-wallet platforms/ios
mv chrome-extension platforms/chrome
mv desktop-wallet platforms/desktop
mv wallet-core shared/core

# Create unified package.json and workspace configuration
```

### Option 2: Separate Repository per Platform

Create individual repositories for each platform:

```bash
# Web Wallet
git clone <web-wallet-repo-url>
cp -r backup/wallets/web-wallet/* web-wallet/

# Android Wallet  
git clone <android-wallet-repo-url>
cp -r backup/wallets/android-wallet/* android-wallet/

# iOS Wallet
git clone <ios-wallet-repo-url>
cp -r backup/wallets/ios-wallet/* ios-wallet/

# Chrome Extension
git clone <chrome-wallet-repo-url>
cp -r backup/wallets/chrome-extension/* chrome-wallet/

# Desktop Wallet
git clone <desktop-wallet-repo-url>
cp -r backup/wallets/desktop-wallet/* desktop-wallet/
```

## 🔧 Required Modifications After Extraction

### 1. Multi-Network Configuration

Update wallet configuration to support multiple networks:

```typescript
// config/networks.ts
export const SUPPORTED_NETWORKS = {
  norchain: {
    chainId: 7171,
    rpcUrl: 'https://rpc.norchain.org',
    blockExplorer: 'https://explorer.norchain.org'
  },
  ethereum: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    blockExplorer: 'https://etherscan.io'
  },
  bsc: {
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com'
  },
  polygon: {
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  }
};
```

### 2. API Integration

Replace direct database access with standardized blockchain APIs:

```typescript
// Before (coupled to NorChain API)
const response = await fetch('/api/wallet/balance');

// After (multi-network support)
const response = await fetch(`${NETWORK_CONFIG[network].apiUrl}/balance`, {
  headers: { 'X-Network': network }
});
```

### 3. Independent Deployment

Set up independent CI/CD pipelines:

```yaml
# .github/workflows/wallet-deployment.yml
name: Deploy Wallet Applications

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Web Wallet
        run: |
          cd platforms/web
          npm run build
          npm run deploy

  deploy-mobile:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build iOS
        run: |
          cd platforms/ios
          xcodebuild -scheme NorWallet archive
      - name: Build Android
        run: |
          cd platforms/android
          ./gradlew assembleRelease
```

## 📋 API Integration Points

### NorChain Integration

Wallets will integrate with NorChain through standard APIs:

```typescript
// NorChain specific integration
const norchainAPI = {
  baseURL: 'https://api.norchain.org',
  endpoints: {
    balance: '/api/account/balance',
    transactions: '/api/transaction/list',
    send: '/api/transaction/broadcast',
    swap: '/api/swap/execute'
  }
};
```

### Multi-Chain Support

```typescript
// Generic blockchain integration
interface BlockchainProvider {
  getBalance(address: string): Promise<string>;
  sendTransaction(tx: Transaction): Promise<string>;
  getTransactions(address: string): Promise<Transaction[]>;
}

class NorChainProvider implements BlockchainProvider {
  // NorChain specific implementation
}

class EthereumProvider implements BlockchainProvider {
  // Ethereum specific implementation
}
```

## 🔄 Migration Checklist

### Pre-Migration
- [ ] Backup all wallet code and documentation
- [ ] Create new repositories or workspace structure
- [ ] Set up CI/CD pipelines for wallet applications
- [ ] Plan multi-network architecture

### During Migration
- [ ] Copy wallet applications to new repositories
- [ ] Update package.json and workspace configurations
- [ ] Modify API integration points for multi-network support
- [ ] Update documentation and README files
- [ ] Set up independent testing environments

### Post-Migration
- [ ] Test wallet functionality in new environment
- [ ] Verify multi-network support works correctly
- [ ] Update deployment pipelines
- [ ] Train wallet development team on new structure
- [ ] Archive old wallet code in monorepo backup

## 📞 Support

If you need help with wallet extraction or have questions about this restructure:

1. **Development Team**: Contact the core development team for technical guidance
2. **Architecture**: Refer to the main monorepo's `CLAUDE.md` and `README.md` for infrastructure details
3. **Documentation**: Check individual wallet directories for specific setup instructions

## 🏗️ Future Architecture

The extracted wallet ecosystem should follow this pattern:

```
Wallet Applications (Independent)
       ↓ API Calls
Multi-Chain Providers (Adapters)
       ↓ RPC Calls
NorChain | Ethereum | BSC | Polygon
```

This enables:
- **Network Agnostic Wallets**: Support any EVM-compatible chain
- **Modular Development**: Add new networks without affecting existing functionality  
- **Independent Scaling**: Scale wallet features separate from blockchain infrastructure
- **Better User Experience**: Users can manage assets across multiple networks

---

**Last Updated**: During monorepo restructure  
**Status**: Ready for extraction to independent repositories