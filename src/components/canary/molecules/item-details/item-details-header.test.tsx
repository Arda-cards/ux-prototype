import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AlignLeft, Dock, SquarePen } from 'lucide-react';
import { ItemDetailsHeader } from './item-details-header';

const tabs = [
  { key: 'details', label: 'Item details', icon: AlignLeft },
  { key: 'cards', label: 'Cards', icon: Dock },
];

describe('ItemDetailsHeader', () => {
  it('renders tabs (title is rendered by the organism, not the molecule)', () => {
    render(<ItemDetailsHeader activeTab="details" onTabChange={() => {}} tabs={tabs} />);
    // Title rendering is the organism's responsibility
    expect(screen.getByText('Item details')).toBeInTheDocument();
  });

  it('renders tab labels', () => {
    render(<ItemDetailsHeader activeTab="details" onTabChange={() => {}} tabs={tabs} />);
    expect(screen.getByText('Item details')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
  });

  it('calls onTabChange when tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<ItemDetailsHeader activeTab="details" onTabChange={onTabChange} tabs={tabs} />);
    await user.click(screen.getByText('Cards'));
    expect(onTabChange).toHaveBeenCalledWith('cards');
  });

  it('renders action buttons when actions provided', () => {
    render(
      <ItemDetailsHeader
        activeTab="details"
        onTabChange={() => {}}
        tabs={tabs}
        actions={[{ key: 'edit', label: 'Edit item', icon: SquarePen, onAction: () => {} }]}
      />,
    );
    // Short label (first word) visible, full label on aria-label
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit item' })).toBeInTheDocument();
  });

  it('does not render action buttons when no actions', () => {
    render(<ItemDetailsHeader activeTab="details" onTabChange={() => {}} tabs={tabs} />);
    expect(screen.queryByRole('button', { name: 'Edit item' })).not.toBeInTheDocument();
  });
});
