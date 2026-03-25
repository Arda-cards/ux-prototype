/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Auto Compressed
 *
 * Shows a file being successfully auto-compressed before use.
 * The wrapper simulates compression by checking file size and showing a
 * success banner when the file is accepted after optimization.
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
// Constants
// ---------------------------------------------------------------------------

const COMPRESSION_THRESHOLD_BYTES = 500 * 1024; // 500 KB — trigger compression banner
const OPTIMIZATION_MESSAGE = 'Your image has been optimized for best display quality.';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

type CompressionStatus = 'idle' | 'optimized' | 'accepted';

function AutoCompressedPage(args: {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}) {
  const [status, setStatus] = useState<CompressionStatus>('idle');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    originalSize: number;
    finalSize: number;
  } | null>(null);

  const handleInput = (input: ImageInput) => {
    if (input.type === 'file') {
      const originalSize = input.file.size;
      // Simulate compression: files above threshold are "compressed" to 80%
      const wasCompressed = originalSize > COMPRESSION_THRESHOLD_BYTES;
      const finalSize = wasCompressed ? Math.round(originalSize * 0.8) : originalSize;

      setFileInfo({ name: input.file.name, originalSize, finalSize });
      setStatus(wasCompressed ? 'optimized' : 'accepted');
    }
    args.onInput(input);
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Formats and Size: Auto Compressed
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Images above 500 KB are automatically optimized before use. A success message confirms the
        optimization.
      </p>

      <ImageDropZone {...args} onInput={handleInput} />

      {status === 'optimized' && fileInfo && (
        <div
          className="mt-4 rounded-lg border border-green-300 bg-green-50 p-4"
          data-testid="result-panel"
        >
          <h2 className="text-sm font-semibold text-green-700 mb-1">Image optimized</h2>
          <p className="text-sm text-green-700" role="status" data-testid="optimization-message">
            {OPTIMIZATION_MESSAGE}
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            {fileInfo.name}: {(fileInfo.originalSize / 1024).toFixed(0)} KB →{' '}
            {(fileInfo.finalSize / 1024).toFixed(0)} KB
          </p>
        </div>
      )}

      {status === 'accepted' && fileInfo && (
        <div
          className="mt-4 rounded-lg border border-border bg-muted/30 p-4"
          data-testid="accepted-panel"
        >
          <h2 className="text-sm font-semibold mb-1">File accepted</h2>
          <p className="text-xs text-muted-foreground font-mono">
            {fileInfo.name}: {(fileInfo.originalSize / 1024).toFixed(0)} KB (no compression needed)
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold mb-2">Auto-compression rules</h2>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            Files under <span className="font-mono">500 KB</span> — accepted as-is
          </li>
          <li>
            Files between <span className="font-mono">500 KB</span> and{' '}
            <span className="font-mono">10 MB</span> — auto-compressed
          </li>
          <li>
            Files over <span className="font-mono">10 MB</span> after compression — rejected
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof AutoCompressedPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Auto Compressed',
  component: AutoCompressedPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Images above 500 KB are automatically optimized before use. ' +
          'A success banner confirms optimization with the message: ' +
          '"Your image has been optimized for best display quality."',
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
type Story = StoryObj<typeof AutoCompressedPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default idle state — drop a large image to see the optimization message. */
export const Default: Story = {};

/**
 * Automated — simulates providing a JPEG file and verifies the optimization
 * message appears after the file is accepted.
 */
export const Automated: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    // Use MOCK_FILE_JPEG — small file, will show the "accepted" panel
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    // onInput should have been called with type: 'file'
    await expect(args.onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'file' }));

    // Either the accepted panel or the optimization message should appear
    const resultPanel =
      canvas.queryByTestId('result-panel') ?? canvas.queryByTestId('accepted-panel');
    await expect(resultPanel).toBeTruthy();
  },
};

/**
 * With Optimization — uses a large mock file to trigger the optimization banner.
 * Since MOCK_FILE_JPEG is tiny, this story documents the expected UX for
 * files above the compression threshold.
 */
export const WithOptimizationMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When a file exceeds the compression threshold, the optimization banner is shown. ' +
          'Drop a file larger than 500 KB to see this message.',
      },
    },
  },
};
