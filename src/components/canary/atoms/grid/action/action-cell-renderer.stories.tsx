import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import { Pencil, Trash2, Eye } from 'lucide-react';

import { ActionCellRenderer, type RowAction } from './action-cell-renderer';

// ============================================================================
// Demo Entity
// ============================================================================

interface DemoEntity {
  id: string;
  name: string;
  status: string;
}

const demoEntity: DemoEntity = { id: '1', name: 'Widget Alpha', status: 'Active' };

const defaultActions: RowAction<DemoEntity>[] = [
  { label: 'View', icon: <Eye className="w-4 h-4" />, onClick: fn() },
  { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: fn() },
  { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: fn() },
];

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof ActionCellRenderer<DemoEntity>> = {
  title: 'Components/Canary/Atoms/Grid/Action Cell Renderer',
  component: ActionCellRenderer<DemoEntity>,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`ActionCellRenderer` renders a vertical ellipsis button (&#8942;) that opens a ' +
          'portal dropdown menu of row-level actions.  Designed for use as an AG Grid cell ' +
          'renderer in a pinned-right column.  The menu portal escapes grid `overflow: hidden` ' +
          'containers.',
      },
    },
  },
  argTypes: {
    rowData: {
      control: false,
      description: 'The row entity this cell represents.',
      table: { category: 'Runtime' },
    },
    actions: {
      control: false,
      description: 'Array of RowAction descriptors.',
      table: { category: 'Static' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the trigger button is disabled.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    rowData: demoEntity,
    actions: defaultActions,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof ActionCellRenderer<DemoEntity>>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Row actions' });
    await expect(trigger).toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Row actions' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Menu renders in a portal (document.body), so query globally
    const menu = document.querySelector('[role="menu"]');
    await expect(menu).toBeTruthy();
  },
};

export const WithoutIcons: Story = {
  args: {
    actions: [
      { label: 'View', onClick: fn() },
      { label: 'Edit', onClick: fn() },
      { label: 'Delete', onClick: fn() },
    ],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Row actions' });
    await expect(trigger).toBeDisabled();
    // Clicking a disabled button should not open the menu
    await userEvent.click(trigger);
    const menu = document.querySelector('[role="menu"]');
    await expect(menu).toBeFalsy();
  },
};

export const SingleAction: Story = {
  args: {
    actions: [{ label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: fn() }],
  },
};

/** Interactive Controls playground */
export const Playground: Story = {
  args: {
    rowData: demoEntity,
    actions: defaultActions,
    disabled: false,
  },
};
