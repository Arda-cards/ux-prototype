import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Package, ShoppingCart, Boxes } from 'lucide-react';

import { SidebarNavGroup } from './sidebar-nav-group';
import { SidebarNavItem } from './sidebar-nav-item';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';
import { SidebarNav } from './sidebar-nav';

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/NavGroup',
  component: SidebarNavGroup,
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
  tags: ['autodocs'],
} satisfies Meta<typeof SidebarNavGroup>;

export default meta;
type Story = StoryObj<typeof SidebarNavGroup>;

/** Collapsed by default — click to expand. */
export const Default: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <SidebarNav>
        <SidebarNavGroup label="Inventory" icon={Boxes}>
          <SidebarNavItem icon={Package} label="Items" />
          <SidebarNavItem icon={ShoppingCart} label="Orders" badge={2} />
        </SidebarNavGroup>
      </SidebarNav>
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
      <SidebarNav>
        <SidebarNavGroup label="Inventory" icon={Boxes} defaultExpanded>
          <SidebarNavItem icon={Package} label="Items" />
          <SidebarNavItem icon={ShoppingCart} label="Orders" />
        </SidebarNavGroup>
      </SidebarNav>
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
      <SidebarNav>
        <SidebarNavGroup label="Inventory" icon={Boxes}>
          <SidebarNavItem icon={Package} label="Items" active />
          <SidebarNavItem icon={ShoppingCart} label="Orders" />
        </SidebarNavGroup>
      </SidebarNav>
    </ArdaSidebar>
  ),
};
