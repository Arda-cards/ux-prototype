/**
 * GEN-MEDIA-0003::0002.FS — Image Inspector Overlay
 * Scene: No Edit
 *
 * Renders the ImageInspectorOverlay WITHOUT an onEdit callback. No Edit button
 * is rendered — only read-only inspection is available.
 *
 * Three story variants via createWorkflowStories:
 *   NoEditInteractive  — live wrapper for manual exploration
 *   NoEditStepwise     — static snapshots with scene annotations
 *   NoEditAutomated    — automated play driving the live wrapper
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { MOCK_ITEM_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import { Button } from '@/components/canary/primitives/button';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function NoEditLive() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — No Edit (Read-Only)</h1>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        Click the thumbnail to open the inspector in read-only mode. No Edit button is rendered —
        the overlay only allows viewing and dismissal.
      </p>
      <button
        data-testid="open-thumbnail"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded border overflow-hidden focus-visible:outline-none focus-visible:ring-2"
        aria-label="Open image inspector"
      >
        <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
      </button>
      <ImageInspectorOverlay
        imageUrl={MOCK_ITEM_IMAGE}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function NoEditScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Thumbnail visible, overlay closed
    case 0:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0003 — No Edit (Read-Only)
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm text-center">
            A clickable thumbnail is shown. No onEdit prop is provided — the overlay will open in
            read-only mode.
          </p>
          <button className="cursor-pointer rounded border overflow-hidden">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
        </div>
      );

    // Scene 1: Inspector open — read-only, no Edit button
    case 1:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0003 — No Edit (Read-Only)
          </h1>
          <button className="cursor-pointer rounded border overflow-hidden opacity-50">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
          <div className="border border-border rounded-lg p-6 bg-background shadow-xl max-w-md w-full flex flex-col items-center gap-4">
            <div className="flex w-full justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Image Inspector (Read-Only)
              </span>
              <Button variant="ghost" size="icon" aria-label="Close">
                &#10005;
              </Button>
            </div>
            <img
              src={MOCK_ITEM_IMAGE}
              alt="Full size preview"
              className="max-h-56 object-contain rounded"
            />
            <p className="text-xs text-muted-foreground italic">
              No Edit button — onEdit prop not provided.
            </p>
          </div>
        </div>
      );

    // Scene 2: Read-only mode verified
    case 2:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0003 — No Edit (Read-Only)
          </h1>
          <button className="cursor-pointer rounded border overflow-hidden opacity-50">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
          <div className="border border-border rounded-lg p-6 bg-background shadow-xl max-w-md w-full flex flex-col items-center gap-4">
            <div className="flex w-full justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Image Inspector (Read-Only)
              </span>
              <Button variant="ghost" size="icon" aria-label="Close">
                &#10005;
              </Button>
            </div>
            <img
              src={MOCK_ITEM_IMAGE}
              alt="Full size preview"
              className="max-h-56 object-contain rounded"
            />
            <div className="flex w-full items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs text-green-700 dark:text-green-400">
                &#10003; No Edit button rendered &#8226; &#10003; Close button present
              </span>
            </div>
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Thumbnail Visible',
    description:
      'A clickable thumbnail is shown. The ImageInspectorOverlay will open in read-only mode because no onEdit prop is provided.',
    interaction: 'Click the thumbnail to open the inspector overlay.',
  },
  {
    title: 'Scene 2 of 3 \u2014 Inspector Open (Read-Only)',
    description:
      'The overlay is open. The full-size image is displayed. No Edit button is rendered in the footer — the overlay only allows viewing. The close button (X) is still available.',
    interaction: 'Verify that no Edit button is present. The inspector is read-only.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Read-Only Mode Verified',
    description:
      'Confirmed: no Edit button exists and the close button is visible. The inspector shows the image without any edit affordance, appropriate for users without edit permissions.',
    interaction: 'The workflow is complete.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: NoEditInteractiveStory,
  Stepwise: NoEditStepwiseStory,
  Automated: NoEditAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <NoEditScene sceneIndex={i} />,
  renderLive: () => <NoEditLive />,
  delayMs: 1500,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Step 1: Open overlay
    const thumbnail = screen.getByTestId('open-thumbnail');
    await userEvent.click(thumbnail);

    await waitFor(
      () => {
        expect(screen.getByAltText('Full size preview')).toBeVisible();
      },
      { timeout: 5000 },
    );

    goToScene(1);
    await delay();

    // Step 2: Verify no Edit button and close button is present
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();

    goToScene(2);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0002 Inspector Overlay/No Edit',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const NoEditInteractive: StoryObj = {
  ...NoEditInteractiveStory,
  name: 'No Edit (Interactive)',
};

export const NoEditStepwise: StoryObj = {
  ...NoEditStepwiseStory,
  name: 'No Edit (Stepwise)',
};

export const NoEditAutomated: StoryObj = {
  ...NoEditAutomatedStory,
  name: 'No Edit (Automated)',
};
