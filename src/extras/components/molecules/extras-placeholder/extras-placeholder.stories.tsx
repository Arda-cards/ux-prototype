import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ExtrasMoleculePlaceholder } from './extras-placeholder';

const meta: Meta<typeof ExtrasMoleculePlaceholder> = {
  title: 'Components/Extras/Molecules/Extras Placeholder',
  component: ExtrasMoleculePlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'A trivial placeholder molecule in the extras export path. This component exists to validate the extras build pipeline and Storybook integration.',
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
type Story = StoryObj<typeof ExtrasMoleculePlaceholder>;

export const Default: Story = {
  args: {
    title: 'Extras Molecule Placeholder',
    description: 'This is a placeholder molecule in the extras export path.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Extras Molecule Placeholder')).toBeInTheDocument();
  },
};

export const CustomContent: Story = {
  args: {
    title: 'Additional Card Layout',
    description: 'A supplementary card layout available in the extras package.',
  },
};
