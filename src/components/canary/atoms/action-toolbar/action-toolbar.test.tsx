import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SquarePen, Printer } from 'lucide-react';
import { ArdaActionToolbar } from './action-toolbar';

describe('ArdaActionToolbar', () => {
  it('renders action buttons with labels', () => {
    render(
      <ArdaActionToolbar
        actions={[
          { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: () => {} },
          { key: 'print', label: 'Print card', icon: Printer, onAction: () => {} },
        ]}
      />,
    );
    expect(screen.getByText('Edit item')).toBeInTheDocument();
    expect(screen.getByText('Print card')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ArdaActionToolbar actions={[{ key: 'edit', label: 'Edit', icon: SquarePen, onAction }]} />,
    );
    await user.click(screen.getByText('Edit'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('disables button when disabled prop is true', () => {
    render(
      <ArdaActionToolbar
        actions={[
          { key: 'edit', label: 'Edit', icon: SquarePen, onAction: () => {}, disabled: true },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
  });

  it('shows loading state', () => {
    render(
      <ArdaActionToolbar
        actions={[
          { key: 'print', label: 'Print', icon: Printer, onAction: () => {}, loading: true },
        ]}
      />,
    );
    expect(screen.getByText('Loading\u2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('renders overflow menu trigger with aria-label', () => {
    render(
      <ArdaActionToolbar
        overflowActions={[{ key: 'delete', label: 'Delete', onAction: () => {} }]}
      />,
    );
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('renders nothing when no actions provided', () => {
    const { container } = render(<ArdaActionToolbar />);
    expect(container.firstChild).toBeNull();
  });
});
