import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ArdaButton } from './button';

describe('ArdaButton', () => {
  it('renders children', () => {
    render(<ArdaButton>Save</ArdaButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ArdaButton onClick={onClick}>Save</ArdaButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<ArdaButton disabled>Save</ArdaButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and shows spinner when loading', () => {
    render(<ArdaButton loading>Saving…</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Spinner SVG should be present
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant classes', () => {
    render(<ArdaButton variant="destructive">Delete</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-destructive');
  });

  it('applies size classes', () => {
    render(<ArdaButton size="sm">Small</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-8');
  });

  it('merges custom className', () => {
    render(<ArdaButton className="mt-4">Save</ArdaButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('mt-4');
  });
});
