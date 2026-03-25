/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: URL Entry
 *
 * User types or pastes an HTTPS URL into the text field and presses Enter.
 * The drop zone validates that the URL starts with "https://" and emits
 * `{ type: "url", url }` on success, or `{ type: "error" }` for invalid input.
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
// Page wrapper
// ---------------------------------------------------------------------------

interface UrlEntryPageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function UrlEntryPage(args: UrlEntryPageProps) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: URL Entry
      </h1>
      <p className="text-sm text-muted-foreground">
        Type or paste a URL into the text field below, then press <kbd>Enter</kbd>. Only{' '}
        <code>https://</code> URLs are accepted — any other prefix produces an inline error message.
      </p>

      <ImageDropZone
        {...args}
        onInput={(input) => {
          setLastInput(input);
          args.onInput(input);
        }}
      />

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

      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Try these:</strong>
        </p>
        <ul className="mt-1 space-y-1 text-xs font-mono text-muted-foreground">
          <li>&#x2714; {MOCK_EXTERNAL_URL}</li>
          <li>&#x2718; http://example.com/image.jpg</li>
          <li>&#x2718; /relative/path/image.png</li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof UrlEntryPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/URL Entry',
  component: UrlEntryPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Type or paste a URL in the text field and press Enter. ' +
          'Only `https://` URLs are routed as `{ type: "url" }`. ' +
          'Non-HTTPS input emits `{ type: "error" }` and shows an inline message.',
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
type Story = StoryObj<typeof UrlEntryPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Valid HTTPS URL — typed into the field and submitted with Enter.
 * Verifies that `{ type: "url" }` is emitted and displayed.
 */
export const ValidUrl: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('URL input field is visible', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
    });

    await step('Type a valid HTTPS URL', async () => {
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.click(input);
      await userEvent.type(input, MOCK_EXTERNAL_URL);
    });

    await step('Press Enter to submit the URL', async () => {
      await userEvent.keyboard('{Enter}');
      await waitFor(() => {
        expect(canvas.getByText(/emitted input/i)).toBeVisible();
      });
    });

    await step('Emitted input type is "url"', async () => {
      const pre = canvasElement.querySelector('pre');
      expect(pre?.textContent).toContain('"type": "url"');
      expect(pre?.textContent).toContain('https://');
    });
  },
};

/**
 * Invalid URL (http://) — shows inline error and emits `{ type: "error" }`.
 */
export const InvalidHttpUrl: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Type an http:// URL', async () => {
      await waitFor(() => {
        expect(canvas.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      });
      const input = canvas.getByPlaceholderText(/paste an image url/i);
      await userEvent.click(input);
      await userEvent.type(input, 'http://example.com/image.jpg');
    });

    await step('Press Enter shows validation error', async () => {
      await userEvent.keyboard('{Enter}');
      await waitFor(() => {
        expect(canvas.getByRole('alert')).toBeVisible();
      });
    });

    await step('Error message mentions https', async () => {
      const alert = canvas.getByRole('alert');
      expect(alert.textContent?.toLowerCase()).toContain('https');
    });
  },
};

/** Idle state — empty URL field ready for input. */
export const Idle: Story = {};
