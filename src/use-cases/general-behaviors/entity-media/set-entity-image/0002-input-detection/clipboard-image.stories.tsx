/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Clipboard Image
 *
 * Simulates pasting an image blob from the clipboard (e.g. a screenshot).
 * Note: ImageDropZone currently handles file and URL inputs directly.
 * Clipboard paste is detected via the `paste` event on the document and would
 * be wired above the drop zone. This story documents the expected routing path
 * and demonstrates the emitted `{ type: "file" }` output using MOCK_CLIPBOARD_IMAGE_BLOB.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, waitFor, userEvent } from 'storybook/test';
import { useState, useEffect, useRef } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_CLIPBOARD_IMAGE_BLOB,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface ClipboardImagePageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function ClipboardImagePage(args: ClipboardImagePageProps) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for paste events on the container and convert image blobs to File
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items ?? [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const input: ImageInput = { type: 'file', file: blob };
            setLastInput(input);
            args.onInput(input);
          }
          break;
        }
      }
    };

    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, [args]);

  const simulatePaste = () => {
    const file = new File([MOCK_CLIPBOARD_IMAGE_BLOB], 'clipboard-screenshot.jpg', {
      type: MOCK_CLIPBOARD_IMAGE_BLOB.type,
    });
    const input: ImageInput = { type: 'file', file };
    setLastInput(input);
    args.onInput(input);
  };

  return (
    <div ref={containerRef} className="p-6 max-w-lg space-y-4" tabIndex={-1}>
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: Clipboard Image
      </h1>
      <p className="text-sm text-muted-foreground">
        When the user presses <kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd> with an image on the clipboard
        (e.g. a screenshot), the blob is converted to a <code>File</code> and routed as{' '}
        <code>{'{ type: "file" }'}</code>. Click <strong>Simulate Paste</strong> below to trigger
        this path without real clipboard access.
      </p>

      <ImageDropZone {...args} />

      <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          Clipboard paste simulation (uses <code>MOCK_CLIPBOARD_IMAGE_BLOB</code>):
        </p>
        <button
          type="button"
          data-testid="simulate-paste-btn"
          onClick={simulatePaste}
          className="rounded bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
        >
          Simulate Paste
        </button>
      </div>

      {lastInput && (
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
            {JSON.stringify(
              lastInput.type === 'file'
                ? {
                    type: lastInput.type,
                    fileName: lastInput.file.name,
                    mimeType: lastInput.file.type,
                    sizeBytes: lastInput.file.size,
                  }
                : lastInput,
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ClipboardImagePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Clipboard Image',
  component: ClipboardImagePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Paste an image from the clipboard (screenshot or copied image). ' +
          'The blob is extracted from the `ClipboardEvent`, converted to a `File`, ' +
          'and emitted as `{ type: "file" }` — the same routing path as a file-picked image.',
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
type Story = StoryObj<typeof ClipboardImagePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Simulate pasting an image blob — clicks the "Simulate Paste" button and
 * verifies the emitted input panel appears with type "file".
 */
export const SimulatedPaste: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Drop zone and simulate button render', async () => {
      await waitFor(() => {
        expect(canvas.getByTestId('simulate-paste-btn')).toBeVisible();
      });
    });

    await step('Click simulate paste triggers file input display', async () => {
      await userEvent.click(canvas.getByTestId('simulate-paste-btn'));
      await waitFor(() => {
        expect(canvas.getByText(/emitted input/i)).toBeVisible();
      });
    });

    await step('Emitted input type is "file"', async () => {
      const pre = canvasElement.querySelector('pre');
      expect(pre?.textContent).toContain('"type": "file"');
      expect(pre?.textContent).toContain('"mimeType": "image/jpeg"');
    });
  },
};

/** Idle state — drop zone shown without any paste yet. */
export const Idle: Story = {};
