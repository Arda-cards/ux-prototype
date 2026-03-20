import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody } from './drawer';
import { ReadOnlyField } from '../read-only-field/read-only-field';

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
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerHeader>
            <DrawerTitle>Item Details</DrawerTitle>
            <DrawerDescription>View and manage this inventory item.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="px-6 py-4 space-y-3">
            <ReadOnlyField label="SKU" value="WDG-4420-BLK" />
            <ReadOnlyField label="Supplier" value="McMaster-Carr" />
            <ReadOnlyField label="Unit Price" value="$12.50" />
            <ReadOnlyField label="Location" value="Bin A-12" />
          </DrawerBody>
        </Drawer>
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
        <Drawer open={open} onOpenChange={setOpen} size="md">
          <DrawerHeader>
            <DrawerTitle>Medium Drawer</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="px-6 py-4">
            <p className="text-sm text-muted-foreground">420px max width on desktop.</p>
          </DrawerBody>
        </Drawer>
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
        <Drawer open={open} onOpenChange={setOpen} size="xl">
          <DrawerHeader>
            <DrawerTitle>Extra-Large Drawer</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="px-6 py-4">
            <p className="text-sm text-muted-foreground">560px max width on desktop.</p>
          </DrawerBody>
        </Drawer>
      </>
    );
  },
};
