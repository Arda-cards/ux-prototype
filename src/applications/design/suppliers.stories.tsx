import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search, Filter, Plus } from 'lucide-react';

import { ArdaButton } from '@/components/atoms/button/button';
import { ArdaSupplierDataGrid } from '@/components/organisms/suppliers-data-grid/suppliers-data-grid';
import { ArdaSupplierDrawer } from '@/components/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';
import { mockSuppliers } from '@/components/molecules/data-grid/presets/suppliers/suppliers-mock-data';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Applications/Design/Suppliers',
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
  render: () => (
    <AppLayout currentPath="/suppliers">
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
            Suppliers
          </h1>
          <ArdaButton variant="primary">
            <Plus size={16} />
            Add Supplier
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
              Search suppliers...
            </span>
          </div>
          <ArdaButton variant="secondary">
            <Filter size={16} />
            Filter
          </ArdaButton>
        </div>

        {/* Suppliers Data Grid */}
        <div style={{ ...designOutline, padding: 4, height: 500 }}>
          <ArdaSupplierDataGrid suppliers={mockSuppliers} activeTab="suppliers" />
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--base-muted-foreground)' }}>
          Showing {mockSuppliers.length} of {mockSuppliers.length} suppliers
        </div>
      </div>
    </AppLayout>
  ),
};

export const WithAddDrawer: Story = {
  render: () => (
    <AppLayout currentPath="/suppliers">
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
            Suppliers
          </h1>
          <ArdaButton variant="primary">
            <Plus size={16} />
            Add Supplier
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
              Search suppliers...
            </span>
          </div>
          <ArdaButton variant="secondary">
            <Filter size={16} />
            Filter
          </ArdaButton>
        </div>

        {/* Suppliers Data Grid */}
        <div style={{ ...designOutline, padding: 4, height: 500 }}>
          <ArdaSupplierDataGrid suppliers={mockSuppliers} activeTab="suppliers" />
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--base-muted-foreground)' }}>
          Showing {mockSuppliers.length} of {mockSuppliers.length} suppliers
        </div>
      </div>

      {/* Supplier Drawer in Add mode */}
      <ArdaSupplierDrawer open mode="add" onClose={() => {}} />
    </AppLayout>
  ),
};
