import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { sampleAffiliates } from '@/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierDrawer, type SupplierDrawerMode } from './supplier-drawer';

const meta: Meta<typeof ArdaSupplierDrawer> = {
  title: 'Components/Organisms/Reference/Business Affiliates/Supplier Drawer',
  component: ArdaSupplierDrawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A slide-in drawer for viewing or adding a business affiliate (supplier). Delegates field rendering and edit/save lifecycle to ArdaSupplierViewer.',
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
      options: ['view', 'add'],
      description: 'Current operating mode.',
      table: { category: 'Runtime' },
    },
    affiliate: {
      control: false,
      description: 'Affiliate data for view mode.',
      table: { category: 'Runtime' },
    },
    onClose: {
      action: 'closed',
      description: 'Called when the drawer requests to close.',
      table: { category: 'Events' },
    },
  },
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaSupplierDrawer>;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- sample data guaranteed
const sampleAffiliate = sampleAffiliates[0]!;

export const ViewMode: Story = {
  args: {
    open: true,
    mode: 'view',
    affiliate: sampleAffiliate,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const matches = await canvas.findAllByText('Fastenal Corp.');
    await expect(matches.length).toBeGreaterThan(0);
  },
};

export const AddMode: Story = {
  args: {
    open: true,
    mode: 'add',
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

    return (
      <>
        <div className="m-4 flex gap-2">
          <button
            onClick={() => {
              setMode('view');
              setOpen(true);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Open View
          </button>
          <button
            onClick={() => {
              setMode('add');
              setOpen(true);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Open Add
          </button>
        </div>
        <ArdaSupplierDrawer
          open={open}
          mode={mode}
          affiliate={sampleAffiliate}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
};
