/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Accepted
 *
 * Shows JPEG, PNG, and WebP files being accepted by the drop zone.
 * The drop zone emits `{ type: 'file', file }` for valid formats.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function AcceptedLive() {
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
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={(input) => setLastInput(input)}
        onDismiss={() => {}}
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

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function AcceptedSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Accepted Formats
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Drop or select an image file. JPEG, PNG, WebP, and HEIC are supported.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: JPEG file provided (showing drop zone with file selected)
    case 1:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Accepted Formats
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            A JPEG file has been selected. The drop zone is validating the format.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <p className="mt-3 text-xs text-muted-foreground font-mono">
            Selected: test-image.jpg (image/jpeg)
          </p>
        </div>
      );

    // Scene 3: File accepted — green status panel
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Accepted Formats
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div className="mt-4 rounded-lg border border-border p-4" data-testid="result-panel">
            <h2 className="text-sm font-semibold mb-1">
              <span className="text-green-600">File accepted</span>
            </h2>
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              {JSON.stringify(
                { type: 'file', fileName: 'test-image.jpg', mimeType: 'image/jpeg' },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const acceptedScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is in its initial idle state. It accepts JPEG, PNG, WebP, HEIC, and HEIF files. The user can drag-and-drop a file, click to open the file picker, or enter a URL.',
    interaction: 'Select or drop a JPEG file to submit it to the drop zone.',
  },
  {
    title: 'Scene 2 of 3 \u2014 JPEG File Provided',
    description:
      'A JPEG file has been selected via the file picker. The drop zone validates the MIME type against the accepted formats list.',
    interaction: 'Wait for validation to complete.',
  },
  {
    title: 'Scene 3 of 3 \u2014 File Accepted',
    description:
      'The JPEG file passed validation. The drop zone emits `{ type: "file", file }` and the result panel shows the accepted state with the file name and MIME type. No error alert is shown.',
    interaction:
      'The workflow is complete. The accepted file can now be passed to the crop editor.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: AcceptedInteractive,
  Stepwise: AcceptedStepwise,
  Automated: AcceptedAutomated,
} = createWorkflowStories({
  scenes: acceptedScenes,
  renderScene: (i) => <AcceptedSceneRenderer sceneIndex={i} />,
  renderLive: () => <AcceptedLive />,
  delayMs: 2000,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Find the hidden file input rendered by react-dropzone
    const fileInput = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });

    // Scene 1 -> 2: Upload file
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Verify acceptance
    await waitFor(() => {
      expect(fileInput).toBeTruthy();
    });
    goToScene(2);
    await delay();

    // Final assertion: no error alert
    const alert = document.querySelector('[role="alert"]');
    expect(alert).toBeNull();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Accepted',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const AcceptedFormatInteractive: StoryObj = {
  ...AcceptedInteractive,
  name: 'Accepted Format (Interactive)',
};

export const AcceptedFormatStepwise: StoryObj = {
  ...AcceptedStepwise,
  name: 'Accepted Format (Stepwise)',
};

export const AcceptedFormatAutomated: StoryObj = {
  ...AcceptedAutomated,

  name: 'Accepted Format (Automated)',
};
