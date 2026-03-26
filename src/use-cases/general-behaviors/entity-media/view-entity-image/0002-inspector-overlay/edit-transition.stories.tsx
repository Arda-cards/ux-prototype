/**
 * GEN-MEDIA-0003::0002.FS — Image Inspector Overlay
 * Scene: Edit Transition
 *
 * Renders the ImageInspectorOverlay with an onEdit callback. The Edit button is
 * visible in the overlay footer. The play function opens the overlay, clicks
 * the Edit button, verifies the overlay closes and onEdit was called.
 *
 * Three story variants via createWorkflowStories:
 *   EditTransitionInteractive  — live wrapper for manual exploration
 *   EditTransitionStepwise     — static snapshots with scene annotations
 *   EditTransitionAutomated    — automated play driving the live wrapper
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, screen } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { MOCK_ITEM_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import { Button } from '@/components/canary/primitives/button';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

const onEditSpy = fn();

function EditTransitionLive() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Edit Transition</h1>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        Click the thumbnail to open the inspector. Click the Edit button to transition to the edit
        flow — the overlay closes and the callback fires.
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
        onEdit={() => {
          onEditSpy();
          setOpen(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function EditTransitionScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Thumbnail visible
    case 0:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Edit Transition</h1>
          <p className="text-sm text-muted-foreground max-w-sm text-center">
            A clickable thumbnail is shown. The inspector overlay is closed.
          </p>
          <button className="cursor-pointer rounded border overflow-hidden">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
        </div>
      );

    // Scene 1: Inspector open with Edit button visible
    case 1:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Edit Transition</h1>
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
              className="max-h-56 object-contain rounded"
            />
            <div className="flex w-full justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>
        </div>
      );

    // Scene 2: Edit button clicked — inspector closes, dialog opens
    case 2:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold tracking-tight">GEN-MEDIA-0003 — Edit Transition</h1>
          <p className="text-xs text-muted-foreground border border-border rounded px-3 py-1">
            &#10003; Inspector closed &#8226; onEdit callback fired
          </p>
          <button className="cursor-pointer rounded border overflow-hidden">
            <img src={MOCK_ITEM_IMAGE} alt="Item thumbnail" className="w-24 h-24 object-cover" />
          </button>
          <div className="border border-border rounded-lg p-4 bg-background max-w-sm w-full text-center">
            <p className="text-sm text-muted-foreground">
              Edit flow would open here (e.g. ImageUploadDialog).
            </p>
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
      'A clickable thumbnail is shown. The ImageInspectorOverlay is closed. Because onEdit is provided, an Edit button will appear in the overlay footer when open.',
    interaction: 'Click the thumbnail to open the inspector overlay.',
  },
  {
    title: 'Scene 2 of 3 \u2014 Inspector Open, Edit Button Visible',
    description:
      'The overlay is open. The full-size image is displayed and an Edit button is visible in the footer. Clicking Edit will call onEdit and close the overlay, signalling to the parent to open the edit dialog.',
    interaction: 'Click the Edit button to transition to the edit flow.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Inspector Closed, Edit Flow Initiated',
    description:
      'The Edit button was clicked. The overlay has closed and the onEdit callback was called once. The parent component would now open the image upload/edit dialog.',
    interaction: 'The workflow is complete. Click the thumbnail to start again.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: EditTransitionInteractiveStory,
  Stepwise: EditTransitionStepwiseStory,
  Automated: EditTransitionAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <EditTransitionScene sceneIndex={i} />,
  renderLive: () => <EditTransitionLive />,
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
        expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
      },
      { timeout: 5000 },
    );

    goToScene(1);
    await delay();

    // Step 2: Click Edit button
    const editButton = screen.getByRole('button', { name: 'Edit' });
    await userEvent.click(editButton);

    await waitFor(
      () => {
        expect(screen.queryByAltText('Full size preview')).toBeNull();
      },
      { timeout: 3000 },
    );

    expect(onEditSpy).toHaveBeenCalledTimes(1);

    goToScene(2);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0002 Inspector Overlay/Edit Transition',
  args: {
    onEdit: fn(),
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const EditTransitionInteractive: StoryObj = {
  ...EditTransitionInteractiveStory,
  name: 'Edit Transition (Interactive)',
};

export const EditTransitionStepwise: StoryObj = {
  ...EditTransitionStepwiseStory,
  name: 'Edit Transition (Stepwise)',
};

export const EditTransitionAutomated: StoryObj = {
  ...EditTransitionAutomatedStory,
  name: 'Edit Transition (Automated)',
};
