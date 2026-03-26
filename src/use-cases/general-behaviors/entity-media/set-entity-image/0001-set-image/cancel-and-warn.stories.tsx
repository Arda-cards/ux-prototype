/**
 * GEN-MEDIA-0001::0001.UC — Set Image via Unified Input Surface
 * Scene: Cancel and Warn
 *
 * When a user has staged an image (ProvidedImage state) and then attempts to dismiss
 * the dialog, the state machine transitions to the Warn state. An AlertDialog appears
 * asking "Discard unsaved image?" with two actions:
 *
 *   Discard     — permanently removes the staged image, dialog closes
 *   Go Back     — returns to the ProvidedImage editor, dialog stays open
 *
 * Two story variants:
 *   DiscardPath      — user confirms discard; dialog closes, onCancel fires
 *   ReturnToEditPath — user clicks Go Back; Warn dialog closes, editor is restored
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, screen, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   WRAPPER
   ================================================================ */

interface CancelWarnPageProps {
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function CancelWarnPage({ onConfirm, onCancel }: CancelWarnPageProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'cancelled' | 'confirmed'>('idle');

  const handleConfirm = (result: ImageUploadResult) => {
    onConfirm(result);
    setStatus('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel();
    setStatus('cancelled');
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold tracking-tight mb-1">
          GEN-MEDIA-0001 \u2014 Cancel and Warn
        </h1>
        <p className="text-sm text-muted-foreground">
          After staging an image, clicking Cancel triggers a confirmation guard that asks whether to
          discard the unsaved image or return to the editor.
        </p>
      </div>

      <button
        type="button"
        data-testid="open-dialog-btn"
        onClick={() => {
          setStatus('idle');
          setOpen(true);
        }}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Open Upload Dialog
      </button>

      {status === 'cancelled' && (
        <p
          data-testid="status-cancelled"
          className="text-sm text-muted-foreground border border-border rounded-md px-4 py-2"
        >
          Image discarded. Dialog closed.
        </p>
      )}
      {status === 'confirmed' && (
        <p
          data-testid="status-confirmed"
          className="text-sm text-green-700 dark:text-green-400 border border-border rounded-md px-4 py-2"
        >
          Image confirmed and uploaded.
        </p>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */

const meta: Meta<CancelWarnPageProps> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0001 Set Image/Cancel and Warn',
  component: CancelWarnPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Demonstrates the Warn guard state. After providing an image, clicking Cancel ' +
          'transitions to the Warn state which renders an AlertDialog. ' +
          '"Discard" fires `onCancel` and closes the dialog; ' +
          '"Go Back" dismisses the alert and restores the ProvidedImage editor.',
      },
    },
  },
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<CancelWarnPageProps>;

/* ================================================================
   SHARED SETUP — open dialog and stage a file
   ================================================================ */

async function openDialogAndStageFile() {
  // Open the dialog
  const openBtn = await waitFor(() => {
    const el = document.querySelector<HTMLButtonElement>('[data-testid="open-dialog-btn"]');
    if (!el) throw new Error('Open button not found');
    return el;
  });
  await userEvent.click(openBtn);

  // Wait for the dialog
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  // Upload a file to transition to ProvidedImage
  const fileInput = await waitFor(() => {
    const el = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!el) throw new Error('File input not found');
    return el;
  });
  await userEvent.upload(fileInput, MOCK_FILE_JPEG);

  // Confirm we are in ProvidedImage state (copyright checkbox visible)
  await waitFor(() => {
    expect(screen.getByRole('checkbox', { name: /copyright acknowledgment/i })).toBeVisible();
  });
}

/* ================================================================
   STORIES
   ================================================================ */

/**
 * DiscardPath — user stages a file, clicks Cancel, sees the Warn dialog,
 * then clicks "Discard" to permanently remove the staged image and close the dialog.
 */
export const DiscardPath: Story = {
  play: async () => {
    await openDialogAndStageFile();

    // Click Cancel — should trigger the Warn AlertDialog
    const cancelBtn = screen.getByRole('button', { name: /^cancel$/i });
    await userEvent.click(cancelBtn);

    // Warn AlertDialog should appear
    await waitFor(() => {
      expect(screen.getByText(/discard unsaved image/i)).toBeVisible();
    });
    expect(screen.getByText(/you have an image staged/i)).toBeVisible();

    // Two actions should be present
    expect(screen.getByRole('button', { name: /discard/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /go back/i })).toBeVisible();

    // Click Discard to confirm removal
    await userEvent.click(screen.getByRole('button', { name: /discard/i }));

    // Dialog and alert dialog should both be gone
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText(/discard unsaved image/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // The wrapper reports "cancelled" status
    await waitFor(() => {
      expect(screen.getByTestId('status-cancelled')).toBeVisible();
    });
  },
};

/**
 * ReturnToEditPath — user stages a file, clicks Cancel, sees the Warn dialog,
 * then clicks "Go Back" to dismiss the alert and return to the ProvidedImage editor.
 * The staged image is preserved.
 */
export const ReturnToEditPath: Story = {
  play: async () => {
    await openDialogAndStageFile();

    // Click Cancel — should trigger the Warn AlertDialog
    const cancelBtn = screen.getByRole('button', { name: /^cancel$/i });
    await userEvent.click(cancelBtn);

    // Warn AlertDialog should appear
    await waitFor(() => {
      expect(screen.getByText(/discard unsaved image/i)).toBeVisible();
    });

    // Click "Go Back" to dismiss the alert and return to the editor
    await userEvent.click(screen.getByRole('button', { name: /go back/i }));

    // Warn dialog should be gone; main dialog should still be open
    await waitFor(() => {
      expect(screen.queryByText(/discard unsaved image/i)).not.toBeInTheDocument();
    });

    // The main dialog is still open and back in ProvidedImage state
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
      // Copyright checkbox is visible — we're back in ProvidedImage
      expect(screen.getByRole('checkbox', { name: /copyright acknowledgment/i })).toBeVisible();
    });

    // Status on the wrapper should still be idle (not cancelled)
    expect(screen.queryByTestId('status-cancelled')).not.toBeInTheDocument();
  },
};
