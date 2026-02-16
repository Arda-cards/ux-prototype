import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import type { SupplyDesignation } from '@/types/reference/business-affiliates/item-supply';

import { ArdaSupplyCard } from './supply-card';

const meta: Meta<typeof ArdaSupplyCard> = {
  title: 'Components/Molecules/Supply Card',
  component: ArdaSupplyCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A card representing a supply relationship between an item and a business affiliate. Shows supplier name, cost, lead time, designation badges, and provides actions for editing, removing, and changing designations.',
      },
    },
  },
  argTypes: {
    supplierName: { description: 'Supplier display name.', table: { category: 'Static' } },
    supplierLinked: {
      description: 'Whether the supplier name is linked.',
      table: { category: 'Static' },
    },
    sku: { description: 'Supplier SKU.', table: { category: 'Static' } },
    orderMechanism: { description: 'Order mechanism label.', table: { category: 'Static' } },
    unitCost: { description: 'Formatted unit cost.', table: { category: 'Static' } },
    leadTime: { description: 'Formatted lead time.', table: { category: 'Static' } },
    legacy: { description: 'Legacy supply flag.', table: { category: 'Static' } },
    designations: {
      description: 'Current designations.',
      table: { category: 'Runtime' },
    },
    isDefault: {
      description: 'Whether this is the default supply.',
      table: { category: 'Runtime' },
    },
    onSupplierClick: {
      action: 'supplierClick',
      description: 'Called when the supplier name is clicked.',
      table: { category: 'Events' },
    },
    onEdit: {
      action: 'edit',
      description: 'Called when the Edit action is triggered.',
      table: { category: 'Events' },
    },
    onRemove: {
      action: 'remove',
      description: 'Called when the Remove action is triggered.',
      table: { category: 'Events' },
    },
    onDesignationChange: {
      action: 'designationChange',
      description: 'Called when a designation change is requested.',
      table: { category: 'Events' },
    },
    onToggleDefault: {
      action: 'toggleDefault',
      description: 'Called when the default toggle star is clicked.',
      table: { category: 'Events' },
    },
  },
  args: {
    onSupplierClick: fn(),
    onEdit: fn(),
    onRemove: fn(),
    onDesignationChange: fn(),
    onToggleDefault: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaSupplyCard>;

export const Default: Story = {
  args: {
    supplierName: 'Fastenal Corp.',
    supplierLinked: true,
    sku: 'FAS-HC500-A',
    orderMechanism: 'Online',
    unitCost: '$189.99/unit',
    leadTime: '5 Days',
    designations: ['PRIMARY'],
    isDefault: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Fastenal Corp.')).toBeInTheDocument();
    await expect(canvas.getByText('FAS-HC500-A')).toBeInTheDocument();
    await expect(canvas.getByText('Primary')).toBeInTheDocument();
  },
};

export const WithDesignations: Story = {
  args: {
    supplierName: 'Parker Hannifin',
    supplierLinked: true,
    sku: 'PH-HC500-OEM',
    orderMechanism: 'Purchase Order',
    unitCost: '$165.00/unit',
    leadTime: '2 Weeks',
    designations: ['SECONDARY', 'BACKUP'],
    isDefault: false,
  },
};

export const LegacySupply: Story = {
  args: {
    supplierName: 'Old Parts Co.',
    sku: 'OPC-LEGACY-01',
    unitCost: '$210.00/unit',
    designations: ['TERTIARY'],
    legacy: true,
  },
};

export const Interactive: Story = {
  render: function InteractiveSupplyCard() {
    const [designations, setDesignations] = useState<SupplyDesignation[]>(['PRIMARY']);
    const [isDefault, setIsDefault] = useState(true);

    return (
      <ArdaSupplyCard
        supplierName="Grainger Industrial"
        supplierLinked
        sku="GRG-HF200"
        orderMechanism="Online"
        unitCost="$142.50/unit"
        leadTime="3 Days"
        designations={designations}
        isDefault={isDefault}
        onSupplierClick={() => alert('Navigate to supplier')}
        onEdit={() => alert('Edit supply')}
        onRemove={() => alert('Remove supply')}
        onDesignationChange={(d) => setDesignations([d])}
        onToggleDefault={() => setIsDefault(!isDefault)}
      />
    );
  },
};
