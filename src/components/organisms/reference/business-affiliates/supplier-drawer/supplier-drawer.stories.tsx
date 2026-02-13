import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { useState } from 'react';

import {
  sampleAffiliates,
  type BusinessAffiliate,
} from '@/types/reference/business-affiliates/business-affiliate';

import {
  ArdaSupplierDrawer,
  type SuppliedItemRow,
  type SupplierDrawerMode,
} from './supplier-drawer';

const meta: Meta<typeof ArdaSupplierDrawer> = {
  title: 'Components/Organisms/Supplier Drawer',
  component: ArdaSupplierDrawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A slide-in drawer for viewing, adding, or editing a business affiliate (supplier). Includes tabbed view mode (Details + Items), form mode with collapsible sections, and dirty-state protection.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaSupplierDrawer>;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- sample data guaranteed
const sampleAffiliate = sampleAffiliates[0]!;

const sampleSuppliedItems: SuppliedItemRow[] = [
  {
    itemId: 'item-001',
    itemName: 'Hydraulic Cylinder HC-500',
    supplierSku: 'FAS-HC500-A',
    unitCost: '$189.99',
    designation: 'Primary',
  },
  {
    itemId: 'item-002',
    itemName: 'O-Ring Kit OR-200',
    supplierSku: 'FAS-ORK200',
    unitCost: '$24.50',
    designation: 'Primary',
  },
  {
    itemId: 'item-003',
    itemName: 'Hex Socket Bolt M8x40',
    supplierSku: 'FAS-HSB-M8X40',
    unitCost: '$0.85',
    designation: 'Secondary',
  },
];

export const ViewMode: Story = {
  args: {
    open: true,
    mode: 'view',
    affiliate: sampleAffiliate,
    suppliedItems: sampleSuppliedItems,
    onClose: () => {},
    onEdit: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Fastenal Corp.')).toBeInTheDocument();
    await expect(canvas.getByText('Vendor')).toBeInTheDocument();
  },
};

export const ViewModeItemsTab: Story = {
  args: {
    open: true,
    mode: 'view',
    affiliate: sampleAffiliate,
    suppliedItems: sampleSuppliedItems,
    onClose: () => {},
  },
};

export const AddMode: Story = {
  args: {
    open: true,
    mode: 'add',
    onClose: () => {},
    onSubmit: (data) => alert(`Submitted: ${JSON.stringify(data, null, 2)}`),
  },
};

export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    affiliate: sampleAffiliate,
    onClose: () => {},
    onSubmit: (data) => alert(`Saved: ${JSON.stringify(data, null, 2)}`),
    onEdit: () => {},
  },
};

export const Closed: Story = {
  args: {
    open: false,
    mode: 'view',
    affiliate: sampleAffiliate,
    onClose: () => {},
  },
};

export const Interactive: Story = {
  render: function InteractiveDrawer() {
    const [open, setOpen] = useState(true);
    const [mode, setMode] = useState<SupplierDrawerMode>('view');
    const [affiliate, setAffiliate] = useState<BusinessAffiliate>(sampleAffiliate);

    return (
      <>
        <button
          onClick={() => {
            setMode('view');
            setOpen(true);
          }}
          className="m-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          Open Drawer
        </button>
        <ArdaSupplierDrawer
          open={open}
          mode={mode}
          affiliate={affiliate}
          suppliedItems={sampleSuppliedItems}
          onClose={() => setOpen(false)}
          onEdit={() => setMode(mode === 'view' ? 'edit' : 'view')}
          onSubmit={(data) => {
            setAffiliate(data);
            setMode('view');
          }}
          onItemClick={(id) => alert(`Navigate to item ${id}`)}
        />
      </>
    );
  },
};
