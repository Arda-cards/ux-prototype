import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ArdaCollapseToggle } from './collapse-toggle';

const meta: Meta<typeof ArdaCollapseToggle> = {
  title: 'Components/Extras/Atoms/Collapse Toggle',
  component: ArdaCollapseToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A general-purpose expand/collapse trigger button with accessible aria-expanded state. ' +
          'Usable in sidebars, collapsible panels, drawers, and split views.',
      },
    },
  },
  argTypes: {
    collapsed: { control: 'boolean', table: { category: 'Model' } },
    expandedLabel: { control: 'text', table: { category: 'View' } },
    collapsedLabel: { control: 'text', table: { category: 'View' } },
  },
  args: {
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaCollapseToggle>;

/** Expanded state — shows collapse icon. */
export const Expanded: Story = {
  args: { collapsed: false },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveAccessibleName('Collapse');
  },
};

/** Collapsed state — shows expand icon. */
export const Collapsed: Story = {
  args: { collapsed: true },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAccessibleName('Expand');
  },
};

/** Custom labels for non-sidebar contexts. */
export const CustomLabels: Story = {
  args: {
    collapsed: false,
    expandedLabel: 'Hide panel',
    collapsedLabel: 'Show panel',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toHaveAccessibleName('Hide panel');
  },
};

/** Interactive toggle demo. */
function ToggleDemo() {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="bg-sidebar-bg p-4 rounded-lg flex items-center gap-4">
      <ArdaCollapseToggle collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <span className="text-sidebar-text text-sm">{collapsed ? 'Collapsed' : 'Expanded'}</span>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <ToggleDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  },
};
