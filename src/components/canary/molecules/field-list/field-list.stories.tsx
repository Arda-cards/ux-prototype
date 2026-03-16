import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArdaFieldList } from './field-list';

const meta = {
  title: 'Components/Canary/Molecules/FieldList',
  component: ArdaFieldList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Data-driven list of read-only label/value fields with dividers. ' +
          'Pass a fields[] array; each renders as an ReadOnlyField.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaFieldList>;

export default meta;
type Story = StoryObj<typeof ArdaFieldList>;

/** Typical detail fields. */
export const Default: Story = {
  args: {
    fields: [
      { key: 'sku', label: 'SKU', value: 'WDG-4420-BLK' },
      { key: 'supplier', label: 'Supplier', value: 'McMaster-Carr' },
      { key: 'price', label: 'Unit Price', value: '$12.50' },
      { key: 'location', label: 'Bin Location', value: 'A-12' },
      { key: 'gl', label: 'GL Code', value: '4200-100' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] border rounded-lg bg-background">
        <Story />
      </div>
    ),
  ],
};

/** Fields with missing values show em-dash fallback. */
export const WithMissingValues: Story = {
  args: {
    fields: [
      { key: 'sku', label: 'SKU', value: 'BOLT-M8-30' },
      { key: 'link', label: 'Link' },
      { key: 'gl', label: 'GL Code' },
      { key: 'price', label: 'Unit Price', value: '$4.25' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] border rounded-lg bg-background">
        <Story />
      </div>
    ),
  ],
};

/** Field with custom children rendering. */
export const WithCustomChildren: Story = {
  args: {
    fields: [
      { key: 'sku', label: 'SKU', value: 'WDG-4420-BLK' },
      {
        key: 'link',
        label: 'Link',
        children: (
          <a href="https://example.com" className="text-link underline break-all text-sm">
            https://example.com/product/wdg-4420
          </a>
        ),
      },
      { key: 'price', label: 'Unit Price', value: '$12.50' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] border rounded-lg bg-background">
        <Story />
      </div>
    ),
  ],
};

/** Empty fields array renders nothing. */
export const Empty: Story = {
  args: {
    fields: [],
  },
};
