/**
 * GEN-MEDIA-0001::0003.FS — Accepted Formats and Size Limits
 * Scene: Limit Exceeded
 *
 * Shows a file exceeding the 10 MB limit being rejected after a simulated
 * compression attempt. The wrapper performs size checking and emits an
 * appropriate error message.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_OVERSIZED,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   CONSTANTS
   ================================================================ */

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SIZE_ERROR_MESSAGE = 'This file is too large. The maximum size is 10 MB.';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

type ValidationStatus = 'idle' | 'size-error';

function LimitExceededLive() {
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleInput = (input: ImageInput) => {
    if (input.type === 'file') {
      setFileName(input.file.name);
      if (input.file.size > MAX_FILE_SIZE_BYTES) {
        setStatus('size-error');
        return;
      }
    }
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

      <ImageDropZone
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={handleInput}
        onDismiss={() => {}}
      />

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

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function LimitExceededSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Limit Exceeded
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Drop or select an oversized file to see the size limit error.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: Oversized file provided — compression attempt
    case 1:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Limit Exceeded
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            An 11 MB JPEG has been selected. Auto-compression is being attempted to bring it within
            the 10 MB limit.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <p className="mt-3 text-xs text-muted-foreground font-mono">
            Processing: oversized.jpg (11.0 MB) — compressing&hellip;
          </p>
        </div>
      );

    // Scene 3: Still too large — size error shown
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0001 — Formats and Size: Limit Exceeded
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
            <h2 className="text-sm font-semibold text-destructive mb-1">File too large</h2>
            <p className="text-sm text-destructive" data-testid="size-error-message">
              {SIZE_ERROR_MESSAGE}
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              File: oversized.jpg (11.0 MB)
            </p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const limitExceededScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone awaits file input. Files larger than 10 MB will be rejected even after auto-compression is attempted.',
    interaction: 'Drop or select a file larger than 10 MB.',
  },
  {
    title: 'Scene 2 of 3 \u2014 Oversized File — Compression Attempt',
    description:
      'An 11 MB JPEG has been selected. The system attempts auto-compression to reduce the file size below the 10 MB threshold.',
    interaction: 'Wait for the compression attempt to complete.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Still Too Large — Error',
    description:
      'The compression attempt could not reduce the file below 10 MB. The error message "This file is too large. The maximum size is 10 MB." is shown. The file is rejected.',
    interaction:
      'The workflow is complete. The user must select a smaller file or compress it manually.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: LimitExceededInteractive,
  Stepwise: LimitExceededStepwise,
  Automated: LimitExceededAutomated,
} = createWorkflowStories({
  scenes: limitExceededScenes,
  renderScene: (i) => <LimitExceededSceneRenderer sceneIndex={i} />,
  renderLive: () => <LimitExceededLive />,
  delayMs: 2000,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    const fileInput = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });

    // Scene 1 -> 2: Upload oversized file
    await userEvent.upload(fileInput, MOCK_FILE_OVERSIZED);
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Verify size error appears
    await waitFor(() => {
      const errorMsg = document.querySelector('[data-testid="size-error-message"]');
      expect(errorMsg).toBeTruthy();
    });
    goToScene(2);
    await delay();

    // Final assertion: error message contains expected text
    const errorMsg = document.querySelector('[data-testid="size-error-message"]');
    expect(errorMsg?.textContent).toContain('10 MB');
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0003 Formats and Size/Limit Exceeded',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const LimitExceededFormatInteractive: StoryObj = {
  ...LimitExceededInteractive,
  name: 'Limit Exceeded (Interactive)',
};

export const LimitExceededFormatStepwise: StoryObj = {
  ...LimitExceededStepwise,
  name: 'Limit Exceeded (Stepwise)',
};

export const LimitExceededFormatAutomated: StoryObj = {
  ...LimitExceededAutomated,
  name: 'Limit Exceeded (Automated)',
};
