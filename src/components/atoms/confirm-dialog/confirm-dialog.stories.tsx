import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ArdaConfirmDialog } from './confirm-dialog';

const meta: Meta<typeof ArdaConfirmDialog> = {
  title: 'Components/Atoms/Other/ConfirmDialog',
  component: ArdaConfirmDialog,
  parameters: {
    docs: {
      description: {
        component:
          'A modal confirmation dialog for destructive or important actions. Centered with backdrop overlay, focus trapping, and Escape key support.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Dialog title displayed as a heading.',
      table: { category: 'Static' },
    },
    message: {
      control: 'text',
      description: 'Descriptive message body explaining what will happen.',
      table: { category: 'Static' },
    },
    confirmLabel: {
      control: 'text',
      description: 'Label for the confirm action button.',
      table: { category: 'Static' },
    },
    cancelLabel: {
      control: 'text',
      description: 'Label for the cancel action button.',
      table: { category: 'Static' },
    },
    confirmVariant: {
      control: 'select',
      options: ['destructive', 'primary'],
      description: 'Visual style of the confirm button.',
      table: { category: 'Static' },
    },
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open.',
      table: { category: 'Runtime' },
    },
    onConfirm: {
      action: 'confirmed',
      table: { category: 'Events' },
    },
    onCancel: {
      action: 'cancelled',
      table: { category: 'Events' },
    },
  },
  args: {
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaConfirmDialog>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    title: 'Discard changes?',
    message: 'You have unsaved changes that will be lost.',
    confirmLabel: 'Discard',
    cancelLabel: 'Keep editing',
    confirmVariant: 'destructive',
  },
};

export const Interactive: Story = {
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const confirmButton = canvas.getByRole('button', { name: 'Confirm' });
    await userEvent.click(confirmButton);
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};
