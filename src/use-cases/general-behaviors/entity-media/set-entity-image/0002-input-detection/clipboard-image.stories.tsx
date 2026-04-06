/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Clipboard Image
 *
 * Simulates pasting an image blob from the clipboard (e.g. a screenshot).
 * Clipboard paste is detected via the `paste` event on the document and routed
 * as `{ type: "file" }`. This story demonstrates the expected routing path
 * using MOCK_CLIPBOARD_IMAGE_BLOB.
 */
import { useState, useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, userEvent } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_CLIPBOARD_IMAGE_BLOB,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function ClipboardImageLive() {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
          }
          break;
        }
      }
    };

    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, []);

  const simulatePaste = () => {
    const file = new File([MOCK_CLIPBOARD_IMAGE_BLOB], 'clipboard-screenshot.jpg', {
      type: MOCK_CLIPBOARD_IMAGE_BLOB.type,
    });
    const input: ImageInput = { type: 'file', file };
    setLastInput(input);
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

      <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={() => {}} />

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
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function ClipboardImageScene({ sceneIndex }: { sceneIndex: number }) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard Image
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. The user has taken a screenshot and it is on the clipboard.
          </p>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </div>
      );

    // Scene 2: Image blob pasted — detecting paste event
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard Image
          </h1>
          <p className="text-sm text-muted-foreground">
            The user pressed <kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd>. The paste event fires and the app
            inspects <code>clipboardData.items</code> for image blobs.
          </p>
          <div className="rounded-lg border border-primary bg-accent/30 p-3">
            <p className="text-xs font-semibold text-primary">
              Paste event detected — checking for image/jpeg or image/png blob
            </p>
          </div>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </div>
      );

    // Scene 3: Preview shown — file input emitted
    case 2:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard Image
          </h1>
          <p className="text-sm text-muted-foreground">
            The blob is extracted from the clipboard and converted to a <code>File</code> object.
            The emitted input shows the file details.
          </p>
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(
                {
                  type: 'file',
                  fileName: 'clipboard-screenshot.jpg',
                  mimeType: 'image/jpeg',
                  sizeBytes: MOCK_CLIPBOARD_IMAGE_BLOB.size,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      );

    // Scene 4: Routed to upload path
    case 3:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard Image
          </h1>
          <p className="text-sm text-muted-foreground">
            The <code>{'{ type: "file" }'}</code> input is identical to a file-picked image. The
            upstream handler routes it to the crop editor — no special clipboard handling needed
            beyond the initial paste detection.
          </p>
          <div className="rounded-lg border border-border bg-accent/10 p-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Routed to crop editor (same path as file pick / drag-drop)
            </p>
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const clipboardImageScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is idle. The user has a screenshot on the clipboard ready to paste.',
    interaction:
      'Press Ctrl+V / Cmd+V while the drop zone is focused to paste the clipboard image.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Image Blob Pasted',
    description:
      'The paste event fires. The app inspects clipboardData.items and finds an image/jpeg blob. The blob is extracted via item.getAsFile().',
    interaction: 'The app extracts the blob and converts it to a File object.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Preview Shown',
    description:
      'The File object is created from the blob. The emitted input contains the file name, MIME type, and size. The file is ready for the crop editor.',
    interaction: 'Review the emitted input details.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Routed to Upload',
    description:
      'The { type: "file" } input routes identically to a file-picked or drag-dropped image. The crop editor opens with the clipboard screenshot.',
    interaction: 'The workflow is complete. The image routes to the crop editor.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: ClipboardImageInteractiveStory,
  Stepwise: ClipboardImageStepwiseStory,
  Automated: ClipboardImageAutomatedStory,
} = createWorkflowStories({
  scenes: clipboardImageScenes,
  renderScene: (i) => <ClipboardImageScene sceneIndex={i} />,
  renderLive: () => <ClipboardImageLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByTestId('simulate-paste-btn')).toBeVisible();
    });
    goToScene(1);
    await delay();

    await userEvent.click(canvas.getByTestId('simulate-paste-btn'));
    await waitFor(() => {
      expect(canvas.getByText(/emitted input/i)).toBeVisible();
    });
    goToScene(2);
    await delay();

    const allPres = document.querySelectorAll('pre');
    const lastPre = allPres[allPres.length - 1] as HTMLElement | undefined;
    if (lastPre) {
      expect(lastPre.textContent).toContain('"type": "file"');
      expect(lastPre.textContent).toContain('"mimeType": "image/jpeg"');
    }
    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Clipboard Image',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const ClipboardImageInteractive: StoryObj = {
  ...ClipboardImageInteractiveStory,
  name: 'Clipboard Image (Interactive)',
};

export const ClipboardImageStepwise: StoryObj = {
  ...ClipboardImageStepwiseStory,
  name: 'Clipboard Image (Stepwise)',
};

export const ClipboardImageAutomated: StoryObj = {
  ...ClipboardImageAutomatedStory,
  name: 'Clipboard Image (Automated)',
};
