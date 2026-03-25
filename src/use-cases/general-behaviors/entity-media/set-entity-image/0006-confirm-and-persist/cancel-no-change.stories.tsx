/**
 * GEN-MEDIA-0001::0006.FS — Confirm and Persist
 * Scene: Cancel No Change
 *
 * Demonstrates the cancel path through ImageUploadDialog. When no image is
 * staged, Cancel fires onCancel immediately and closes the dialog. When an
 * image is staged, Cancel triggers the Warn AlertDialog guard, requiring
 * explicit discard confirmation before the dialog closes.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, fn, screen } from 'storybook/test';
import { useState } from 'react';

import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface CancelNoChangePageProps {
  open: boolean;
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function CancelNoChangePage({ open, onConfirm, onCancel }: CancelNoChangePageProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [cancelledCount, setCancelledCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0001 — Cancel: No Change</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cancelling with no image staged closes the dialog immediately. Cancelling after staging an
          image shows a discard confirmation guard.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground"
      >
        Open Upload Dialog
      </button>

      {cancelledCount > 0 && (
        <p className="text-sm text-muted-foreground" data-testid="cancel-count">
          Cancelled {cancelledCount} time{cancelledCount > 1 ? 's' : ''}.
        </p>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={isOpen}
        onCancel={() => {
          onCancel();
          setCancelledCount((c) => c + 1);
          setIsOpen(false);
        }}
        onConfirm={(result) => {
          onConfirm(result);
          setIsOpen(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CancelNoChangePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/Cancel No Change',
  component: CancelNoChangePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Cancel in the EmptyImage state fires `onCancel` immediately. ' +
          'Cancel in the ProvidedImage state (after staging a file or URL) triggers the ' +
          'Warn AlertDialog — the user must explicitly choose "Discard" to exit without saving.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog starts open.',
      table: { category: 'Runtime' },
    },
    onConfirm: {
      description: 'Called with ImageUploadResult when upload completes.',
      table: { category: 'Runtime' },
    },
    onCancel: {
      description: 'Called when the user cancels (after any warn confirmation).',
      table: { category: 'Runtime' },
    },
  },
  args: {
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CancelNoChangePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — dialog opens in EmptyImage state. Click Cancel to dismiss immediately. */
export const Default: Story = {};

/**
 * Automated — verifies the direct-cancel path (no image staged):
 * clicks Cancel, confirms onCancel fires, and verifies the dialog closes.
 */
export const AutomatedDirectCancel: Story = {
  args: {
    open: true,
  },
  play: async ({ args, step }) => {
    await step('Dialog is open', async () => {
      await waitFor(
        () => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Click Cancel with no image staged', async () => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
    });

    await step('onCancel callback fires', async () => {
      await waitFor(() => {
        expect(args.onCancel).toHaveBeenCalled();
      });
    });

    await step('Dialog closes after cancel', async () => {
      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeNull();
      });
    });
  },
};

/**
 * Automated — verifies the warn-on-discard path:
 * stage a file, click Cancel, verify the Warn AlertDialog appears,
 * then click Discard to confirm and verify onCancel fires.
 */
export const AutomatedWarnOnDiscard: Story = {
  args: {
    open: true,
  },
  play: async ({ args, step }) => {
    await step('Dialog is open and drop zone is visible', async () => {
      await waitFor(
        () => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Stage a JPEG file', async () => {
      let fileInput: HTMLInputElement | null = null;
      await waitFor(
        () => {
          fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
          if (!fileInput) throw new Error('File input not found');
        },
        { timeout: 5000 },
      );
      if (!fileInput) throw new Error('File input not found after waitFor');
      await userEvent.upload(fileInput, MOCK_FILE_JPEG);
    });

    await step('Image preview appears (ProvidedImage state)', async () => {
      await waitFor(
        () => {
          const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
          expect(checkbox).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Click Cancel triggers Warn AlertDialog', async () => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        const warnTitle = screen.getByText(/discard unsaved image/i);
        expect(warnTitle).toBeVisible();
      });
    });

    await step('Click Discard to confirm cancellation', async () => {
      const discardButton = screen.getByRole('button', { name: /discard/i });
      await userEvent.click(discardButton);
    });

    await step('onCancel callback fires after discard', async () => {
      await waitFor(() => {
        expect(args.onCancel).toHaveBeenCalled();
      });
    });

    await step('Dialog closes after discard', async () => {
      await waitFor(() => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toBeNull();
      });
    });
  },
};
