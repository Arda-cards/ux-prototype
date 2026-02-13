import type { Meta, StoryObj } from '@storybook/react';
import { Package, AlertTriangle, ShoppingCart, DollarSign } from 'lucide-react';

import { ArdaBadge } from '@/components/atoms/badge/badge';
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
  title: 'Application Mocks/Production/Dashboard',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const metrics = [
  { label: 'Total Inventory', value: '2,847', change: '+12%', icon: Package, color: '#3B82F6' },
  { label: 'Low-Stock Alerts', value: '14', change: '+3', icon: AlertTriangle, color: '#F59E0B' },
  { label: 'Pending Orders', value: '8', change: '-2', icon: ShoppingCart, color: '#FC5A29' },
  { label: 'Monthly Spend', value: '$24,560', change: '+5.2%', icon: DollarSign, color: '#10B981' },
];

const recentOrders = [
  {
    id: 'PO-2025-0041',
    supplier: 'Fastenal Corp.',
    items: 12,
    total: '$3,240.00',
    status: 'Processing',
    date: '2025-06-10',
  },
  {
    id: 'PO-2025-0040',
    supplier: 'SKF Distribution',
    items: 4,
    total: '$1,890.00',
    status: 'Shipped',
    date: '2025-06-09',
  },
  {
    id: 'PO-2025-0039',
    supplier: 'Gates Industrial',
    items: 8,
    total: '$720.00',
    status: 'Delivered',
    date: '2025-06-07',
  },
  {
    id: 'PO-2025-0038',
    supplier: 'SafetyFirst Inc.',
    items: 20,
    total: '$2,100.00',
    status: 'Processing',
    date: '2025-06-06',
  },
  {
    id: 'PO-2025-0037',
    supplier: 'HydroTech Systems',
    items: 3,
    total: '$5,670.00',
    status: 'Delivered',
    date: '2025-06-04',
  },
];

const orderStatus = (status: string) => {
  switch (status) {
    case 'Processing':
      return 'info' as const;
    case 'Shipped':
      return 'warning' as const;
    case 'Delivered':
      return 'success' as const;
    default:
      return 'default' as const;
  }
};

export const Default: Story = {
  render: () => (
    <AppLayout currentPath="/">
      <div style={{ maxWidth: 1200 }}>
        {/* Welcome Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FC5A29 0%, #E04D22 100%)',
            borderRadius: 12,
            padding: '24px 32px',
            color: 'white',
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Good morning, Alex</h1>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            You have 14 low-stock alerts and 8 pending orders to review today.
          </p>
        </div>

        {/* Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                background: 'white',
                borderRadius: 10,
                padding: 20,
                border: '1px solid #E5E5E5',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: '#737373', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#0A0A0A' }}>{m.value}</div>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${m.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <m.icon size={20} color={m.color} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#10B981', marginTop: 8 }}>
                {m.change} from last month
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', marginBottom: 12 }}>
            Recent Orders
          </h2>
          <ArdaTable>
            <ArdaTableHeader>
              <ArdaTableRow>
                <ArdaTableHead>Order ID</ArdaTableHead>
                <ArdaTableHead>Supplier</ArdaTableHead>
                <ArdaTableHead>Items</ArdaTableHead>
                <ArdaTableHead>Total</ArdaTableHead>
                <ArdaTableHead>Status</ArdaTableHead>
                <ArdaTableHead>Date</ArdaTableHead>
              </ArdaTableRow>
            </ArdaTableHeader>
            <ArdaTableBody>
              {recentOrders.map((order) => (
                <ArdaTableRow key={order.id}>
                  <ArdaTableCell className="font-mono font-semibold">{order.id}</ArdaTableCell>
                  <ArdaTableCell>{order.supplier}</ArdaTableCell>
                  <ArdaTableCell>{order.items}</ArdaTableCell>
                  <ArdaTableCell className="font-semibold">{order.total}</ArdaTableCell>
                  <ArdaTableCell>
                    <ArdaBadge variant={orderStatus(order.status)} dot>
                      {order.status}
                    </ArdaBadge>
                  </ArdaTableCell>
                  <ArdaTableCell className="text-[#737373]">{order.date}</ArdaTableCell>
                </ArdaTableRow>
              ))}
            </ArdaTableBody>
          </ArdaTable>
        </div>
      </div>
    </AppLayout>
  ),
};
