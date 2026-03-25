import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquarePen, Printer, ShoppingCart, Trash2 } from 'lucide-react';
import { ArdaGridAction } from './grid-action';

const meta = {
  title: 'Components/Canary/Molecules/GridAction',
  component: ArdaGridAction,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ArdaGridAction>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    icon: SquarePen,
    label: 'Edit item',
    onAction: () => {},
  },
};

export const WithShortLabel: Story = {
  args: {
    icon: ShoppingCart,
    label: 'Add to queue',
    shortLabel: 'Queue',
    onAction: () => {},
  },
};

export const Loading: Story = {
  args: {
    icon: Printer,
    label: 'Print',
    loading: true,
    onAction: () => {},
  },
};

export const Destructive: Story = {
  args: {
    icon: Trash2,
    label: 'Delete item',
    destructive: true,
    onAction: () => {},
  },
};

export const Grid: StoryObj<typeof ArdaGridAction> = {
  render: () => (
    <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-2">
      <ArdaGridAction icon={SquarePen} label="Edit" onAction={() => {}} />
      <ArdaGridAction icon={ShoppingCart} label="Queue" onAction={() => {}} />
      <ArdaGridAction icon={Printer} label="Print" onAction={() => {}} />
      <ArdaGridAction icon={Trash2} label="Delete" destructive onAction={() => {}} />
    </div>
  ),
};

/**
 * Interactive Controls playground — use the Controls panel to toggle
 * `loading`, `destructive`, and edit `label` / `shortLabel`.
 */
export const Playground: Story = {
  args: {
    icon: SquarePen,
    label: 'Edit item',
    shortLabel: 'Edit',
    loading: false,
    destructive: false,
    onAction: () => {},
  },
};
