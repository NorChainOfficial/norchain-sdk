# Noor Wallet - Web Application

Next.js web application for Noor Wallet, connected to Supabase backend.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd web-wallet
npm install
```

### Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://acyilidfiyfeouzzfkzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Features

- ✅ Supabase integration
- ✅ Authentication (sign up/in/out)
- ✅ Wallet management
- ✅ Glassmorphism UI design
- ✅ Responsive design
- ✅ Cross-platform sync

## Structure

```
web-wallet/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   └── settings/     # Settings pages
│   ├── components/       # React components
│   │   ├── SecurityCard.tsx
│   │   ├── SettingsSection.tsx
│   │   ├── TokenIcon.tsx
│   │   ├── WalletHomeScreen.tsx
│   │   └── OnboardingScreen.tsx
│   └── lib/              # Utilities
│       ├── supabase-config.ts
│       ├── supabase-client.ts
│       └── supabase-service.ts
├── public/               # Static assets
└── package.json
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React, Tailwind CSS
- **Backend**: Supabase
- **Styling**: Glassmorphism design

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

- Build: `npm run build`
- Start: `npm start`
- Deploy the `.next` folder

## Development Notes

- Uses Next.js App Router (not Pages Router)
- Client components use `'use client'` directive
- Supabase client is singleton pattern
- Follows iOS app patterns and design

