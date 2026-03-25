/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Limit Exceeded
 *
 * Shows a file exceeding the 10 MB limit being rejected after a simulated
 * compression attempt. The wrapper performs size checking and emits an
 * appropriate error message.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_OVERSIZED,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SIZE_ERROR_MESSAGE = 'This file is too large. The maximum size is 10 MB.';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

type ValidationStatus = 'idle' | 'size-error';

function LimitExceededPage(args: {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}) {
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleInput = (input: ImageInput) => {
    if (input.type === 'file') {
      setFileName(input.file.name);
      if (input.file.size > MAX_FILE_SIZE_BYTES) {
        setStatus('size-error');
        args.onInput({ type: 'error', message: SIZE_ERROR_MESSAGE });
        return;
      }
    }
    args.onInput(input);
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Formats and Size: Limit Exceeded
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Files larger than 10 MB are rejected after a compression attempt fails to bring them within
        the limit. Drop or select an oversized file to see the error.
      </p>

      <ImageDropZone {...args} onInput={handleInput} />

      {status === 'size-error' && (
        <div
          className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          data-testid="result-panel"
        >
          <h2 className="text-sm font-semibold text-destructive mb-1">File too large</h2>
          <p className="text-sm text-destructive" role="alert" data-testid="size-error-message">
            {SIZE_ERROR_MESSAGE}
          </p>
          {fileName && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              File: {fileName} ({(MOCK_FILE_OVERSIZED.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold mb-2">Size limits</h2>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            Maximum file size: <span className="font-mono">10 MB</span>
          </li>
          <li>
            Auto-compression applied for files between <span className="font-mono">2 MB</span> and{' '}
            <span className="font-mono">10 MB</span>
          </li>
          <li>Files exceeding 10 MB after compression are rejected</li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof LimitExceededPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Limit Exceeded',
  component: LimitExceededPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Files exceeding 10 MB are rejected after a simulated compression attempt. ' +
          'The user sees a plain-language error: "This file is too large. The maximum size is 10 MB."',
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
type Story = StoryObj<typeof LimitExceededPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default idle state — try dropping an oversized file to see the error. */
export const Default: Story = {};

/**
 * Automated — simulates providing an oversized file and verifies the size
 * error message appears.
 */
export const Automated: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    await userEvent.upload(fileInput, MOCK_FILE_OVERSIZED);

    // onInput should have been called with type: 'error'
    await expect(args.onInput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: SIZE_ERROR_MESSAGE }),
    );

    // The size error message should be visible in the result panel
    const errorMessage = canvas.getByTestId('size-error-message');
    await expect(errorMessage).toBeTruthy();
    await expect(errorMessage.textContent).toContain('10 MB');
  },
};
