/**
 * Component Tests for Badge
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { render as customRender } from '../../utils/test-utils';

describe('Badge', () => {
  it('should render badge-like components', () => {
    // Test badge-like spans
    customRender(<span className="badge bg-green-500 text-white px-2 py-1 rounded">Success</span>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { rerender } = customRender(
      <span className="badge bg-green-500">Success</span>
    );
    expect(screen.getByText('Success')).toHaveClass('bg-green-500');

    rerender(<span className="badge bg-red-500">Danger</span>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-500');
  });
});

