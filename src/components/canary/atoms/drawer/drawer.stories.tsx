import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ArdaDrawer,
  ArdaDrawerHeader,
  ArdaDrawerTitle,
  ArdaDrawerDescription,
  ArdaDrawerBody,
  ArdaDrawerFooter,
} from './drawer';
import { ArdaDetailField } from '../detail-field/detail-field';

const meta = {
  title: 'Components/Canary/Atoms/Drawer',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arda-branded slide-over panel wrapping shadcn Sheet. ' +
          'Provides width presets and compound component slots (Header, Body, Footer).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Default drawer with header, body, and footer. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open drawer
        </button>
        <ArdaDrawer open={open} onOpenChange={setOpen}>
          <ArdaDrawerHeader>
            <ArdaDrawerTitle>Item Details</ArdaDrawerTitle>
            <ArdaDrawerDescription>View and manage this inventory item.</ArdaDrawerDescription>
          </ArdaDrawerHeader>
          <ArdaDrawerBody className="px-6 py-4 space-y-3">
            <ArdaDetailField label="SKU" value="WDG-4420-BLK" />
            <ArdaDetailField label="Supplier" value="McMaster-Carr" />
            <ArdaDetailField label="Unit Price" value="$12.50" />
            <ArdaDetailField label="Location" value="Bin A-12" />
          </ArdaDrawerBody>
          <ArdaDrawerFooter>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium"
            >
              Done
            </button>
          </ArdaDrawerFooter>
        </ArdaDrawer>
      </>
    );
  },
};

/** Medium width (420px). */
export const SizeMd: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open medium drawer
        </button>
        <ArdaDrawer open={open} onOpenChange={setOpen} size="md">
          <ArdaDrawerHeader>
            <ArdaDrawerTitle>Medium Drawer</ArdaDrawerTitle>
          </ArdaDrawerHeader>
          <ArdaDrawerBody className="px-6 py-4">
            <p className="text-sm text-muted-foreground">420px max width on desktop.</p>
          </ArdaDrawerBody>
        </ArdaDrawer>
      </>
    );
  },
};

/** Extra-large width (560px). */
export const SizeXl: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open XL drawer
        </button>
        <ArdaDrawer open={open} onOpenChange={setOpen} size="xl">
          <ArdaDrawerHeader>
            <ArdaDrawerTitle>Extra-Large Drawer</ArdaDrawerTitle>
          </ArdaDrawerHeader>
          <ArdaDrawerBody className="px-6 py-4">
            <p className="text-sm text-muted-foreground">560px max width on desktop.</p>
          </ArdaDrawerBody>
        </ArdaDrawer>
      </>
    );
  },
};
