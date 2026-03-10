import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquarePen, Printer, Dock, Tag, Hash } from 'lucide-react';

import { ArdaItemDetails } from './item-details';
import type { ToolbarAction, OverflowAction, DetailFieldDef } from './index';

const meta = {
  title: 'Components/Canary/Organisms/ItemDetails',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Item detail/edit slide-over panel. Compound component built from ' +
          'ArdaDrawer, ArdaItemDetailsHeader, ArdaItemDetailsCardPreview, and ArdaItemDetailsContent.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const noop = () => {};

const sampleFields: DetailFieldDef[] = [
  { key: 'sku', label: 'SKU', value: 'WDG-4420-BLK' },
  { key: 'gl', label: 'General Ledger Code', value: 'GL-5200' },
  { key: 'price', label: 'Unit price', value: '$12.50' },
  { key: 'cards', label: 'Number of cards', value: '5' },
];

const sampleActions: ToolbarAction[] = [
  { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
  { key: 'cart', label: 'Add to cart', icon: Dock, onAction: noop },
  { key: 'print', label: 'Print card', icon: Printer, onAction: noop },
  { key: 'label', label: 'Print label', icon: Tag, onAction: noop },
  { key: 'breadcrumb', label: 'Print breadcrumb', icon: Hash, onAction: noop },
];

const sampleOverflow: OverflowAction[] = [
  { key: 'scan', label: 'Scan preview', onAction: noop },
  { key: 'preview', label: 'View card preview', onAction: noop },
  { key: 'duplicate', label: 'Duplicate item\u2026', onAction: noop },
  { key: 'delete', label: 'Delete', onAction: noop, destructive: true, separatorBefore: true },
];

const MockCard = ({ index }: { index: number }) => (
  <div className="flex h-48 w-72 items-center justify-center rounded-lg border bg-background shadow-sm">
    <div className="text-center">
      <p className="text-sm font-medium text-foreground">Widget Assembly Kit</p>
      <p className="text-xs text-muted-foreground">Card {index} of 5</p>
      <p className="mt-2 text-xs font-mono text-muted-foreground">WDG-4420-BLK</p>
    </div>
  </div>
);

/** Default — full item details panel with cards and toolbar. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open item details
        </button>
        <ArdaItemDetails
          open={open}
          onOpenChange={setOpen}
          title="Widget Assembly Kit WDG-4420-BLK"
          fields={sampleFields}
          actions={sampleActions}
          overflowActions={sampleOverflow}
          cardCount={5}
          renderCard={(i) => <MockCard index={i} />}
          onCardPreview={noop}
        />
      </div>
    );
  },
};

/** Loading state — cards are being fetched. */
export const CardsLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ArdaItemDetails
        open={open}
        onOpenChange={setOpen}
        title="Hex Bolt M8x30"
        fields={sampleFields}
        actions={sampleActions}
        cardsLoading
      />
    );
  },
};

/** No cards — empty state with guidance. */
export const NoCards: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ArdaItemDetails
        open={open}
        onOpenChange={setOpen}
        title="New Item (Draft)"
        fields={[
          { key: 'sku', label: 'SKU', value: 'DRAFT-001' },
          { key: 'price', label: 'Unit price' },
        ]}
        cardCount={0}
      />
    );
  },
};

/** With a custom cards tab. */
export const WithCardsTab: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ArdaItemDetails
        open={open}
        onOpenChange={setOpen}
        title="Widget Assembly Kit"
        fields={sampleFields}
        actions={sampleActions}
        overflowActions={sampleOverflow}
        cardCount={3}
        renderCard={(i) => <MockCard index={i} />}
        renderCardsTab={() => (
          <div className="flex items-center justify-center p-12">
            <p className="text-sm text-muted-foreground">
              Card management panel would render here.
            </p>
          </div>
        )}
      />
    );
  },
};
