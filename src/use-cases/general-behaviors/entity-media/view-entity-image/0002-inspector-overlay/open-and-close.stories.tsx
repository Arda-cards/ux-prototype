/**
 * GEN-MEDIA-0003::0002.FS — Image Inspector Overlay
 * Scene: Open and Close
 *
 * Renders a clickable image thumbnail that opens the ImageInspectorOverlay in a
 * modal. All three dismiss methods are exercised: Escape key, click-outside,
 * and the close button.
 *
 * Three story variants via createWorkflowStories:
 *   OpenAndCloseInteractive  — live wrapper for manual exploration
 *   OpenAndCloseStepwise     — static snapshots with scene annotations
 *   OpenAndCloseAutomated    — automated play driving the live wrapper
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

function OpenAndCloseLive() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Open and Close</h1>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        Click the thumbnail to open the inspector overlay. Dismiss using Escape, clicking the
        backdrop, or the X close button.
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

/** Reusable overlay illustration for static scenes. */
function OverlayIllustration({ showOverlay }: { showOverlay: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Open and Close</h1>
      <button className="cursor-pointer rounded border overflow-hidden">
        <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
      </button>
      {showOverlay && (
        <div className="border border-border rounded-lg p-6 bg-background shadow-xl max-w-md w-full flex flex-col items-center gap-4">
          <div className="flex w-full justify-end">
            <Button variant="ghost" size="icon" aria-label="Close">
              &#10005;
            </Button>
          </div>
          <img
            src={MOCK_ITEM_IMAGE}
            alt="Full size preview"
            className="max-h-64 object-contain rounded"
          />
        </div>
      )}
    </div>
  );
}

function OpenAndCloseScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Thumbnail visible, overlay closed
    case 0:
      return <OverlayIllustration showOverlay={false} />;

    // Scene 1: Inspector open
    case 1:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Open and Close</h1>
          <button className="cursor-pointer rounded border overflow-hidden opacity-50">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
          <div className="border border-border rounded-lg p-6 bg-background shadow-xl max-w-md w-full flex flex-col items-center gap-4">
            <div className="flex w-full justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Image Inspector</span>
              <Button variant="ghost" size="icon" aria-label="Close">
                &#10005;
              </Button>
            </div>
            <img
              src={MOCK_ITEM_IMAGE}
              alt="Full size preview"
              className="max-h-64 object-contain rounded"
            />
          </div>
        </div>
      );

    // Scene 2: Dismissed via Escape — back to thumbnail
    case 2:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Open and Close</h1>
          <p className="text-xs text-muted-foreground border border-border rounded px-3 py-1">
            Dismissed via Escape key
          </p>
          <button className="cursor-pointer rounded border overflow-hidden">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
        </div>
      );

    // Scene 3: Re-opened for backdrop dismiss
    case 3:
      return <OverlayIllustration showOverlay />;

    // Scene 4: Dismissed via backdrop
    case 4:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Open and Close</h1>
          <p className="text-xs text-muted-foreground border border-border rounded px-3 py-1">
            Dismissed via backdrop click
          </p>
          <button className="cursor-pointer rounded border overflow-hidden">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
        </div>
      );

    // Scene 5: Re-opened for close button
    case 5:
      return <OverlayIllustration showOverlay />;

    // Scene 6: Dismissed via close button
    case 6:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Open and Close</h1>
          <p className="text-xs text-muted-foreground border border-border rounded px-3 py-1">
            Dismissed via close button &#10003;
          </p>
          <button className="cursor-pointer rounded border overflow-hidden">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 7 \u2014 Thumbnail Visible',
    description:
      'A clickable thumbnail is shown. The ImageInspectorOverlay is closed. Clicking the thumbnail will open the full-size inspector.',
    interaction: 'Click the thumbnail to open the inspector overlay.',
  },
  {
    title: 'Scene 2 of 7 \u2014 Inspector Open',
    description:
      'The overlay is open. The full-size image is displayed in a modal dialog. A close button (X) is visible in the top-right corner. Escape, backdrop click, or the close button will dismiss it.',
    interaction: 'Press Escape to dismiss the overlay.',
  },
  {
    title: 'Scene 3 of 7 \u2014 Dismissed via Escape',
    description:
      'The Escape key was pressed. The overlay dismissed and the full-size image is no longer in the DOM. The thumbnail is still visible.',
    interaction: 'Click the thumbnail to re-open the overlay.',
  },
  {
    title: 'Scene 4 of 7 \u2014 Re-opened',
    description: 'The overlay is open again. The full-size image is visible.',
    interaction: 'Click the backdrop (outside the image) to dismiss.',
  },
  {
    title: 'Scene 5 of 7 \u2014 Dismissed via Backdrop',
    description:
      'The dialog overlay (backdrop) was clicked. The overlay dismissed — the full-size image is gone.',
    interaction: 'Click the thumbnail to re-open the overlay once more.',
  },
  {
    title: 'Scene 6 of 7 \u2014 Re-opened Again',
    description: 'The overlay is open a third time. The full-size image is visible.',
    interaction: 'Click the X close button to dismiss.',
  },
  {
    title: 'Scene 7 of 7 \u2014 Dismissed via Close Button',
    description:
      'The close button (X) was clicked. All three dismiss methods have been exercised: Escape, backdrop, and close button.',
    interaction: 'The workflow is complete.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: OpenAndCloseInteractiveStory,
  Stepwise: OpenAndCloseStepwiseStory,
  Automated: OpenAndCloseAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <OpenAndCloseScene sceneIndex={i} />,
  renderLive: () => <OpenAndCloseLive />,
  delayMs: 1500,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Step 1: Open overlay by clicking thumbnail
    const thumbnail = screen.getByTestId('open-thumbnail');
    await userEvent.click(thumbnail);

    await waitFor(
      () => {
        const overlayImage = screen.getByAltText('Full size preview');
        expect(overlayImage).toBeVisible();
      },
      { timeout: 5000 },
    );

    goToScene(1);
    await delay();

    // Step 2: Dismiss via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(
      () => {
        expect(screen.queryByAltText('Full size preview')).toBeNull();
      },
      { timeout: 3000 },
    );

    goToScene(2);
    await delay();

    // Step 3: Re-open
    await userEvent.click(thumbnail);
    await waitFor(
      () => {
        expect(screen.getByAltText('Full size preview')).toBeVisible();
      },
      { timeout: 5000 },
    );

    goToScene(3);
    await delay();

    // Step 4: Dismiss via backdrop click
    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement | null;
    if (overlay) {
      await userEvent.click(overlay);
    }
    await waitFor(
      () => {
        expect(screen.queryByAltText('Full size preview')).toBeNull();
      },
      { timeout: 3000 },
    );

    goToScene(4);
    await delay();

    // Step 5: Re-open again
    await userEvent.click(thumbnail);
    await waitFor(
      () => {
        expect(screen.getByAltText('Full size preview')).toBeVisible();
      },
      { timeout: 5000 },
    );

    goToScene(5);
    await delay();

    // Step 6: Dismiss via close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    await waitFor(
      () => {
        expect(screen.queryByAltText('Full size preview')).toBeNull();
      },
      { timeout: 3000 },
    );

    goToScene(6);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0002 Inspector Overlay/Open and Close',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const OpenAndCloseInteractive: StoryObj = {
  ...OpenAndCloseInteractiveStory,
  name: 'Open and Close (Interactive)',
};

export const OpenAndCloseStepwise: StoryObj = {
  ...OpenAndCloseStepwiseStory,
  name: 'Open and Close (Stepwise)',
};

export const OpenAndCloseAutomated: StoryObj = {
  ...OpenAndCloseAutomatedStory,
  name: 'Open and Close (Automated)',
};
