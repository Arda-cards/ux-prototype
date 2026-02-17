import type { Meta, StoryObj } from '@storybook/react';

import { sampleAffiliates } from '@/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierForm } from './supplier-form';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- sample data guaranteed
const sampleAffiliate = sampleAffiliates[0]!;

const meta: Meta<typeof ArdaSupplierForm> = {
  title: 'Components/Organisms/Reference/Business Affiliates/Supplier Form',
  component: ArdaSupplierForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Thin wrapper around ArdaSupplierViewer for backward compatibility. Supports single-scroll and stepped layout modes.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single-scroll', 'stepped'],
      description: 'Form layout mode.',
      table: { category: 'Static' },
    },
    value: {
      control: false,
      description: 'Current BusinessAffiliate value.',
      table: { category: 'Runtime' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaSupplierForm>;

export const SingleScroll: Story = {
  args: {
    value: sampleAffiliate,
    mode: 'single-scroll',
  },
};

export const Stepped: Story = {
  args: {
    value: sampleAffiliate,
    mode: 'stepped',
  },
};

export const Empty: Story = {
  args: {
    value: { eId: '', name: '', legal: {}, roles: [] },
  },
};
