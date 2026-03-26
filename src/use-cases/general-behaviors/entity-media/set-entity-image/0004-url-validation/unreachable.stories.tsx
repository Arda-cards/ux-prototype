/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Unreachable URL
 *
 * Demonstrates the error state when an HTTPS URL passes the scheme check but
 * cannot be reached (404 or timeout). The page wrapper simulates the
 * reachability check that an upstream consumer would perform after receiving
 * `{ type: 'url', url }` from the drop zone.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL_BROKEN,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   REACHABILITY SIMULATION
   ================================================================ */

/** Simulates an upstream reachability check that always fails for broken URLs. */
async function simulateReachabilityCheck(url: string): Promise<'ok' | 'unreachable'> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  if (url === MOCK_EXTERNAL_URL_BROKEN || url.includes('nonexistent')) {
    return 'unreachable';
  }
  return 'ok';
}

const UNREACHABLE_ERROR =
  "We couldn't load an image from this address. Check that the link points directly to an image.";

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function UnreachableLive() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'ok'>('idle');
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInput = async (input: ImageInput) => {
    setLastInput(input);

    if (input.type === 'url') {
      setStatus('checking');
      setErrorMessage(null);
      const result = await simulateReachabilityCheck(input.url);
      if (result === 'unreachable') {
        setStatus('error');
        setErrorMessage(UNREACHABLE_ERROR);
      } else {
        setStatus('ok');
      }
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — URL Validation: Unreachable
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter an HTTPS URL that returns a 404 or cannot be reached. The drop zone accepts the
        scheme, emits <code>{'{ type: "url" }'}</code>, and the consumer then performs a
        reachability check — surfacing an error when the image cannot be loaded.
      </p>

      <ImageDropZone
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={handleInput}
        onDismiss={() => {}}
      />

      {status === 'checking' && (
        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Checking reachability&hellip;
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div
          role="status"
          aria-label="reachability-error"
          className="rounded-lg border border-destructive bg-destructive/5 p-4"
        >
          <p className="text-sm font-semibold text-destructive mb-1">Image unreachable</p>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {status === 'ok' && lastInput?.type === 'url' && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold mb-1">URL accepted</p>
          <pre className="text-xs text-muted-foreground font-mono break-all">
            {JSON.stringify(lastInput, null, 2)}
          </pre>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Test URL (broken / 404): <code className="break-all">{MOCK_EXTERNAL_URL_BROKEN}</code>
      </p>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function UnreachableSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Unreachable
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. Enter a broken HTTPS URL to trigger the reachability failure.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: Broken URL typed — reachability check in progress
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Unreachable
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            Checking reachability&hellip;
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Verifying: {MOCK_EXTERNAL_URL_BROKEN}
          </p>
        </div>
      );

    // Scene 3: Reachability check fails — error shown
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Unreachable
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div
            role="status"
            aria-label="reachability-error"
            className="rounded-lg border border-destructive bg-destructive/5 p-4"
          >
            <p className="text-sm font-semibold text-destructive mb-1">Image unreachable</p>
            <p className="text-sm text-destructive">{UNREACHABLE_ERROR}</p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const unreachableScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone awaits a URL. A broken or 404 HTTPS URL will pass the scheme check but fail the reachability check performed by the consumer.',
    interaction: `Type "${MOCK_EXTERNAL_URL_BROKEN}" into the URL field and press Enter.`,
  },
  {
    title: 'Scene 2 of 3 \u2014 URL Typed — Reachability Check in Progress',
    description:
      'The HTTPS URL passed the scheme check and the drop zone emitted `{ type: "url", url }`. The consumer is now performing a simulated reachability check (400 ms delay to mimic a network probe).',
    interaction: 'Wait for the reachability check to complete.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Reachability Check Failed',
    description:
      'The reachability check returned "unreachable". The error message "We couldn\'t load an image from this address. Check that the link points directly to an image." is displayed to guide the user.',
    interaction: 'The workflow is complete. The user must enter a working image URL.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: UnreachableInteractive,
  Stepwise: UnreachableStepwise,
  Automated: UnreachableAutomated,
} = createWorkflowStories({
  scenes: unreachableScenes,
  renderScene: (i) => <UnreachableSceneRenderer sceneIndex={i} />,
  renderLive: () => <UnreachableLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Find the URL input field
    const urlInput = canvas.getByPlaceholderText(/paste an image url/i);
    await waitFor(() => {
      expect(urlInput).toBeVisible();
    });

    // Scene 1 -> 2: Type the broken URL and press Enter
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, MOCK_EXTERNAL_URL_BROKEN, { delay: 20 });
    await userEvent.keyboard('{Enter}');
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Wait for reachability error panel
    await waitFor(
      () => {
        const errorPanel = document.querySelector('[aria-label="reachability-error"]');
        expect(errorPanel).not.toBeNull();
        expect(errorPanel?.textContent).toContain("couldn't load an image");
      },
      { timeout: 3000 },
    );
    goToScene(2);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Unreachable',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const UnreachableInteractiveStory: StoryObj = {
  ...UnreachableInteractive,
  name: 'Unreachable URL (Interactive)',
};

export const UnreachableStepwiseStory: StoryObj = {
  ...UnreachableStepwise,
  name: 'Unreachable URL (Stepwise)',
};

export const UnreachableAutomatedStory: StoryObj = {
  ...UnreachableAutomated,

  name: 'Unreachable URL (Automated)',
};
