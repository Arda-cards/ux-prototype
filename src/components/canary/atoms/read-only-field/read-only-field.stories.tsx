import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ReadOnlyField } from './read-only-field';

const meta = {
  title: 'Components/Canary/Atoms/ReadOnlyField',
  component: ReadOnlyField,
  parameters: {
    docs: {
      description: {
        component:
          'A read-only label/value pair for entity detail views. ' +
          'Displays a field label above a formatted value with consistent typography.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The field label displayed above the value.',
      table: { category: 'Static' },
    },
    fallback: {
      control: 'text',
      description: 'Text shown when value is undefined or empty. Defaults to an em dash.',
      table: { category: 'Static' },
    },
    variant: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Visual density variant.',
      table: { category: 'Static' },
    },
    value: {
      control: 'text',
      description: 'The field value to display as plain text.',
      table: { category: 'Runtime' },
    },
  },
} satisfies Meta<typeof ReadOnlyField>;

export default meta;
type Story = StoryObj<typeof ReadOnlyField>;

/** Default rendering with a label and value. */
export const Default: Story = {
  args: { label: 'SKU', value: 'ITEM-001-A' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('SKU')).toBeVisible();
    await expect(canvas.getByText('ITEM-001-A')).toBeVisible();
  },
};

/** Displays the em-dash fallback when value is undefined. */
export const EmptyValue: Story = {
  args: { label: 'GL Code' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('GL Code')).toBeVisible();
    await expect(canvas.getByText('\u2014')).toBeVisible();
  },
};

/** Custom fallback text when the value is absent. */
export const CustomFallback: Story = {
  args: { label: 'Link', fallback: 'No link available' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No link available')).toBeVisible();
  },
};

/** Compact variant with reduced gap between label and value. */
export const Compact: Story = {
  args: { label: 'Unit Price', value: '$12.50', variant: 'compact' },
};

/** Custom value rendering using children. */
export const WithChildren: Story = {
  args: { label: 'Link' },
  render: (args) => (
    <ReadOnlyField {...args}>
      <a href="https://example.com" className="text-primary underline break-all">
        https://example.com/very-long-product-link-that-truncates
      </a>
    </ReadOnlyField>
  ),
};

/** Multiple fields together. */
export const Composition: Story = {
  render: () => (
    <div className="w-[400px] space-y-3 p-4 border rounded-lg">
      <ReadOnlyField label="Link" fallback="No link available" />
      <ReadOnlyField label="SKU" value="ITEM-001-A" />
      <ReadOnlyField label="General Ledger Code" value="4200-100" />
      <ReadOnlyField label="Unit price" value="$12.50" />
      <ReadOnlyField label="Number of cards" value="3" />
    </div>
  ),
};
