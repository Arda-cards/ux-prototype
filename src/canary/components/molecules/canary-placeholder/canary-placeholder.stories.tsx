import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CanaryMoleculePlaceholder } from './canary-placeholder';

const meta: Meta<typeof CanaryMoleculePlaceholder> = {
  title: 'Components/Canary/Molecules/Canary Placeholder',
  component: CanaryMoleculePlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'A trivial placeholder molecule in the canary export path. This component exists to validate the canary build pipeline and Storybook integration.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text displayed in the card header.',
      table: { category: 'Static' },
    },
    description: {
      control: 'text',
      description: 'Description text displayed below the title.',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CanaryMoleculePlaceholder>;

export const Default: Story = {
  args: {
    title: 'Canary Molecule Placeholder',
    description: 'This is a placeholder molecule in the canary export path.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Canary Molecule Placeholder')).toBeInTheDocument();
  },
};

export const CustomContent: Story = {
  args: {
    title: 'Experimental Card Layout',
    description: 'A new card layout being tested before promotion to stable.',
  },
};
