import type { Meta, StoryObj } from '@storybook/react';
import { AlertTriangle } from 'lucide-react';

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
  title: 'Application Mocks/Development/Order Queue',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const DevBanner = () => (
  <div
    style={{
      background: '#FEF3C7',
      borderBottom: '1px solid #FDE68A',
      padding: '8px 24px',
      fontSize: 13,
      color: '#92400E',
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

const supplierGroups = [
  {
    supplier: 'Fastenal Corp.',
    items: [
      {
        name: 'Hex Socket Bolt M8x40',
        sku: 'FST-HSB-M8X40',
        qty: 200,
        unitPrice: 0.45,
        total: 90.0,
      },
      { name: 'Flat Washer M8 Zinc', sku: 'FST-FWZ-M8', qty: 500, unitPrice: 0.12, total: 60.0 },
      { name: 'Hex Nut M8 Grade 8', sku: 'FST-HNG8-M8', qty: 200, unitPrice: 0.18, total: 36.0 },
    ],
    subtotal: 186.0,
  },
  {
    supplier: 'SKF Distribution',
    items: [
      { name: 'Bearing SKF 6205-2RS', sku: 'SKF-6205-2RS', qty: 20, unitPrice: 12.5, total: 250.0 },
      { name: 'Bearing SKF 6308-2Z', sku: 'SKF-6308-2Z', qty: 10, unitPrice: 28.9, total: 289.0 },
    ],
    subtotal: 539.0,
  },
  {
    supplier: 'SafetyFirst Inc.',
    items: [
      { name: 'Safety Goggles Pro', sku: 'SFI-SGP-001', qty: 50, unitPrice: 8.99, total: 449.5 },
      {
        name: 'Nitrile Gloves Box (L)',
        sku: 'SFI-NGL-L',
        qty: 24,
        unitPrice: 14.99,
        total: 359.76,
      },
      { name: 'Ear Plugs 200-Pack', sku: 'SFI-EP200', qty: 5, unitPrice: 22.0, total: 110.0 },
    ],
    subtotal: 919.26,
  },
];

const grandTotal = supplierGroups.reduce((sum, g) => sum + g.subtotal, 0);

export const Default: Story = {
  render: () => (
    <AppLayout currentPath="/orders" banner={<DevBanner />}>
      <div style={{ maxWidth: 1200 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>Order Queue</h1>
            <p style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>
              {supplierGroups.length} suppliers with pending orders
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <ArdaButton variant="secondary">Export CSV</ArdaButton>
            <ArdaButton variant="primary">Submit All Orders</ArdaButton>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: 10,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, color: '#737373' }}>Grand Total</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>
            ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {supplierGroups.map((group) => (
          <div
            key={group.supplier}
            style={{
              marginBottom: 24,
              background: 'white',
              borderRadius: 10,
              border: '1px solid #E5E5E5',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#0A0A0A' }}>
                  {group.supplier}
                </span>
                <ArdaBadge variant="info">{group.items.length} items</ArdaBadge>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#0A0A0A' }}>
                ${group.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <ArdaTable>
              <ArdaTableHeader>
                <ArdaTableRow>
                  <ArdaTableHead>Item</ArdaTableHead>
                  <ArdaTableHead>SKU</ArdaTableHead>
                  <ArdaTableHead>Qty</ArdaTableHead>
                  <ArdaTableHead>Unit Price</ArdaTableHead>
                  <ArdaTableHead>Total</ArdaTableHead>
                </ArdaTableRow>
              </ArdaTableHeader>
              <ArdaTableBody>
                {group.items.map((item) => (
                  <ArdaTableRow key={item.sku}>
                    <ArdaTableCell className="font-semibold">{item.name}</ArdaTableCell>
                    <ArdaTableCell className="font-mono text-sm">{item.sku}</ArdaTableCell>
                    <ArdaTableCell>{item.qty}</ArdaTableCell>
                    <ArdaTableCell>${item.unitPrice.toFixed(2)}</ArdaTableCell>
                    <ArdaTableCell className="font-semibold">
                      ${item.total.toFixed(2)}
                    </ArdaTableCell>
                  </ArdaTableRow>
                ))}
              </ArdaTableBody>
            </ArdaTable>
          </div>
        ))}
      </div>
    </AppLayout>
  ),
};
