# Xaheen Explorer Wallet Integration

This document explains how the Xaheen Explorer provides seamless wallet integration for BitcoinBR and Flash Coin tokens.

## Features

### 1. Automatic Wallet Detection
The explorer automatically detects if a user has a compatible wallet (MetaMask, Trust Wallet, etc.) installed in their browser.

### 2. One-Click Network Addition
Users can add the Xaheen Chain network to their wallet with a single click:
- Network Name: Xaheen Chain
- RPC URL: https://rpc.bitcoinbr.tech
- Chain ID: 885824
- Currency Symbol: BTCBR
- Block Explorer: https://explorer.bitcoinbr.tech

### 3. Automatic Token Detection
The wallet connector automatically adds BitcoinBR and Flash Coin tokens to supported wallets.

### 4. Connection Status
Users can see their connection status, including:
- Connected account address
- Current network
- Ability to disconnect

## Supported Wallets

1. **MetaMask** - Full support for all features
2. **Trust Wallet** - Supported via browser extension
3. **Ledger** - Supported via MetaMask bridge
4. **Other EIP-1193 compliant wallets** - Basic support

## Implementation Details

### WalletConnector Component
The `WalletConnector` component provides all wallet integration functionality:
- Connect/disconnect wallet
- Add Xaheen Chain network
- Add BitcoinBR token
- Display connection status

### Token List
The explorer provides a token list at `/tokenlist.json` that wallets can use for automatic token detection.

### Wallet Configuration
Detailed wallet configuration information is available at `/wallet-config.json`.

## User Experience

### For New Users
1. Visit the explorer
2. See the wallet connector component
3. Click "Connect Wallet"
4. Add network and tokens with one click
5. Start interacting with BitcoinBR and Flash Coins

### For Returning Users
1. Wallet connection is automatically detected
2. Network and tokens are already configured
3. Ready to interact immediately

## Developer Integration

To integrate wallet functionality into other parts of the explorer:

```typescript
import { WalletConnector } from '@/components/wallet/WalletConnector';

// Use the component in any page
<WalletConnector />
```

The component uses React hooks for state management and the `useToast` hook for user feedback.

## Security Considerations

1. All wallet interactions are initiated by the user
2. No private keys or sensitive information are accessed
3. Only standard EIP-1193 methods are used
4. All interactions are transparent to the user

## Troubleshooting

### Common Issues
1. **Wallet not detected** - Ensure wallet extension is installed and enabled
2. **Network not added** - Check wallet settings and permissions
3. **Token not appearing** - Verify network is correct and token contract is valid

### Support
For wallet-related issues, users should:
1. Check their wallet documentation
2. Ensure they're using a supported browser
3. Contact wallet provider support