import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ExtrasAtomPlaceholder } from './extras-placeholder';

const meta: Meta<typeof ExtrasAtomPlaceholder> = {
  title: 'Components/Extras/Atoms/Extras Placeholder',
  component: ExtrasAtomPlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'A trivial placeholder atom in the extras export path. This component exists to validate the extras build pipeline and Storybook integration.',
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
type Story = StoryObj<typeof ExtrasAtomPlaceholder>;

export const Default: Story = {
  args: {
    label: 'Extras Atom Placeholder',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Extras Atom Placeholder')).toBeInTheDocument();
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Additional Badge Variant',
  },
};
