import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TypeaheadOption } from '@/components/atoms/typeahead/typeahead';
import { sampleItemSupplies } from '@/types/reference/business-affiliates/item-supply';

import { ArdaItemSupplyFormDialog } from './item-supply-form-dialog';

const suppliers: TypeaheadOption[] = [
  { label: 'Fastenal Corp.', value: 'ba-001' },
  { label: 'Parker Hannifin', value: 'ba-002' },
];

const editSupply = sampleItemSupplies[0]!;

describe('ArdaItemSupplyFormDialog', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <ArdaItemSupplyFormDialog
        open={false}
        mode="add"
        availableSuppliers={suppliers}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders dialog with Add Supply heading in add mode', () => {
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="add"
        availableSuppliers={suppliers}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Add Supply' })).toBeInTheDocument();
  });

  it('renders dialog with Edit Supply heading in edit mode', () => {
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="edit"
        availableSuppliers={suppliers}
        supply={editSupply}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Edit Supply' })).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="add"
        availableSuppliers={suppliers}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('Supply Name')).toBeInTheDocument();
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Order Method')).toBeInTheDocument();
    expect(screen.getByText('Order Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unit Cost')).toBeInTheDocument();
    expect(screen.getByText('Average Lead Time')).toBeInTheDocument();
  });

  it('disables save button when no supplier is selected', () => {
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="add"
        availableSuppliers={suppliers}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    const saveButtons = screen.getAllByText('Add Supply');
    const saveButton = saveButtons.at(-1) as HTMLElement;
    expect(saveButton).toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="add"
        availableSuppliers={suppliers}
        onClose={onClose}
        onSave={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pre-fills SKU in edit mode', () => {
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="edit"
        availableSuppliers={suppliers}
        supply={editSupply}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    const skuInput = screen.getByLabelText('SKU') as HTMLInputElement;
    expect(skuInput.value).toBe('FAS-HC500-A');
  });

  it('shows URL field when order method is ONLINE', () => {
    render(
      <ArdaItemSupplyFormDialog
        open
        mode="edit"
        availableSuppliers={suppliers}
        supply={editSupply}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
  });
});
