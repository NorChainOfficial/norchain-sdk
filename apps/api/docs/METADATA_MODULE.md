# Metadata Module - Self-Service Token/Contract Metadata

## Overview

The Metadata Module enables developers and token/contract owners to self-publish rich metadata (logos, descriptions, social links, docs, audits, tags) without filing requests. It includes cryptographic ownership verification, trust tiers, and abuse protection.

## Features

### Trust Levels
1. **Unverified** - Anyone can submit; rate-limited; soft visibility
2. **Owner Verified** - Submitter proves control via EIP-191/EIP-1271 signature
3. **Community Verified** - Quorum of N reputable signers approves
4. **Nor Verified** - NorChain review (automated + human); highest trust

### Core Capabilities
- ✅ Challenge-based ownership verification
- ✅ Profile submission with cryptographic proof
- ✅ Version history (append-only audit trail)
- ✅ Community attestations
- ✅ Abuse reporting with auto-shadow
- ✅ Search and discovery
- ✅ RPC extensions (`nor_tokenProfile`, `nor_contractProfile`)

## API Endpoints

### REST v2

#### `POST /api/v2/metadata/challenges`
Create ownership challenge for signing.

**Request:**
```json
{
  "chainId": "65001",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

**Response:**
```json
{
  "challengeId": "uuid",
  "message": "NorChain Metadata Claim\n\nChain: 65001\nAddress: 0x...\nNonce: abc123\n\nSign this message to prove ownership.",
  "expiresAt": "2025-01-10T15:00:00Z"
}
```

#### `POST /api/v2/metadata/profiles`
Submit or update asset profile (idempotent).

**Request:**
```json
{
  "type": "token",
  "chainId": "65001",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "display": {
    "name": "My Token",
    "symbol": "MTK",
    "shortDescription": "A revolutionary token",
    "description": "Full description..."
  },
  "media": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "bannerUrl": "https://cdn.example.com/banner.png",
    "themeColor": "#FF5733"
  },
  "links": {
    "website": "https://example.com",
    "docs": "https://docs.example.com",
    "twitter": "https://twitter.com/example"
  },
  "tags": ["defi", "rwa"],
  "attestation": {
    "method": "eip191",
    "signer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "signature": "0x...",
    "challengeId": "uuid"
  }
}
```

#### `GET /api/v2/metadata/profiles/{chainId}/{address}`
Get current profile.

#### `GET /api/v2/metadata/profiles/{chainId}/{address}/versions`
Get profile version history.

#### `GET /api/v2/metadata/search?query=token&tag=defi&trustLevel=owner_verified`
Search profiles with filters.

#### `POST /api/v2/metadata/attest`
Add community attestation.

#### `POST /api/v2/metadata/report`
Report profile for abuse/phishing.

#### `POST /api/v2/metadata/media`
Upload logo/banner (returns CDN URLs).

### RPC Extensions

#### `nor_tokenProfile(address)`
Returns minimal token profile for wallets:
```json
{
  "name": "My Token",
  "symbol": "MTK",
  "logoUrl": "https://cdn.../logo.png",
  "trustLevel": "owner_verified",
  "version": 1
}
```

#### `nor_contractProfile(address)`
Returns contract profile:
```json
{
  "name": "My Contract",
  "description": "Short description",
  "logoUrl": "https://cdn.../logo.png",
  "website": "https://example.com",
  "docsUrl": "https://docs.example.com",
  "trustLevel": "owner_verified",
  "version": 1
}
```

## Usage Flow

### 1. Claim Asset
```typescript
// 1. Create challenge
const { challengeId, message } = await fetch('/api/v2/metadata/challenges', {
  method: 'POST',
  body: JSON.stringify({ chainId: '65001', address: '0x...' })
}).then(r => r.json());

// 2. Sign message with wallet
const signature = await signer.signMessage(message);

// 3. Submit profile
const profile = await fetch('/api/v2/metadata/profiles', {
  method: 'POST',
  headers: { 'Idempotency-Key': crypto.randomUUID() },
  body: JSON.stringify({
    type: 'token',
    chainId: '65001',
    address: '0x...',
    display: { name: 'My Token', symbol: 'MTK' },
    attestation: { method: 'eip191', signer: address, signature, challengeId }
  })
}).then(r => r.json());
```

### 2. Update Profile
Same flow as claim, but with existing profile - creates new version.

### 3. Community Verification
```typescript
// Add attestation
await fetch('/api/v2/metadata/attest', {
  method: 'POST',
  body: JSON.stringify({
    profileId: 'uuid',
    signerAddress: '0x...',
    signature: '0x...',
    rationale: 'Verified by community member'
  })
});
```

## Database Schema

### Tables
- `asset_profiles` - Main profile data
- `asset_profile_versions` - Immutable version history
- `ownership_challenges` - Short-lived signing challenges
- `community_attestations` - Community verification signatures
- `asset_reports` - Abuse/phishing reports

### Indexes
- `(type, chainId, address)` - Unique constraint
- `(trustLevel, reviewState)` - Filtering
- `(chainId, address)` - Lookups

## Security

- **Signature Verification**: EIP-191 (EOA) and EIP-1271 (contracts)
- **Rate Limiting**: Per IP/user/address
- **Abuse Detection**: Auto-shadow on high-risk keywords
- **Phishing Protection**: Fuzzy name matching against top tokens
- **File Validation**: MIME type, size limits (1MB, 512×512)

## Real-time Updates

Profile updates emit events via EventEmitter:
- `metadata.profile.updated` - Profile created/updated
- `metadata.profile.verified` - Trust level upgraded

WebSocket/SSE clients can subscribe to these events for instant UI updates.

## Integration Points

- **Explorer**: Show profile cards with trust badges
- **Wallet**: Pull `nor_tokenProfile` for logos/symbols
- **DEX**: Display badges (Audited, RWA, Stable), risk warnings
- **Bridge**: Enforce stricter warnings for unverified assets

## Future Enhancements

- Supabase Storage integration for media uploads
- IPFS pinning for decentralized storage
- DNS/ENS verification methods
- Governance hooks for disputes
- TokenList JSON auto-generation
- CLI tool (`norctl metadata claim`)

---

**Status**: ✅ Core implementation complete  
**Next**: Supabase Storage integration, IPFS pinning, enhanced verification methods

