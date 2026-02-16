import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { ArdaBadge } from '@/components/atoms/badge/badge';

import {
  ArdaTable,
  ArdaTableBody,
  ArdaTableCell,
  ArdaTableHead,
  ArdaTableHeader,
  ArdaTableRow,
} from './table';

const meta: Meta<typeof ArdaTable> = {
  title: 'Components/Molecules/Table',
  component: ArdaTable,
  parameters: {
    docs: {
      description: {
        component:
          'A composite data table built from six sub-components: ArdaTable, ArdaTableHeader, ArdaTableBody, ArdaTableRow, ArdaTableHead, and ArdaTableCell. Supports clickable rows with an active/selected state. Use ArdaBadge inside cells for status indicators.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS class for the table element.',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaTable>;

const inventoryData = [
  {
    id: 1,
    name: 'Hex Socket Bolt M8x40',
    sku: 'FST-HSB-M8X40',
    category: 'Fasteners',
    qty: 342,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Safety Goggles Pro',
    sku: 'SFI-SGP-001',
    category: 'PPE',
    qty: 8,
    status: 'Low Stock',
  },
  {
    id: 3,
    name: 'Hydraulic Filter HF-200',
    sku: 'HTS-HF200-R',
    category: 'Filters',
    qty: 0,
    status: 'Out of Stock',
  },
  {
    id: 4,
    name: 'Bearing SKF 6205',
    sku: 'SKF-6205-2RS',
    category: 'Bearings',
    qty: 156,
    status: 'In Stock',
  },
  { id: 5, name: 'V-Belt A68', sku: 'GTS-VBA68', category: 'Drive', qty: 4, status: 'Low Stock' },
  {
    id: 6,
    name: 'Lubricant Grease EP2',
    sku: 'SHL-GEP2-400',
    category: 'Lubricants',
    qty: 45,
    status: 'In Stock',
  },
];

const statusVariant = (status: string) => {
  switch (status) {
    case 'In Stock':
      return 'success' as const;
    case 'Low Stock':
      return 'warning' as const;
    case 'Out of Stock':
      return 'destructive' as const;
    default:
      return 'default' as const;
  }
};

export const WithData: Story = {
  render: () => (
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
        {inventoryData.map((item) => (
          <ArdaTableRow key={item.id}>
            <ArdaTableCell>{item.name}</ArdaTableCell>
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Hex Socket Bolt M8x40')).toBeInTheDocument();
    await expect(canvas.getByText('In Stock')).toBeInTheDocument();
  },
};

export const EmptyState: Story = {
  render: () => (
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
        <tr>
          <td colSpan={5} className="text-center text-muted-foreground py-12 px-4">
            No inventory items found. Add your first item to get started.
          </td>
        </tr>
      </ArdaTableBody>
    </ArdaTable>
  ),
};

function ActiveRowDemo() {
  const [activeId, setActiveId] = React.useState<number | null>(null);

  return (
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
        {inventoryData.map((item) => (
          <ArdaTableRow
            key={item.id}
            active={activeId === item.id}
            onClick={() => setActiveId(item.id)}
          >
            <ArdaTableCell>{item.name}</ArdaTableCell>
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
  );
}

export const WithActiveRow: Story = {
  render: () => <ActiveRowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstRow = canvas.getByText('Hex Socket Bolt M8x40').closest('tr');
    if (firstRow) {
      await userEvent.click(firstRow);
      await expect(firstRow.className).toContain('font-medium');
    }
  },
};
