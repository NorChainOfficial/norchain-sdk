/**
 * Component Tests for Card
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';
import { render as customRender } from '../../utils/test-utils';

describe('Card', () => {
  it('should render with children', () => {
    customRender(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    customRender(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('custom-class');
  });
});

