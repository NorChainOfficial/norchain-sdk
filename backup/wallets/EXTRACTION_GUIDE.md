# Wallet Applications Extraction Guide

This guide provides step-by-step instructions for extracting wallet applications from the NorChain monorepo backup into independent repositories.

## 🎯 Extraction Goals

1. **Independent Development**: Enable wallet development separate from blockchain infrastructure
2. **Multi-Network Support**: Allow wallets to work with multiple blockchain networks
3. **Simplified Deployment**: Independent deployment pipelines for wallet applications
4. **Reduced Coupling**: Remove dependencies on NorChain-specific APIs

## 📋 Prerequisites

Before starting extraction:

- [ ] New Git repositories created for wallet projects
- [ ] Development team access to new repositories
- [ ] CI/CD pipeline planning completed
- [ ] Multi-network architecture designed
- [ ] API integration strategy defined

## 🚀 Extraction Methods

### Method 1: Unified Wallet Repository (Recommended)

Create a single repository containing all wallet platforms:

#### Step 1: Repository Setup
```bash
# Clone the new unified wallet repository
git clone https://github.com/norchain/norchain-wallets.git
cd norchain-wallets

# Initialize workspace structure
mkdir -p {platforms/{web,android,ios,chrome,desktop},shared/{core,ui,types},docs,scripts}
```

#### Step 2: Copy Applications
```bash
# Copy each wallet application
cp -r /path/to/norchain-monorepo/backup/wallets/web-wallet/* platforms/web/
cp -r /path/to/norchain-monorepo/backup/wallets/android-wallet/* platforms/android/
cp -r /path/to/norchain-monorepo/backup/wallets/ios-wallet/* platforms/ios/
cp -r /path/to/norchain-monorepo/backup/wallets/chrome-extension/* platforms/chrome/
cp -r /path/to/norchain-monorepo/backup/wallets/desktop-wallet/* platforms/desktop/
cp -r /path/to/norchain-monorepo/backup/wallets/wallet-core/* shared/core/
```

#### Step 3: Create Root Package.json
```json
{
  "name": "norchain-wallets",
  "version": "1.0.0",
  "private": true,
  "description": "NorChain Multi-Platform Wallet Suite",
  "workspaces": [
    "platforms/*",
    "shared/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "web:dev": "npm run dev --workspace=@norchain/web-wallet",
    "android:build": "cd platforms/android && ./gradlew assembleDebug",
    "ios:build": "cd platforms/ios && xcodebuild -scheme NorWallet build",
    "chrome:build": "npm run build --workspace=@norchain/chrome-wallet",
    "desktop:dev": "npm run dev --workspace=@norchain/desktop-wallet"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.14.0"
  }
}
```

### Method 2: Separate Repositories per Platform

Create individual repositories for each platform:

#### Web Wallet Repository
```bash
git clone https://github.com/norchain/web-wallet.git
cd web-wallet
cp -r /path/to/norchain-monorepo/backup/wallets/web-wallet/* .

# Update package.json
npm pkg set name="@norchain/web-wallet"
npm pkg set description="NorChain Web Wallet - Multi-Network Cryptocurrency Wallet"
```

#### Android Wallet Repository
```bash
git clone https://github.com/norchain/android-wallet.git
cd android-wallet
cp -r /path/to/norchain-monorepo/backup/wallets/android-wallet/* .

# Update build.gradle.kts
# Change applicationId and package names as needed
```

#### iOS Wallet Repository  
```bash
git clone https://github.com/norchain/ios-wallet.git
cd ios-wallet
cp -r /path/to/norchain-monorepo/backup/wallets/ios-wallet/* .

# Update Xcode project configuration
# Change bundle identifier and project settings
```

## 🔧 Required Code Modifications

### 1. API Client Updates

Replace monorepo API calls with network-agnostic clients:

#### Before (Monorepo Coupled)
```typescript
// apps/wallet/src/lib/api-client.ts
const API_BASE_URL = 'http://localhost:4000';

export const apiClient = {
  getBalance: (address: string) => 
    fetch(`${API_BASE_URL}/api/account/balance/${address}`)
};
```

#### After (Multi-Network)
```typescript
// platforms/web/src/lib/blockchain-client.ts
interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  apiUrl?: string;
  explorer: string;
}

export const networks: Record<string, NetworkConfig> = {
  norchain: {
    chainId: 7171,
    rpcUrl: 'https://rpc.norchain.org',
    apiUrl: 'https://api.norchain.org',
    explorer: 'https://explorer.norchain.org'
  },
  ethereum: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    explorer: 'https://etherscan.io'
  }
};

export class MultiNetworkClient {
  constructor(private network: string) {}
  
  getBalance(address: string) {
    const config = networks[this.network];
    if (config.apiUrl) {
      return fetch(`${config.apiUrl}/balance/${address}`);
    }
    // Fallback to direct RPC calls
    return this.getRPCBalance(address);
  }
  
  private getRPCBalance(address: string) {
    const config = networks[this.network];
    return fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    });
  }
}
```

### 2. Configuration Management

Create network-specific configuration:

```typescript
// shared/types/src/networks.ts
export interface NetworkConfig {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  blockExplorer: string;
  apiUrl?: string;
  iconUrl: string;
  isTestnet?: boolean;
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  norchain: {
    chainId: 7171,
    name: 'NorChain',
    symbol: 'NOR',
    decimals: 18,
    rpcUrl: 'https://rpc.norchain.org',
    blockExplorer: 'https://explorer.norchain.org',
    apiUrl: 'https://api.norchain.org',
    iconUrl: 'https://assets.norchain.org/logo.png'
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    blockExplorer: 'https://etherscan.io',
    iconUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  }
};
```

### 3. Environment Configuration

Update environment variables for multi-network support:

```env
# .env.example
# NorChain Configuration
NEXT_PUBLIC_NORCHAIN_RPC_URL=https://rpc.norchain.org
NEXT_PUBLIC_NORCHAIN_API_URL=https://api.norchain.org

# Ethereum Configuration
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id

# BSC Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org

# Default Network
NEXT_PUBLIC_DEFAULT_NETWORK=norchain

# Feature Flags
NEXT_PUBLIC_ENABLE_MULTI_NETWORK=true
NEXT_PUBLIC_ENABLE_TESTNET=false
```

## 📱 Platform-Specific Considerations

### Web Wallet (Next.js)
- Update `next.config.js` for new domain/subdomain
- Configure environment variables for multiple networks
- Update API routes if any exist
- Test responsive design for standalone deployment

### Android Wallet (Kotlin/Compose)
- Update `build.gradle.kts` with new package names
- Modify native bridge configurations
- Update app signing configuration
- Test with multiple network providers

### iOS Wallet (SwiftUI)
- Update Xcode project configuration
- Modify bundle identifiers and provisioning profiles
- Update native core library integration
- Test with iOS Keychain for multi-network keys

### Chrome Extension
- Update `manifest.json` with new extension ID
- Configure content security policy for multiple domains
- Update background script for multi-network support
- Test extension installation and permissions

### Desktop Wallet (Tauri)
- Update Tauri configuration for new app identifier
- Modify build scripts for independent distribution
- Update auto-updater configuration
- Test cross-platform builds

## 🧪 Testing Strategy

### Pre-Extraction Testing
```bash
# Test current wallet functionality
npm run test --workspace=backup/wallets/web-wallet
cd backup/wallets/android-wallet && ./gradlew test
cd backup/wallets/ios-wallet && xcodebuild test -scheme NorWallet
```

### Post-Extraction Testing
```bash
# Test in new environment
npm run test  # All platforms
npm run web:test
npm run android:test
npm run ios:test
```

### Integration Testing
- [ ] Test wallet connectivity with NorChain network
- [ ] Test multi-network switching functionality
- [ ] Test transaction broadcasting on each network
- [ ] Test wallet import/export across platforms
- [ ] Test synchronization between platforms

## 🚀 Deployment Strategy

### Development Workflow
```bash
# Feature development
git checkout -b feature/multi-network-support
npm run web:dev  # Develop web wallet
# Make changes...
npm run test
git commit -m "Add multi-network support"
git push origin feature/multi-network-support
```

### CI/CD Pipeline
```yaml
name: Wallet CI/CD
on: [push, pull_request]

jobs:
  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Web Wallet
        run: |
          npm install
          npm run web:test
          npm run web:build

  test-mobile:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test iOS
        run: |
          cd platforms/ios
          xcodebuild test -scheme NorWallet
      - name: Test Android
        run: |
          cd platforms/android
          ./gradlew test

  deploy-web:
    needs: [test-web]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy Web Wallet
        run: |
          npm run web:build
          # Deploy to hosting provider
```

## 📋 Post-Extraction Checklist

### Technical
- [ ] All wallet applications build successfully in new environment
- [ ] Multi-network functionality works correctly
- [ ] API integrations are properly configured
- [ ] Environment variables are set up for all networks
- [ ] Testing suites pass in new repository structure

### Documentation
- [ ] Update README files for each platform
- [ ] Create architecture documentation for multi-network support
- [ ] Document API integration patterns
- [ ] Create deployment guides for each platform
- [ ] Update contributing guidelines

### Team Coordination
- [ ] Train wallet development team on new repository structure
- [ ] Update development workflows and processes
- [ ] Set up new repository permissions and access controls
- [ ] Create new project management boards/issues
- [ ] Establish communication channels for wallet team

### Infrastructure
- [ ] Set up CI/CD pipelines for new repositories
- [ ] Configure deployment environments
- [ ] Set up monitoring and error tracking
- [ ] Configure backup and disaster recovery
- [ ] Set up analytics and usage tracking

## 🔄 Rollback Plan

If extraction encounters issues:

1. **Stop Extraction**: Halt the extraction process
2. **Backup Current State**: Create backup of partially extracted code
3. **Restore from Backup**: Use `backup/wallets/` as source of truth
4. **Fix Issues**: Address problems identified during extraction
5. **Re-attempt**: Start extraction process again with fixes

## 📞 Support and Resources

- **NorChain API Documentation**: https://docs.norchain.org/api
- **Ethereum Integration Guide**: https://ethereum.org/en/developers/
- **BSC Integration Guide**: https://docs.bnbchain.org/
- **Multi-Chain Wallet Patterns**: Industry best practices and examples

---

**Status**: Ready for execution  
**Estimated Time**: 2-3 weeks for complete extraction and testing  
**Risk Level**: Medium (requires careful testing of network integrations)