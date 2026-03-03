import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ArdaSupplyCard } from './supply-card';

describe('ArdaSupplyCard', () => {
  it('renders supplier name and SKU', () => {
    render(
      <ArdaSupplyCard supplierName="Fastenal Corp." sku="FAS-HC500-A" designations={['PRIMARY']} />,
    );
    expect(screen.getByText('Fastenal Corp.')).toBeInTheDocument();
    expect(screen.getByText('FAS-HC500-A')).toBeInTheDocument();
  });

  it('renders designation badges', () => {
    render(<ArdaSupplyCard supplierName="Test" designations={['PRIMARY', 'BACKUP']} />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Backup')).toBeInTheDocument();
  });

  it('renders cost and lead time line', () => {
    render(
      <ArdaSupplyCard
        supplierName="Test"
        unitCost="$189.99/unit"
        leadTime="5 Days"
        designations={[]}
      />,
    );
    expect(screen.getByText('$189.99/unit \u00B7 5 Days lead')).toBeInTheDocument();
  });

  it('renders supplier name as link when supplierLinked', () => {
    const onClick = vi.fn();
    render(
      <ArdaSupplyCard
        supplierName="Fastenal Corp."
        supplierLinked
        designations={['PRIMARY']}
        onSupplierClick={onClick}
      />,
    );
    const link = screen.getByText('Fastenal Corp.');
    expect(link.tagName).toBe('BUTTON');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders legacy text when legacy flag is set', () => {
    render(<ArdaSupplyCard supplierName="Old Parts Co." legacy designations={['TERTIARY']} />);
    expect(
      screen.getByText('*Legacy supply — not linked to a supplier record*'),
    ).toBeInTheDocument();
  });

  it('calls onEdit and onRemove when action buttons are clicked', () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    render(
      <ArdaSupplyCard
        supplierName="Test"
        designations={['PRIMARY']}
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByLabelText('Edit supply'));
    expect(onEdit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByLabelText('Remove supply'));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
