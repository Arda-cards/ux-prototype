import type { Meta, StoryObj } from '@storybook/react';
import { Search, Filter, Plus } from 'lucide-react';

import { ArdaBadge } from '@/components/atoms/badge/badge';
import { ArdaButton } from '@/components/atoms/button/button';
import {
  ArdaTable,
  ArdaTableBody,
  ArdaTableCell,
  ArdaTableHead,
  ArdaTableHeader,
  ArdaTableRow,
} from '@/components/molecules/table/table';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Application Mocks/Production/Items',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const items = [
  { name: 'Hex Socket Bolt M8x40', sku: 'FST-HSB-M8X40', category: 'Fasteners', qty: 342, status: 'In Stock' },
  { name: 'Safety Goggles Pro', sku: 'SFI-SGP-001', category: 'PPE', qty: 8, status: 'Low Stock' },
  { name: 'Hydraulic Filter HF-200', sku: 'HTS-HF200-R', category: 'Filters', qty: 0, status: 'Out of Stock' },
  { name: 'Bearing SKF 6205', sku: 'SKF-6205-2RS', category: 'Bearings', qty: 156, status: 'In Stock' },
  { name: 'V-Belt A68', sku: 'GTS-VBA68', category: 'Drive', qty: 4, status: 'Low Stock' },
  { name: 'Lubricant Grease EP2', sku: 'SHL-GEP2-400', category: 'Lubricants', qty: 45, status: 'In Stock' },
];

const statusVariant = (status: string) => {
  switch (status) {
    case 'In Stock': return 'success' as const;
    case 'Low Stock': return 'warning' as const;
    case 'Out of Stock': return 'destructive' as const;
    default: return 'default' as const;
  }
};

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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>Items</h1>
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
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              background: 'white',
              flex: 1,
              maxWidth: 360,
            }}
          >
            <Search size={16} color="#737373" />
            <span style={{ color: '#737373', fontSize: 14 }}>Search items...</span>
          </div>
          <ArdaButton variant="secondary">
            <Filter size={16} />
            Filter
          </ArdaButton>
        </div>

        {/* Items Table */}
        <ArdaTable>
          <ArdaTableHeader>
            <ArdaTableRow>
              <ArdaTableHead>Name</ArdaTableHead>
              <ArdaTableHead>SKU</ArdaTableHead>
              <ArdaTableHead>Category</ArdaTableHead>
              <ArdaTableHead>Quantity</ArdaTableHead>
              <ArdaTableHead>Status</ArdaTableHead>
            </ArdaTableRow>
          </ArdaTableHeader>
          <ArdaTableBody>
            {items.map((item) => (
              <ArdaTableRow key={item.sku}>
                <ArdaTableCell className="font-semibold">{item.name}</ArdaTableCell>
                <ArdaTableCell className="font-mono text-sm">{item.sku}</ArdaTableCell>
                <ArdaTableCell>{item.category}</ArdaTableCell>
                <ArdaTableCell>{item.qty}</ArdaTableCell>
                <ArdaTableCell>
                  <ArdaBadge variant={statusVariant(item.status)} dot>
                    {item.status}
                  </ArdaBadge>
                </ArdaTableCell>
              </ArdaTableRow>
            ))}
          </ArdaTableBody>
        </ArdaTable>

        {/* Footer info */}
        <div style={{ marginTop: 12, fontSize: 13, color: '#737373' }}>
          Showing {items.length} of 2,847 items
        </div>
      </div>
    </AppLayout>
  ),
};
