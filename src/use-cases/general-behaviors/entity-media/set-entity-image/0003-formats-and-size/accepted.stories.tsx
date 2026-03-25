/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Accepted
 *
 * Shows JPEG, PNG, and WebP files being accepted by the drop zone.
 * The drop zone emits `{ type: 'file', file }` for valid formats.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function AcceptedPage(args: {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Formats and Size: Accepted Formats
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        JPEG, PNG, and WebP files are accepted. Drop or select an image to see the drop zone emit a
        classified input event.
      </p>

      <ImageDropZone
        {...args}
        onInput={(input) => {
          setLastInput(input);
          args.onInput(input);
        }}
      />

      {lastInput && (
        <div className="mt-4 rounded-lg border border-border p-4" data-testid="result-panel">
          <h2 className="text-sm font-semibold mb-1">
            {lastInput.type === 'file' ? (
              <span className="text-green-600">File accepted</span>
            ) : lastInput.type === 'error' ? (
              <span className="text-destructive">File rejected</span>
            ) : (
              'Input received'
            )}
          </h2>
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
            {JSON.stringify(
              lastInput.type === 'file'
                ? {
                    type: lastInput.type,
                    fileName: lastInput.file.name,
                    mimeType: lastInput.file.type,
                  }
                : lastInput,
              null,
              2,
            )}
          </pre>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold mb-2">Supported formats</h2>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <span className="font-mono">JPEG</span> — standard photos
          </li>
          <li>
            <span className="font-mono">PNG</span> — lossless images
          </li>
          <li>
            <span className="font-mono">WebP</span> — modern web format
          </li>
          <li>
            <span className="font-mono">HEIC / HEIF</span> — Apple device photos
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof AcceptedPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Accepted',
  component: AcceptedPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'JPEG, PNG, WebP, and HEIC/HEIF files are accepted by the drop zone. ' +
          'A valid file emits `{ type: "file", file }`. Use the Controls panel to toggle accepted formats.',
      },
    },
  },
  argTypes: {
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
    },
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AcceptedPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default idle state — JPEG and PNG formats accepted. */
export const Default: Story = {};

/** Playground — use Controls to toggle which MIME types are accepted. */
export const Playground: Story = {
  args: {
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

/**
 * Automated — simulates providing a JPEG file and verifies it is accepted.
 * The drop zone should emit `{ type: 'file' }` with no error message shown.
 */
export const Automated: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the hidden file input rendered by react-dropzone
    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    // onInput should have been called with type: 'file'
    await expect(args.onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'file' }));

    // No error alert should appear
    const alert = canvas.queryByRole('alert');
    await expect(alert).toBeNull();
  },
};
