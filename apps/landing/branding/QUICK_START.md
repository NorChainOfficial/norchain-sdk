# NorChain Brand System - Quick Start Guide

Get your app using the NorChain brand system in 5 minutes.

## Step 1: Import CSS Variables (Optional)

Add to your `app/globals.css`:

```css
@import '../branding/tokens/brand-variables.css';
```

## Step 2: Use Tailwind Classes

The brand tokens are already integrated into your Tailwind config. Start using them:

```tsx
// Example: Hero Section
<section className="bg-norchain-secondary text-white">
  <h1 className="font-display text-6xl font-bold">
    NorChain
  </h1>
  <p className="font-body text-norchain-highlight">
    The Complete Blockchain OS
  </p>
</section>
```

## Step 3: Add Theme Provider (Optional)

If you want automatic dark/light mode switching:

### 3.1: Update `app/layout.tsx`

```tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 3.2: Add Theme Toggle to Header

```tsx
import { ThemeToggle } from '@/components/theme-toggle'

export default function Header() {
  return (
    <nav>
      {/* Your navigation */}
      <ThemeToggle />
    </nav>
  )
}
```

## Common Patterns

### Card Component

```tsx
<div className="bg-white dark:bg-norchain-dark rounded-xl shadow-card p-6 hover:shadow-glow transition-all">
  <h3 className="font-display text-2xl">Fast Transactions</h3>
  <p className="font-body text-gray-600 dark:text-gray-300">
    3-second block times
  </p>
</div>
```

### Button Component

```tsx
<button className="h-12 px-6 bg-norchain-accent hover:bg-norchain-highlight text-white font-body rounded-lg shadow-glow transition-all">
  Launch App
</button>
```

### Gradient Background

```tsx
<div className="bg-aurora text-white p-12 rounded-2xl">
  Aurora Gradient Background
</div>
```

### Using CSS Variables

```tsx
<div style={{ backgroundColor: 'var(--nc-primary)' }}>
  Dynamic Theme Color
</div>
```

## Brand Colors Reference

### Tailwind Classes

| Color | Class | Hex (Light) | Hex (Dark) |
|-------|-------|-------------|------------|
| Primary | `bg-norchain-primary` | #0057B8 | #2EC4B6 |
| Accent | `bg-norchain-accent` | #2EC4B6 | #0057B8 |
| Highlight | `bg-norchain-highlight` | #33F2FF | #33F2FF |
| Secondary | `bg-norchain-secondary` | #0B132B | #021D39 |

### Gradients

| Gradient | Class |
|----------|-------|
| Aurora | `bg-aurora` |
| Aurora Dark | `bg-aurora-dark` |
| Primary Glow | `bg-primary-glow` |
| Accent Glow | `bg-accent-glow` |

### Effects

| Effect | Class |
|--------|-------|
| Glow | `shadow-glow` |
| Glow Intense | `shadow-glow-intense` |
| Card Shadow | `shadow-card` |
| Card Light | `shadow-card-light` |

## Typography

| Type | Class | Font |
|------|-------|------|
| Display | `font-display` | Orbitron |
| Body | `font-body` | Inter |
| Code | `font-mono` | JetBrains Mono |

## Next Steps

- See `README.md` for complete documentation
- Check `brand.config.json` for all design tokens
- Browse component examples in the README

## Support

For questions about the brand system, refer to the main `README.md` or contact the design team.
