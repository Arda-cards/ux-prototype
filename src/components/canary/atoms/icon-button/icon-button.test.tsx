import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell, HelpCircle } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { ArdaIconButton } from './icon-button';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

const renderWithTooltip = (ui: React.ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>);

describe('ArdaIconButton', () => {
  it('renders with an accessible label', () => {
    renderWithTooltip(<ArdaIconButton icon={HelpCircle} label="Help" />);
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderWithTooltip(<ArdaIconButton icon={HelpCircle} label="Help" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders a badge with the correct count', () => {
    renderWithTooltip(<ArdaIconButton icon={Bell} label="Notifications" badgeCount={8} />);
    expect(screen.getByRole('status')).toHaveTextContent('8');
  });

  it('renders badge as 99+ for counts over 99', () => {
    renderWithTooltip(<ArdaIconButton icon={Bell} label="Notifications" badgeCount={142} />);
    expect(screen.getByRole('status')).toHaveTextContent('99+');
  });

  it('does not render a badge when count is undefined', () => {
    renderWithTooltip(<ArdaIconButton icon={Bell} label="Notifications" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not render a badge when count is zero', () => {
    renderWithTooltip(<ArdaIconButton icon={Bell} label="Notifications" badgeCount={0} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('badge has an accessible label describing the count', () => {
    renderWithTooltip(<ArdaIconButton icon={Bell} label="Notifications" badgeCount={3} />);
    expect(screen.getByLabelText('3 notifications')).toBeInTheDocument();
  });

  it('uses singular "notification" for count of 1', () => {
    renderWithTooltip(<ArdaIconButton icon={Bell} label="Notifications" badgeCount={1} />);
    expect(screen.getByLabelText('1 notification')).toBeInTheDocument();
  });
});
