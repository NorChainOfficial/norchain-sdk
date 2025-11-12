# NorChain Brand System

Complete brand identity and design token system for the NorChain blockchain ecosystem.

## Overview

This brand system provides a comprehensive, production-ready design language for all NorChain applications. It includes color tokens, typography, effects, animations, and integration guides for automatic theming.

---

## 🎨 Quick Start

### 1. Using Brand Colors in Tailwind

```tsx
// Primary brand colors
<div className="bg-norchain-primary text-white">
  NorChain Primary Blue
</div>

// Accent and highlights
<button className="bg-norchain-accent hover:bg-norchain-highlight">
  Connect Wallet
</button>

// Brand gradients
<div className="bg-aurora text-white">
  Aurora Gradient Background
</div>
```

### 2. Using Brand Typography

```tsx
// Display text (Orbitron)
<h1 className="font-display text-4xl font-bold">
  NorChain
</h1>

// Body text (Inter)
<p className="font-body text-base">
  The Complete Blockchain OS
</p>

// Code/Mono text (JetBrains Mono)
<code className="font-mono">
  console.log('blockchain');
</code>
```

### 3. Using Brand Effects

```tsx
// Glow effects
<div className="shadow-glow">
  Glowing Card
</div>

// Card shadows
<div className="shadow-card bg-white rounded-xl p-6">
  Professional Card
</div>
```

---

## 📦 Complete Integration Guide

### Step 1: Import Brand Tokens

The brand tokens are defined in `branding/tokens/brand.config.json` and automatically integrated into `tailwind.config.ts`.

### Step 2: Add Theme Provider (Optional)

For automatic dark/light mode switching, add the theme provider to your app:

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Step 3: Use CSS Variables (Advanced)

For dynamic theming, add CSS variables to your global styles:

```css
/* app/globals.css */
:root {
  --nc-primary: #0057B8;
  --nc-secondary: #0B132B;
  --nc-accent: #2EC4B6;
  --nc-highlight: #33F2FF;
  --nc-background: #FFFFFF;
  --nc-surface: #F9FAFB;
}

.dark {
  --nc-primary: #2EC4B6;
  --nc-secondary: #021D39;
  --nc-accent: #0057B8;
  --nc-highlight: #33F2FF;
  --nc-background: #0B132B;
  --nc-surface: #1C2438;
}
```

Then use in components:

```tsx
<div style={{ backgroundColor: 'var(--nc-primary)' }}>
  Dynamic Theme Color
</div>
```

---

## 🎨 Design Token Reference

### Colors

#### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0057B8` | Main brand color, CTAs |
| Secondary | `#0B132B` | Text, contrast |
| Accent | `#2EC4B6` | Highlights, interactive |
| Highlight | `#33F2FF` | Aurora effects |
| Background | `#FFFFFF` | Page background |
| Surface | `#F9FAFB` | Cards, UI elements |

#### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#2EC4B6` | Main brand color (inverted) |
| Secondary | `#021D39` | Deep background |
| Accent | `#0057B8` | Contrast accent |
| Highlight | `#33F2FF` | Aurora shimmer |
| Background | `#0B132B` | Page background |
| Surface | `#1C2438` | Cards, UI elements |

### Typography

| Role | Font | Weight | Example |
|------|------|--------|---------|
| Display | Orbitron | 700 | NORCHAIN |
| Headings | Orbitron | 600 | "The Complete Blockchain OS" |
| Body | Inter | 400-600 | Paragraph text |
| Code | JetBrains Mono | 400 | `console.log()` |

### Effects

| Name | Definition | Usage |
|------|------------|-------|
| Glow | `shadow-glow` | Accent highlights |
| Glow Intense | `shadow-glow-intense` | Strong highlights |
| Card Shadow | `shadow-card` | Card elevation |
| Card Light | `shadow-card-light` | Subtle elevation |

### Gradients

| Name | Tailwind Class | Definition |
|------|----------------|------------|
| Aurora | `bg-aurora` | Primary brand gradient |
| Aurora Dark | `bg-aurora-dark` | Dark mode gradient |
| Primary Glow | `bg-primary-glow` | Blue to teal |
| Accent Glow | `bg-accent-glow` | Teal to cyan |

---

## 🧩 Tailwind Integration

The brand system extends your Tailwind configuration:

```typescript
// tailwind.config.ts
extend: {
  colors: {
    'norchain-primary': '#0057B8',
    'norchain-secondary': '#0B132B',
    'norchain-accent': '#2EC4B6',
    'norchain-highlight': '#33F2FF',
    'norchain-dark': '#021D39',
  },
  fontFamily: {
    display: ['Orbitron', 'sans-serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  backgroundImage: {
    'aurora': 'linear-gradient(135deg, #0057B8 0%, #2EC4B6 50%, #33F2FF 100%)',
    'aurora-dark': 'linear-gradient(135deg, #0B132B 0%, #0057B8 50%, #2EC4B6 100%)',
  },
  boxShadow: {
    'glow': '0 0 20px rgba(46, 196, 182, 0.4)',
    'card': '0 6px 25px rgba(11, 19, 43, 0.25)',
  }
}
```

---

## 📱 Component Examples

### Hero Section

```tsx
<section className="relative min-h-screen bg-norchain-secondary">
  <div className="absolute inset-0 bg-aurora-dark opacity-50" />
  <div className="relative z-10 container mx-auto px-6 pt-32">
    <h1 className="font-display text-6xl font-bold text-white mb-6">
      NorChain
    </h1>
    <p className="font-body text-xl text-norchain-highlight">
      The Complete Blockchain OS
    </p>
  </div>
</section>
```

### Card Component

```tsx
<div className="bg-white dark:bg-norchain-dark rounded-xl shadow-card p-6 hover:shadow-glow transition-all">
  <h3 className="font-display text-2xl font-semibold mb-4">
    Fast Transactions
  </h3>
  <p className="font-body text-gray-600 dark:text-gray-300">
    3-second block times with sub-cent fees
  </p>
</div>
```

### Button Component

```tsx
<button className="h-12 px-6 bg-norchain-accent hover:bg-norchain-highlight text-white font-body font-medium rounded-lg shadow-glow transition-all duration-300 hover:scale-105">
  Launch App
</button>
```

### Navigation Header

```tsx
<nav className="fixed w-full z-50 bg-[#0f2847]/90 backdrop-blur-xl border-b border-norchain-accent/20">
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <img src="/norchain.png" alt="NorChain" className="h-12" />
      <div className="space-x-6">
        <a className="font-body text-white hover:text-norchain-highlight transition-colors">
          Features
        </a>
        <button className="px-6 py-2 bg-aurora text-white rounded-lg shadow-glow hover:shadow-glow-intense transition-all">
          Connect
        </button>
      </div>
    </div>
  </div>
</nav>
```

---

## 🎬 Animation Examples

### Fade In

```tsx
<div className="animate-fade-in">
  Content fades in smoothly
</div>
```

### Slide Up

```tsx
<div className="animate-slide-up">
  Content slides up from below
</div>
```

### Pulse Glow

```tsx
<div className="animate-pulse-slow shadow-glow">
  Pulsing glow effect
</div>
```

---

## 🌗 Dark Mode Integration

### Automatic Theme Detection

```tsx
// components/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Manual Theme Toggle

```tsx
'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-norchain-accent text-white"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

### Dark Mode Styles

Use Tailwind's `dark:` prefix for dark mode variants:

```tsx
<div className="bg-white dark:bg-norchain-secondary text-gray-900 dark:text-white">
  Automatic theme switching
</div>
```

---

## 📂 Asset Structure

```
/branding
├── logo/
│   ├── norchain-logo.svg         # Full logo with text
│   ├── norchain-icon.svg         # Icon only
│   ├── norchain-tagline.svg      # Logo + tagline
│   ├── norchain-token.svg        # Token symbol
│   └── variants/
│       ├── dark/                 # Dark background variants
│       ├── white/                # White/light variants
│       └── mono/                 # Monochrome variants
├── video/
│   ├── norchain-intro.mp4        # Brand intro animation
│   ├── norchain-loop.webm        # Looping background
│   └── source/                   # After Effects sources
├── tokens/
│   ├── brand.config.json         # Design tokens (JSON)
│   └── tailwind.config.js        # Tailwind integration
├── fonts/
│   ├── Orbitron.woff2            # Display font
│   ├── Inter.woff2               # Body font
│   └── JetBrainsMono.woff2       # Mono font
└── README.md                     # This file
```

---

## 🚀 Next Steps

1. **Install Theme Package** (if needed):
   ```bash
   npm install next-themes
   ```

2. **Load Fonts** - Add to `app/layout.tsx`:
   ```tsx
   import { Inter } from 'next/font/google'

   const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
   ```

3. **Create Reusable Components**:
   - Button variants with brand colors
   - Card components with brand shadows
   - Typography components with brand fonts

4. **Export to Figma**:
   - Use Figma Tokens Studio plugin
   - Import `brand.config.json`
   - Sync design system across tools

---

## 📖 Additional Resources

- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Next.js Theming**: https://nextjs.org/docs/app/building-your-application/styling
- **next-themes Package**: https://github.com/pacocoursey/next-themes
- **Figma Tokens Studio**: https://tokens.studio

---

## 🤝 Contributing

When adding new brand elements:

1. Update `brand.config.json` with new tokens
2. Extend `tailwind.config.ts` if needed
3. Add usage examples to this README
4. Test in both light and dark modes
5. Ensure accessibility (WCAG AAA compliance)

---

## 📄 License

This brand system is part of the NorChain project. All rights reserved.

**Brand Guidelines**: For logo usage and brand compliance, contact the NorChain team.

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Maintained by**: NorChain Design Team
