import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ArdaBadge } from '@/components/atoms/badge/badge';
import { ArdaButton } from '@/components/atoms/button/button';
import { ArdaItemsDataGrid } from '@/components/organisms/reference/items/items-data-grid/items-data-grid';
import { mockPublishedItems } from '@/components/molecules/data-grid/presets/items/items-mock-data';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Applications/Design/Order Queue',
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

const supplierGroups = [
  { supplier: 'Fastenal Corp.', itemCount: 3, subtotal: 186.0, startIndex: 0 },
  { supplier: 'SKF Distribution', itemCount: 2, subtotal: 539.0, startIndex: 3 },
  { supplier: 'SafetyFirst Inc.', itemCount: 3, subtotal: 919.26, startIndex: 5 },
];

const grandTotal = supplierGroups.reduce((sum, g) => sum + g.subtotal, 0);

export const Default: Story = {
  render: () => (
    <AppLayout currentPath="/orders">
      <div style={{ maxWidth: 1200 }}>
        {/* Page Header */}
        <div
          style={{
            ...designOutline,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            padding: 4,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--base-foreground)' }}>
              Order Queue
            </h1>
            <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', marginTop: 4 }}>
              {supplierGroups.length} suppliers with pending orders
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <ArdaButton variant="secondary">Export CSV</ArdaButton>
            <ArdaButton variant="primary">Submit All Orders</ArdaButton>
          </div>
        </div>

        {/* Grand Total */}
        <div
          style={{
            ...designOutline,
            background: 'white',
            border: '1px solid var(--base-border)',
            borderRadius: 10,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, color: 'var(--base-muted-foreground)' }}>Grand Total</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--base-foreground)' }}>
            ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Supplier Groups */}
        {supplierGroups.map((group) => (
          <div
            key={group.supplier}
            style={{
              ...designOutline,
              marginBottom: 24,
              background: 'white',
              borderRadius: 10,
              border: '1px solid var(--base-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--base-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--base-foreground)' }}>
                  {group.supplier}
                </span>
                <ArdaBadge variant="info">{group.itemCount} items</ArdaBadge>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--base-foreground)' }}>
                ${group.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ height: 200 }}>
              <ArdaItemsDataGrid
                items={mockPublishedItems.slice(
                  group.startIndex,
                  group.startIndex + group.itemCount,
                )}
                activeTab={`order-${group.supplier}`}
                columnVisibility={{
                  select: false,
                  imageUrl: false,
                  quickActions: false,
                  cardCount: false,
                  cardNotesDefault: false,
                  taxable: false,
                  color: false,
                  cardSize: false,
                  labelSize: false,
                  breadcrumbSize: false,
                  'locator.facility': false,
                  'locator.department': false,
                  'locator.location': false,
                  useCase: false,
                  'classification.subType': false,
                  notes: false,
                }}
                enableCellEditing
              />
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const matches = canvas.getAllByText('Order Queue');
    await expect(matches.length).toBeGreaterThan(0);
  },
};
