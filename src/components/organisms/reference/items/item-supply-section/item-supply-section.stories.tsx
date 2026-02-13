import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { useState } from 'react';

import {
  sampleItemSupplies,
  type ItemSupply,
  type SupplyDesignation,
} from '@/types/reference/business-affiliates/item-supply';

import { ArdaItemSupplySection } from './item-supply-section';

const meta: Meta<typeof ArdaItemSupplySection> = {
  title: 'Components/Organisms/Item Supply Section',
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
    onAdd: () => alert('Add supply'),
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
