import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SquarePen, Trash2 } from 'lucide-react';
import { ArdaGridAction } from './grid-action';

describe('ArdaGridAction', () => {
  it('renders with label and icon', () => {
    render(<ArdaGridAction icon={SquarePen} label="Edit item" onAction={() => {}} />);
    const button = screen.getByRole('button', { name: 'Edit item' });
    expect(button).toBeVisible();
    // Short label defaults to first word of label
    expect(screen.getByText('Edit')).toBeVisible();
  });

  it('uses shortLabel when provided', () => {
    render(
      <ArdaGridAction
        icon={SquarePen}
        label="Add to queue"
        shortLabel="Queue"
        onAction={() => {}}
      />,
    );
    expect(screen.getByText('Queue')).toBeVisible();
    expect(screen.queryByText('Add to queue')).not.toBeInTheDocument();
  });

  it('calls onAction when clicked', () => {
    const onAction = vi.fn();
    render(<ArdaGridAction icon={SquarePen} label="Edit" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<ArdaGridAction icon={SquarePen} label="Edit" onAction={() => {}} disabled />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });

  it('is disabled and shows loading text when loading', () => {
    render(<ArdaGridAction icon={SquarePen} label="Edit" onAction={() => {}} loading />);
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Wait\u2026')).toBeVisible();
  });

  it('applies destructive styling', () => {
    render(<ArdaGridAction icon={Trash2} label="Delete" onAction={() => {}} destructive />);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('text-destructive');
  });

  it('hides icon from screen readers', () => {
    const { container } = render(
      <ArdaGridAction icon={SquarePen} label="Edit" onAction={() => {}} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
