import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AlignLeft, Dock, SquarePen } from 'lucide-react';
import { ArdaItemDetailsHeader } from './item-details-header';

const tabs = [
  { key: 'details', label: 'Item details', icon: AlignLeft },
  { key: 'cards', label: 'Cards', icon: Dock },
];

describe('ArdaItemDetailsHeader', () => {
  it('renders title', () => {
    render(
      <ArdaItemDetailsHeader
        title="Test Item"
        activeTab="details"
        onTabChange={() => {}}
        tabs={tabs}
      />,
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('renders fallback title when empty', () => {
    render(
      <ArdaItemDetailsHeader title="" activeTab="details" onTabChange={() => {}} tabs={tabs} />,
    );
    expect(screen.getByText('Item Details')).toBeInTheDocument();
  });

  it('renders tab labels', () => {
    render(
      <ArdaItemDetailsHeader title="Test" activeTab="details" onTabChange={() => {}} tabs={tabs} />,
    );
    expect(screen.getByText('Item details')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
  });

  it('calls onTabChange when tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <ArdaItemDetailsHeader
        title="Test"
        activeTab="details"
        onTabChange={onTabChange}
        tabs={tabs}
      />,
    );
    await user.click(screen.getByText('Cards'));
    expect(onTabChange).toHaveBeenCalledWith('cards');
  });

  it('renders action toolbar when actions provided', () => {
    render(
      <ArdaItemDetailsHeader
        title="Test"
        activeTab="details"
        onTabChange={() => {}}
        tabs={tabs}
        actions={[{ key: 'edit', label: 'Edit item', icon: SquarePen, onAction: () => {} }]}
      />,
    );
    expect(screen.getByText('Edit item')).toBeInTheDocument();
  });

  it('does not render toolbar when no actions', () => {
    render(
      <ArdaItemDetailsHeader title="Test" activeTab="details" onTabChange={() => {}} tabs={tabs} />,
    );
    expect(screen.queryByText('Edit item')).not.toBeInTheDocument();
  });
});
