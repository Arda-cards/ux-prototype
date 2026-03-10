import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Package, ShoppingCart, Boxes } from 'lucide-react';

import { ArdaSidebarNavGroup } from './sidebar-nav-group';
import { ArdaSidebarNavItem } from './sidebar-nav-item';
import { ArdaSidebar } from './sidebar';
import { ArdaSidebarNav } from './sidebar-nav';

const meta: Meta<typeof ArdaSidebarNavGroup> = {
  title: 'Components/Canary/Organisms/Sidebar/Nav Group',
  component: ArdaSidebarNavGroup,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A collapsible disclosure group for organizing nav items into sections. ' +
          'Built on shadcn Collapsible + SidebarGroup. Auto-expands when a child item is active.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaSidebarNavGroup>;

/** Collapsed by default — click to expand. */
export const Default: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavGroup label="Inventory" icon={Boxes}>
          <ArdaSidebarNavItem icon={Package} label="Items" />
          <ArdaSidebarNavItem icon={ShoppingCart} label="Orders" badge={2} />
        </ArdaSidebarNavGroup>
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inventory')).toBeVisible();
  },
};

/** Starts expanded. */
export const DefaultExpanded: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavGroup label="Inventory" icon={Boxes} defaultExpanded>
          <ArdaSidebarNavItem icon={Package} label="Items" />
          <ArdaSidebarNavItem icon={ShoppingCart} label="Orders" />
        </ArdaSidebarNavGroup>
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Items')).toBeVisible();
  },
};

/** Auto-expands because child item is active. */
export const AutoExpandActive: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarNav>
        <ArdaSidebarNavGroup label="Inventory" icon={Boxes}>
          <ArdaSidebarNavItem icon={Package} label="Items" active />
          <ArdaSidebarNavItem icon={ShoppingCart} label="Orders" />
        </ArdaSidebarNavGroup>
      </ArdaSidebarNav>
    </ArdaSidebar>
  ),
};
