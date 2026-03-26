/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Valid HTTPS
 *
 * Demonstrates that a valid HTTPS URL passes the scheme check and is emitted
 * as `{ type: 'url', url }`. The reviewer can type any HTTPS URL and press
 * Enter to observe the success state.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function ValidHttpsLive() {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — URL Validation: Valid HTTPS
      </h1>
      <p className="text-sm text-muted-foreground">
        Type an <code>https://</code> URL into the field and press{' '}
        <kbd className="rounded border border-border px-1 py-0.5 font-mono text-xs">Enter</kbd>. The
        drop zone validates the scheme and emits <code>{'{ type: "url", url }'}</code> on success.
      </p>

      <ImageDropZone
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={(input) => setLastInput(input)}
        onDismiss={() => {}}
      />

      {lastInput && (
        <div
          className={`rounded-lg border p-4 ${
            lastInput.type === 'error' ? 'border-destructive bg-destructive/5' : 'border-border'
          }`}
          data-testid="result-panel"
        >
          <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
            {JSON.stringify(lastInput, null, 2)}
          </pre>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Suggested URL to try: <code className="break-all">{MOCK_EXTERNAL_URL}</code>
      </p>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function ValidHttpsSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Valid HTTPS
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. The URL input field is available for entering an image URL.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: URL typed — validation in progress
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Valid HTTPS
          </h1>
          <p className="text-sm text-muted-foreground">
            The HTTPS URL has been typed and Enter has been pressed. Scheme validation is running.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <p className="text-xs text-muted-foreground font-mono">Validating: {MOCK_EXTERNAL_URL}</p>
        </div>
      );

    // Scene 3: Validation passes — success state
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Valid HTTPS
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div className="rounded-lg border border-border p-4" data-testid="result-panel">
            <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              {JSON.stringify({ type: 'url', url: MOCK_EXTERNAL_URL }, null, 2)}
            </pre>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const validHttpsScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is in its idle state. The URL input field at the bottom accepts HTTPS URLs. Type a URL and press Enter to validate.',
    interaction: `Type "${MOCK_EXTERNAL_URL}" into the URL field and press Enter.`,
  },
  {
    title: 'Scene 2 of 3 \u2014 URL Typed — Validation Passes',
    description:
      'The HTTPS URL has been entered and submitted. The drop zone checks the scheme: since it starts with "https://", it passes scheme validation immediately with no network request required at this stage.',
    interaction: 'Observe the result panel showing the emitted URL input.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Success — URL Emitted',
    description:
      'The URL passed validation. The drop zone emits `{ type: "url", url }` with the entered URL. No error alert is shown. The consumer can now use this URL for the reachability and content-type checks.',
    interaction: 'The workflow is complete. The URL is ready to pass to the image preview editor.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: ValidHttpsInteractive,
  Stepwise: ValidHttpsStepwise,
  Automated: ValidHttpsAutomated,
} = createWorkflowStories({
  scenes: validHttpsScenes,
  renderScene: (i) => <ValidHttpsSceneRenderer sceneIndex={i} />,
  renderLive: () => <ValidHttpsLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Find the URL input field
    const urlInput = canvas.getByPlaceholderText(/paste an image url/i);
    await waitFor(() => {
      expect(urlInput).toBeVisible();
    });

    // Scene 1 -> 2: Type URL and press Enter
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, MOCK_EXTERNAL_URL, { delay: 20 });
    await userEvent.keyboard('{Enter}');
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Verify no error alert and result panel appeared
    await waitFor(() => {
      const alert = document.querySelector('[role="alert"]');
      expect(alert).toBeNull();
    });

    await waitFor(() => {
      const resultPanel = document.querySelector('[data-testid="result-panel"]');
      expect(resultPanel).toBeTruthy();
    });
    goToScene(2);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Valid HTTPS',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const ValidHttpsInteractiveStory: StoryObj = {
  ...ValidHttpsInteractive,
  name: 'Valid HTTPS (Interactive)',
};

export const ValidHttpsStepwiseStory: StoryObj = {
  ...ValidHttpsStepwise,
  name: 'Valid HTTPS (Stepwise)',
};

export const ValidHttpsAutomatedStory: StoryObj = {
  ...ValidHttpsAutomated,

  name: 'Valid HTTPS (Automated)',
};
