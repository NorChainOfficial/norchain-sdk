# @norchain/design-system

Unified design system for the NorChain ecosystem.

## Installation

```bash
npm install @norchain/design-system
```

## Usage

### Tailwind Config

```typescript
import { norchainDesignSystem } from '@norchain/design-system/tailwind.config'

export default {
  ...norchainDesignSystem,
  // Your app-specific config
}
```

### Utilities

```typescript
import { cn, formatAddress, formatCurrency } from '@norchain/design-system'

// Merge classes
const className = cn('base-class', condition && 'conditional-class')

// Format address
const short = formatAddress('0x1234567890abcdef1234567890abcdef12345678')
// => "0x1234...5678"

// Format currency
const formatted = formatCurrency(1234.5678, 'NOR', 4)
// => "NOR 1,234.5678"
```

### Design Tokens

```typescript
import { colors, spacing, typography } from '@norchain/design-system'

// Use tokens
const primaryColor = colors.primary[500]
const padding = spacing.lg
```

## Components

Coming soon: React component library

## License

MIT

