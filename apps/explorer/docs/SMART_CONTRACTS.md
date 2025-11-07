# Xaheen Chain - Smart Contracts

## Overview

This document lists all deployed smart contracts on Xaheen Chain and provides information about their functionality, addresses, and integration.

## Network Information

- **Chain Name:** Xaheen Chain
- **Chain ID:** 65001 (0xFDE9)
- **Native Currency:** XHT (Xaheen)
- **Block Explorer:** https://explorer.xaheen.org

## Deployed Smart Contracts

### BTCBR Token

**Contract Address:** `0x0cF8e180350253271f4b917CcFb0aCCc4862F262`

**Description:**
BitcoinBR (BTCBR) is a token deployed on Xaheen Chain representing Bitcoin Brasil.

**Token Details:**
- **Symbol:** BTCBR
- **Decimals:** 0
- **Type:** ERC-20 Token
- **Contract Verified:** ✅ Yes

**Explorer Link:**
[View on Explorer](https://explorer.xaheen.org/address/0x0cF8e180350253271f4b917CcFb0aCCc4862F262)

**Add to Wallet:**
```javascript
await window.ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC20',
    options: {
      address: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262',
      symbol: 'BTCBR',
      decimals: 0,
      image: 'https://explorer.xaheen.org/btcbr-logo.png',
    },
  },
});
```

### Future Contracts

The following contracts are planned for deployment on Xaheen Chain:

#### Wrapped XHT (WXHT)
**Status:** Coming Soon
**Description:** Wrapped version of native XHT token for DeFi compatibility

#### DEX Factory
**Status:** Coming Soon
**Description:** Factory contract for creating trading pairs

#### DEX Router
**Status:** Coming Soon
**Description:** Router contract for token swapping

## Integration Guide

### Adding Xaheen Chain to Wallet

Before interacting with smart contracts, users need to add Xaheen Chain to their wallet:

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0xFDE9', // 65001 in hex
    chainName: 'Xaheen Chain',
    rpcUrls: ['https://rpc.xaheen.org'],
    nativeCurrency: {
      name: 'Xaheen',
      symbol: 'XHT',
      decimals: 18,
    },
    blockExplorerUrls: ['https://explorer.xaheen.org'],
  }],
});
```

### Interacting with BTCBR Token

#### Reading Token Balance

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://rpc.xaheen.org');

const btcbrAddress = '0x0cF8e180350253271f4b917CcFb0aCCc4862F262';
const btcbrAbi = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

const btcbrContract = new web3.eth.Contract(btcbrAbi, btcbrAddress);

async function getBalance(address) {
  const balance = await btcbrContract.methods.balanceOf(address).call();
  console.log(`BTCBR Balance: ${balance}`);
  return balance;
}
```

#### Transferring BTCBR Tokens

```javascript
async function transferBTCBR(toAddress, amount) {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  const transferAbi = [
    {
      "constant": false,
      "inputs": [
        {"name": "_to", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    }
  ];

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(transferAbi, btcbrAddress);

  const tx = await contract.methods
    .transfer(toAddress, amount)
    .send({ from: accounts[0] });

  console.log('Transaction hash:', tx.transactionHash);
  return tx;
}
```

## Wallet Connector

The Xaheen Chain Explorer includes a built-in wallet connector on the homepage that allows users to:

1. **Connect Wallet** - MetaMask, Trust Wallet, or Ledger
2. **Add Xaheen Chain Network** - One-click network addition
3. **Add BTCBR Token** - One-click token addition

Visit the [Xaheen Explorer](https://explorer.xaheen.org) homepage and scroll to the "Connect Your Wallet" section.

## Contract Verification

To verify your smart contract on Xaheen Chain Explorer:

1. Visit https://explorer.xaheen.org/contracts/verify
2. Enter your contract address
3. Upload source code and constructor arguments
4. Submit for verification

Verified contracts will have a green checkmark ✅ in the explorer.

## Security Considerations

### Token Interactions
- Always verify contract addresses before interacting
- Double-check transaction details before signing
- Use hardware wallets for large amounts
- Test with small amounts first

### Common Scams to Avoid
- ❌ Fake token airdrops
- ❌ Phishing websites with similar URLs
- ❌ Unverified contracts claiming to be official
- ❌ Direct messages asking for private keys

### Best Practices
- ✅ Always use official contract addresses listed here
- ✅ Verify on the official explorer
- ✅ Keep seed phrases secure and offline
- ✅ Use hardware wallets for significant holdings
- ✅ Enable transaction signing confirmations

## Resources

- **Explorer:** https://explorer.xaheen.org
- **RPC Endpoint:** https://rpc.xaheen.org
- **WebSocket:** wss://ws.xaheen.org
- **Documentation:** https://docs.xaheen.org
- **Support:** support@xaheen.org

## Contract Registry

All official Xaheen Chain smart contracts will be listed on this page. Always verify contract addresses through official channels before interacting with them.

### How to Verify a Contract Address

1. Visit the [official Xaheen documentation](https://docs.xaheen.org)
2. Check this SMART_CONTRACTS.md file in the repository
3. Verify on the explorer at https://explorer.xaheen.org
4. Cross-reference with official announcements

## Developer Resources

### Testnet Information
- **Testnet RPC:** (Coming Soon)
- **Testnet Explorer:** (Coming Soon)
- **Faucet:** (Coming Soon)

### Development Tools
- **Web3.js:** Compatible
- **Ethers.js:** Compatible
- **Hardhat:** Supported
- **Truffle:** Supported
- **Remix:** Supported

### Example Project
Check out our [Xaheen Chain DApp Template](https://github.com/xaheenchain/dapp-template) for a starter project.

## Contributing

To add or update contract information:

1. Fork the repository
2. Update this document
3. Submit a pull request
4. Include verification details

## Changelog

### 2024-Current
- **BTCBR Token** deployed at `0x0cF8e180350253271f4b917CcFb0aCCc4862F262`
- Wallet connector integrated into explorer homepage
- Smart contracts documentation created

---

**Last Updated:** 2024
**Maintained by:** Xaheen Chain Team
**License:** MIT
