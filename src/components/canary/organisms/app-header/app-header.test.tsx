import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell, HelpCircle, ScanBarcode } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { AppHeader } from './app-header';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

const renderHeader = (ui: React.ReactElement) => render(<TooltipProvider>{ui}</TooltipProvider>);

const defaultActions = [
  { key: 'help', icon: HelpCircle, label: 'Help' },
  { key: 'notifications', icon: Bell, label: 'Notifications', badgeCount: 8 },
];

const defaultButtonActions = [{ key: 'scan', icon: ScanBarcode, label: 'Scan' }];

describe('AppHeader', () => {
  it('renders a header element', () => {
    renderHeader(<AppHeader />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the search input by default', () => {
    renderHeader(<AppHeader />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('hides the search input when showSearch is false', () => {
    renderHeader(<AppHeader showSearch={false} />);
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
  });

  it('renders button actions with labels', () => {
    renderHeader(<AppHeader buttonActions={defaultButtonActions} />);
    expect(screen.getByRole('button', { name: /scan/i })).toBeInTheDocument();
  });

  it('renders icon actions with accessible labels', () => {
    renderHeader(<AppHeader actions={defaultActions} />);
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('renders notification badge', () => {
    renderHeader(<AppHeader actions={defaultActions} />);
    expect(screen.getByRole('status')).toHaveTextContent('8');
  });

  it('hides actions with visible: false', () => {
    const actions = [
      { key: 'help', icon: HelpCircle, label: 'Help', visible: false },
      { key: 'notifications', icon: Bell, label: 'Notifications' },
    ];
    renderHeader(<AppHeader actions={actions} />);
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('calls button action onClick', async () => {
    const user = userEvent.setup();
    const handleScan = vi.fn();
    renderHeader(
      <AppHeader
        buttonActions={[{ key: 'scan', icon: ScanBarcode, label: 'Scan', onClick: handleScan }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /scan/i }));
    expect(handleScan).toHaveBeenCalledOnce();
  });

  it('calls icon action onClick', async () => {
    const user = userEvent.setup();
    const handleHelp = vi.fn();
    renderHeader(
      <AppHeader
        actions={[{ key: 'help', icon: HelpCircle, label: 'Help', onClick: handleHelp }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(handleHelp).toHaveBeenCalledOnce();
  });

  it('renders leading content', () => {
    renderHeader(<AppHeader leading={<span data-testid="breadcrumb">Items</span>} />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('fires onSearchChange when typing', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    renderHeader(<AppHeader onSearchChange={handleSearch} />);

    await user.type(screen.getByPlaceholderText('Search'), 'test');
    expect(handleSearch).toHaveBeenCalledWith('t');
    expect(handleSearch).toHaveBeenCalledTimes(4);
  });
});
