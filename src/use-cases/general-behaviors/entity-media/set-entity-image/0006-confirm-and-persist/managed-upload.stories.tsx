/**
 * GEN-MEDIA-0001::0006.FS — Confirm and Persist
 * Scene: Managed Upload
 *
 * Renders ImageUploadDialog in a controlled state simulating the full file
 * upload flow: provide a file, acknowledge copyright, confirm, observe upload
 * progress bar, then success callback fires.
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

interface ManagedUploadPageProps {
  existingImageUrl: string | null;
  open: boolean;
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function ManagedUploadPage({
  existingImageUrl,
  open,
  onConfirm,
  onCancel,
}: ManagedUploadPageProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0001 — Managed Upload Flow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Provide a file, acknowledge copyright, click Confirm to observe the upload progress bar
          then the success result.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setLastResult(null);
          setIsOpen(true);
        }}
        className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground"
      >
        Open Upload Dialog
      </button>

      {lastResult && (
        <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
          <p className="font-semibold mb-2">Upload complete!</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={existingImageUrl}
        open={isOpen}
        onCancel={() => {
          onCancel();
          setIsOpen(false);
        }}
        onConfirm={(result) => {
          onConfirm(result);
          setLastResult(result);
          setIsOpen(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ManagedUploadPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/Managed Upload',
  component: ManagedUploadPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`ImageUploadDialog` file-upload path: provide a file via the drop zone, ' +
          'acknowledge copyright, click Confirm, observe the progress bar, then the ' +
          '`onConfirm` callback fires with an `ImageUploadResult`.',
      },
    },
  },
  argTypes: {
    existingImageUrl: {
      control: 'text',
      description: 'URL of an existing image (shows comparison layout when set).',
      table: { category: 'Runtime' },
    },
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
      description: 'Called when the user cancels the dialog.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    existingImageUrl: null,
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ManagedUploadPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — dialog opens in EmptyImage state. Drop a file to begin the upload flow. */
export const Default: Story = {};

/**
 * Automated — simulates the full managed upload happy path:
 * provide a JPEG file, acknowledge copyright, click Confirm,
 * then verify that onConfirm fires.
 */
export const Automated: Story = {
  args: {
    open: true,
    existingImageUrl: null,
  },
  play: async ({ args, step }) => {
    await step('Dialog is open and drop zone is visible', async () => {
      await waitFor(
        () => {
          const dropZone = screen.getByRole('dialog');
          expect(dropZone).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Provide a JPEG file via the hidden file input', async () => {
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

    await step('Copyright acknowledgment checkbox appears', async () => {
      await waitFor(
        () => {
          const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
          expect(checkbox).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Acknowledge copyright', async () => {
      const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
      await userEvent.click(checkbox);
    });

    await step('Confirm button is enabled and clickable', async () => {
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        expect(confirmButton).not.toBeDisabled();
      });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEvent.click(confirmButton);
    });

    await step('onConfirm callback fires with upload result', async () => {
      await waitFor(
        () => {
          expect(args.onConfirm).toHaveBeenCalledWith(
            expect.objectContaining({ imageUrl: expect.any(String) }),
          );
        },
        { timeout: 5000 },
      );
    });
  },
};
