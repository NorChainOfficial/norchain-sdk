/**
 * Component Tests for TokenHoldings
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TokenHoldings } from '@/components/accounts/TokenHoldings';
import { render as customRender } from '../../utils/test-utils';

const mockTokenHoldings = [
  {
    contractAddress: '0x123',
    symbol: 'USDT',
    name: 'Tether USD',
    balance: '1000000000000000000',
    decimals: 18,
  },
  {
    contractAddress: '0x456',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    balance: '500000000000000000',
    decimals: 18,
  },
];

describe('TokenHoldings', () => {
  it('should render loading state', () => {
    customRender(
      <TokenHoldings address="0x123" nativeBalance="1000" isLoading={true} />
    );
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should display native balance', () => {
    customRender(
      <TokenHoldings address="0x123" nativeBalance="1000" tokenHoldings={[]} />
    );
    expect(screen.getByText(/NOR/i)).toBeInTheDocument();
  });

  it('should display token holdings', () => {
    customRender(
      <TokenHoldings
        address="0x123"
        nativeBalance="1000"
        tokenHoldings={mockTokenHoldings}
      />
    );
    expect(screen.getByText(/USDT/i)).toBeInTheDocument();
    expect(screen.getByText(/WBTC/i)).toBeInTheDocument();
  });

  it('should handle empty token holdings', () => {
    customRender(
      <TokenHoldings address="0x123" nativeBalance="1000" tokenHoldings={[]} />
    );
    expect(screen.getByText(/NOR/i)).toBeInTheDocument();
  });
});

