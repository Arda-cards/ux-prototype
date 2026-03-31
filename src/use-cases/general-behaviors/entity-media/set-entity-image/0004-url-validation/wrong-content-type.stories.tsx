/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Wrong Content Type
 *
 * Demonstrates the error state when an HTTPS URL is reachable but returns a
 * non-image content type (e.g. `text/html`). The page wrapper simulates the
 * content-type check that an upstream consumer would perform after receiving
 * `{ type: 'url', url }` from the drop zone.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL_NON_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   CONTENT-TYPE CHECK SIMULATION
   ================================================================ */

/** Simulates a consumer-side content-type check that fails for non-image URLs. */
async function simulateContentTypeCheck(url: string): Promise<'image' | 'non-image'> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  if (
    url === MOCK_EXTERNAL_URL_NON_IMAGE ||
    url.endsWith('.html') ||
    url.endsWith('.htm') ||
    url.endsWith('.pdf') ||
    url.endsWith('.txt')
  ) {
    return 'non-image';
  }
  return 'image';
}

const WRONG_CONTENT_TYPE_ERROR =
  "The link doesn't point to a supported image type. Try a direct link to a JPEG, PNG, WebP, or HEIC image.";

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function WrongContentTypeLive() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'ok'>('idle');
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInput = async (input: ImageInput) => {
    setLastInput(input);

    if (input.type === 'url') {
      setStatus('checking');
      setErrorMessage(null);
      const result = await simulateContentTypeCheck(input.url);
      if (result === 'non-image') {
        setStatus('error');
        setErrorMessage(WRONG_CONTENT_TYPE_ERROR);
      } else {
        setStatus('ok');
      }
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — URL Validation: Wrong Content Type
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter an HTTPS URL that resolves to a non-image resource (e.g. an HTML page). The drop zone
        accepts the scheme, emits <code>{'{ type: "url" }'}</code>, and the consumer then checks the
        content type — surfacing an error when the response is not an image.
      </p>

      <ImageDropZone
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={handleInput}
        onDismiss={() => {}}
      />

      {status === 'checking' && (
        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Checking content type&hellip;
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div
          role="status"
          aria-label="content-type-error"
          className="rounded-lg border border-destructive bg-destructive/5 p-4"
        >
          <p className="text-sm font-semibold text-destructive mb-1">Unsupported content type</p>
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

      <div className="rounded-lg border border-border p-3 text-sm space-y-1">
        <p className="font-medium">URLs that produce this error:</p>
        <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5 font-mono">
          <li>https://example.com/page.html</li>
          <li>https://example.com/document.pdf</li>
          <li>https://example.com/data.txt</li>
        </ul>
      </div>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function WrongContentTypeSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Wrong Content Type
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. Enter a non-image URL (e.g. .html, .pdf) to trigger content-type
            rejection.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: Non-image URL typed — content-type check in progress
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Wrong Content Type
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            Checking content type&hellip;
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Verifying: {MOCK_EXTERNAL_URL_NON_IMAGE}
          </p>
        </div>
      );

    // Scene 3: Content-type check fails — error shown
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — URL Validation: Wrong Content Type
          </h1>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div
            role="status"
            aria-label="content-type-error"
            className="rounded-lg border border-destructive bg-destructive/5 p-4"
          >
            <p className="text-sm font-semibold text-destructive mb-1">Unsupported content type</p>
            <p className="text-sm text-destructive">{WRONG_CONTENT_TYPE_ERROR}</p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const wrongContentTypeScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone awaits a URL. An HTTPS URL pointing to a non-image resource (HTML page, PDF, text file) will pass the scheme check but fail the content-type check.',
    interaction: `Type "${MOCK_EXTERNAL_URL_NON_IMAGE}" into the URL field and press Enter.`,
  },
  {
    title: 'Scene 2 of 3 \u2014 Non-Image URL — Content-Type Check in Progress',
    description:
      'The HTTPS URL passed scheme validation and the drop zone emitted `{ type: "url", url }`. The consumer is now performing a simulated content-type check (400 ms delay to mimic a network probe).',
    interaction: 'Wait for the content-type check to complete.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Content-Type Check Failed',
    description:
      'The URL returns a non-image content type (text/html). The error message "The link doesn\'t point to a supported image type. Try a direct link to a JPEG, PNG, WebP, or HEIC image." guides the user to use a direct image link.',
    interaction: 'The workflow is complete. The user must provide a direct link to an image file.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: WrongContentTypeInteractive,
  Stepwise: WrongContentTypeStepwise,
  Automated: WrongContentTypeAutomated,
} = createWorkflowStories({
  scenes: wrongContentTypeScenes,
  renderScene: (i) => <WrongContentTypeSceneRenderer sceneIndex={i} />,
  renderLive: () => <WrongContentTypeLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Find the URL input field
    const urlInput = canvas.getByPlaceholderText(/example\.com\/image/i);
    await waitFor(() => {
      expect(urlInput).toBeVisible();
    });

    // Scene 1 -> 2: Type the non-image URL and press Enter
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, MOCK_EXTERNAL_URL_NON_IMAGE, { delay: 20 });
    await userEvent.keyboard('{Enter}');
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Wait for content-type error panel
    await waitFor(
      () => {
        const errorPanel = document.querySelector('[aria-label="content-type-error"]');
        expect(errorPanel).not.toBeNull();
        expect(errorPanel?.textContent).toContain("doesn't point to a supported image type");
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
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Wrong Content Type',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const WrongContentTypeInteractiveStory: StoryObj = {
  ...WrongContentTypeInteractive,
  name: 'Wrong Content Type (Interactive)',
};

export const WrongContentTypeStepwiseStory: StoryObj = {
  ...WrongContentTypeStepwise,
  name: 'Wrong Content Type (Stepwise)',
};

export const WrongContentTypeAutomatedStory: StoryObj = {
  ...WrongContentTypeAutomated,

  name: 'Wrong Content Type (Automated)',
};
