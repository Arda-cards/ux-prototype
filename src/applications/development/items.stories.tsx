import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { useState } from 'react';
import { Search, Filter, Plus, AlertTriangle } from 'lucide-react';

import { ArdaButton } from '@/extras/components/atoms/button/button';
import { ArdaItemsDataGrid } from '@/extras/components/organisms/reference/items/items-data-grid/items-data-grid';
import { mockPublishedItems } from '@/extras/components/molecules/data-grid/presets/items/items-mock-data';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Applications/Development/Items',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const DevBanner = () => (
  <div
    style={{
      background: 'var(--status-warning-bg)',
      borderBottom: '1px solid var(--status-warning-border)',
      padding: '8px 24px',
      fontSize: 13,
      color: 'var(--status-warning-text)',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <AlertTriangle size={14} />
    Development Environment — Features in progress may appear here
  </div>
);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const matches = canvas.getAllByText('Items');
    await expect(matches.length).toBeGreaterThan(0);
  },
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = mockPublishedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockPublishedItems.slice(startIndex, startIndex + pageSize);

    return (
      <AppLayout currentPath="/items" banner={<DevBanner />}>
        <div style={{ maxWidth: 1200 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--base-foreground)' }}>
              Items
            </h1>
            <ArdaButton variant="primary">
              <Plus size={16} />
              Add Item
            </ArdaButton>
          </div>

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

          <div style={{ height: 500 }}>
            <ArdaItemsDataGrid
              items={currentItems}
              activeTab="published"
              enableCellEditing
              paginationData={{
                currentPage: page,
                currentPageSize: pageSize,
                totalItems,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
              }}
              onNextPage={() => setPage((p) => Math.min(p + 1, totalPages))}
              onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
              onFirstPage={() => setPage(1)}
            />
          </div>
        </div>
      </AppLayout>
    );
  },
};
