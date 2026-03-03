import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CanaryAtomPlaceholder } from './canary-placeholder';

const meta: Meta<typeof CanaryAtomPlaceholder> = {
  title: 'Components/Canary/Atoms/Canary Placeholder',
  component: CanaryAtomPlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'A trivial placeholder atom in the canary export path. This component exists to validate the canary build pipeline and Storybook integration.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed inside the placeholder.',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CanaryAtomPlaceholder>;

export const Default: Story = {
  args: {
    label: 'Canary Atom Placeholder',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Canary Atom Placeholder')).toBeInTheDocument();
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Experimental Badge Variant',
  },
};
