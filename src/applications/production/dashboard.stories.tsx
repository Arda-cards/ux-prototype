import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Package, AlertTriangle, ShoppingCart, DollarSign } from 'lucide-react';

import { ArdaItemsDataGrid } from '@/components/organisms/reference/items/items-data-grid/items-data-grid';
import { mockPublishedItems } from '@/components/molecules/data-grid/presets/items/items-mock-data';
import { AppLayout } from '@/applications/shared/app-layout';

const meta: Meta = {
  title: 'Applications/Production/Dashboard',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const metrics = [
  {
    label: 'Total Inventory',
    value: '2,847',
    change: '+12%',
    icon: Package,
    color: 'var(--accent-blue)',
  },
  {
    label: 'Low-Stock Alerts',
    value: '14',
    change: '+3',
    icon: AlertTriangle,
    color: 'var(--accent-amber)',
  },
  {
    label: 'Pending Orders',
    value: '8',
    change: '-2',
    icon: ShoppingCart,
    color: 'var(--base-primary)',
  },
  {
    label: 'Monthly Spend',
    value: '$24,560',
    change: '+5.2%',
    icon: DollarSign,
    color: 'var(--accent-emerald)',
  },
];

export const Default: Story = {
  render: () => (
    <AppLayout currentPath="/">
      <div style={{ maxWidth: 1200 }}>
        {/* Welcome Card */}
        <div
          style={{
            background:
              'linear-gradient(135deg, var(--base-primary) 0%, var(--base-primary-dark) 100%)',
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
                border: '1px solid var(--base-border)',
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
                  <div
                    style={{ fontSize: 13, color: 'var(--base-muted-foreground)', marginBottom: 4 }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--base-foreground)' }}>
                    {m.value}
                  </div>
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
              <div style={{ fontSize: 12, color: 'var(--accent-emerald)', marginTop: 8 }}>
                {m.change} from last month
              </div>
            </div>
          ))}
        </div>

        {/* Recent Items */}
        <div style={{ marginBottom: 16 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--base-foreground)',
              marginBottom: 12,
            }}
          >
            Recent Items
          </h2>
          <div style={{ height: 350 }}>
            <ArdaItemsDataGrid
              items={mockPublishedItems.slice(0, 5)}
              activeTab="dashboard"
              columnVisibility={{
                select: false,
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
      </div>
    </AppLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Good morning, Alex')).toBeInTheDocument();
  },
};
