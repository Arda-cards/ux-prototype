/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Data URI Text
 *
 * User pastes a `data:image/...;base64,...` or `blob:` URI string into the
 * URL text field. The current ImageDropZone validates for `https://` only, so
 * a data URI is treated as an unrecognized (non-HTTPS) input and emits
 * `{ type: "error" }`. This story documents the current behavior and shows
 * the decode attempt concept that a future enhancement could support.
 *
 * Two workflows:
 *   ImageDataUri — data:image/jpeg;base64,... emits error (current behavior)
 *   BlobUri      — blob: URI emits error (browser-scoped, cannot transfer)
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, userEvent } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Sample data URIs
// ---------------------------------------------------------------------------

/** 1x1 red JPEG pixel as a data URI. */
const SAMPLE_DATA_URI =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAFRABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgA//9k=';

/** A blob: URI — browser-scoped, cannot survive serialization. */
const SAMPLE_BLOB_URI = 'blob:https://example.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// ---------------------------------------------------------------------------
// Classification utility
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
      const base64Part = value.split(',')[1] ?? '';
      const sizeBytes = Math.round((base64Part.length * 3) / 4);
      return { kind: 'data-uri-image', mimeType, sizeBytes };
    }
    return { kind: 'data-uri-non-image', mimeType };
  }
  return { kind: 'other' };
}

function buildErrorMessage(cls: DataUriClassification): string {
  switch (cls.kind) {
    case 'data-uri-image':
      return (
        `Data URI detected (${cls.mimeType}, ~${cls.sizeBytes} bytes). ` +
        'Future enhancement: decode and route as managed upload.'
      );
    case 'blob-uri':
      return (
        'Blob URI detected. Blob URIs are browser-scoped and cannot be transferred. ' +
        'Future enhancement: fetch blob and route as managed upload.'
      );
    case 'data-uri-non-image':
      return `Data URI is not an image type: ${cls.mimeType}`;
    default:
      return 'URL must start with https://';
  }
}

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function DataUriLive({ sampleUri }: { sampleUri: string }) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [classification, setClassification] = useState<DataUriClassification | null>(null);

  const simulatePasteUri = () => {
    const cls = classifyPastedString(sampleUri);
    setClassification(cls);
    const input: ImageInput = { type: 'error', message: buildErrorMessage(cls) };
    setLastInput(input);
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

      <ImageDropZone
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={() => {}}
        onDismiss={() => {}}
      />

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
        <div className="rounded-lg border border-destructive p-4">
          <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
          <pre className="text-xs font-mono text-destructive whitespace-pre-wrap">
            {JSON.stringify(lastInput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer
// ---------------------------------------------------------------------------

function DataUriScene({
  sceneIndex,
  sampleUri,
  classification,
}: {
  sceneIndex: number;
  sampleUri: string;
  classification: DataUriClassification;
}) {
  const noop = () => {};
  const errorMessage = buildErrorMessage(classification);

  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Data URI Text
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. The user has a data URI or blob URI on the clipboard.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: data: URI pasted — URI displayed
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Data URI Text
          </h1>
          <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pasted URI (truncated)
            </p>
            <pre className="text-xs font-mono bg-muted rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {sampleUri.length > 120 ? sampleUri.slice(0, 120) + '...' : sampleUri}
            </pre>
          </div>
        </div>
      );

    // Scene 3: Decode attempt — classification shown
    case 2:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Data URI Text
          </h1>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Client-side classification
            </p>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(classification, null, 2)}
            </pre>
          </div>
        </div>
      );

    // Scene 4: Error emitted
    case 3:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Data URI Text
          </h1>
          <div className="rounded-lg border border-destructive p-4">
            <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
            <pre className="text-xs font-mono text-destructive whitespace-pre-wrap">
              {JSON.stringify({ type: 'error', message: errorMessage }, null, 2)}
            </pre>
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// IMAGE DATA URI workflow
// ---------------------------------------------------------------------------

const dataUriImageClassification = classifyPastedString(SAMPLE_DATA_URI);

const imageDataUriScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is idle. The user has a data:image/jpeg;base64,... URI on the clipboard, perhaps copied from a data-heavy page.',
    interaction: 'Paste the data URI into the URL field and press Enter.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Data URI Pasted',
    description:
      'The pasted string starts with "data:image/jpeg;base64,". The current drop zone URL field validates for "https://" prefix only, so this will not pass as a URL.',
    interaction: 'The app classifies the string as a data URI.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Decode Attempt',
    description:
      'The app performs a client-side classification: kind="data-uri-image", mimeType="image/jpeg". A future enhancement would decode this and route as a managed upload instead of an error.',
    interaction: 'Review the classification result.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Error Emitted (Current Behavior)',
    description:
      'Current behavior: the drop zone emits { type: "error" } with a message explaining that data URIs are detected but not yet supported. The user can retry with an HTTPS URL.',
    interaction: 'The workflow is complete. Retry with a valid https:// URL.',
  },
];

const {
  Interactive: DataUriImageInteractiveStory,
  Stepwise: DataUriImageStepwiseStory,
  Automated: DataUriImageAutomatedStory,
} = createWorkflowStories({
  scenes: imageDataUriScenes,
  renderScene: (i) => (
    <DataUriScene
      sceneIndex={i}
      sampleUri={SAMPLE_DATA_URI}
      classification={dataUriImageClassification}
    />
  ),
  renderLive: () => <DataUriLive sampleUri={SAMPLE_DATA_URI} />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByTestId('simulate-data-uri-btn')).toBeVisible();
    });
    goToScene(1);
    await delay();

    goToScene(2);
    await delay();

    await userEvent.click(canvas.getByTestId('simulate-data-uri-btn'));
    await waitFor(() => {
      expect(canvas.getByText(/emitted input/i)).toBeVisible();
    });

    const allPres = document.querySelectorAll('pre');
    const lastPre = allPres[allPres.length - 1] as HTMLElement | undefined;
    if (lastPre) {
      expect(lastPre.textContent).toContain('"type": "error"');
    }
    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// BLOB URI workflow
// ---------------------------------------------------------------------------

const blobUriClassification = classifyPastedString(SAMPLE_BLOB_URI);

const blobUriScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      "The ImageDropZone is idle. The user has a blob: URI — a browser-scoped object URL — that they copied from the browser's developer tools or a web app.",
    interaction: 'Paste the blob URI into the URL field.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Blob URI Pasted',
    description:
      'The pasted string starts with "blob:https://...". Blob URIs are browser-scoped and tied to a specific browser session — they cannot be serialized or transferred.',
    interaction: 'The app classifies the string as a blob URI.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Classification',
    description:
      'The classification result is kind="blob-uri". A future enhancement could fetch the blob content and route it as a managed upload, but this is not supported today.',
    interaction: 'Review the classification result.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Error Emitted',
    description:
      'The app emits { type: "error" } explaining that blob URIs are browser-scoped and cannot be transferred. The user should use an HTTPS URL or upload a file directly.',
    interaction: 'The workflow is complete. Use a direct file upload or HTTPS URL instead.',
  },
];

const {
  Interactive: BlobUriInteractiveStory,
  Stepwise: BlobUriStepwiseStory,
  Automated: BlobUriAutomatedStory,
} = createWorkflowStories({
  scenes: blobUriScenes,
  renderScene: (i) => (
    <DataUriScene
      sceneIndex={i}
      sampleUri={SAMPLE_BLOB_URI}
      classification={blobUriClassification}
    />
  ),
  renderLive: () => <DataUriLive sampleUri={SAMPLE_BLOB_URI} />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByTestId('simulate-data-uri-btn')).toBeVisible();
    });
    goToScene(1);
    await delay();

    goToScene(2);
    await delay();

    await userEvent.click(canvas.getByTestId('simulate-data-uri-btn'));
    await waitFor(() => {
      expect(canvas.getByText(/emitted input/i)).toBeVisible();
    });

    const allPres = document.querySelectorAll('pre');
    const lastPre = allPres[allPres.length - 1] as HTMLElement | undefined;
    if (lastPre) {
      expect(lastPre.textContent).toContain('"type": "error"');
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
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Data URI Text',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Image data URI path
export const ImageDataUriInteractive: StoryObj = {
  ...DataUriImageInteractiveStory,
  name: 'Image Data URI (Interactive)',
};

export const ImageDataUriStepwise: StoryObj = {
  ...DataUriImageStepwiseStory,
  name: 'Image Data URI (Stepwise)',
};

export const ImageDataUriAutomated: StoryObj = {
  ...DataUriImageAutomatedStory,
  name: 'Image Data URI (Automated)',
};

// Blob URI path
export const BlobUriInteractive: StoryObj = {
  ...BlobUriInteractiveStory,
  name: 'Blob URI (Interactive)',
};

export const BlobUriStepwise: StoryObj = {
  ...BlobUriStepwiseStory,
  name: 'Blob URI (Stepwise)',
};

export const BlobUriAutomated: StoryObj = {
  ...BlobUriAutomatedStory,
  name: 'Blob URI (Automated)',
};
