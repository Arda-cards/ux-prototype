/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Unrecognized Text
 *
 * The user pastes arbitrary text that is neither an image URL nor parseable
 * HTML with an image tag. The drop zone shows an inline error and offers the
 * user a chance to retry with different input.
 *
 * Two workflows:
 *   PlainText  — typing random text, pressing Enter shows inline error
 *   PartialUrl — domain-only URL (no https://) is also rejected
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, userEvent } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Sample inputs
// ---------------------------------------------------------------------------

const SAMPLE_PLAIN_TEXT = 'Meeting notes from Monday: review action items and follow up with team.';
const SAMPLE_PARTIAL_URL = 'example.com/photo.jpg';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function UnrecognizedLive() {
  const [inputHistory, setInputHistory] = useState<ImageInput[]>([]);

  const handleInput = (input: ImageInput) => {
    setInputHistory((prev) => [input, ...prev].slice(0, 3));
  };

  const retryReset = () => {
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

      <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={handleInput} />

      <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Try these unrecognized inputs
        </p>
        <ul className="text-xs font-mono text-muted-foreground space-y-1">
          <li>&ldquo;{SAMPLE_PLAIN_TEXT.slice(0, 48)}...&rdquo;</li>
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer
// ---------------------------------------------------------------------------

function UnrecognizedScene({ sceneIndex, typedText }: { sceneIndex: number; typedText: string }) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Drop zone idle
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Unrecognized Text
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone URL field is idle, waiting for input. The user is about to type text that
            is not a valid image URL.
          </p>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </div>
      );

    // Scene 2: Text typed into URL field
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Unrecognized Text
          </h1>
          <p className="text-sm text-muted-foreground">
            The user has typed non-URL text into the URL field:{' '}
            <code>
              &ldquo;{typedText.slice(0, 40)}
              {typedText.length > 40 ? '...' : ''}&rdquo;
            </code>
          </p>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </div>
      );

    // Scene 3: Error message shown
    case 2:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Unrecognized Text
          </h1>
          <p className="text-sm text-muted-foreground">
            After pressing Enter, the drop zone shows an inline error. The field remains editable.
          </p>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
          <div className="rounded border border-destructive p-3" role="alert">
            <p className="text-xs text-destructive font-medium">URL must start with https://</p>
          </div>
        </div>
      );

    // Scene 4: Retry — field editable, user corrects input
    case 3:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Unrecognized Text
          </h1>
          <p className="text-sm text-muted-foreground">
            The URL field stays editable after the error. The user can clear the text and type a
            valid <code>https://</code> URL to retry.
          </p>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
          <p className="text-xs text-muted-foreground">
            The field remains editable — correct the URL and press Enter to retry.
          </p>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// PLAIN TEXT workflow
// ---------------------------------------------------------------------------

const plainTextScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone URL field is idle. The user is about to type arbitrary text that is not an image URL.',
    interaction: 'Click the URL field and type some non-URL text.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Text Typed',
    description:
      'The user has typed plain text ("Meeting notes from Monday...") into the URL field. The drop zone has not yet validated the input.',
    interaction: 'Press Enter to submit the text and trigger validation.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Error Message',
    description:
      'Pressing Enter triggers validation. The text does not start with "https://" so the drop zone shows an inline error: "URL must start with https://". The onInput callback is called with { type: "error" }.',
    interaction: 'Read the error message. The field stays editable for correction.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Retry',
    description:
      'The URL field remains editable and focused after the error. The user can clear the text, type a valid HTTPS URL, and press Enter again to retry without reopening the dialog.',
    interaction: 'The workflow is complete. Clear the field and enter a valid https:// URL.',
  },
];

const {
  Interactive: PlainTextInteractiveStory,
  Stepwise: PlainTextStepwiseStory,
  Automated: PlainTextAutomatedStory,
} = createWorkflowStories({
  scenes: plainTextScenes,
  renderScene: (i) => <UnrecognizedScene sceneIndex={i} typedText={SAMPLE_PLAIN_TEXT} />,
  renderLive: () => <UnrecognizedLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByPlaceholderText(/example\.com\/image/i)).toBeVisible();
    });

    const input = canvas.getByPlaceholderText(/example\.com\/image/i);
    await userEvent.click(input);
    goToScene(1);
    await delay();

    await userEvent.type(input, 'just some random text, not a URL');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(canvas.getByRole('alert')).toBeVisible();
    });
    goToScene(2);
    await delay();

    const alert = canvas.getByRole('alert');
    expect(alert.textContent).toBeTruthy();
    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// PARTIAL URL workflow
// ---------------------------------------------------------------------------

const partialUrlScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone URL field is idle. The user has a partial URL (missing the https:// scheme) that they plan to paste.',
    interaction: 'Click the URL field and type a domain-only URL.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Partial URL Typed',
    description:
      'The user has typed "example.com/photo.jpg" — a valid domain and path but missing the scheme prefix. This is a common mistake when copying from a browser address bar that hides the scheme.',
    interaction: 'Press Enter to submit.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Error Message',
    description:
      'Validation fails because the string does not start with "https://". The inline error appears. The field stays editable so the user can prepend "https://" and retry.',
    interaction: 'Read the error. Add "https://" prefix and retry.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Retry',
    description:
      'The field remains editable. The user can correct the URL by adding the https:// prefix and pressing Enter again.',
    interaction: 'The workflow is complete. Prepend https:// to the URL and retry.',
  },
];

const {
  Interactive: PartialUrlInteractiveStory,
  Stepwise: PartialUrlStepwiseStory,
  Automated: PartialUrlAutomatedStory,
} = createWorkflowStories({
  scenes: partialUrlScenes,
  renderScene: (i) => <UnrecognizedScene sceneIndex={i} typedText={SAMPLE_PARTIAL_URL} />,
  renderLive: () => <UnrecognizedLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await waitFor(() => {
      expect(canvas.getByPlaceholderText(/example\.com\/image/i)).toBeVisible();
    });

    const input = canvas.getByPlaceholderText(/example\.com\/image/i);
    await userEvent.click(input);
    goToScene(1);
    await delay();

    await userEvent.type(input, SAMPLE_PARTIAL_URL);
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(canvas.getByRole('alert')).toBeVisible();
    });
    goToScene(2);
    await delay();

    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Unrecognized Text',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Plain text path
export const PlainTextInteractive: StoryObj = {
  ...PlainTextInteractiveStory,
  name: 'Plain Text (Interactive)',
};

export const PlainTextStepwise: StoryObj = {
  ...PlainTextStepwiseStory,
  name: 'Plain Text (Stepwise)',
};

export const PlainTextAutomated: StoryObj = {
  ...PlainTextAutomatedStory,
  name: 'Plain Text (Automated)',
};

// Partial URL path
export const PartialUrlInteractive: StoryObj = {
  ...PartialUrlInteractiveStory,
  name: 'Partial URL (Interactive)',
};

export const PartialUrlStepwise: StoryObj = {
  ...PartialUrlStepwiseStory,
  name: 'Partial URL (Stepwise)',
};

export const PartialUrlAutomated: StoryObj = {
  ...PartialUrlAutomatedStory,
  name: 'Partial URL (Automated)',
};
