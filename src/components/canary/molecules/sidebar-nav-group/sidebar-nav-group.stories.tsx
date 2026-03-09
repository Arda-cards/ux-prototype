import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Package, ShoppingCart, Boxes } from 'lucide-react';

import { ArdaSidebarNavGroup } from './sidebar-nav-group';
import { ArdaNavItem } from '../../atoms/nav-item/nav-item';

const meta: Meta<typeof ArdaSidebarNavGroup> = {
  title: 'Components/Canary/Molecules/Sidebar Nav Group',
  component: ArdaSidebarNavGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A collapsible disclosure group for organizing nav items into sections. ' +
          'Built on shadcn Collapsible. In collapsed sidebar mode, renders children directly without a group header.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-sidebar-bg p-4 rounded-lg w-[260px]">
        <nav>
          <ul role="list" className="space-y-1 list-none">
            <Story />
          </ul>
        </nav>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaSidebarNavGroup>;

/** Collapsed by default — click to expand. */
export const Default: Story = {
  args: {
    label: 'Inventory',
    icon: Boxes,
  },
  render: (args) => (
    <ArdaSidebarNavGroup {...args}>
      <ArdaNavItem href="/items" icon={Package} label="Items" variant="dark" />
      <ArdaNavItem href="/orders" icon={ShoppingCart} label="Orders" badge={2} variant="dark" />
    </ArdaSidebarNavGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inventory')).toBeVisible();
  },
};

/** Starts expanded. */
export const DefaultExpanded: Story = {
  args: {
    label: 'Inventory',
    icon: Boxes,
    defaultExpanded: true,
  },
  render: (args) => (
    <ArdaSidebarNavGroup {...args}>
      <ArdaNavItem href="/items" icon={Package} label="Items" variant="dark" />
      <ArdaNavItem href="/orders" icon={ShoppingCart} label="Orders" variant="dark" />
    </ArdaSidebarNavGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Items')).toBeVisible();
  },
};

/** Sidebar collapsed mode — children rendered without group header. */
export const SidebarCollapsed: Story = {
  args: {
    label: 'Inventory',
    icon: Boxes,
    collapsed: true,
  },
  render: (args) => (
    <ArdaSidebarNavGroup {...args}>
      <ArdaNavItem href="/items" icon={Package} label="Items" collapsed variant="dark" />
      <ArdaNavItem href="/orders" icon={ShoppingCart} label="Orders" collapsed variant="dark" />
    </ArdaSidebarNavGroup>
  ),
};
