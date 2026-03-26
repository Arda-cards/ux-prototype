/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Rejected Scheme
 *
 * Demonstrates that non-HTTPS URL schemes (`http:`, `javascript:`, `file:`)
 * are rejected with a clear error message before any network request is made.
 * Only `https://` URLs are accepted.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   CONSTANTS
   ================================================================ */

const HTTP_URL = 'http://example.com/image.jpg';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function RejectedSchemeLive() {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — URL Validation: Rejected Scheme
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter a URL with a non-HTTPS scheme — such as <code>http://</code>, <code>javascript:</code>
        , or <code>file://</code> — and press{' '}
        <kbd className="rounded border border-border px-1 py-0.5 font-mono text-xs">Enter</kbd>. The
        drop zone rejects the URL immediately without making any network request.
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

      <div className="rounded-lg border border-border p-3 text-sm space-y-1">
        <p className="font-medium">URLs to try:</p>
        <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5 font-mono">
          <li>http://example.com/image.jpg</li>
          <li>javascript:alert(1)</li>
          <li>file:///etc/hosts</li>
        </ul>
      </div>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function RejectedSchemeSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Rejected Scheme
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. Enter an http:// URL to trigger scheme rejection.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: http URL typed — scheme rejected
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Rejected Scheme
          </h1>
          <p className="text-sm text-muted-foreground">
            An <code>http://</code> URL has been entered. The drop zone rejects it immediately
            without a network request.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <p className="text-xs text-muted-foreground font-mono">Submitted: {HTTP_URL}</p>
        </div>
      );

    // Scene 3: Error message shown
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Rejected Scheme
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div
            className="rounded-lg border border-destructive bg-destructive/5 p-4"
            data-testid="result-panel"
          >
            <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              {JSON.stringify({ type: 'error', message: 'URL must start with https://' }, null, 2)}
            </pre>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const rejectedSchemeScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is idle. Only HTTPS URLs are accepted. Any URL not starting with "https://" will be rejected client-side before any network request is made.',
    interaction: `Type "${HTTP_URL}" into the URL field and press Enter.`,
  },
  {
    title: 'Scene 2 of 3 \u2014 http:// URL Typed — Scheme Rejected',
    description:
      'An http:// URL has been submitted. The drop zone performs a synchronous scheme check and immediately rejects it. No network request is made. This prevents insecure connections and blocks javascript: and file:// injection attacks.',
    interaction: 'Observe the error message that appears.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Error: Scheme Not Supported',
    description:
      'The drop zone emits `{ type: "error", message: "URL must start with https://" }`. The result panel shows the rejection and the inline alert appears inside the drop zone. The user must use an HTTPS URL.',
    interaction: 'The workflow is complete. The user must enter a valid HTTPS URL.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: RejectedSchemeInteractive,
  Stepwise: RejectedSchemeStepwise,
  Automated: RejectedSchemeAutomated,
} = createWorkflowStories({
  scenes: rejectedSchemeScenes,
  renderScene: (i) => <RejectedSchemeSceneRenderer sceneIndex={i} />,
  renderLive: () => <RejectedSchemeLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Find the URL input field
    const urlInput = canvas.getByPlaceholderText(/paste an image url/i);
    await waitFor(() => {
      expect(urlInput).toBeVisible();
    });

    // Scene 1 -> 2: Type http:// URL and press Enter
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, HTTP_URL, { delay: 20 });
    await userEvent.keyboard('{Enter}');
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Verify error alert appears
    await waitFor(() => {
      const alert = document.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      expect(alert?.textContent).toMatch(/https/i);
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
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Rejected Scheme',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const RejectedSchemeInteractiveStory: StoryObj = {
  ...RejectedSchemeInteractive,
  name: 'Rejected Scheme (Interactive)',
};

export const RejectedSchemeStepwiseStory: StoryObj = {
  ...RejectedSchemeStepwise,
  name: 'Rejected Scheme (Stepwise)',
};

export const RejectedSchemeAutomatedStory: StoryObj = {
  ...RejectedSchemeAutomated,
  name: 'Rejected Scheme (Automated)',
};
