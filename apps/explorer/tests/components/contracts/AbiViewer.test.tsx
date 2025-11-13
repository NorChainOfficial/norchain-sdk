/**
 * Component Tests for AbiViewer
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AbiViewer } from '@/components/contracts/AbiViewer';
import { render as customRender } from '../../utils/test-utils';

const mockABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
];

describe('AbiViewer', () => {
  it('should render ABI viewer', () => {
    customRender(<AbiViewer abi={mockABI} contractAddress="0x123" />);
    expect(screen.getByText(/transfer/i)).toBeInTheDocument();
  });

  it('should display function names', () => {
    customRender(<AbiViewer abi={mockABI} contractAddress="0x123" />);
    expect(screen.getByText('transfer')).toBeInTheDocument();
    expect(screen.getByText('balanceOf')).toBeInTheDocument();
  });

  it('should handle empty ABI', () => {
    customRender(<AbiViewer abi={[]} contractAddress="0x123" />);
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should display function inputs', () => {
    customRender(<AbiViewer abi={mockABI} contractAddress="0x123" />);
    expect(screen.getByText(/to/i)).toBeInTheDocument();
    expect(screen.getByText(/amount/i)).toBeInTheDocument();
  });
});

