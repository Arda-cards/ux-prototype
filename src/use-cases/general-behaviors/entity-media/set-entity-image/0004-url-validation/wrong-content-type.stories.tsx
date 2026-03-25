/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Wrong Content Type
 *
 * Demonstrates the error state when an HTTPS URL is reachable but returns a
 * non-image content type (e.g. `text/html`). The page wrapper simulates the
 * content-type check that an upstream consumer would perform after receiving
 * `{ type: 'url', url }` from the drop zone.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL_NON_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Content-type check simulation
// ---------------------------------------------------------------------------

/** Simulates a consumer-side content-type check that fails for non-image URLs. */
async function simulateContentTypeCheck(url: string): Promise<'image' | 'non-image'> {
  // Simulate async network delay
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  // In the story context, treat the non-image mock URL as always non-image
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

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface WrongContentTypePageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  urlToTest: string;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function WrongContentTypePage({
  urlToTest,
  onInput,
  onDismiss,
  acceptedFormats,
}: WrongContentTypePageProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'ok'>('idle');
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInput = async (input: ImageInput) => {
    setLastInput(input);
    onInput(input);

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
        acceptedFormats={acceptedFormats}
        onInput={handleInput}
        onDismiss={onDismiss}
      />

      {status === 'checking' && (
        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Checking content type…
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
        <p className="text-xs text-muted-foreground pt-1">
          Current test URL: <code className="break-all">{urlToTest}</code>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof WrongContentTypePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Wrong Content Type',
  component: WrongContentTypePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An HTTPS URL that resolves to a non-image content type (e.g. `text/html`) ' +
          'passes the scheme check but fails the content-type check performed by the consumer. ' +
          'The error message instructs the user to use a direct link to a JPEG, PNG, WebP, or HEIC image.',
      },
    },
  },
  argTypes: {
    urlToTest: {
      control: { type: 'text' },
      description: 'HTTPS URL expected to return a non-image content type.',
    },
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
    },
  },
  args: {
    urlToTest: MOCK_EXTERNAL_URL_NON_IMAGE,
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WrongContentTypePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Automated check: types the non-image URL, presses Enter, waits for the
 * content-type simulation to complete, and confirms the error panel appears.
 */
export const NonImageContentType: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('URL input field is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
    });

    await step('Type the non-image URL and press Enter', async () => {
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.clear(input);
      await userEvent.type(input, args.urlToTest);
      await userEvent.keyboard('{Enter}');
    });

    await step('Drop zone accepts the https:// scheme — no inline error', async () => {
      await waitFor(() => {
        const inlineAlert = canvasElement.querySelector('[role="alert"]');
        expect(inlineAlert).toBeNull();
      });
    });

    await step('onInput called with type "url"', async () => {
      await waitFor(() => {
        expect(args.onInput).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'url', url: args.urlToTest }),
        );
      });
    });

    await step('Content-type error panel is displayed', async () => {
      await waitFor(
        () => {
          const errorPanel = canvasElement.querySelector('[aria-label="content-type-error"]');
          expect(errorPanel).not.toBeNull();
          expect(errorPanel?.textContent).toContain("doesn't point to a supported image type");
        },
        { timeout: 3000 },
      );
    });
  },
};

/**
 * Playground — use Controls to enter any URL and observe the content-type
 * check simulation. URLs ending in .html, .htm, .pdf, or .txt trigger the error.
 */
export const Playground: Story = {};
