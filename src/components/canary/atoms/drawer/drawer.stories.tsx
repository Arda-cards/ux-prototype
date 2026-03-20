import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from './drawer';
import { Button } from '@/components/canary/primitives/button';
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

export const Playground: Story = {
  argTypes: {
    size: {
      control: 'select',
      options: ['md', 'lg', 'xl'],
    },
    side: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
  args: {
    size: 'lg',
    side: 'right',
  },
  render: (args: { size?: 'md' | 'lg' | 'xl'; side?: 'left' | 'right' }) => {
    const [open, setOpen] = useState(false);
    const size = args.size ?? 'lg';
    const side = args.side ?? 'right';
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open drawer
        </button>
        <Drawer open={open} onOpenChange={setOpen} size={size} side={side}>
          <DrawerHeader>
            <DrawerTitle>
              Drawer ({size}, {side})
            </DrawerTitle>
            <DrawerDescription>Playground drawer instance.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="px-6 py-4">
            <p className="text-sm text-muted-foreground">Drawer body content.</p>
          </DrawerBody>
        </Drawer>
      </>
    );
  },
};

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

/** All size and side combinations. Each card opens its own drawer. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
    const setOpen = (key: string, val: boolean) =>
      setOpenStates((prev) => ({ ...prev, [key]: val }));

    const variants: Array<{
      label: string;
      key: string;
      size: 'md' | 'lg' | 'xl';
      side: 'left' | 'right';
    }> = [
      { label: 'md / right', key: 'md-right', size: 'md', side: 'right' },
      { label: 'lg / right', key: 'lg-right', size: 'lg', side: 'right' },
      { label: 'xl / right', key: 'xl-right', size: 'xl', side: 'right' },
      { label: 'md / left', key: 'md-left', size: 'md', side: 'left' },
      { label: 'lg / left', key: 'lg-left', size: 'lg', side: 'left' },
      { label: 'xl / left', key: 'xl-left', size: 'xl', side: 'left' },
    ];

    return (
      <div className="flex flex-col gap-4 max-w-xs">
        {variants.map(({ label, key, size, side }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-28 text-sm text-muted-foreground">{label}</span>
            <Button size="sm" variant="outline" onClick={() => setOpen(key, true)}>
              Open
            </Button>
            <Drawer
              open={openStates[key] ?? false}
              onOpenChange={(v) => setOpen(key, v)}
              size={size}
              side={side}
            >
              <DrawerHeader>
                <DrawerTitle>Drawer — {label}</DrawerTitle>
                <DrawerDescription>
                  Size: {size}, Side: {side}
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="px-6 py-4">
                <p className="text-sm text-muted-foreground">Content area.</p>
              </DrawerBody>
              <DrawerFooter>
                <Button size="sm" variant="outline" onClick={() => setOpen(key, false)}>
                  Close
                </Button>
              </DrawerFooter>
            </Drawer>
          </div>
        ))}
      </div>
    );
  },
};
