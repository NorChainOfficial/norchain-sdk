/**
 * Component Tests for Badge
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';
import { render as customRender } from '../../utils/test-utils';

describe('Badge', () => {
  it('should render with text', () => {
    customRender(<Badge>Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { rerender } = customRender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass(/success|green/i);

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText('Danger')).toHaveClass(/danger|red/i);
  });
});

