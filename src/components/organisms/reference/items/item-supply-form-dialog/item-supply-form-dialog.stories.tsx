import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { useState } from 'react';

import type { TypeaheadOption } from '@/components/atoms/typeahead/typeahead';
import { sampleItemSupplies } from '@/types/reference/business-affiliates/item-supply';

import { ArdaItemSupplyFormDialog } from './item-supply-form-dialog';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- sample data guaranteed
const editSupply = sampleItemSupplies[0]!;

const sampleSuppliers: TypeaheadOption[] = [
  { label: 'Fastenal Corp.', value: 'ba-001', meta: 'Supplier, Distributor' },
  { label: 'Parker Hannifin', value: 'ba-002', meta: 'Manufacturer, Supplier' },
  { label: 'Grainger Industrial', value: 'ba-003', meta: 'Supplier, Distributor' },
];

const meta: Meta<typeof ArdaItemSupplyFormDialog> = {
  title: 'Components/Organisms/Item Supply Form Dialog',
  component: ArdaItemSupplyFormDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A modal dialog for adding or editing an item supply relationship. Includes a typeahead for supplier selection, form fields for supply details, and dirty-state protection.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaItemSupplyFormDialog>;

export const AddMode: Story = {
  args: {
    open: true,
    mode: 'add',
    availableSuppliers: sampleSuppliers,
    onClose: () => {},
    onSave: (data) => alert(`Saved: ${JSON.stringify(data, null, 2)}`),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Add Supply' })).toBeInTheDocument();
  },
};

export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    availableSuppliers: sampleSuppliers,
    supply: editSupply,
    onClose: () => {},
    onSave: (data) => alert(`Saved: ${JSON.stringify(data, null, 2)}`),
  },
};

export const WithTypeahead: Story = {
  render: function WithTypeaheadStory() {
    const [open, setOpen] = useState(true);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="m-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          Open Dialog
        </button>
        <ArdaItemSupplyFormDialog
          open={open}
          mode="add"
          availableSuppliers={sampleSuppliers}
          onClose={() => setOpen(false)}
          onSave={(data) => {
            alert(`Saved: ${JSON.stringify(data, null, 2)}`);
            setOpen(false);
          }}
          onCreateSupplier={(name) => alert(`Create supplier: ${name}`)}
        />
      </>
    );
  },
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [open, setOpen] = useState(true);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="m-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          Open Dialog
        </button>
        <ArdaItemSupplyFormDialog
          open={open}
          mode="add"
          availableSuppliers={sampleSuppliers}
          onClose={() => setOpen(false)}
          onSave={(data) => {
            alert(`Saved: ${JSON.stringify(data, null, 2)}`);
            setOpen(false);
          }}
          onCreateSupplier={(name) => alert(`Create new supplier: ${name}`)}
        />
      </>
    );
  },
};
