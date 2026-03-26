/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Rejected
 *
 * Shows an unsupported BMP file being rejected by the drop zone.
 * The drop zone emits `{ type: 'error', message }` with a plain-language error.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function RejectedLive() {
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
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={(input) => setLastInput(input)}
        onDismiss={() => {}}
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

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function RejectedSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Rejected Format
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Drop or select a file. Unsupported formats will be rejected.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: BMP file provided
    case 1:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Rejected Format
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            A BMP file has been selected. The drop zone is validating the MIME type.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <p className="mt-3 text-xs text-muted-foreground font-mono">
            Selected: unsupported.bmp (image/bmp)
          </p>
        </div>
      );

    // Scene 3: Error — "file type not supported"
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Rejected Format
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div
            className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
            data-testid="result-panel"
          >
            <h2 className="text-sm font-semibold text-destructive mb-1">File rejected</h2>
            <p className="text-xs text-muted-foreground">
              This file type isn&apos;t supported. Try a JPEG, PNG, WebP, or HEIC image.
            </p>
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Technical detail: Invalid file type: image/bmp
            </p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const rejectedScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is in its initial idle state. It only accepts JPEG, PNG, WebP, HEIC, and HEIF files. BMP and other formats will be rejected.',
    interaction: 'Select or drop a BMP file to trigger format rejection.',
  },
  {
    title: 'Scene 2 of 3 \u2014 BMP File Provided',
    description:
      'A BMP file has been selected. The drop zone validates the MIME type against the accepted formats list and determines it is not supported.',
    interaction: 'Wait for validation to complete.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Error: File Type Not Supported',
    description:
      'The BMP file failed format validation. The drop zone emits `{ type: "error", message }` and shows an inline error alert. The error panel below shows the user-facing message and technical detail.',
    interaction:
      'The workflow is complete. The user must select a JPEG, PNG, WebP, or HEIC image instead.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: RejectedInteractive,
  Stepwise: RejectedStepwise,
  Automated: RejectedAutomated,
} = createWorkflowStories({
  scenes: rejectedScenes,
  renderScene: (i) => <RejectedSceneRenderer sceneIndex={i} />,
  renderLive: () => <RejectedLive />,
  delayMs: 2000,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < rejectedScenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Rejected',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const RejectedFormatInteractive: StoryObj = {
  ...RejectedInteractive,
  name: 'Rejected Format (Interactive)',
};

export const RejectedFormatStepwise: StoryObj = {
  ...RejectedStepwise,
  name: 'Rejected Format (Stepwise)',
};

export const RejectedFormatAutomated: StoryObj = {
  ...RejectedAutomated,

  name: 'Rejected Format (Automated)',
};
