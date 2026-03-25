/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Unrecognized Text
 *
 * The user pastes arbitrary text that is neither an image URL nor parseable
 * HTML with an image tag. The drop zone shows an inline error and offers the
 * user a chance to retry with different input.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, waitFor, userEvent } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Sample non-image text inputs
// ---------------------------------------------------------------------------

const SAMPLE_PLAIN_TEXT = 'Meeting notes from Monday: review action items and follow up with team.';
const SAMPLE_BARCODE = '4006381333931';
const SAMPLE_PARTIAL_URL = 'example.com/photo.jpg';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface UnrecognizedPageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function UnrecognizedPage(args: UnrecognizedPageProps) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);
  const [inputHistory, setInputHistory] = useState<ImageInput[]>([]);

  const handleInput = (input: ImageInput) => {
    setLastInput(input);
    setInputHistory((prev) => [input, ...prev].slice(0, 3));
    args.onInput(input);
  };

  const retryReset = () => {
    setLastInput(null);
    setInputHistory([]);
  };

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: Unrecognized Text
      </h1>
      <p className="text-sm text-muted-foreground">
        Type non-image, non-URL text into the URL field and press <kbd>Enter</kbd>. The drop zone
        validates that the value starts with <code>https://</code> — anything else shows an inline
        error and keeps the field editable for retry.
      </p>

      <ImageDropZone {...args} onInput={handleInput} />

      <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Try these unrecognized inputs
        </p>
        <ul className="text-xs font-mono text-muted-foreground space-y-1">
          <li>&ldquo;{SAMPLE_PLAIN_TEXT.slice(0, 48)}...&rdquo;</li>
          <li>&ldquo;{SAMPLE_BARCODE}&rdquo;</li>
          <li>&ldquo;{SAMPLE_PARTIAL_URL}&rdquo;</li>
        </ul>
        {inputHistory.length > 0 && (
          <button
            type="button"
            data-testid="retry-reset-btn"
            onClick={retryReset}
            className="mt-1 text-xs text-primary underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0"
          >
            Clear history
          </button>
        )}
      </div>

      {inputHistory.length > 0 && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="text-sm font-semibold">Input history (latest first)</h2>
          {inputHistory.map((input, i) => (
            <div
              key={i}
              className={`rounded border p-2 text-xs font-mono ${
                input.type === 'error'
                  ? 'border-destructive text-destructive'
                  : 'border-border text-foreground'
              }`}
            >
              <pre className="whitespace-pre-wrap">{JSON.stringify(input, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      {lastInput?.type === 'error' && (
        <p className="text-xs text-muted-foreground">
          The field remains editable — correct the URL and press Enter to retry.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof UnrecognizedPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Unrecognized Text',
  component: UnrecognizedPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'When the user enters text that is not an `https://` URL, the drop zone ' +
          'emits `{ type: "error" }` and renders an inline alert. ' +
          'The field stays editable so the user can correct the input and retry.',
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
type Story = StoryObj<typeof UnrecognizedPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Plain text entry — typing ordinary text and pressing Enter triggers the
 * validation error ("URL must start with https://").
 */
export const PlainText: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('URL field is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
    });

    await step('Type non-URL plain text', async () => {
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.click(input);
      await userEvent.type(input, 'just some random text, not a URL');
    });

    await step('Press Enter triggers inline error', async () => {
      await userEvent.keyboard('{Enter}');
      await waitFor(() => {
        expect(canvas.getByRole('alert')).toBeVisible();
      });
    });

    await step('Error message is shown', async () => {
      const alert = canvas.getByRole('alert');
      expect(alert.textContent).toBeTruthy();
    });
  },
};

/**
 * Partial URL (missing scheme) — "example.com/image.jpg" fails because it
 * does not start with "https://".
 */
export const PartialUrl: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Type partial URL without scheme', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.click(input);
      await userEvent.type(input, SAMPLE_PARTIAL_URL);
      await userEvent.keyboard('{Enter}');
    });

    await step('Inline error appears', async () => {
      await waitFor(() => {
        expect(canvas.getByRole('alert')).toBeVisible();
      });
    });
  },
};

/** Idle state — empty field, no error shown. */
export const Idle: Story = {};
