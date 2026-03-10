import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlignLeft, Dock, SquarePen, Printer, Tag, Hash } from 'lucide-react';

import { ArdaItemDetailsHeader } from './item-details-header';

const meta = {
  title: 'Components/Canary/Molecules/ItemDetails/ItemDetailsHeader',
  component: ArdaItemDetailsHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Title, tab bar, and action toolbar for the item detail drawer.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaItemDetailsHeader>;

export default meta;
type Story = StoryObj<typeof ArdaItemDetailsHeader>;

const noop = () => {};

const defaultTabs = [
  { key: 'details', label: 'Item details', icon: AlignLeft },
  { key: 'cards', label: 'Cards', icon: Dock },
];

const defaultActions = [
  { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
  { key: 'cart', label: 'Add to cart', icon: Dock, onAction: noop },
  { key: 'print', label: 'Print card', icon: Printer, onAction: noop },
  { key: 'label', label: 'Print label', icon: Tag, onAction: noop },
  { key: 'breadcrumb', label: 'Print breadcrumb', icon: Hash, onAction: noop },
];

const defaultOverflow = [
  { key: 'scan', label: 'Scan preview', onAction: noop },
  { key: 'preview', label: 'View card preview', onAction: noop },
  { key: 'duplicate', label: 'Duplicate item\u2026', onAction: noop },
  { key: 'delete', label: 'Delete', onAction: noop, destructive: true, separatorBefore: true },
];

/** Full header with tabs and toolbar. */
export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState('details');
    return (
      <div className="w-[460px] border rounded-lg p-4 bg-background">
        <ArdaItemDetailsHeader
          title="Widget Assembly Kit WDG-4420-BLK"
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

/** Tabs only — no action toolbar (e.g., on the cards tab). */
export const TabsOnly: Story = {
  render: () => {
    const [tab, setTab] = useState('cards');
    return (
      <div className="w-[460px] border rounded-lg p-4 bg-background">
        <ArdaItemDetailsHeader
          title="Hex Bolt M8x30"
          activeTab={tab}
          onTabChange={setTab}
          tabs={defaultTabs}
        />
      </div>
    );
  },
};
