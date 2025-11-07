# Quick Reference Guide

## Installation & Setup (2 minutes)

```bash
# Already installed - just import!
import { EnhancedReadContract, EnhancedWriteContract } from '@/components/contract';
```

## Basic Usage

### Read Contract
```tsx
<EnhancedReadContract
  contractAddress="0x1234567890123456789012345678901234567890"
  abi={contractAbi}
/>
```

### Write Contract
```tsx
<EnhancedWriteContract
  contractAddress="0x1234567890123456789012345678901234567890"
  abi={contractAbi}
/>
```

## Common Patterns

### Full Contract Page
```tsx
import { EnhancedReadContract, EnhancedWriteContract } from '@/components/contract';

export default function ContractPage({ address, abi }: Props) {
  return (
    <div className="space-y-8">
      <EnhancedReadContract contractAddress={address} abi={abi} />
      <EnhancedWriteContract contractAddress={address} abi={abi} />
    </div>
  );
}
```

### Input Validation
```tsx
import { AbiManager } from '@/lib/contracts/abi-manager';

const manager = new AbiManager(abi);

// Validate input
const result = manager.validateAndParseInput('123', 'uint256');
if (!result.isValid) {
  console.error(result.error);
}
```

### Direct Contract Calls
```tsx
import { ContractInteractionService } from '@/lib/contracts/interaction-service';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const service = new ContractInteractionService(provider);

// Read
const balance = await service.readContract(
  address,
  abi,
  'balanceOf',
  ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb']
);

// Write
const tx = await service.writeContract(
  address,
  abi,
  'transfer',
  ['0x...', '1000000000000000000']
);
```

### Batch Read
```tsx
const results = await service.batchRead(address, abi, [
  { functionName: 'name', params: [] },
  { functionName: 'symbol', params: [] },
  { functionName: 'decimals', params: [] },
]);
```

### Gas Estimation
```tsx
const estimate = await service.estimateGas(
  address,
  abi,
  'transfer',
  ['0x...', '1000000000000000000']
);

console.log('Gas limit:', estimate?.gasLimit);
console.log('Cost:', estimate?.estimatedCostEth, 'ETH');
```

### Transaction Simulation
```tsx
const simulation = await service.simulateTransaction(
  address,
  abi,
  'transfer',
  ['0x...', '1000000000000000000']
);

if (simulation.success) {
  console.log('Transaction will succeed');
} else {
  console.error('Transaction will fail:', simulation.error);
}
```

## Input Examples by Type

### uint256
```typescript
Valid:   '123', '0', '999999999', '0x1e240'
Invalid: '-1', 'abc', '1.5'
```

### address
```typescript
Valid:   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
Invalid: '0xinvalid', '742d35Cc...', '0x123'
```

### bool
```typescript
Valid:   'true', 'false', '1', '0'
Invalid: 'yes', 'no', '2'
```

### bytes32
```typescript
Valid:   '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
Invalid: '0x1234', 'not bytes'
```

### uint256[]
```typescript
Valid:   '[]', '[1]', '[1, 2, 3]'
Invalid: 'not array', '1, 2, 3'
```

### string[]
```typescript
Valid:   '[]', '["a"]', '["hello", "world"]'
Invalid: '[1, 2]', 'hello, world'
```

## Error Handling

```tsx
try {
  const result = await service.readContract(address, abi, func, params);
  if (result.success) {
    console.log(result.data);
  } else {
    console.error(result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Provider not set" | Connect wallet first |
| "Transaction rejected by user" | User cancelled in MetaMask |
| "Insufficient funds" | Add more ETH to wallet |
| "Address must be 42 characters" | Check address format |
| "Value must be an integer" | Remove decimals from number |

## Testing Examples

### Unit Test
```typescript
import { AbiManager } from '@/lib/contracts/abi-manager';

test('validates uint256', () => {
  const manager = new AbiManager([]);
  const result = manager.validateAndParseInput('123', 'uint256');
  expect(result.isValid).toBe(true);
});
```

### Integration Test
```typescript
import { render, screen } from '@testing-library/react';
import { EnhancedReadContract } from '@/components/contract';

test('renders functions', () => {
  render(<EnhancedReadContract address="0x..." abi={abi} />);
  expect(screen.getByText('balanceOf')).toBeInTheDocument();
});
```

## Performance Tips

1. **Memoize ABI parsing:**
```tsx
const manager = useMemo(() => new AbiManager(abi), [abi]);
```

2. **Enable caching:**
```tsx
await service.readContract(address, abi, func, params, true);
```

3. **Use batch reads:**
```tsx
const results = await service.batchRead(address, abi, calls);
```

## File Locations

```
Components:
  /apps/web/components/contract/EnhancedReadContract.tsx
  /apps/web/components/contract/EnhancedWriteContract.tsx

Services:
  /apps/web/lib/contracts/abi-manager.ts
  /apps/web/lib/contracts/interaction-service.ts

Examples:
  /apps/web/components/contract/examples/erc20-example.ts
  /apps/web/components/contract/examples/nft-example.ts
  /apps/web/components/contract/examples/complex-types-example.ts

Documentation:
  /apps/web/components/contract/README.md
  /apps/web/components/contract/INTEGRATION_GUIDE.md
  /apps/web/components/contract/IMPLEMENTATION_SUMMARY.md
```

## Troubleshooting

### MetaMask not detected
```tsx
if (typeof window.ethereum === 'undefined') {
  // Show install MetaMask message
}
```

### Wrong network
```tsx
const network = await provider.getNetwork();
if (network.chainId !== expectedChainId) {
  // Show network switch prompt
}
```

### Transaction fails
```tsx
// Always simulate first
const sim = await service.simulateTransaction(...);
if (!sim.success) {
  alert(`Transaction will fail: ${sim.error}`);
  return;
}
```

## Next Steps

1. See **README.md** for full documentation
2. Check **INTEGRATION_GUIDE.md** for setup instructions
3. Review **IMPLEMENTATION_SUMMARY.md** for architecture details
4. Try **examples/** for test contracts

## Support

- GitHub Issues: [Link to repo]
- Documentation: /apps/web/components/contract/README.md
- Examples: /apps/web/components/contract/examples/
