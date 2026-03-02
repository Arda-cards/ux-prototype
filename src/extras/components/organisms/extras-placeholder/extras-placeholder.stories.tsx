import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ExtrasOrganismPlaceholder } from './extras-placeholder';

const meta: Meta<typeof ExtrasOrganismPlaceholder> = {
  title: 'Components/Extras/Organisms/Extras Placeholder',
  component: ExtrasOrganismPlaceholder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A trivial placeholder organism in the extras export path. This component exists to validate the extras build pipeline and Storybook integration.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text displayed in the header.',
      table: { category: 'Static' },
    },
    description: {
      control: 'text',
      description: 'Description text displayed below the title.',
      table: { category: 'Static' },
    },
    rows: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of placeholder rows to render.',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExtrasOrganismPlaceholder>;

export const Default: Story = {
  args: {
    title: 'Extras Organism Placeholder',
    description: 'This is a placeholder organism in the extras export path.',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Extras Organism Placeholder')).toBeInTheDocument();
  },
};

export const ManyRows: Story = {
  args: {
    title: 'Additional Data Panel',
    description: 'A supplementary panel layout available in the extras package.',
    rows: 8,
  },
};
