import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

const meta = {
  title: 'Components/Canary/Primitives/AlertDialog (Image Context)',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AlertDialog primitive as used for image removal and discard confirmations.',
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Confirm removal of a product image — destructive action. */
export const RemoveConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="rounded border px-3 py-1.5 text-sm hover:bg-accent">
        Remove image
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Product Image?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the product image. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** Confirm discarding unsaved image changes — destructive with secondary go-back action. */
export const DiscardChanges: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="rounded border px-3 py-1.5 text-sm hover:bg-accent">
        Upload new image
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved image?</AlertDialogTitle>
          <AlertDialogDescription>
            You have an unsaved image selection. Leaving now will discard your changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
