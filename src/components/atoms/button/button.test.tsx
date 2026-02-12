import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ArdaButton } from './button';

describe('ArdaButton', () => {
  it('renders with text content', () => {
    render(<ArdaButton>Click Me</ArdaButton>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('applies primary variant class by default', () => {
    render(<ArdaButton>Primary</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('arda-btn-primary');
  });

  it('applies secondary variant class', () => {
    render(<ArdaButton variant="secondary">Secondary</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('arda-btn-secondary');
  });

  it('applies ghost variant class', () => {
    render(<ArdaButton variant="ghost">Ghost</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('arda-btn-ghost');
  });

  it('applies destructive variant class', () => {
    render(<ArdaButton variant="destructive">Delete</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('arda-btn-destructive');
  });

  it('applies size classes', () => {
    const { rerender } = render(<ArdaButton size="sm">Small</ArdaButton>);
    expect(screen.getByRole('button').className).toContain('arda-btn-sm');

    rerender(<ArdaButton size="md">Medium</ArdaButton>);
    expect(screen.getByRole('button').className).toContain('arda-btn-md');

    rerender(<ArdaButton size="lg">Large</ArdaButton>);
    expect(screen.getByRole('button').className).toContain('arda-btn-lg');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<ArdaButton onClick={handleClick}>Click</ArdaButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<ArdaButton disabled>Disabled</ArdaButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading', () => {
    render(<ArdaButton loading>Loading</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.className).toContain('arda-btn-loading');
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ArdaButton disabled onClick={handleClick}>
        No Click
      </ArdaButton>,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
