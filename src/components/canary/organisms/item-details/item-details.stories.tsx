import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquarePen, Printer, ShoppingCart, Tag, ScanLine, Copy, Trash2 } from 'lucide-react';

import { ArdaItemDetails } from './item-details';
import type { ToolbarAction, OverflowAction, FieldDef } from './index';

const meta = {
  title: 'Components/Canary/Organisms/ItemDetails',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Item detail/edit slide-over panel. Compound component built from ' +
          'ArdaDrawer, ArdaItemDetailsHeader, ArdaItemDetailsCardPreview, and ArdaFieldList.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const noop = () => {};

const sampleFields: FieldDef[] = [
  { key: 'sku', label: 'SKU', value: 'WDG-4420-BLK' },
  {
    key: 'desc',
    label: 'Description',
    value: 'Standard widget assembly kit with mounting hardware',
  },
  { key: 'gl', label: 'GL Code', value: 'GL-5200' },
  { key: 'price', label: 'Unit Price', value: '$12.50' },
  { key: 'reorder', label: 'Reorder Point', value: '25 units' },
  { key: 'supplier', label: 'Supplier', value: 'McMaster-Carr' },
  { key: 'lead', label: 'Lead Time', value: '3\u20135 days' },
];

const sampleActions: ToolbarAction[] = [
  { key: 'edit', label: 'Edit', icon: SquarePen, onAction: noop },
  { key: 'cart', label: 'Queue', icon: ShoppingCart, onAction: noop },
  { key: 'print', label: 'Print', icon: Printer, onAction: noop },
];

const sampleOverflow: OverflowAction[] = [
  { key: 'label', label: 'Label', icon: Tag, onAction: noop },
  { key: 'scan', label: 'Scan', icon: ScanLine, onAction: noop },
  { key: 'duplicate', label: 'Duplicate', icon: Copy, onAction: noop },
  { key: 'delete', label: 'Delete', icon: Trash2, onAction: noop, destructive: true },
];

const CARD_STATUSES: Record<number, string> = { 2: 'Low Stock', 4: 'Reorder' };

const MockCard = ({ index }: { index: number }) => {
  const status = CARD_STATUSES[index];
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border bg-background p-4 shadow-sm">
      {/* Status sash — sized for the smaller preview card */}
      {status && (
        <div className="absolute right-0 top-0 z-10 -mr-4 mt-3 rotate-45 bg-primary px-6 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
          {status}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-foreground">Widget Assembly Kit</p>
        <p className="mt-1 text-xs text-muted-foreground font-mono">WDG-4420-BLK</p>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex size-10 items-center justify-center rounded border border-dashed border-border">
          <span className="text-xs text-muted-foreground font-mono">QR</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Card {index}</span>
      </div>
    </div>
  );
};

/** Default — full item details panel with cards and toolbar. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex h-screen items-center justify-center bg-muted/50">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Open item details
        </button>
        <ArdaItemDetails
          open={open}
          onOpenChange={setOpen}
          title="Widget Assembly Kit"
          fields={sampleFields}
          actions={sampleActions}
          overflowActions={sampleOverflow}
          cardCount={5}
          renderCard={(i) => <MockCard index={i} />}
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
          { key: 'price', label: 'Unit Price' },
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
