/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Rejected Scheme
 *
 * Demonstrates that non-HTTPS URL schemes (`http:`, `javascript:`, `file:`)
 * are rejected with a clear error message before any network request is made.
 * Only `https://` URLs are accepted.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface RejectedSchemePageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  urlToReject: string;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function RejectedSchemePage({
  urlToReject,
  onInput,
  onDismiss,
  acceptedFormats,
}: RejectedSchemePageProps) {
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
        acceptedFormats={acceptedFormats}
        onInput={(input) => {
          setLastInput(input);
          onInput(input);
        }}
        onDismiss={onDismiss}
      />

      {lastInput && (
        <div
          className={`rounded-lg border p-4 ${
            lastInput.type === 'error' ? 'border-destructive bg-destructive/5' : 'border-border'
          }`}
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
        <p className="text-xs text-muted-foreground pt-1">
          Current test URL: <code className="break-all">{urlToReject}</code>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof RejectedSchemePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Rejected Scheme',
  component: RejectedSchemePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Non-HTTPS URL schemes are rejected client-side with the message ' +
          '"URL must start with https://". No network request is made. ' +
          '`onInput` receives `{ type: "error" }` with the rejection message.',
      },
    },
  },
  argTypes: {
    urlToReject: {
      control: { type: 'text' },
      description: 'URL with a non-HTTPS scheme to demonstrate rejection.',
    },
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
    },
  },
  args: {
    urlToReject: 'http://example.com/image.jpg',
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof RejectedSchemePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * HTTP scheme rejected — types an `http://` URL and confirms the inline error
 * alert appears and `onInput` receives `{ type: "error" }`.
 */
export const HttpSchemeRejected: Story = {
  args: {
    urlToReject: 'http://example.com/image.jpg',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('URL input field is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
    });

    await step('Type an http:// URL and press Enter', async () => {
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.clear(input);
      await userEvent.type(input, args.urlToReject);
      await userEvent.keyboard('{Enter}');
    });

    await step('Error alert is shown', async () => {
      await waitFor(() => {
        const alert = canvasElement.querySelector('[role="alert"]');
        expect(alert).not.toBeNull();
        expect(alert?.textContent).toMatch(/https/i);
      });
    });

    await step('onInput called with type "error"', async () => {
      await waitFor(() => {
        expect(args.onInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
      });
    });
  },
};

/**
 * Playground — use Controls to try different non-HTTPS schemes and observe
 * the scheme-rejection error message.
 */
export const Playground: Story = {};
