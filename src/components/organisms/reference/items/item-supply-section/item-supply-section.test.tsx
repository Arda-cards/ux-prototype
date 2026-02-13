import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  sampleItemSupplies,
  type SupplyDesignation,
} from '@/types/reference/business-affiliates/item-supply';

import { ArdaItemSupplySection } from './item-supply-section';

const supplierNames: Record<string, string> = {
  'is-001': 'Fastenal Corp.',
  'is-002': 'Parker Hannifin',
};

const designations: Record<string, SupplyDesignation[]> = {
  'is-001': ['PRIMARY'],
  'is-002': ['SECONDARY'],
};

describe('ArdaItemSupplySection', () => {
  it('renders section title', () => {
    render(
      <ArdaItemSupplySection
        supplies={sampleItemSupplies}
        designations={designations}
        supplierNames={supplierNames}
      />,
    );
    expect(screen.getByText('Supplies')).toBeInTheDocument();
  });

  it('renders custom section title', () => {
    render(
      <ArdaItemSupplySection
        title="Vendor Supplies"
        supplies={[]}
        designations={{}}
        supplierNames={{}}
      />,
    );
    expect(screen.getByText('Vendor Supplies')).toBeInTheDocument();
  });

  it('renders all supply cards', () => {
    render(
      <ArdaItemSupplySection
        supplies={sampleItemSupplies}
        designations={designations}
        supplierNames={supplierNames}
      />,
    );
    expect(screen.getByText('Fastenal Corp.')).toBeInTheDocument();
    expect(screen.getByText('Parker Hannifin')).toBeInTheDocument();
  });

  it('renders empty state when no supplies', () => {
    render(<ArdaItemSupplySection supplies={[]} designations={{}} supplierNames={{}} />);
    expect(screen.getByText('No supplies configured')).toBeInTheDocument();
  });

  it('renders Add button and calls onAdd', () => {
    const onAdd = vi.fn();
    render(
      <ArdaItemSupplySection supplies={[]} designations={{}} supplierNames={{}} onAdd={onAdd} />,
    );
    // There are two "Add" elements: the header button and the empty state link
    const addButtons = screen.getAllByText(/Add/);
    fireEvent.click(addButtons.at(0) as HTMLElement);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('calls onEditSupply with correct supply id', () => {
    const onEdit = vi.fn();
    render(
      <ArdaItemSupplySection
        supplies={sampleItemSupplies}
        designations={designations}
        supplierNames={supplierNames}
        onEditSupply={onEdit}
      />,
    );
    const editButtons = screen.getAllByLabelText('Edit supply');
    fireEvent.click(editButtons.at(0) as HTMLElement);
    expect(onEdit).toHaveBeenCalledWith('is-001');
  });

  it('calls onRemoveSupply with correct supply id', () => {
    const onRemove = vi.fn();
    render(
      <ArdaItemSupplySection
        supplies={sampleItemSupplies}
        designations={designations}
        supplierNames={supplierNames}
        onRemoveSupply={onRemove}
      />,
    );
    const removeButtons = screen.getAllByLabelText('Remove supply');
    fireEvent.click(removeButtons.at(0) as HTMLElement);
    expect(onRemove).toHaveBeenCalledWith('is-001');
  });

  it('calls onSupplierClick with affiliate id', () => {
    const onSupplierClick = vi.fn();
    render(
      <ArdaItemSupplySection
        supplies={sampleItemSupplies}
        designations={designations}
        supplierNames={supplierNames}
        linkedSupplierIds={new Set(['is-001'])}
        onSupplierClick={onSupplierClick}
      />,
    );
    fireEvent.click(screen.getByText('Fastenal Corp.'));
    expect(onSupplierClick).toHaveBeenCalledWith('ba-001');
  });

  it('renders designation badges', () => {
    render(
      <ArdaItemSupplySection
        supplies={sampleItemSupplies}
        designations={designations}
        supplierNames={supplierNames}
      />,
    );
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });
});
