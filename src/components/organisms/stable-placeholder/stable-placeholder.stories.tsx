import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StableOrganismPlaceholder } from './stable-placeholder';

const meta: Meta<typeof StableOrganismPlaceholder> = {
  title: 'Components/Organisms/Stable Placeholder',
  component: StableOrganismPlaceholder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A trivial placeholder organism in the stable export path. This component exists to validate the stable build pipeline and Storybook integration.',
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
type Story = StoryObj<typeof StableOrganismPlaceholder>;

export const Default: Story = {
  args: {
    title: 'Stable Organism Placeholder',
    description: 'This is a placeholder organism in the stable export path.',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Stable Organism Placeholder')).toBeInTheDocument();
  },
};

export const ManyRows: Story = {
  args: {
    title: 'Stable Data Panel',
    description: 'A stable panel layout in the main package.',
    rows: 8,
  },
};
