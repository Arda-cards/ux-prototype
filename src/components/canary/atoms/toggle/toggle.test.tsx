import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toggle } from './toggle';

describe('Toggle', () => {
  it('renders children', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.getByRole('button', { name: 'Bold' })).toBeVisible();
  });

  it('toggles pressed state on click (uncontrolled)', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-state', 'off');
    fireEvent.click(button);
    expect(button).toHaveAttribute('data-state', 'on');
    fireEvent.click(button);
    expect(button).toHaveAttribute('data-state', 'off');
  });

  it('calls onPressedChange when toggled', () => {
    const onChange = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={onChange}>
        B
      </Toggle>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('respects controlled pressed prop', () => {
    render(
      <Toggle aria-label="Bold" pressed>
        B
      </Toggle>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'on');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Toggle aria-label="Bold" disabled>
        B
      </Toggle>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes', () => {
    render(
      <Toggle aria-label="Bold" variant="outline">
        B
      </Toggle>,
    );
    expect(screen.getByRole('button').className).toContain('border');
  });

  it('applies size classes', () => {
    render(
      <Toggle aria-label="Bold" size="sm">
        B
      </Toggle>,
    );
    expect(screen.getByRole('button').className).toContain('h-8');
  });
});
