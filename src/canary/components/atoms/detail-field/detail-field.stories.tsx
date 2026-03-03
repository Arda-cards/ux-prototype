import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ArdaDetailField } from './detail-field';

const meta: Meta<typeof ArdaDetailField> = {
  title: 'Components/Canary/Atoms/Detail Field',
  component: ArdaDetailField,
  parameters: {
    docs: {
      description: {
        component:
          'A read-only label/value pair for entity detail views. ' +
          'Displays a field label above a formatted value with consistent typography. ' +
          'Extracted from ItemDetailsPanel vendored source.',
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
};

export default meta;
type Story = StoryObj<typeof ArdaDetailField>;

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
  args: { label: 'GL Code', value: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('GL Code')).toBeVisible();
    // The default fallback is an em dash
    await expect(canvas.getByText('\u2014')).toBeVisible();
  },
};

/** Custom fallback text when the value is absent. */
export const CustomFallback: Story = {
  args: { label: 'Link', value: undefined, fallback: 'No link available' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No link available')).toBeVisible();
  },
};

/** Compact variant with reduced gap between label and value. */
export const Compact: Story = {
  args: { label: 'Unit Price', value: '$12.50', variant: 'compact' },
};

/**
 * WithChildren story — custom value rendering using children.
 * Mirrors the Link block in ItemDetailsPanel which renders a TruncatedLink.
 */
export const WithChildren: Story = {
  args: { label: 'Link' },
  render: (args) => (
    <ArdaDetailField {...args}>
      <a href="https://example.com" className="text-primary underline break-all">
        https://example.com/very-long-product-link-that-truncates
      </a>
    </ArdaDetailField>
  ),
};

/**
 * Composition story — multiple fields together, mirroring the Item Details section
 * in ItemDetailsPanel lines 1160-1205.
 */
export const Composition: Story = {
  render: () => (
    <div className="w-[400px] space-y-3 p-4 border rounded-lg">
      <ArdaDetailField label="Link" fallback="No link available" />
      <ArdaDetailField label="SKU" value="ITEM-001-A" />
      <ArdaDetailField label="General Ledger Code" value="4200-100" />
      <ArdaDetailField label="Unit price" value="$12.50" />
      <ArdaDetailField label="Number of cards" value="3" />
    </div>
  ),
};

/** Interactive playground: use the Controls panel to experiment with all props. */
export const Playground: Story = {
  args: { label: 'Field Label', value: 'Field Value', variant: 'default' },
};
