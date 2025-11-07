# Integration Guide: Enhanced Contract Interaction

This guide shows how to integrate the enhanced contract interaction components into your XaheenExplorer application.

## Quick Start

### 1. Replace Existing Components

Update your contract page to use the enhanced components:

```tsx
// Before: app/contracts/[address]/page.tsx
import { ReadContract } from '@/components/ReadContract';
import { WriteContract } from '@/components/WriteContract';

// After:
import { EnhancedReadContract } from '@/components/contract/EnhancedReadContract';
import { EnhancedWriteContract } from '@/components/contract/EnhancedWriteContract';

export default function ContractPage({ params }: { params: { address: string } }) {
  // ... fetch contract data

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs>
        <TabPanel label="Read Contract">
          <EnhancedReadContract
            contractAddress={contract.address}
            abi={contract.abi}
          />
        </TabPanel>

        <TabPanel label="Write Contract">
          <EnhancedWriteContract
            contractAddress={contract.address}
            abi={contract.abi}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}
```

### 2. Add Type Declarations

Extend window.ethereum types for TypeScript:

```typescript
// types/ethereum.d.ts
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
```

### 3. Verify Dependencies

Ensure these packages are installed:

```bash
npm install ethers@^6.15.0
npm install @tanstack/react-query@^5.0.0
```

## Page-Level Integration

### Complete Contract Page Example

```tsx
// app/contracts/[address]/page.tsx
import { Suspense } from 'react';
import { EnhancedReadContract } from '@/components/contract/EnhancedReadContract';
import { EnhancedWriteContract } from '@/components/contract/EnhancedWriteContract';
import { SourceCodeViewer } from '@/components/SourceCodeViewer';
import { ContractEvents } from '@/components/ContractEvents';
import { apiClient } from '@/lib/api-client';

interface ContractPageProps {
  readonly params: {
    readonly address: string;
  };
}

export default async function ContractPage({ params }: ContractPageProps) {
  // Fetch contract data
  const contract = await apiClient.getContract(params.address);

  if (!contract.is_verified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">
            Contract Not Verified
          </h2>
          <p className="text-gray-300">
            This contract has not been verified. Contract interaction is only
            available for verified contracts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Contract Header */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-4">
          {contract.verification?.contract_name || 'Contract'}
        </h1>
        <p className="text-gray-400 font-mono">{contract.contract_address}</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button className="py-4 border-b-2 border-blue-500 text-blue-400 font-medium">
              Read Contract
            </button>
            <button className="py-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium">
              Write Contract
            </button>
            <button className="py-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium">
              Code
            </button>
            <button className="py-4 border-b-2 border-transparent text-gray-400 hover:text-white font-medium">
              Events
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <EnhancedReadContract
              contractAddress={contract.contract_address}
              abi={contract.abi || []}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### With React Query

For better data management, integrate with React Query:

```tsx
// app/contracts/[address]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { EnhancedReadContract } from '@/components/contract/EnhancedReadContract';
import { EnhancedWriteContract } from '@/components/contract/EnhancedWriteContract';
import { apiClient } from '@/lib/api-client';

export default function ContractPage({ params }: { params: { address: string } }) {
  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', params.address],
    queryFn: () => apiClient.getContract(params.address),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !contract) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {contract.is_verified && (
        <>
          <EnhancedReadContract
            contractAddress={contract.contract_address}
            abi={contract.abi || []}
          />

          <EnhancedWriteContract
            contractAddress={contract.contract_address}
            abi={contract.abi || []}
          />
        </>
      )}
    </div>
  );
}
```

## Backend Integration

### XaheenSDK API Integration

If using XaheenSDK backend, modify the interaction service:

```typescript
// lib/contracts/xaheen-interaction-service.ts
import { ContractInteractionService, ReadCallResult } from './interaction-service';
import { apiClient } from '@/lib/api-client';

export class XaheenContractInteractionService extends ContractInteractionService {
  /**
   * Read from contract via XaheenSDK API
   */
  public async readContract(
    contractAddress: string,
    abi: readonly any[],
    functionName: string,
    params: readonly unknown[] = [],
    useCache = true
  ): Promise<ReadCallResult> {
    try {
      // Try XaheenSDK API first
      const result = await apiClient.readContract(
        contractAddress,
        functionName,
        params as any[]
      );

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }
    } catch (error) {
      console.warn('XaheenSDK API call failed, falling back to direct RPC');
    }

    // Fallback to direct RPC call
    return super.readContract(contractAddress, abi, functionName, params, useCache);
  }
}
```

Update components to use the new service:

```tsx
// components/contract/EnhancedReadContract.tsx
import { XaheenContractInteractionService } from '@/lib/contracts/xaheen-interaction-service';

// In component:
const interactionService = useMemo(
  () => new XaheenContractInteractionService(),
  []
);
```

## Advanced Features

### 1. Contract ABI Upload

Allow users to upload ABI for unverified contracts:

```tsx
'use client';

import { useState } from 'react';
import { AbiManager } from '@/lib/contracts/abi-manager';
import { EnhancedReadContract } from '@/components/contract/EnhancedReadContract';

export function ContractWithABIUpload({ address }: { address: string }) {
  const [abi, setAbi] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAbiUpload = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(event.target.value);
      if (AbiManager.isValidAbi(parsed)) {
        setAbi(parsed);
        setError(null);
      } else {
        setError('Invalid ABI format');
      }
    } catch (err) {
      setError('Invalid JSON');
    }
  };

  return (
    <div className="space-y-6">
      {!abi ? (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Upload Contract ABI</h3>
          <textarea
            onChange={handleAbiUpload}
            placeholder="Paste contract ABI JSON here..."
            className="w-full h-64 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm"
          />
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      ) : (
        <EnhancedReadContract contractAddress={address} abi={abi} />
      )}
    </div>
  );
}
```

### 2. Transaction History

Track user's transaction history:

```tsx
'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  hash: string;
  functionName: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('transaction_history');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const addTransaction = (tx: Transaction) => {
    const updated = [tx, ...transactions].slice(0, 10); // Keep last 10
    setTransactions(updated);
    localStorage.setItem('transaction_history', JSON.stringify(updated));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div key={tx.hash} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
            <div>
              <p className="text-white font-mono text-sm">{tx.hash}</p>
              <p className="text-gray-400 text-xs">{tx.functionName}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              tx.status === 'success' ? 'bg-green-600' :
              tx.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
            } text-white`}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Gas Price Tracker

Show current gas prices:

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { ethers, BrowserProvider } from 'ethers';

export function GasPriceTracker() {
  const { data: gasPrice } = useQuery({
    queryKey: ['gasPrice'],
    queryFn: async () => {
      if (typeof window === 'undefined' || !window.ethereum) {
        return null;
      }
      const provider = new BrowserProvider(window.ethereum);
      const feeData = await provider.getFeeData();
      return feeData.gasPrice;
    },
    refetchInterval: 15000, // Update every 15 seconds
  });

  if (!gasPrice) return null;

  const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');

  return (
    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Current Gas Price:</span>
        <span className="text-blue-400 font-mono font-medium">
          {parseFloat(gasPriceGwei).toFixed(2)} Gwei
        </span>
      </div>
    </div>
  );
}
```

## Testing

### Unit Tests

```typescript
// __tests__/abi-manager.test.ts
import { AbiManager } from '@/lib/contracts/abi-manager';

describe('AbiManager', () => {
  it('validates uint256 correctly', () => {
    const manager = new AbiManager([]);

    expect(manager.validateAndParseInput('123', 'uint256')).toEqual({
      isValid: true,
      parsedValue: '123',
    });

    expect(manager.validateAndParseInput('-123', 'uint256')).toEqual({
      isValid: false,
      error: 'Unsigned integers cannot be negative',
    });
  });

  it('validates addresses correctly', () => {
    const manager = new AbiManager([]);

    expect(
      manager.validateAndParseInput(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        'address'
      )
    ).toEqual({
      isValid: true,
      parsedValue: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/contract-interaction.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedReadContract } from '@/components/contract/EnhancedReadContract';
import { ERC20_ABI } from '@/components/contract/examples/erc20-example';

describe('EnhancedReadContract', () => {
  it('renders read functions', () => {
    render(
      <EnhancedReadContract
        contractAddress="0x1234567890123456789012345678901234567890"
        abi={ERC20_ABI}
      />
    );

    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('balanceOf')).toBeInTheDocument();
  });

  it('validates input before query', async () => {
    render(
      <EnhancedReadContract
        contractAddress="0x1234567890123456789012345678901234567890"
        abi={ERC20_ABI}
      />
    );

    // Expand balanceOf function
    fireEvent.click(screen.getByText('balanceOf'));

    // Enter invalid address
    const input = screen.getByPlaceholderText(/0x742d35Cc/);
    fireEvent.change(input, { target: { value: 'invalid' } });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Address must be 42 characters/)).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Issue: "Provider not set" error

**Solution:** Ensure wallet is connected before write operations:

```tsx
if (!walletState.account) {
  alert('Please connect your wallet first');
  return;
}
```

### Issue: Gas estimation fails

**Solution:** Check parameter validity and wallet balance:

```tsx
try {
  const estimate = await service.estimateGas(address, abi, func, params);
  if (!estimate) {
    console.error('Parameters might be invalid or insufficient balance');
  }
} catch (error) {
  console.error('Gas estimation error:', error);
}
```

### Issue: MetaMask not detected

**Solution:** Add fallback for missing provider:

```tsx
const hasMetaMask = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

if (!hasMetaMask) {
  return (
    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
      <a href="https://metamask.io" target="_blank">
        Install MetaMask
      </a>
    </div>
  );
}
```

## Performance Tips

1. **Use memoization** for ABI parsing:
```tsx
const { readFunctions } = useMemo(() => abiManager.parseAbi(), [abiManager]);
```

2. **Enable caching** for read calls:
```tsx
await service.readContract(address, abi, func, params, true); // Enable cache
```

3. **Batch reads** when possible:
```tsx
const results = await service.batchRead(address, abi, [
  { functionName: 'name', params: [] },
  { functionName: 'symbol', params: [] },
]);
```

## Next Steps

1. Add WalletConnect support for mobile wallets
2. Implement contract verification UI
3. Add event log streaming
4. Create transaction queue UI
5. Add hardware wallet support

## Support

For issues or questions:
- Check the README.md for component documentation
- Review example files in `examples/` directory
- See type definitions in `lib/contracts/`
