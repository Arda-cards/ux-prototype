import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
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
  argTypes: {
    title: {
      control: 'text',
      description: 'Override the drawer header title.',
      table: { category: 'Static' },
    },
    open: {
      control: 'boolean',
      description: 'Whether the drawer is open.',
      table: { category: 'Runtime' },
    },
    mode: {
      control: 'select',
      options: ['view', 'add', 'edit'],
      description: 'Current operating mode.',
      table: { category: 'Runtime' },
    },
    affiliate: {
      control: false,
      description: 'Affiliate data for view/edit modes.',
      table: { category: 'Runtime' },
    },
    suppliedItems: {
      control: false,
      description: 'List of items supplied by this affiliate.',
      table: { category: 'Runtime' },
    },
    onClose: {
      action: 'closed',
      description: 'Called when the drawer requests to close.',
      table: { category: 'Events' },
    },
    onSubmit: {
      action: 'submitted',
      description: 'Called when the form is submitted.',
      table: { category: 'Events' },
    },
    onEdit: {
      action: 'edit-clicked',
      description: 'Called when the Edit button is clicked.',
      table: { category: 'Events' },
    },
    onItemClick: {
      action: 'item-clicked',
      description: 'Called when a supplied item row is clicked.',
      table: { category: 'Events' },
    },
  },
  args: {
    onClose: fn(),
    onSubmit: fn(),
    onEdit: fn(),
    onItemClick: fn(),
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
  },
};

export const AddMode: Story = {
  args: {
    open: true,
    mode: 'add',
  },
};

export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    affiliate: sampleAffiliate,
  },
};

export const Closed: Story = {
  args: {
    open: false,
    mode: 'view',
    affiliate: sampleAffiliate,
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
