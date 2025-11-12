# Chrome Extension - Nor Wallet

## Setup

```bash
cd chrome-extension
npm install
npm run build
```

## Development

```bash
npm run dev
```

## Load Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension/dist` folder

## Features

- ✅ Supabase integration
- ✅ Wallet management
- ✅ dApp connection (EIP-1193)
- ✅ Transaction signing
- ✅ Glassmorphism UI

## Structure

- `src/background/` - Service worker
- `src/content/` - Content script for dApp injection
- `src/popup/` - Popup UI
- `src/services/` - Supabase services
- `src/injected/` - Wallet provider injection

