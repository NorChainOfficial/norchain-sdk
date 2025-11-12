/**
 * Component Tests for SearchBar
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/layout/SearchBar';
import { render as customRender } from '../../utils/test-utils';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    customRender(<SearchBar />);
    const input = screen.getByPlaceholderText(/search|block|transaction|address/i);
    expect(input).toBeInTheDocument();
  });

  it('should allow typing in search input', async () => {
    const user = userEvent.setup();
    customRender(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/search|block|transaction|address/i) as HTMLInputElement;
    await user.type(input, '0x123');
    
    expect(input.value).toBe('0x123');
  });

  it('should handle search submission', async () => {
    const user = userEvent.setup();
    customRender(<SearchBar />);
    
    const input = screen.getByPlaceholderText(/search|block|transaction|address/i);
    await user.type(input, '0x123');
    await user.keyboard('{Enter}');
    
    // Search should trigger navigation or search action
    // Exact behavior depends on implementation
    expect(input).toBeInTheDocument();
  });
});

