/**
 * Component Tests for Button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { render as customRender } from '../../utils/test-utils';

describe('Button', () => {
  it('should render with children', () => {
    customRender(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    customRender(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByText('Click me');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    customRender(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading', () => {
    customRender(<Button loading>Loading</Button>);
    const button = screen.getByText('Loading');
    expect(button).toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    customRender(<Button loading>Loading</Button>);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { rerender } = customRender(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-gradient-to-r');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-600');
  });

  it('should apply size styles', () => {
    const { rerender } = customRender(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('h-9');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText('Medium')).toHaveClass('h-12');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('h-14');
  });

  it('should apply fullWidth class when fullWidth is true', () => {
    customRender(<Button fullWidth>Full Width</Button>);
    expect(screen.getByText('Full Width')).toHaveClass('w-full');
  });

  it('should render icon on left by default', () => {
    const icon = <span data-testid="icon">Icon</span>;
    customRender(<Button icon={icon}>With Icon</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render icon on right when specified', () => {
    const icon = <span data-testid="icon">Icon</span>;
    customRender(<Button icon={icon} iconPosition="right">With Icon</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should not render icon when loading', () => {
    const icon = <span data-testid="icon">Icon</span>;
    customRender(<Button icon={icon} loading>Loading</Button>);
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });
});

