/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: URL Entry
 *
 * User types or pastes an HTTPS URL into the text field and presses Enter.
 * The drop zone validates that the URL starts with "https://" and emits
 * `{ type: "url", url }` on success, or `{ type: "error" }` for invalid input.
 *
 * Two workflows:
 *   ValidUrl        — HTTPS URL accepted, emits { type: "url" }
 *   InvalidHttpUrl  — http:// URL rejected, emits { type: "error" }
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
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function UrlEntryLive() {
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
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={(input) => {
          setLastInput(input);
        }}
        onDismiss={() => {}}
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
// Static scene renderer
// ---------------------------------------------------------------------------

function UrlEntryScene({
  sceneIndex,
  typedUrl,
  isValid,
}: {
  sceneIndex: number;
  typedUrl: string;
  isValid: boolean;
}) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Drop zone idle — empty URL field
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: URL Entry
          </h1>
          <p className="text-sm text-muted-foreground">
            The URL field is empty and ready for input. The user will type or paste a URL.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: URL typed — field populated
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: URL Entry
          </h1>
          <p className="text-sm text-muted-foreground">
            The user has typed: <code>{typedUrl}</code>. They are about to press Enter or click Go.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 3: Validation
    case 2:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: URL Entry
          </h1>
          <p className="text-sm text-muted-foreground">
            Validation checks whether the URL starts with <code>https://</code>:
          </p>
          <div
            className={`rounded-lg border p-3 ${isValid ? 'border-border' : 'border-destructive'}`}
          >
            <p
              className={`text-xs font-mono ${isValid ? 'text-muted-foreground' : 'text-destructive'}`}
            >
              {isValid
                ? `"${typedUrl}" \u2713 starts with https://`
                : `"${typedUrl}" \u2718 does not start with https://`}
            </p>
          </div>
        </div>
      );

    // Scene 4: Result — accepted or rejected
    case 3:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: URL Entry
          </h1>
          {isValid ? (
            <div className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify({ type: 'url', url: typedUrl }, null, 2)}
              </pre>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-destructive p-4">
                <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
                <pre className="text-xs font-mono text-destructive whitespace-pre-wrap">
                  {JSON.stringify(
                    { type: 'error', message: 'URL must start with https://' },
                    null,
                    2,
                  )}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                The field stays editable. The user can correct the URL and retry.
              </p>
            </>
          )}
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// VALID URL workflow
// ---------------------------------------------------------------------------

const validUrlScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The URL entry field in the ImageDropZone is empty and ready. The user will type or paste a valid HTTPS image URL.',
    interaction: 'Click the URL field and type or paste an https:// URL.',
  },
  {
    title: 'Scene 2 of 4 \u2014 URL Typed',
    description: `The user has entered "${MOCK_EXTERNAL_URL}" — a valid HTTPS image URL. The Go button is enabled.`,
    interaction: 'Press Enter or click the Go button to submit the URL.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Validation Passes',
    description:
      'The URL starts with "https://" so it passes the scheme check. The app emits the URL input.',
    interaction: 'Validation passes. The URL is routed to the upstream handler.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Accepted',
    description:
      'The emitted input is { type: "url", url }. The upstream handler will check reachability and, if valid, open the crop editor with the remote image.',
    interaction: 'The workflow is complete. The image URL proceeds to the crop editor.',
  },
];

const {
  Interactive: ValidUrlInteractiveStory,
  Stepwise: ValidUrlStepwiseStory,
  Automated: ValidUrlAutomatedStory,
} = createWorkflowStories({
  scenes: validUrlScenes,
  renderScene: (i) => <UrlEntryScene sceneIndex={i} typedUrl={MOCK_EXTERNAL_URL} isValid />,
  renderLive: () => <UrlEntryLive />,
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

    await userEvent.type(input, MOCK_EXTERNAL_URL);
    goToScene(2);
    await delay();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByText(/emitted input/i)).toBeVisible();
    });

    const pre = canvas
      .getByText(/emitted input/i)
      .closest('div')
      ?.querySelector('pre');
    if (pre) {
      expect(pre.textContent).toContain('"type": "url"');
      expect(pre.textContent).toContain('https://');
    }
    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// INVALID HTTP URL workflow
// ---------------------------------------------------------------------------

const INVALID_HTTP_URL = 'http://example.com/image.jpg';

const invalidHttpUrlScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The URL entry field is empty. The user is about to type an http:// URL (missing the S in HTTPS).',
    interaction: 'Click the URL field and type an http:// URL.',
  },
  {
    title: 'Scene 2 of 4 \u2014 HTTP URL Typed',
    description: `The user has entered "${INVALID_HTTP_URL}" — an HTTP URL without TLS. Only HTTPS URLs are accepted to prevent mixed-content issues.`,
    interaction: 'Press Enter to submit.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Validation Fails',
    description:
      'The URL starts with "http://" not "https://". Validation fails. An inline error is shown below the field: "URL must start with https://".',
    interaction: 'Read the error. Correct the URL by changing http to https.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Error Shown',
    description:
      'The emitted input is { type: "error" }. The URL field stays editable. The user can prepend "https://" and resubmit without reopening the dialog.',
    interaction: 'The workflow is complete. Fix the URL scheme and retry.',
  },
];

const {
  Interactive: InvalidHttpUrlInteractiveStory,
  Stepwise: InvalidHttpUrlStepwiseStory,
  Automated: InvalidHttpUrlAutomatedStory,
} = createWorkflowStories({
  scenes: invalidHttpUrlScenes,
  renderScene: (i) => <UrlEntryScene sceneIndex={i} typedUrl={INVALID_HTTP_URL} isValid={false} />,
  renderLive: () => <UrlEntryLive />,
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

    await userEvent.type(input, INVALID_HTTP_URL);
    goToScene(2);
    await delay();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByRole('alert')).toBeVisible();
    });

    const alert = canvas.getByRole('alert');
    expect(alert.textContent?.toLowerCase()).toContain('https');
    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/URL Entry',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Valid URL path
export const ValidUrlInteractive: StoryObj = {
  ...ValidUrlInteractiveStory,
  name: 'Valid URL (Interactive)',
};

export const ValidUrlStepwise: StoryObj = {
  ...ValidUrlStepwiseStory,
  name: 'Valid URL (Stepwise)',
};

export const ValidUrlAutomated: StoryObj = {
  ...ValidUrlAutomatedStory,
  name: 'Valid URL (Automated)',
};

// Invalid HTTP URL path
export const InvalidHttpUrlInteractive: StoryObj = {
  ...InvalidHttpUrlInteractiveStory,
  name: 'Invalid HTTP URL (Interactive)',
};

export const InvalidHttpUrlStepwise: StoryObj = {
  ...InvalidHttpUrlStepwiseStory,
  name: 'Invalid HTTP URL (Stepwise)',
};

export const InvalidHttpUrlAutomated: StoryObj = {
  ...InvalidHttpUrlAutomatedStory,
  name: 'Invalid HTTP URL (Automated)',
};
