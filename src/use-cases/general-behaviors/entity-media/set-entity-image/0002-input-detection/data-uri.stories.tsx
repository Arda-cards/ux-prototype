/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Data URI Text
 *
 * User pastes a `data:image/...;base64,...` or `blob:` URI string into the
 * URL text field. The current ImageDropZone validates for `https://` only, so
 * a data URI is treated as an unrecognized (non-HTTPS) input and emits
 * `{ type: "error" }`. This story documents the current behavior and shows
 * the decode attempt concept that a future enhancement could support.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, waitFor, userEvent } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Sample data URIs
// ---------------------------------------------------------------------------

/** 1x1 red JPEG pixel as a data URI (truncated for display; full base64 used in tests). */
const SAMPLE_DATA_URI =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAFRABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgA//9k=';

/** A blob: URI — browser-scoped, cannot survive serialization. */
const SAMPLE_BLOB_URI = 'blob:https://example.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/** A data URI for a non-image type. */
const SAMPLE_DATA_URI_TEXT = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';

// ---------------------------------------------------------------------------
// Utility — classify a pasted string locally (future enhancement preview)
// ---------------------------------------------------------------------------

type DataUriClassification =
  | { kind: 'data-uri-image'; mimeType: string; sizeBytes: number }
  | { kind: 'data-uri-non-image'; mimeType: string }
  | { kind: 'blob-uri' }
  | { kind: 'other' };

function classifyPastedString(value: string): DataUriClassification {
  if (value.startsWith('blob:')) {
    return { kind: 'blob-uri' };
  }
  const dataUriMatch = /^data:([^;,]+)[;,]/.exec(value);
  if (dataUriMatch) {
    const mimeType = dataUriMatch[1] ?? '';
    if (mimeType.startsWith('image/')) {
      // Rough byte estimate from base64 length
      const base64Part = value.split(',')[1] ?? '';
      const sizeBytes = Math.round((base64Part.length * 3) / 4);
      return { kind: 'data-uri-image', mimeType, sizeBytes };
    }
    return { kind: 'data-uri-non-image', mimeType };
  }
  return { kind: 'other' };
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface DataUriPageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
  sampleUri?: string;
}

function DataUriPage({ sampleUri = SAMPLE_DATA_URI, ...args }: DataUriPageProps) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [classification, setClassification] = useState<DataUriClassification | null>(null);

  const simulatePasteUri = () => {
    const cls = classifyPastedString(sampleUri);
    setClassification(cls);

    // Current behavior: ImageDropZone rejects non-HTTPS strings via its URL field.
    // We emit the error to demonstrate what happens today.
    const input: ImageInput = {
      type: 'error',
      message:
        cls.kind === 'data-uri-image'
          ? `Data URI detected (${cls.mimeType}, ~${cls.sizeBytes} bytes). ` +
            'Future enhancement: decode and route as managed upload.'
          : cls.kind === 'blob-uri'
            ? 'Blob URI detected. Blob URIs are browser-scoped and cannot be transferred. ' +
              'Future enhancement: fetch blob and route as managed upload.'
            : cls.kind === 'data-uri-non-image'
              ? `Data URI is not an image type: ${cls.mimeType}`
              : 'URL must start with https://',
    };
    setLastInput(input);
    args.onInput(input);
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: Data URI Text
      </h1>
      <p className="text-sm text-muted-foreground">
        A user may paste a <code>data:</code> or <code>blob:</code> URI string into the URL field.
        The current drop zone requires <code>https://</code>, so both URI types produce an error
        today. A future enhancement could decode image data URIs and route them as managed uploads.
      </p>

      <ImageDropZone {...args} />

      <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          URI simulation
        </p>
        <p className="text-xs text-muted-foreground">Sample URI (truncated for display):</p>
        <pre className="text-xs font-mono bg-muted rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
          {sampleUri.length > 120 ? sampleUri.slice(0, 120) + '...' : sampleUri}
        </pre>
        <button
          type="button"
          data-testid="simulate-data-uri-btn"
          onClick={simulatePasteUri}
          className="rounded bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
        >
          Simulate Paste URI
        </button>
      </div>

      {classification && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            Client-side classification
          </p>
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(classification, null, 2)}
          </pre>
        </div>
      )}

      {lastInput && (
        <div
          className={`rounded-lg border p-4 ${
            lastInput.type === 'error' ? 'border-destructive' : 'border-border'
          }`}
        >
          <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
          <pre
            className={`text-xs font-mono whitespace-pre-wrap ${
              lastInput.type === 'error' ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {JSON.stringify(lastInput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof DataUriPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Data URI Text',
  component: DataUriPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Paste a `data:image/...;base64,...` or `blob:` URI string. ' +
          'Current behavior: the drop zone rejects non-HTTPS strings with an error. ' +
          'Future enhancement: detect image data URIs, decode them, and route as managed uploads.',
      },
    },
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DataUriPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Image data URI — classified as `data-uri-image`, emits an error today.
 * A future enhancement would decode and route as a managed upload.
 */
export const ImageDataUri: Story = {
  args: {
    sampleUri: SAMPLE_DATA_URI,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Simulate button is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByTestId('simulate-data-uri-btn')).toBeVisible();
      });
    });

    await step('Click simulate triggers classification and error', async () => {
      await userEvent.click(canvas.getByTestId('simulate-data-uri-btn'));
      await waitFor(() => {
        expect(canvas.getByText(/emitted input/i)).toBeVisible();
      });
    });

    await step('Emitted input is an error (current behavior)', async () => {
      const pres = canvasElement.querySelectorAll('pre');
      const lastPre = pres[pres.length - 1];
      expect(lastPre?.textContent).toContain('"type": "error"');
    });
  },
};

/**
 * Blob URI — browser-scoped; cannot be transferred. Emits an error today.
 */
export const BlobUri: Story = {
  args: {
    sampleUri: SAMPLE_BLOB_URI,
  },
};

/**
 * Non-image data URI — e.g. `data:text/plain;base64,...`. Not an image type.
 */
export const NonImageDataUri: Story = {
  args: {
    sampleUri: SAMPLE_DATA_URI_TEXT,
  },
};

/** Idle state — drop zone shown without any URI paste yet. */
export const Idle: Story = {};
