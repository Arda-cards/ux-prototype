import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquarePen, Printer, ShoppingCart, Tag, Hash } from 'lucide-react';

import { ArdaActionToolbar } from './action-toolbar';

const meta = {
  title: 'Components/Canary/Molecules/ActionToolbar',
  component: ArdaActionToolbar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A row of icon+label action buttons with an overflow dropdown menu. ' +
          'Data-driven via actions[] and overflowActions[] arrays.',
      },
    },
  },
} satisfies Meta<typeof ArdaActionToolbar>;

export default meta;
type Story = StoryObj<typeof ArdaActionToolbar>;

const noop = () => {};
export const Default: Story = {
  args: {
    actions: [
      { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
      { key: 'queue', label: 'Add to queue', icon: ShoppingCart, onAction: noop },
      { key: 'print', label: 'Print card', icon: Printer, onAction: noop },
      { key: 'label', label: 'Print label', icon: Tag, onAction: noop },
      { key: 'breadcrumb', label: 'Print breadcrumb', icon: Hash, onAction: noop },
    ],
    overflowActions: [
      { key: 'scan', label: 'Scan preview', onAction: noop },
      { key: 'preview', label: 'View card preview', onAction: noop },
      { key: 'duplicate', label: 'Duplicate item\u2026', onAction: noop },
      { key: 'delete', label: 'Delete', onAction: noop, destructive: true, separatorBefore: true },
    ],
  },
};

/** Action in loading state. */
export const Loading: Story = {
  args: {
    actions: [
      { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
      { key: 'print', label: 'Print card', icon: Printer, onAction: noop, loading: true },
    ],
  },
};

/** Some actions disabled. */
export const Disabled: Story = {
  args: {
    actions: [
      { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
      { key: 'queue', label: 'Add to queue', icon: ShoppingCart, onAction: noop, disabled: true },
    ],
  },
};

/** Overflow-only (no primary action buttons). */
export const OverflowOnly: Story = {
  args: {
    overflowActions: [
      { key: 'scan', label: 'Scan preview', onAction: noop },
      { key: 'delete', label: 'Delete', onAction: noop, destructive: true, separatorBefore: true },
    ],
  },
};

/**
 * Interactive Controls playground — use the Controls panel to inspect props.
 * Note: `actions` and `overflowActions` are complex arrays; adjust via the
 * story args directly. The story pre-populates a typical toolbar configuration.
 */
export const Playground: Story = {
  args: {
    actions: [
      { key: 'edit', label: 'Edit item', icon: SquarePen, onAction: noop },
      { key: 'queue', label: 'Add to queue', icon: ShoppingCart, onAction: noop },
      { key: 'print', label: 'Print card', icon: Printer, onAction: noop },
    ],
    overflowActions: [
      { key: 'delete', label: 'Delete', onAction: noop, destructive: true, separatorBefore: true },
    ],
  },
};

/** Typical item detail toolbar with edit, queue, print, and overflow actions. */
