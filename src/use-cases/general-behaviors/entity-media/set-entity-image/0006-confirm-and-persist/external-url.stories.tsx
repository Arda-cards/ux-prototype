/**
 * GEN-MEDIA-0001::0006.FS — Confirm and Persist
 * Scene: External URL
 *
 * Demonstrates the URL-entry path through ImageUploadDialog. The user types
 * an HTTPS URL, acknowledges copyright, and clicks Confirm. Unlike the file
 * upload path there is no progress bar — the URL is stored as-is.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, fn, screen } from 'storybook/test';
import { useState } from 'react';

import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface ExternalUrlPageProps {
  existingImageUrl: string | null;
  url: string;
  open: boolean;
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function ExternalUrlPage({
  existingImageUrl,
  url,
  open,
  onConfirm,
  onCancel,
}: ExternalUrlPageProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0001 — External URL Flow</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Type an HTTPS URL into the drop zone, acknowledge copyright, then confirm. No upload
          progress bar — the URL is stored as-is.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Suggested URL: <code className="break-all">{url}</code>
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
          <p className="font-semibold mb-2">Image confirmed!</p>
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

const meta: Meta<typeof ExternalUrlPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/External URL',
  component: ExternalUrlPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`ImageUploadDialog` URL path: type an `https://` URL into the drop zone, ' +
          'acknowledge copyright, click Confirm. Unlike the file-upload path there is no ' +
          'progress bar — the URL is stored directly via `onConfirm`.',
      },
    },
  },
  argTypes: {
    url: {
      control: { type: 'text' },
      description: 'HTTPS URL to enter into the dialog URL field.',
      table: { category: 'Runtime' },
    },
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
      description: 'Called with ImageUploadResult when URL is confirmed.',
      table: { category: 'Runtime' },
    },
    onCancel: {
      description: 'Called when the user cancels the dialog.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    existingImageUrl: null,
    url: MOCK_EXTERNAL_URL,
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ExternalUrlPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — dialog opens in EmptyImage state. Paste a URL to begin the URL confirm flow. */
export const Default: Story = {};

/**
 * Automated — types a valid HTTPS URL into the drop zone URL field, waits for
 * the preview to load, acknowledges copyright, confirms, and verifies
 * that onConfirm fires.
 */
export const Automated: Story = {
  args: {
    open: true,
    existingImageUrl: null,
    url: MOCK_EXTERNAL_URL,
  },
  play: async ({ args, step }) => {
    await step('Dialog is open and URL input is visible', async () => {
      await waitFor(
        () => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 5000 },
      );
      await waitFor(
        () => {
          const urlInput = screen.getByPlaceholderText(/paste an image url/i);
          expect(urlInput).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Type a valid HTTPS URL and press Enter', async () => {
      const urlInput = screen.getByPlaceholderText(/paste an image url/i);
      await userEvent.clear(urlInput);
      await userEvent.type(urlInput, args.url);
      await userEvent.keyboard('{Enter}');
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

    await step('onConfirm callback fires', async () => {
      await waitFor(
        () => {
          expect(args.onConfirm).toHaveBeenCalled();
        },
        { timeout: 5000 },
      );
    });
  },
};
