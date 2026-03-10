import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ArdaItemDetails } from './item-details';

describe('ArdaItemDetails', () => {
  const defaultProps = {
    open: true,
    onOpenChange: () => {},
    title: 'Test Item',
  };

  it('renders title in drawer', () => {
    render(<ArdaItemDetails {...defaultProps} />);
    // Title appears in both sr-only and header
    expect(screen.getAllByText('Test Item').length).toBeGreaterThanOrEqual(1);
  });

  it('renders detail fields', () => {
    render(
      <ArdaItemDetails
        {...defaultProps}
        fields={[
          { key: 'sku', label: 'SKU', value: 'ABC-123' },
          { key: 'price', label: 'Unit price', value: '$5.00' },
        ]}
      />,
    );
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
  });

  it('shows Done button that closes the drawer', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ArdaItemDetails {...defaultProps} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders tab triggers', () => {
    render(<ArdaItemDetails {...defaultProps} />);
    expect(screen.getByText('Item details')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ArdaItemDetails {...defaultProps} open={false} />);
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
  });

  it('renders card preview with count badge', () => {
    render(
      <ArdaItemDetails {...defaultProps} cardCount={3} renderCard={(i) => <div>Card {i}</div>} />,
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
  });

  it('shows loading state for cards', () => {
    render(<ArdaItemDetails {...defaultProps} cardsLoading />);
    expect(screen.getByText('Loading cards')).toBeInTheDocument();
  });
});
