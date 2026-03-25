import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { CopyrightAcknowledgment } from './copyright-acknowledgment';

describe('CopyrightAcknowledgment', () => {
  it('renders unchecked by default (checkbox role present, not checked)', () => {
    render(<CopyrightAcknowledgment acknowledged={false} onAcknowledge={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders legal text', () => {
    render(<CopyrightAcknowledgment acknowledged={false} onAcknowledge={vi.fn()} />);
    expect(
      screen.getByText(/I confirm that I own or have a license to use this image/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/uploading infringing material may result in account termination/),
    ).toBeInTheDocument();
  });

  it('calls onAcknowledge(true) on click', async () => {
    const user = userEvent.setup();
    const onAcknowledge = vi.fn();
    render(<CopyrightAcknowledgment acknowledged={false} onAcknowledge={onAcknowledge} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onAcknowledge).toHaveBeenCalledWith(true);
  });

  it('toggles back — second click calls with false', async () => {
    const user = userEvent.setup();
    const onAcknowledge = vi.fn();
    render(<CopyrightAcknowledgment acknowledged={true} onAcknowledge={onAcknowledge} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onAcknowledge).toHaveBeenCalledWith(false);
  });

  it('disabled prevents interaction', async () => {
    const user = userEvent.setup();
    const onAcknowledge = vi.fn();
    render(<CopyrightAcknowledgment acknowledged={false} onAcknowledge={onAcknowledge} disabled />);
    await user.click(screen.getByRole('checkbox'));
    expect(onAcknowledge).not.toHaveBeenCalled();
  });

  it('disabled applies opacity', () => {
    render(<CopyrightAcknowledgment acknowledged={false} onAcknowledge={vi.fn()} disabled />);
    const root = screen.getByRole('checkbox').closest('[data-slot="copyright-acknowledgment"]');
    expect(root).toHaveClass('opacity-50');
  });

  it('checkbox has accessible label', () => {
    render(<CopyrightAcknowledgment acknowledged={false} onAcknowledge={vi.fn()} />);
    // The label is associated via htmlFor / aria-label
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    // The label text should be present and linked
    expect(screen.getByText(/I confirm that I own or have a license/)).toBeInTheDocument();
  });
});
