import type { Meta, StoryObj } from '@storybook/react';
import { Search, Filter, Plus } from 'lucide-react';

import { ArdaButton } from '@/components/atoms/button/button';
import { ArdaItemsDataGrid } from '@/components/organisms/items-data-grid/items-data-grid';
import { mockPublishedItems } from '@/components/molecules/data-grid/presets/items/items-mock-data';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Applications/Production/Items',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <AppLayout currentPath="/items">
      <div style={{ maxWidth: 1200 }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--base-foreground)' }}>Items</h1>
          <ArdaButton variant="primary">
            <Plus size={16} />
            Add Item
          </ArdaButton>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: '1px solid var(--base-border)',
              borderRadius: 8,
              background: 'white',
              flex: 1,
              maxWidth: 360,
            }}
          >
            <Search size={16} color="var(--base-muted-foreground)" />
            <span style={{ color: 'var(--base-muted-foreground)', fontSize: 14 }}>
              Search items...
            </span>
          </div>
          <ArdaButton variant="secondary">
            <Filter size={16} />
            Filter
          </ArdaButton>
        </div>

        {/* Items Data Grid */}
        <div style={{ height: 500 }}>
          <ArdaItemsDataGrid items={mockPublishedItems.slice(0, 10)} activeTab="published" />
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--base-muted-foreground)' }}>
          Showing 10 of {mockPublishedItems.length} items
        </div>
      </div>
    </AppLayout>
  ),
};
