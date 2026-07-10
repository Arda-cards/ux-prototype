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
