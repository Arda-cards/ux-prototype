import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/canary/atoms/button/button';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog';

const meta = {
  title: 'Components/Canary/Atoms/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog built on Radix UI Dialog primitives. ' +
          'Compose with DialogHeader, DialogTitle, DialogDescription, DialogFooter.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    open: { control: 'boolean' },
  },
  args: {
    open: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open ?? false);
    return (
      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is the dialog description. It provides context about the action.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">Dialog body content goes here.</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const WithoutCloseMark: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open (No X mark)</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Important Notice</DialogTitle>
            <DialogDescription>
              This dialog has no close button in the corner. Use the footer buttons to dismiss.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button>Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const ActionAndClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

    const handleConfirm = async () => {
      setStatus('processing');
      // Simulate async action (API call, save, etc.)
      await new Promise((r) => setTimeout(r, 1500));
      setStatus('done');
      // Close after a brief success indication
      setTimeout(() => {
        setOpen(false);
        setStatus('idle');
      }, 500);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Archive Item</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={status === 'idle'}>
          <DialogHeader>
            <DialogTitle>{status === 'done' ? 'Item Archived' : 'Archive this item?'}</DialogTitle>
            <DialogDescription>
              {status === 'done'
                ? 'The item has been moved to the archive.'
                : 'The item will be moved to the archive. You can restore it later from the archive view.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {status === 'idle' && (
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            )}
            {status !== 'done' && (
              <Button onClick={handleConfirm} loading={status === 'processing'}>
                {status === 'processing' ? 'Archiving\u2026' : 'Archive'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const WithFooterClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open with footer close</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>Viewing details for the selected inventory item.</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm">
              <span className="font-medium">SKU:</span>{' '}
              <span className="text-muted-foreground">WDG-4420-BLK</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Location:</span>{' '}
              <span className="text-muted-foreground">Bin A-12</span>
            </p>
          </div>
          <DialogFooter showCloseButton>
            <Button>Edit Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
