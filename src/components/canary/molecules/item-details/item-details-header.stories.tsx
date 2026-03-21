import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlignLeft,
  CreditCard,
  SquarePen,
  Printer,
  ShoppingCart,
  Tag,
  Hash,
  ScanLine,
  Copy,
  Trash2,
} from 'lucide-react';

import { ItemDetailsHeader } from './item-details-header';

const meta = {
  title: 'Components/Canary/Molecules/ItemDetails/ItemDetailsHeader',
  component: ItemDetailsHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tab bar and action grid for the item detail drawer.',
      },
    },
  },
} satisfies Meta<typeof ItemDetailsHeader>;

export default meta;
type Story = StoryObj<typeof ItemDetailsHeader>;

/**
 * Interactive Controls playground — the tab and actions props are complex
 * objects; this story pre-populates a typical configuration. Switch tabs
 * interactively.
 */
export const Playground: Story = {
  render: () => {
    const [tab, setTab] = useState('details');
    return (
      <div className="w-[460px] border rounded-lg p-4 bg-background">
        <ItemDetailsHeader
          activeTab={tab}
          onTabChange={setTab}
          tabs={defaultTabs}
          actions={defaultActions}
          overflowActions={defaultOverflow}
        />
      </div>
    );
  },
};

const noop = () => {};

const defaultTabs = [
  { key: 'details', label: 'Item details', icon: AlignLeft },
  { key: 'cards', label: 'Cards', icon: CreditCard },
];

const defaultActions = [
  { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
  { key: 'queue', label: 'Add to queue', icon: ShoppingCart, onAction: noop },
  { key: 'print', label: 'Print card', icon: Printer, onAction: noop },
  { key: 'label', label: 'Print label', icon: Tag, onAction: noop },
  { key: 'breadcrumb', label: 'Print breadcrumb', icon: Hash, onAction: noop },
];

const defaultOverflow = [
  { key: 'scan', label: 'Scan preview', icon: ScanLine, onAction: noop },
  { key: 'copy', label: 'Copy item ID', icon: Copy, onAction: noop },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    onAction: noop,
    destructive: true,
    separatorBefore: true,
  },
];

/** Full header with tabs and action grid. */
export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState('details');
    return (
      <div className="w-[460px] border rounded-lg p-4 bg-background">
        <ItemDetailsHeader
          activeTab={tab}
          onTabChange={setTab}
          tabs={defaultTabs}
          actions={defaultActions}
          overflowActions={defaultOverflow}
        />
      </div>
    );
  },
};

/** Tabs only — no action grid (e.g., on the cards tab). */
export const TabsOnly: Story = {
  render: () => {
    const [tab, setTab] = useState('cards');
    return (
      <div className="w-[460px] border rounded-lg p-4 bg-background">
        <ItemDetailsHeader activeTab={tab} onTabChange={setTab} tabs={defaultTabs} />
      </div>
    );
  },
};

/** Actions only — no tabs. */
export const ActionsOnly: Story = {
  render: () => (
    <div className="w-[460px] border rounded-lg p-4 bg-background">
      <ItemDetailsHeader
        activeTab="details"
        onTabChange={() => {}}
        tabs={[]}
        actions={defaultActions.slice(0, 3)}
      />
    </div>
  ),
};
