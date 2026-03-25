/**
 * GEN-MEDIA-0001::0004.FS — URL Scheme and Reachability Validation
 * Scene: Valid HTTPS
 *
 * Demonstrates that a valid HTTPS URL passes the scheme check and is emitted
 * as `{ type: 'url', url }`. The reviewer can type any HTTPS URL and press
 * Enter to observe the success state.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_EXTERNAL_URL,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface ValidHttpsPageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  url: string;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function ValidHttpsPage({ url, onInput, onDismiss, acceptedFormats }: ValidHttpsPageProps) {
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

      <p className="text-xs text-muted-foreground">
        Suggested URL to try: <code className="break-all">{url}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ValidHttpsPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0004 URL Validation/Valid HTTPS',
  component: ValidHttpsPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A valid `https://` URL passes the scheme check and is emitted as ' +
          '`{ type: "url", url }`. Use the Controls panel to try different URLs.',
      },
    },
  },
  argTypes: {
    url: {
      control: { type: 'text' },
      description: 'HTTPS URL to enter into the drop zone URL field.',
    },
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
    },
  },
  args: {
    url: MOCK_EXTERNAL_URL,
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ValidHttpsPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Playground — use Controls to enter any HTTPS URL and verify that the drop
 * zone emits `{ type: "url" }` without an error message.
 */
export const Playground: Story = {};

/**
 * Automated check: types the mock HTTPS URL into the URL field, presses Enter,
 * and confirms no error alert is shown and the emitted-input panel appears.
 */
export const ValidUrlAccepted: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('URL input field is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
    });

    await step('Type a valid HTTPS URL and press Enter', async () => {
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.clear(input);
      await userEvent.type(input, args.url);
      await userEvent.keyboard('{Enter}');
    });

    await step('No error alert is displayed', async () => {
      const alert = canvasElement.querySelector('[role="alert"]');
      expect(alert).toBeNull();
    });

    await step('onInput called with type "url"', async () => {
      await waitFor(() => {
        expect(args.onInput).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'url', url: args.url }),
        );
      });
    });
  },
};
