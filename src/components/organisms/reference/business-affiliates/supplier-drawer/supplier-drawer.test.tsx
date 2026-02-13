import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { sampleAffiliates } from '@/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierDrawer, type SuppliedItemRow } from './supplier-drawer';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- sample data guaranteed
const affiliate = sampleAffiliates[0]!;

const suppliedItems: SuppliedItemRow[] = [
  {
    itemId: 'item-001',
    itemName: 'Hydraulic Cylinder HC-500',
    supplierSku: 'FAS-HC500-A',
    unitCost: '$189.99',
    designation: 'Primary',
  },
];

describe('ArdaSupplierDrawer', () => {
  it('renders supplier name in view mode', () => {
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={() => {}} />);
    expect(screen.getByText('Fastenal Corp.')).toBeInTheDocument();
  });

  it('renders role badges in view mode', () => {
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={() => {}} />);
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('Distributor')).toBeInTheDocument();
  });

  it('renders contact details in view mode', () => {
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={() => {}} />);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  it('renders Details and Items tabs in view mode', () => {
    render(
      <ArdaSupplierDrawer
        open
        mode="view"
        affiliate={affiliate}
        suppliedItems={suppliedItems}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('switches to Items tab and shows items', () => {
    render(
      <ArdaSupplierDrawer
        open
        mode="view"
        affiliate={affiliate}
        suppliedItems={suppliedItems}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Items'));
    expect(screen.getByText('Hydraulic Cylinder HC-500')).toBeInTheDocument();
    expect(screen.getByText('FAS-HC500-A')).toBeInTheDocument();
  });

  it('shows empty state on Items tab when no items', () => {
    render(
      <ArdaSupplierDrawer
        open
        mode="view"
        affiliate={affiliate}
        suppliedItems={[]}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Items'));
    expect(screen.getByText('No items are linked to this supplier.')).toBeInTheDocument();
  });

  it('calls onItemClick when item name is clicked', () => {
    const onItemClick = vi.fn();
    render(
      <ArdaSupplierDrawer
        open
        mode="view"
        affiliate={affiliate}
        suppliedItems={suppliedItems}
        onClose={() => {}}
        onItemClick={onItemClick}
      />,
    );
    fireEvent.click(screen.getByText('Items'));
    fireEvent.click(screen.getByText('Hydraulic Cylinder HC-500'));
    expect(onItemClick).toHaveBeenCalledWith('item-001');
  });

  it('renders Add Supplier title in add mode', () => {
    render(<ArdaSupplierDrawer open mode="add" onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Add Supplier' })).toBeInTheDocument();
  });

  it('renders form fields in add mode', () => {
    render(<ArdaSupplierDrawer open mode="add" onClose={() => {}} />);
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <ArdaSupplierDrawer
        open
        mode="view"
        affiliate={affiliate}
        onClose={() => {}}
        onEdit={onEdit}
      />,
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('calls onClose when close button is clicked in view mode', () => {
    const onClose = vi.fn();
    render(<ArdaSupplierDrawer open mode="view" affiliate={affiliate} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close drawer'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not render dialog content when closed', () => {
    render(
      <ArdaSupplierDrawer open={false} mode="view" affiliate={affiliate} onClose={() => {}} />,
    );
    // The drawer is still in the DOM but translated off-screen
    expect(screen.getByRole('dialog')).toHaveClass('translate-x-full');
  });
});
