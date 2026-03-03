import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CanaryOrganismPlaceholder } from './canary-placeholder';

const meta: Meta<typeof CanaryOrganismPlaceholder> = {
  title: 'Components/Canary/Organisms/Canary Placeholder',
  component: CanaryOrganismPlaceholder,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A trivial placeholder organism in the canary export path. This component exists to validate the canary build pipeline and Storybook integration.',
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
type Story = StoryObj<typeof CanaryOrganismPlaceholder>;

export const Default: Story = {
  args: {
    title: 'Canary Organism Placeholder',
    description: 'This is a placeholder organism in the canary export path.',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Canary Organism Placeholder')).toBeInTheDocument();
  },
};

export const ManyRows: Story = {
  args: {
    title: 'Experimental Data Grid',
    description: 'A new grid layout being tested before promotion to stable.',
    rows: 8,
  },
};
