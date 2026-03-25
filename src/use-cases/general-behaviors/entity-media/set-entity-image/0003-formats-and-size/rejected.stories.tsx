/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Rejected
 *
 * Shows an unsupported BMP file being rejected by the drop zone.
 * The drop zone emits `{ type: 'error', message }` with a plain-language error.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_BMP,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function RejectedPage(args: {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Formats and Size: Rejected Format
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        BMP and other unsupported formats are rejected. Drop or select a BMP file to see the error
        message.
      </p>

      <ImageDropZone
        {...args}
        onInput={(input) => {
          setLastInput(input);
          args.onInput(input);
        }}
      />

      {lastInput && lastInput.type === 'error' && (
        <div
          className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          data-testid="result-panel"
        >
          <h2 className="text-sm font-semibold text-destructive mb-1">File rejected</h2>
          <p className="text-xs text-muted-foreground" data-testid="user-message">
            This file type isn&apos;t supported. Try a JPEG, PNG, WebP, or HEIC image.
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Technical detail: {lastInput.message}
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold mb-2">Unsupported formats</h2>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <span className="font-mono">BMP</span> — Windows bitmap
          </li>
          <li>
            <span className="font-mono">TIFF</span> — high-resolution scan format
          </li>
          <li>
            <span className="font-mono">GIF</span> — animated image format
          </li>
          <li>
            <span className="font-mono">SVG</span> — vector graphics
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof RejectedPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Rejected',
  component: RejectedPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Unsupported formats (BMP, TIFF, GIF, SVG) are rejected with a plain-language error. ' +
          'The drop zone emits `{ type: "error", message }` and shows an inline error.',
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
type Story = StoryObj<typeof RejectedPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default idle state — try dropping a BMP file to see the rejection. */
export const Default: Story = {};

/**
 * Automated — simulates providing a BMP file and verifies the error message appears.
 * The drop zone should emit `{ type: 'error' }` and show an inline error alert.
 */
export const Automated: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    await userEvent.upload(fileInput, MOCK_FILE_BMP);

    // onInput should have been called with type: 'error'
    await expect(args.onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));

    // The inline error alert rendered by ImageDropZone should appear
    const alert = canvas.getByRole('alert');
    await expect(alert).toBeTruthy();
    await expect(alert.textContent).toContain('Invalid file type');
  },
};
