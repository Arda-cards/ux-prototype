/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Unreachable URL
 *
 * Demonstrates the error state when an HTTPS URL passes the scheme check but
 * cannot be reached (404 or timeout). The page wrapper simulates the
 * reachability check that an upstream consumer would perform after receiving
 * `{ type: 'url', url }` from the drop zone.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL_BROKEN,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Reachability simulation
// ---------------------------------------------------------------------------

/** Simulates an upstream reachability check that always fails for broken URLs. */
async function simulateReachabilityCheck(url: string): Promise<'ok' | 'unreachable'> {
  // Simulate async network delay
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  // In the story context, treat the broken mock URL as always unreachable
  if (url === MOCK_EXTERNAL_URL_BROKEN || url.includes('nonexistent')) {
    return 'unreachable';
  }
  return 'ok';
}

const UNREACHABLE_ERROR =
  "We couldn't load an image from this address. Check that the link points directly to an image.";

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface UnreachablePageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  urlToTest: string;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function UnreachablePage({ urlToTest, onInput, onDismiss, acceptedFormats }: UnreachablePageProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'error' | 'ok'>('idle');
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInput = async (input: ImageInput) => {
    setLastInput(input);
    onInput(input);

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
        acceptedFormats={acceptedFormats}
        onInput={handleInput}
        onDismiss={onDismiss}
      />

      {status === 'checking' && (
        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Checking reachability…
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
        Test URL (broken / 404): <code className="break-all">{urlToTest}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof UnreachablePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Unreachable',
  component: UnreachablePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An HTTPS URL that returns a 404 or times out passes the scheme check ' +
          'but fails the reachability check performed by the consumer. ' +
          'The error message guides the user to verify the link points directly to an image.',
      },
    },
  },
  argTypes: {
    urlToTest: {
      control: { type: 'text' },
      description: 'HTTPS URL expected to be unreachable (404 or timeout).',
    },
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
    },
  },
  args: {
    urlToTest: MOCK_EXTERNAL_URL_BROKEN,
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof UnreachablePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Automated check: types the broken URL, presses Enter, waits for the
 * reachability simulation to complete, and confirms the error panel appears.
 */
export const BrokenUrl404: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('URL input field is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
    });

    await step('Type the broken URL and press Enter', async () => {
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

    await step('Reachability error panel is displayed', async () => {
      await waitFor(
        () => {
          const errorPanel = canvasElement.querySelector('[aria-label="reachability-error"]');
          expect(errorPanel).not.toBeNull();
          expect(errorPanel?.textContent).toContain("couldn't load an image");
        },
        { timeout: 3000 },
      );
    });
  },
};

/**
 * Playground — use Controls to enter any HTTPS URL and observe the
 * reachability check simulation.
 */
export const Playground: Story = {};
