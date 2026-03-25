/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Clipboard HTML
 *
 * Simulates pasting HTML markup that contains an embedded image URL (e.g.
 * copying an image from a web page). The URL is extracted from the first
 * `<img src="...">` tag and routed as `{ type: "url", url }`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, waitFor, userEvent } from 'storybook/test';
import { useState } from 'react';

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

const SAMPLE_HTML_NO_IMAGE = `<p>This is plain HTML with no image tag.</p>`;

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface ClipboardHtmlPageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
  sampleHtml?: string;
}

function ClipboardHtmlPage({ sampleHtml = SAMPLE_HTML_WITH_URL, ...args }: ClipboardHtmlPageProps) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [htmlPreview] = useState(sampleHtml);

  const simulateHtmlPaste = () => {
    const url = extractImageUrlFromHtml(htmlPreview);
    let input: ImageInput;

    if (!url) {
      input = { type: 'error', message: 'No image URL found in pasted HTML.' };
    } else if (!url.startsWith('https://')) {
      input = {
        type: 'error',
        message: `Extracted URL is not HTTPS: "${url}"`,
      };
    } else {
      input = { type: 'url', url };
    }

    setLastInput(input);
    args.onInput(input);
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: Clipboard HTML
      </h1>
      <p className="text-sm text-muted-foreground">
        When the user copies an image from a web page, the clipboard contains both HTML markup and
        the raw image. The first <code>{'<img src>'}</code> URL is extracted and validated. HTTPS
        URLs are routed as <code>{'{ type: "url" }'}</code>; relative or non-HTTPS URLs emit an
        error.
      </p>

      <ImageDropZone {...args} />

      <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          HTML payload (simulated clipboard content)
        </p>
        <pre className="text-xs font-mono bg-muted rounded p-2 overflow-x-auto whitespace-pre-wrap">
          {htmlPreview}
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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ClipboardHtmlPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Clipboard HTML',
  component: ClipboardHtmlPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Paste HTML markup containing an `<img>` tag (e.g. copied from a web page). ' +
          'The first `src` attribute is extracted and validated — HTTPS URLs route as ' +
          '`{ type: "url" }`, relative or non-HTTPS URLs emit `{ type: "error" }`.',
      },
    },
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ClipboardHtmlPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * HTML with a valid HTTPS image URL — extracted and routed as `{ type: "url" }`.
 */
export const ValidHttpsUrl: Story = {
  args: {
    sampleHtml: SAMPLE_HTML_WITH_URL,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Simulate button is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByTestId('simulate-html-paste-btn')).toBeVisible();
      });
    });

    await step('Click simulate triggers URL extraction', async () => {
      await userEvent.click(canvas.getByTestId('simulate-html-paste-btn'));
      await waitFor(() => {
        expect(canvas.getByText(/emitted input/i)).toBeVisible();
      });
    });

    await step('Emitted input type is "url" with extracted HTTPS URL', async () => {
      const pre = canvasElement.querySelector('pre:last-of-type');
      expect(pre?.textContent).toContain('"type": "url"');
      expect(pre?.textContent).toContain('https://');
    });
  },
};

/**
 * HTML with a relative image URL — extraction succeeds but validation fails
 * because the URL is not HTTPS.
 */
export const RelativeUrlRejected: Story = {
  args: {
    sampleHtml: SAMPLE_HTML_RELATIVE,
  },
};

/**
 * HTML with no image tag — emits an error because no URL can be extracted.
 */
export const NoImageInHtml: Story = {
  args: {
    sampleHtml: SAMPLE_HTML_NO_IMAGE,
  },
};
