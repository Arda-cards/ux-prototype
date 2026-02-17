import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Search, Filter, Plus } from 'lucide-react';

import { ArdaButton } from '@/components/atoms/button/button';
import { ArdaItemsDataGrid } from '@/components/organisms/reference/items/items-data-grid/items-data-grid';
import { ArdaItemDrawer, sampleItem } from '@/components/organisms/item-drawer/item-drawer';
import { mockPublishedItems } from '@/components/molecules/data-grid/presets/items/items-mock-data';
import { sampleItemSupplies } from '@/types/reference/business-affiliates/item-supply';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Applications/Design/Items',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const designOutline: React.CSSProperties = {
  outline: '1px dotted var(--accent-slate)',
  outlineOffset: 2,
  borderRadius: 4,
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Items')).toBeInTheDocument();
  },
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = mockPublishedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockPublishedItems.slice(startIndex, startIndex + pageSize);

    return (
      <AppLayout currentPath="/items">
        <div style={{ maxWidth: 1200 }}>
          {/* Page Header */}
          <div
            style={{
              ...designOutline,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              padding: 4,
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

          {/* Toolbar */}
          <div
            style={{
              ...designOutline,
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              alignItems: 'center',
              padding: 4,
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
          <div style={{ ...designOutline, padding: 4, height: 500 }}>
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

export const WithItemDrawer: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = mockPublishedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockPublishedItems.slice(startIndex, startIndex + pageSize);

    return (
      <AppLayout currentPath="/items">
        <div style={{ maxWidth: 1200 }}>
          {/* Page Header */}
          <div
            style={{
              ...designOutline,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              padding: 4,
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

          {/* Toolbar */}
          <div
            style={{
              ...designOutline,
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              alignItems: 'center',
              padding: 4,
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
          <div style={{ ...designOutline, padding: 4, height: 500 }}>
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

        {/* Item Drawer with Supply Section */}
        <ArdaItemDrawer
          open
          mode="view"
          item={sampleItem}
          itemSupplies={sampleItemSupplies}
          supplyDesignations={{
            'is-001': ['PRIMARY'],
            'is-002': ['SECONDARY'],
          }}
          supplySupplierNames={{
            'is-001': 'Fastenal Corp.',
            'is-002': 'Parker Hannifin',
          }}
          onClose={() => {}}
        />
      </AppLayout>
    );
  },
};
