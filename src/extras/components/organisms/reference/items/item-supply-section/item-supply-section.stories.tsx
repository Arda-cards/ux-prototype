import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import {
  sampleItemSupplies,
  type ItemSupply,
  type SupplyDesignation,
} from '@/extras/types/reference/business-affiliates/item-supply';

import { ArdaItemSupplySection } from './item-supply-section';

const meta: Meta<typeof ArdaItemSupplySection> = {
  title: 'Components/Extras/Organisms/Reference/Items/Item Supply Section',
  component: ArdaItemSupplySection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A section that displays all supply relationships for an item. Composes ArdaSupplyCard molecules into a list with an "Add" button and empty-state handling.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Section heading. Defaults to "Supplies".',
      table: { category: 'Static' },
    },
    supplies: {
      control: false,
      description: 'List of item supplies to display.',
      table: { category: 'Runtime' },
    },
    designations: {
      control: false,
      description: 'Map of supply entityId to its designations.',
      table: { category: 'Runtime' },
    },
    supplierNames: {
      control: false,
      description: 'Map of supply entityId to supplier display name.',
      table: { category: 'Runtime' },
    },
    defaultSupplyId: {
      control: 'text',
      description: 'The entityId of the default supply.',
      table: { category: 'Runtime' },
    },
    onAdd: {
      action: 'add',
      description: 'Called when the Add button is clicked.',
      table: { category: 'Events' },
    },
    onEditSupply: {
      action: 'editSupply',
      description: 'Called when a supply Edit action is triggered.',
      table: { category: 'Events' },
    },
    onRemoveSupply: {
      action: 'removeSupply',
      description: 'Called when a supply Remove action is triggered.',
      table: { category: 'Events' },
    },
    onSupplierClick: {
      action: 'supplierClick',
      description: 'Called when a supplier name is clicked.',
      table: { category: 'Events' },
    },
    onDesignationChange: {
      action: 'designationChange',
      description: 'Called when a designation change is requested.',
      table: { category: 'Events' },
    },
    onToggleDefault: {
      action: 'toggleDefault',
      description: 'Called when the default toggle is clicked.',
      table: { category: 'Events' },
    },
  },
  args: {
    onAdd: fn(),
    onEditSupply: fn(),
    onRemoveSupply: fn(),
    onSupplierClick: fn(),
    onDesignationChange: fn(),
    onToggleDefault: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaItemSupplySection>;

const defaultSupplierNames: Record<string, string> = {
  'is-001': 'Fastenal Corp.',
  'is-002': 'Parker Hannifin',
};

const defaultDesignations: Record<string, SupplyDesignation[]> = {
  'is-001': ['PRIMARY'],
  'is-002': ['SECONDARY'],
};

export const WithSupplies: Story = {
  args: {
    supplies: sampleItemSupplies,
    designations: defaultDesignations,
    supplierNames: defaultSupplierNames,
    linkedSupplierIds: new Set(['is-001', 'is-002']),
    defaultSupplyId: 'is-001',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Fastenal Corp.')).toBeInTheDocument();
    await expect(canvas.getByText('Parker Hannifin')).toBeInTheDocument();
    await expect(canvas.getByText('Primary')).toBeInTheDocument();
    await expect(canvas.getByText('Secondary')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    supplies: [],
    designations: {},
    supplierNames: {},
  },
};

const legacySupply: ItemSupply = {
  entityId: 'is-legacy',
  affiliateId: 'ba-legacy',
  itemId: 'item-001',
  designation: 'TERTIARY',
  supplierSku: 'OLD-PART-99',
  unitCost: { value: 210.0, currency: 'USD' },
};

export const WithLegacy: Story = {
  args: {
    supplies: [...sampleItemSupplies, legacySupply],
    designations: {
      ...defaultDesignations,
      'is-legacy': ['TERTIARY'],
    },
    supplierNames: {
      ...defaultSupplierNames,
      'is-legacy': 'Old Parts Co.',
    },
    linkedSupplierIds: new Set(['is-001', 'is-002']),
    legacySupplyIds: new Set(['is-legacy']),
    defaultSupplyId: 'is-001',
  },
};

export const Interactive: Story = {
  render: function InteractiveSection() {
    const [supplies] = useState<ItemSupply[]>(sampleItemSupplies);
    const [designations, setDesignations] =
      useState<Record<string, SupplyDesignation[]>>(defaultDesignations);
    const [defaultId, setDefaultId] = useState<string | undefined>('is-001');

    return (
      <ArdaItemSupplySection
        supplies={supplies}
        designations={designations}
        supplierNames={defaultSupplierNames}
        linkedSupplierIds={new Set(['is-001', 'is-002'])}
        {...(defaultId ? { defaultSupplyId: defaultId } : {})}
        onAdd={() => alert('Add supply dialog')}
        onEditSupply={(id) => alert(`Edit supply ${id}`)}
        onRemoveSupply={(id) => alert(`Remove supply ${id}`)}
        onSupplierClick={(id) => alert(`Navigate to supplier ${id}`)}
        onDesignationChange={(id, d) => setDesignations((prev) => ({ ...prev, [id]: [d] }))}
        onToggleDefault={(id) => setDefaultId((prev) => (prev === id ? undefined : id))}
      />
    );
  },
};
