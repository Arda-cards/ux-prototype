import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ArdaItemCard } from './item-card';

describe('ArdaItemCard', () => {
  it('renders with title', () => {
    render(<ArdaItemCard title="Hex Socket Bolt M8x40" />);
    expect(screen.getByText('Hex Socket Bolt M8x40')).toBeInTheDocument();
  });

  it('displays all attribute sections', () => {
    render(
      <ArdaItemCard
        title="Test Item"
        minQty="50"
        minUnit="pcs"
        location="W-03-B2"
        orderQty="100"
        orderUnit="pcs"
        supplier="Fastenal Corp."
      />,
    );

    expect(screen.getByText('50 pcs')).toBeInTheDocument();
    expect(screen.getByText('W-03-B2')).toBeInTheDocument();
    expect(screen.getByText('100 pcs')).toBeInTheDocument();
    expect(screen.getByText('Fastenal Corp.')).toBeInTheDocument();
  });

  it('displays the SKU', () => {
    render(<ArdaItemCard title="Test" sku="SKU-12345" />);
    expect(screen.getByText('SKU-12345')).toBeInTheDocument();
  });

  it('shows card index and total', () => {
    render(<ArdaItemCard title="Test" cardIndex={2} totalCards={5} />);
    expect(screen.getByText('Card 2 of 5')).toBeInTheDocument();
  });

  it('renders status sash when status is provided', () => {
    render(<ArdaItemCard title="Test" status="Low Stock" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('does not render status sash when status is not provided', () => {
    const { container } = render(<ArdaItemCard title="Test" />);
    // The sash has rotate-45 class -- if no status, it should not appear
    expect(container.querySelector('.rotate-45')).not.toBeInTheDocument();
  });

  it('renders card notes when provided', () => {
    render(<ArdaItemCard title="Test" cardNotes="Replace every 500 hours" />);
    expect(screen.getByText('Replace every 500 hours')).toBeInTheDocument();
  });

  it('uses default values when minimal props provided', () => {
    render(<ArdaItemCard title="Minimal Item" />);
    expect(screen.getByText('Minimal Item')).toBeInTheDocument();
    // Default values -- both Minimum and Order show "2 ea"
    expect(screen.getAllByText('2 ea')).toHaveLength(2);
    expect(screen.getByText('A-12-3')).toBeInTheDocument();
    expect(screen.getByText('Sample Supplier')).toBeInTheDocument();
    expect(screen.getByText('SKU-123456')).toBeInTheDocument();
  });
});
