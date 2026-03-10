import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ArdaItemCard } from './item-card';

const meta: Meta<typeof ArdaItemCard> = {
  title: 'Components/Extras/Molecules/Item Card',
  component: ArdaItemCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A physical-card-style component representing an inventory item. Displays item name, reorder quantities, storage location, supplier, product image, and SKU. An optional diagonal sash shows runtime status (e.g. "Low Stock", "Reorder").',
      },
    },
  },
  argTypes: {
    title: { description: 'Item display name.', table: { category: 'Static' } },
    minQty: { description: 'Minimum reorder quantity.', table: { category: 'Static' } },
    minUnit: {
      description: 'Unit of measure for minimum quantity.',
      table: { category: 'Static' },
    },
    location: { description: 'Physical storage location code.', table: { category: 'Static' } },
    orderQty: { description: 'Standard order quantity.', table: { category: 'Static' } },
    orderUnit: {
      description: 'Unit of measure for order quantity.',
      table: { category: 'Static' },
    },
    supplier: { description: 'Preferred supplier name.', table: { category: 'Static' } },
    sku: { description: 'Stock keeping unit identifier.', table: { category: 'Static' } },
    image: { description: 'Product image URL.', table: { category: 'Static' } },
    cardIndex: { description: "Card's position in a set.", table: { category: 'Static' } },
    totalCards: { description: 'Total number of cards in the set.', table: { category: 'Static' } },
    cardNotes: {
      description: 'Free-text notes displayed below the header.',
      table: { category: 'Static' },
    },
    status: {
      description: 'Current status displayed as a diagonal sash.',
      table: { category: 'Runtime' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaItemCard>;

export const Default: Story = {
  args: {
    title: 'Hex Socket Bolt M8x40',
    minQty: '50',
    minUnit: 'pcs',
    location: 'W-03-B2',
    orderQty: '100',
    orderUnit: 'pcs',
    supplier: 'Fastenal Corp.',
    sku: 'FST-HSB-M8X40',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop',
    cardIndex: 1,
    totalCards: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Hex Socket Bolt M8x40')).toBeInTheDocument();
  },
};

export const WithStatusSash: Story = {
  args: {
    title: 'Safety Goggles Pro',
    minQty: '10',
    minUnit: 'ea',
    location: 'S-01-A4',
    orderQty: '24',
    orderUnit: 'ea',
    supplier: 'SafetyFirst Inc.',
    sku: 'SFI-SGP-001',
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
    cardIndex: 2,
    totalCards: 5,
  },
};

export const MinimalData: Story = {
  args: {
    title: 'Uncategorized Part',
  },
};

export const WithCardNotes: Story = {
  args: {
    title: 'Hydraulic Filter HF-200',
    minQty: '5',
    minUnit: 'ea',
    location: 'M-07-C1',
    orderQty: '10',
    orderUnit: 'ea',
    supplier: 'HydroTech Systems',
    sku: 'HTS-HF200-R',
    cardNotes:
      'Replace every 500 operating hours. Check pressure differential gauge before ordering.',
    cardIndex: 1,
    totalCards: 1,
    status: 'Reorder',
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <ArdaItemCard
        title="Bearing SKF 6205"
        minQty="20"
        minUnit="ea"
        location="B-04-A1"
        orderQty="50"
        orderUnit="ea"
        supplier="SKF Distribution"
        sku="SKF-6205-2RS"
        cardIndex={1}
        totalCards={2}
      />
      <ArdaItemCard
        title="V-Belt A68"
        minQty="5"
        minUnit="ea"
        location="B-04-B3"
        orderQty="10"
        orderUnit="ea"
        supplier="Gates Industrial"
        sku="GTS-VBA68"
        status="Low Stock"
        cardIndex={2}
        totalCards={2}
      />
    </div>
  ),
};
