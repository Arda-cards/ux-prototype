import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TokenChip } from './token-chip';

describe('TokenChip', () => {
  it('renders the value and fires onRemove from the × button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<TokenChip value="a@x.com" onRemove={onRemove} />);
    expect(screen.getByText('a@x.com')).toBeInTheDocument();
    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Remove a@x.com' }),
    });
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('renders no × without onRemove', () => {
    render(<TokenChip value="a@x.com" />);
    expect(screen.queryByRole('button', { name: 'Remove a@x.com' })).toBeNull();
  });

  it('fires the inline action without triggering remove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onAction = vi.fn();
    render(
      <TokenChip
        value="a@x.com"
        onRemove={onRemove}
        action={{ label: 'Set a@x.com as default', icon: <span>*</span>, onAction }}
      />,
    );
    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Set a@x.com as default' }),
    });
    expect(onAction).toHaveBeenCalledOnce();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('activates remove and action via keyboard clicks (detail 0)', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const onRemove = vi.fn();
    const onAction = vi.fn();
    render(
      <TokenChip
        value="a@x.com"
        onRemove={onRemove}
        action={{ label: 'Promote a@x.com', icon: <span>*</span>, onAction }}
      />,
    );
    // fireEvent.click dispatches detail 0 with no pointerdown — the
    // keyboard/assistive-tech activation path.
    fireEvent.click(screen.getByRole('button', { name: 'Remove a@x.com' }));
    fireEvent.click(screen.getByRole('button', { name: 'Promote a@x.com' }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('does not double-fire when a pointer press precedes the click', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<TokenChip value="a@x.com" onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Remove a@x.com' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('shields host pointerdown handlers when internal buttons fire', async () => {
    const user = userEvent.setup();
    const hostPointerDown = vi.fn();
    render(
      <span onPointerDown={hostPointerDown}>
        <TokenChip value="a@x.com" onRemove={vi.fn()} />
      </span>,
    );
    await user.pointer({
      keys: '[MouseLeft]',
      target: screen.getByRole('button', { name: 'Remove a@x.com' }),
    });
    expect(hostPointerDown).not.toHaveBeenCalled();
  });
});
