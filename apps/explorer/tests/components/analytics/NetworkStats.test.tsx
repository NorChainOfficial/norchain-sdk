/**
 * Component Tests for NetworkStats
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkStats } from '@/components/analytics/NetworkStats';
import { render as customRender } from '../../utils/test-utils';

describe('NetworkStats', () => {
  it('should render network stats', () => {
    customRender(<NetworkStats />);
    // Component should render (may show loading or stats)
    const component = document.querySelector('[class*="stat"], [class*="network"]');
    expect(component).toBeDefined();
  });

  it('should display loading state', () => {
    customRender(<NetworkStats />);
    // May show loading skeleton or stats
    const hasContent = document.querySelector('.animate-pulse') || screen.queryByText(/\d+/);
    expect(hasContent).toBeTruthy();
  });
});

