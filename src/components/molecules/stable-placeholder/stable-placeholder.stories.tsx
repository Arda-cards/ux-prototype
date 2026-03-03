import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StableMoleculePlaceholder } from './stable-placeholder';

const meta: Meta<typeof StableMoleculePlaceholder> = {
  title: 'Components/Molecules/Stable Placeholder',
  component: StableMoleculePlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'A trivial placeholder molecule in the stable export path. This component exists to validate the stable build pipeline and Storybook integration.',
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
type Story = StoryObj<typeof StableMoleculePlaceholder>;

export const Default: Story = {
  args: {
    title: 'Stable Molecule Placeholder',
    description: 'This is a placeholder molecule in the stable export path.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Stable Molecule Placeholder')).toBeInTheDocument();
  },
};

export const CustomContent: Story = {
  args: {
    title: 'Stable Card Layout',
    description: 'A stable card layout in the main package.',
  },
};
