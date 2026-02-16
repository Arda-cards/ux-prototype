import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import {
  sampleAffiliates,
  type BusinessAffiliate,
} from '@/types/reference/business-affiliates/business-affiliate';

import { ArdaSupplierForm } from './supplier-form';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- sample data guaranteed
const sampleAffiliate = sampleAffiliates[0]!;

function emptyAffiliate(): BusinessAffiliate {
  return { eId: '', name: '', legal: {}, roles: [] };
}

const meta: Meta<typeof ArdaSupplierForm> = {
  title: 'Components/Organisms/Supplier Form',
  component: ArdaSupplierForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Shared supplier form component used by both the supplier drawer (single-scroll) and the create-supplier wizard (stepped). Renders all fields for a BusinessAffiliate.',
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
      description: 'Current BusinessAffiliate form value.',
      table: { category: 'Runtime' },
    },
    onChange: {
      action: 'changed',
      description: 'Called when any form field changes.',
      table: { category: 'Events' },
    },
    currentStep: {
      control: { type: 'number', min: 0, max: 2 },
      description: 'Current step index for stepped mode (0-2).',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onChange: fn(),
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

export const SingleScrollEmpty: Story = {
  render: function SingleScrollEmptyRender() {
    const [value, setValue] = useState<BusinessAffiliate>(emptyAffiliate());
    return <ArdaSupplierForm value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Company Name')).toBeInTheDocument();
    await expect(canvas.getByText('Business Roles')).toBeInTheDocument();
  },
};

export const SingleScrollWithData: Story = {
  render: function SingleScrollDataRender() {
    const [value, setValue] = useState<BusinessAffiliate>(sampleAffiliate);
    return <ArdaSupplierForm value={value} onChange={setValue} />;
  },
};

export const SteppedStep0: Story = {
  render: function SteppedStep0Render() {
    const [value, setValue] = useState<BusinessAffiliate>(sampleAffiliate);
    return <ArdaSupplierForm value={value} onChange={setValue} mode="stepped" currentStep={0} />;
  },
};

export const SteppedStep1: Story = {
  render: function SteppedStep1Render() {
    const [value, setValue] = useState<BusinessAffiliate>(sampleAffiliate);
    return <ArdaSupplierForm value={value} onChange={setValue} mode="stepped" currentStep={1} />;
  },
};

export const SteppedStep2: Story = {
  render: function SteppedStep2Render() {
    const [value, setValue] = useState<BusinessAffiliate>(sampleAffiliate);
    return <ArdaSupplierForm value={value} onChange={setValue} mode="stepped" currentStep={2} />;
  },
};
