/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Clipboard HTML
 *
 * Simulates pasting HTML markup that contains an embedded image URL (e.g.
 * copying an image from a web page). The URL is extracted from the first
 * `<img src="...">` tag and routed as `{ type: "url", url }`.
 *
 * Two workflows:
 *   ValidHttpsUrl — extracts HTTPS URL and routes as { type: "url" }
 *   RelativeUrlRejected — extraction succeeds but non-HTTPS URL emits error
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, userEvent } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Utility — extract first img src from HTML string
// ---------------------------------------------------------------------------

function extractImageUrlFromHtml(html: string): string | null {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return match?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Sample HTML payloads
// ---------------------------------------------------------------------------

const SAMPLE_HTML_WITH_URL = `<div>
  <p>Check out this image:</p>
  <img src="${MOCK_EXTERNAL_URL}" alt="Sample item photo" width="400" height="400" />
</div>`;

const SAMPLE_HTML_RELATIVE = `<figure>
  <img src="/images/local-asset.png" alt="Local image" />
  <figcaption>This relative URL will be rejected.</figcaption>
</figure>`;

// ---------------------------------------------------------------------------
// Shared page scaffold
// ---------------------------------------------------------------------------

function ClipboardHtmlLive({ sampleHtml }: { sampleHtml: string }) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  const simulateHtmlPaste = () => {
    const url = extractImageUrlFromHtml(sampleHtml);
    let input: ImageInput;
    if (!url) {
      input = { type: 'error', message: 'No image URL found in pasted HTML.' };
    } else if (!url.startsWith('https://')) {
      input = { type: 'error', message: `Extracted URL is not HTTPS: "${url}"` };
    } else {
      input = { type: 'url', url };
    }
    setLastInput(input);
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: Clipboard HTML
      </h1>
      <p className="text-sm text-muted-foreground">
        When the user copies an image from a web page, the clipboard contains both HTML markup and
        the raw image. The first <code>{'<img src>'}</code> URL is extracted and validated.
      </p>

      <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={() => {}} />

      <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          HTML payload (simulated clipboard content)
        </p>
        <pre className="text-xs font-mono bg-muted rounded p-2 overflow-x-auto whitespace-pre-wrap">
          {sampleHtml}
        </pre>
        <button
          type="button"
          data-testid="simulate-html-paste-btn"
          onClick={simulateHtmlPaste}
          className="rounded bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80"
        >
          Simulate HTML Paste
        </button>
      </div>

      {lastInput && (
        <div
          className={`rounded-lg border p-4 ${
            lastInput.type === 'error' ? 'border-destructive' : 'border-border'
          }`}
        >
          <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
          <pre
            className={`text-xs font-mono whitespace-pre-wrap ${
              lastInput.type === 'error' ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
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

function ClipboardHtmlScene({
  sceneIndex,
  sampleHtml,
  extractedUrl,
  isValid,
}: {
  sceneIndex: number;
  sampleHtml: string;
  extractedUrl: string | null;
  isValid: boolean;
}) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard HTML
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. The user is about to copy an image from a web page and paste it.
          </p>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </div>
      );

    // Scene 2: HTML pasted — payload visible
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard HTML
          </h1>
          <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Clipboard HTML payload
            </p>
            <pre className="text-xs font-mono bg-muted rounded p-2 overflow-x-auto whitespace-pre-wrap">
              {sampleHtml}
            </pre>
          </div>
        </div>
      );

    // Scene 3: URL extracted
    case 2:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard HTML
          </h1>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Extracted URL</p>
            <pre className="text-xs font-mono text-muted-foreground">
              {extractedUrl ?? '(none)'}
            </pre>
          </div>
        </div>
      );

    // Scene 4: Validation result
    case 3:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Clipboard HTML
          </h1>
          <div
            className={`rounded-lg border p-4 ${isValid ? 'border-border' : 'border-destructive'}`}
          >
            <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
            <pre
              className={`text-xs font-mono whitespace-pre-wrap ${
                isValid ? 'text-muted-foreground' : 'text-destructive'
              }`}
            >
              {isValid
                ? JSON.stringify({ type: 'url', url: extractedUrl }, null, 2)
                : JSON.stringify(
                    {
                      type: 'error',
                      message: extractedUrl
                        ? `Extracted URL is not HTTPS: "${extractedUrl}"`
                        : 'No image URL found in pasted HTML.',
                    },
                    null,
                    2,
                  )}
            </pre>
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// VALID HTTPS URL workflow
// ---------------------------------------------------------------------------

const validHttpsScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is idle. The user is about to copy an image from a web page — the clipboard will contain both HTML markup and the raw image data.',
    interaction: 'Copy an image from a web page (Ctrl+C / Cmd+C on the image).',
  },
  {
    title: 'Scene 2 of 4 \u2014 HTML Pasted',
    description:
      'The clipboard paste event fires. The HTML payload contains an <img src="https://..."> tag. The app parses the HTML to find the first image URL.',
    interaction: 'The app extracts the src attribute from the first <img> tag.',
  },
  {
    title: 'Scene 3 of 4 \u2014 URL Extracted',
    description:
      'The HTTPS URL has been extracted from the HTML. It starts with "https://" so it passes the scheme validation check.',
    interaction: 'The URL is validated against the https:// prefix requirement.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Routed as URL',
    description:
      'The extracted URL is valid. The app emits { type: "url", url } to the upstream handler, which will fetch and validate reachability before proceeding to the crop editor.',
    interaction: 'The workflow is complete. The image URL routes to the crop editor.',
  },
];

const {
  Interactive: ValidInteractive,
  Stepwise: ValidStepwise,
  Automated: ValidAutomated,
} = createWorkflowStories({
  scenes: validHttpsScenes,
  renderScene: (i) => (
    <ClipboardHtmlScene
      sceneIndex={i}
      sampleHtml={SAMPLE_HTML_WITH_URL}
      extractedUrl={MOCK_EXTERNAL_URL}
      isValid
    />
  ),
  renderLive: () => <ClipboardHtmlLive sampleHtml={SAMPLE_HTML_WITH_URL} />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByTestId('simulate-html-paste-btn')).toBeVisible();
    });
    goToScene(1);
    await delay();

    goToScene(2);
    await delay();

    await userEvent.click(canvas.getByTestId('simulate-html-paste-btn'));
    await waitFor(() => {
      expect(canvas.getByText(/emitted input/i)).toBeVisible();
    });

    const pres = document.querySelectorAll('pre');
    const lastPre = pres[pres.length - 1] as HTMLElement | undefined;
    if (lastPre) {
      expect(lastPre.textContent).toContain('"type": "url"');
    }
    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// RELATIVE URL REJECTED workflow
// ---------------------------------------------------------------------------

const relativeUrlScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone is idle. The user copies an image from a page that uses a relative URL (/images/...).',
    interaction: 'Copy an image with a relative src from a web page.',
  },
  {
    title: 'Scene 2 of 4 \u2014 HTML Pasted',
    description:
      'The clipboard paste event fires. The HTML payload contains an <img src="/images/local-asset.png"> with a relative path.',
    interaction: 'The app extracts the src attribute.',
  },
  {
    title: 'Scene 3 of 4 \u2014 URL Extracted (Relative)',
    description:
      'The extracted value is "/images/local-asset.png" — a relative path. It does not start with "https://" so it fails validation.',
    interaction: 'Validation rejects the relative URL.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Error Emitted',
    description:
      'The app emits { type: "error", message: "Extracted URL is not HTTPS: ..." }. The drop zone shows an inline error so the user can retry with a valid HTTPS URL.',
    interaction: 'The workflow is complete. The user can try again with an HTTPS image URL.',
  },
];

const {
  Interactive: RelativeInteractive,
  Stepwise: RelativeStepwise,
  Automated: RelativeAutomated,
} = createWorkflowStories({
  scenes: relativeUrlScenes,
  renderScene: (i) => (
    <ClipboardHtmlScene
      sceneIndex={i}
      sampleHtml={SAMPLE_HTML_RELATIVE}
      extractedUrl="/images/local-asset.png"
      isValid={false}
    />
  ),
  renderLive: () => <ClipboardHtmlLive sampleHtml={SAMPLE_HTML_RELATIVE} />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByTestId('simulate-html-paste-btn')).toBeVisible();
    });
    goToScene(1);
    await delay();

    goToScene(2);
    await delay();

    await userEvent.click(canvas.getByTestId('simulate-html-paste-btn'));
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
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Clipboard HTML',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Valid HTTPS URL path
export const ValidHttpsUrlInteractive: StoryObj = {
  ...ValidInteractive,
  name: 'Valid HTTPS URL (Interactive)',
};

export const ValidHttpsUrlStepwise: StoryObj = {
  ...ValidStepwise,
  name: 'Valid HTTPS URL (Stepwise)',
};

export const ValidHttpsUrlAutomated: StoryObj = {
  ...ValidAutomated,

  name: 'Valid HTTPS URL (Automated)',
};

// Relative URL rejected path
export const RelativeUrlRejectedInteractive: StoryObj = {
  ...RelativeInteractive,
  name: 'Relative URL Rejected (Interactive)',
};

export const RelativeUrlRejectedStepwise: StoryObj = {
  ...RelativeStepwise,
  name: 'Relative URL Rejected (Stepwise)',
};

export const RelativeUrlRejectedAutomated: StoryObj = {
  ...RelativeAutomated,

  name: 'Relative URL Rejected (Automated)',
};
