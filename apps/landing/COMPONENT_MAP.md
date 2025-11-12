# 🗺️ XAHEEN LANDING PAGE - COMPONENT MAP

## 📐 Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Fixed Top)                                     │
│  - Logo + NorChain                                        │
│  - Navigation: Explorer, DEX, Bridge, Staking, Docs     │
│  - Launch App CTA                                       │
│  File: components/Header.tsx (116 lines)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  HERO SECTION (Above Fold)                              │
│  - NorChain Logo (white rounded square)                   │
│  - "Blockchain. Fast. Affordable. For Good."            │
│  - Subtitle with charity message                        │
│  - Live Stats Bar (4 metrics)                           │
│  - Add to MetaMask (Primary CTA)                        │
│  - 3 Secondary CTAs                                     │
│  File: components/Hero.tsx (277 lines)                  │
│  Updates: Every 3 seconds (live blockchain data)        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FEATURES (4 Cards)                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │    ⚡    │    💰    │    🔧    │    ❤️    │         │
│  │Lightning │   Ultra  │    EVM   │Blockchain│         │
│  │   Fast   │Affordable│Compatible│ for Good │         │
│  │  3s      │ <$0.001  │ Solidity │  $164k/  │         │
│  │ blocks   │   fees   │  ready   │   year   │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│  File: components/Features.tsx (56 lines)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  NETWORK STATISTICS (6 Live Metrics)                    │
│  ┌────────┬────────┬────────┬────────┬────────┬──────┐ │
│  │Current │Total Tx│ Active │  DEX   │Charity │Status│ │
│  │ Block  │        │Wallets │Volume  │Donated │      │ │
│  │ 7,542  │45,283  │ 1,247  │$24,582 │ $3,247 │Online│ │
│  └────────┴────────┴────────┴────────┴────────┴──────┘ │
│                                                          │
│  Network Info: RPC | Chain ID | Symbol                  │
│  File: components/NetworkStats.tsx (136 lines)          │
│  Updates: Every 3 seconds                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  WHY XAHEEN? (Comparison Table)                         │
│  ┌──────────────┬────────┬─────────┬────────┐          │
│  │   Feature    │ NorChain │Ethereum │Polygon │          │
│  ├──────────────┼────────┼─────────┼────────┤          │
│  │ Block Time   │   3s   │   12s   │   2s   │          │
│  │ Gas Fees     │<$0.001 │ $5-50   │$0.01-05│          │
│  │ Finality     │   3s   │12+ min  │ ~2 min │          │
│  │ TPS          │ 1000+  │  15-30  │  65+   │          │
│  │ EVM Compat   │   ✅   │   ✅    │   ✅   │          │
│  │ Charity      │✅ 5%   │   ❌    │   ❌   │          │
│  │ Carbon       │✅Offset│  ✅ PoS │ ✅ PoS │          │
│  └──────────────┴────────┴─────────┴────────┘          │
│  File: components/WhyNorChain.tsx (69 lines)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CHARITY IMPACT (Live Counters + Partners)              │
│  ┌─────────────────────────────────────┐                │
│  │    Total Donated to Date            │                │
│  │         $3,247                      │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ┌─────────┬─────────┬─────────┐                       │
│  │   🎓    │   🌳    │   🍽️   │                       │
│  │   487   │  1,234  │  6,543  │                       │
│  │Students │  Trees  │  Meals  │                       │
│  │Educated │ Planted │Provided │                       │
│  └─────────┴─────────┴─────────┘                       │
│                                                          │
│  Charity Partners (4 organizations + allocation %)      │
│  File: components/CharityImpact.tsx (144 lines)         │
│  Updates: Every 5 seconds                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  TECHNOLOGY STACK (6 Tech Cards + 6 Tool Icons)         │
│  ┌────────────┬────────────┬────────────┐              │
│  │ Consensus  │   Smart    │Infrastructure│            │
│  │    PoA     │  Contracts │    Geth    │              │
│  └────────────┴────────────┴────────────┘              │
│  ┌────────────┬────────────┬────────────┐              │
│  │ Networking │  Storage   │    APIs    │              │
│  │    P2P     │  LevelDB   │  JSON-RPC  │              │
│  └────────────┴────────────┴────────────┘              │
│                                                          │
│  Compatible Tools: MetaMask, Hardhat, Truffle, etc.     │
│  File: components/TechnologyStack.tsx (106 lines)       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ROADMAP (Timeline View)                                │
│                                                          │
│  Q4 2024 ─────●───── ✅ Foundation                      │
│  Q1 2025 ─────●───── ✅ Growth                          │
│  Q2 2025 ─────●───── 🔄 Expansion (IN PROGRESS)        │
│  Q3 2025 ─────○───── 📋 Scale (Planned)                │
│  Q4 2025 ─────○───── 📋 Maturity (Planned)             │
│                                                          │
│  File: components/Roadmap.tsx (150 lines)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FAQ (5 Categories, 15+ Questions)                      │
│  1️⃣ General (3 questions)                               │
│     ▸ What is NorChain Chain?                             │
│     ▸ How different from Ethereum?                      │
│     ▸ Is it decentralized?                              │
│                                                          │
│  2️⃣ For Developers (3 questions)                        │
│     ▸ Can I deploy Ethereum contracts?                  │
│     ▸ What languages supported?                         │
│     ▸ Developer incentives?                             │
│                                                          │
│  3️⃣ Charity & Impact (3 questions)                      │
│  4️⃣ Getting Started (3 questions)                       │
│  5️⃣ Technical (3 questions)                             │
│                                                          │
│  File: components/FAQ.tsx (176 lines)                   │
│  Interaction: Expandable/collapsible                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  COMMUNITY (6 Social Links + Newsletter)                │
│  ┌────────┬────────┬────────┬────────┬────────┬──────┐ │
│  │Discord │Twitter │Telegram│ GitHub │ Medium │YouTube│ │
│  │ 5,000+ │12,000+ │ 8,000+ │ 500+   │ 3,000+ │2,000+│ │
│  │members │followers│members │ stars  │readers │subs  │ │
│  └────────┴────────┴────────┴────────┴────────┴──────┘ │
│                                                          │
│  Newsletter Signup Form                                 │
│  File: components/Community.tsx (105 lines)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FOOTER (4 Columns + Bottom Bar)                        │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ Product  │Developers│ Resources│  Company │         │
│  │ Explorer │   Docs   │Whitepaper│  About   │         │
│  │   DEX    │   API    │  Brand   │ Careers  │         │
│  │  Bridge  │   SDK    │  Audits  │ Contact  │         │
│  │ Staking  │  GitHub  │  Reports │ Privacy  │         │
│  │Governance│Bug Bounty│   Blog   │  Terms   │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  © 2025 NorChain | Privacy | Terms | Cookies              │
│  Chain ID: 65001 | RPC: rpc.xaheen.org | Symbol: XHT    │
│  File: components/Footer.tsx (141 lines)                │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Component Hierarchy

```
app/page.tsx (Main Page)
│
├── Header.tsx
│   └── Navigation Links
│       └── Launch App CTA
│
├── Hero.tsx
│   ├── Logo
│   ├── Tagline
│   ├── Live Stats (4 metrics)
│   │   └── RPC Call → eth_blockNumber
│   ├── MetaMask Button
│   │   └── wallet_addEthereumChain
│   └── Secondary CTAs
│
├── Features.tsx
│   └── 4 Feature Cards
│       ├── Lightning Fast
│       ├── Ultra Affordable
│       ├── EVM Compatible
│       └── Blockchain for Good
│
├── NetworkStats.tsx
│   ├── 6 Live Metrics
│   │   └── RPC Call → eth_blockNumber
│   └── Network Info Card
│
├── WhyNorChain.tsx
│   └── Comparison Table
│       ├── NorChain Column (highlighted)
│       ├── Ethereum Column
│       └── Polygon Column
│
├── CharityImpact.tsx
│   ├── Total Donated Counter
│   │   └── RPC Call → eth_blockNumber
│   ├── 3 Impact Metrics
│   │   ├── Students Educated
│   │   ├── Trees Planted
│   │   └── Meals Provided
│   └── 4 Charity Partners
│
├── TechnologyStack.tsx
│   ├── 6 Technology Cards
│   └── 6 Compatible Tools
│
├── Roadmap.tsx
│   └── 5 Timeline Milestones
│       ├── Q4 2024 (Completed)
│       ├── Q1 2025 (Completed)
│       ├── Q2 2025 (In Progress)
│       ├── Q3 2025 (Planned)
│       └── Q4 2025 (Planned)
│
├── FAQ.tsx
│   └── 5 Categories
│       ├── General (3 Q&A)
│       ├── For Developers (3 Q&A)
│       ├── Charity & Impact (3 Q&A)
│       ├── Getting Started (3 Q&A)
│       └── Technical (3 Q&A)
│
├── Community.tsx
│   ├── 6 Social Links
│   └── Newsletter Form
│
└── Footer.tsx
    ├── Brand Section
    ├── 4 Link Columns
    └── Bottom Bar
```

---

## 🔄 Data Flow

```
Blockchain RPC (https://rpc.xaheen.org)
            ↓
    JSON-RPC Request
    method: eth_blockNumber
            ↓
    Block Height (e.g., 7542)
            ↓
    ┌──────────────────────────┐
    │   Hero Component         │
    │   - Block height         │
    │   - Charity total        │
    └──────────────────────────┘
            ↓
    ┌──────────────────────────┐
    │ NetworkStats Component   │
    │   - Current block        │
    │   - Total transactions   │
    │   - Active wallets       │
    │   - DEX volume           │
    └──────────────────────────┘
            ↓
    ┌──────────────────────────┐
    │ CharityImpact Component  │
    │   - Total donated        │
    │   - Students helped      │
    │   - Trees planted        │
    │   - Meals provided       │
    └──────────────────────────┘
            ↓
    Updates every 3-5 seconds
```

---

## 📊 Component Stats

| Component | Lines | Updates | Purpose |
|-----------|-------|---------|---------|
| Header | 116 | Static | Navigation |
| Hero | 277 | 3s | MetaMask + Stats |
| Features | 56 | Static | Value props |
| NetworkStats | 136 | 3s | Live metrics |
| WhyNorChain | 69 | Static | Comparison |
| CharityImpact | 144 | 5s | Social impact |
| TechnologyStack | 106 | Static | Technical |
| Roadmap | 150 | Static | Timeline |
| FAQ | 176 | Static | Questions |
| Community | 105 | Static | Social |
| Footer | 141 | Static | Links |

**Total:** 1,476 lines of code

---

## 🎨 Color Usage Map

```
HEADER
├── Background: White with blur
└── Text: Gray-900

HERO
├── Background: Blue-600 to Blue-800 gradient
├── Text: White
├── Accent: Green-300 (charity)
└── CTA: White background, Blue-700 text

FEATURES
├── Background: White
├── Cards: White with Gray-200 border
├── Hover: Blue-600 border
└── Metrics: Blue-50 background

NETWORK STATS
├── Background: Gray-50
├── Cards: White
├── Highlight: Green-500 ring (charity)
└── Status: Green-500 pulse

COMPARISON TABLE
├── Background: White
├── Header: Blue-600 gradient
├── NorChain column: Blue-50 background
└── Text: Gray-900

CHARITY IMPACT
├── Background: Green-50 to Blue-50 gradient
├── Total: Green-600
└── Cards: White

TECHNOLOGY STACK
├── Background: Gray-900 to Blue-900 gradient
├── Cards: White/10 with blur
└── Text: White

ROADMAP
├── Background: White
├── Timeline: Blue-600 to Green-500 gradient
├── Completed: Green-500 border
├── In Progress: Blue-500 border
└── Planned: Gray-300 border

FAQ
├── Background: Gray-50
├── Cards: White
└── Icons: Blue-600

COMMUNITY
├── Background: Blue-900 to Purple-900 gradient
├── Cards: White/10 with blur
└── Text: White

FOOTER
├── Background: Gray-900
├── Text: Gray-300
└── Links: Hover to White
```

---

## 🎯 CTA Locations

```
PRIMARY CTAs:
1. Add to MetaMask (Hero)
   - Location: Center of hero
   - Size: Large (px-10 py-4)
   - Color: White on blue gradient background

2. Launch App (Header)
   - Location: Top-right navigation
   - Size: Medium (px-6 py-2)
   - Color: Blue-Green gradient

SECONDARY CTAs:
3. Learn More (Hero) → Scroll to features
4. Block Explorer (Hero) → Opens explorer.xaheen.org
5. Investor Deck (Hero) → Downloads PDF
6. Read Docs (Multiple) → docs.xaheen.org
7. Join Discord (FAQ + Community)
8. Download Whitepaper (Why NorChain)
9. View on GitHub (Community)
10. Subscribe Newsletter (Community)
```

---

## 📱 Responsive Breakpoints

```
< 640px (Mobile)
├── Header: Hamburger menu
├── Stats: 2-column grid
├── Features: 1 column
├── Comparison: Horizontal scroll
└── Footer: 1 column

640px - 1024px (Tablet)
├── Header: Full menu
├── Stats: 3-column grid
├── Features: 2 columns
├── Comparison: Full table
└── Footer: 2 columns

> 1024px (Desktop)
├── Header: Full menu
├── Stats: 6-column grid
├── Features: 4 columns
├── Comparison: Full table
└── Footer: 4 columns
```

---

**This component map serves as a quick visual reference for understanding the landing page structure.**
