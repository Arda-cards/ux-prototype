import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StableAtomPlaceholder } from './stable-placeholder';

const meta: Meta<typeof StableAtomPlaceholder> = {
  title: 'Components/Atoms/Stable Placeholder',
  component: StableAtomPlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'A trivial placeholder atom in the stable export path. This component exists to validate the stable build pipeline and Storybook integration.',
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
type Story = StoryObj<typeof StableAtomPlaceholder>;

export const Default: Story = {
  args: {
    label: 'Stable Atom Placeholder',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Stable Atom Placeholder')).toBeInTheDocument();
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Stable Badge Variant',
  },
};
