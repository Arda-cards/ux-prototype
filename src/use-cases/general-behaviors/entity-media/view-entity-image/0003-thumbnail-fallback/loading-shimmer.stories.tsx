/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: Loading Shimmer
 *
 * Renders ImageDisplay with a blob URL that never resolves, keeping the
 * skeleton shimmer permanently visible for inspection.
 *
 * Three story variants via createWorkflowStories:
 *   LoadingShimmerInteractive  — live component for manual exploration
 *   LoadingShimmerStepwise     — static snapshots with scene annotations
 *   LoadingShimmerAutomated    — automated play verifying the shimmer state
 *
 * The existing SlowLoad static story is preserved alongside the workflow exports.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { MOCK_LARGE_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
//
// A blob URL created from empty content — the browser starts loading but
// never fires onLoad or onError, so the skeleton stays visible indefinitely.
// ---------------------------------------------------------------------------

function LoadingShimmerLive() {
  const [stuckUrl] = React.useState(() => URL.createObjectURL(new Blob([])));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={stuckUrl}
          entityTypeDisplayName="Item"
          propertyDisplayName="Product Image"
        />
      </div>
      <p className="text-xs text-muted-foreground max-w-48 text-center">
        Skeleton shimmer shown while image is loading. Uses a Blob URL that never resolves to keep
        this state visible. In production, this transitions to the loaded image.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function LoadingShimmerScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Initial state — skeleton shimmer visible
    case 0:
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded bg-muted border border-border animate-pulse" />
          <p className="text-xs text-muted-foreground max-w-48 text-center">
            ImageDisplay mounted with an unresolvable Blob URL. Skeleton shimmer is shown while the
            image load is pending.
          </p>
        </div>
      );

    // Scene 1: Verified state — shimmer confirmed, no error badge
    case 1:
    default:
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded bg-muted border border-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
              [shimmer]
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-48 text-center">
            &#10003; Skeleton shimmer visible &#8226; &#10003; No error badge &#8226; &#10003;
            ImageDisplay container present
          </p>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 2 \u2014 Loading State',
    description:
      'ImageDisplay is mounted with a Blob URL that never resolves. The skeleton shimmer ([data-slot="skeleton"]) is visible while the image load is pending. No error badge is shown.',
    interaction: 'Wait for the shimmer to confirm the loading state is rendered.',
  },
  {
    title: 'Scene 2 of 2 \u2014 Shimmer Verified',
    description:
      'The skeleton shimmer is confirmed visible. No error badge is present (the load has not failed \u2014 it is still pending). The ImageDisplay container is rendered correctly.',
    interaction:
      'The workflow is complete. In production this state briefly transitions to loaded.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: LoadingShimmerInteractiveStory,
  Stepwise: LoadingShimmerStepwiseStory,
  Automated: LoadingShimmerAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <LoadingShimmerScene sceneIndex={i} />,
  renderLive: () => <LoadingShimmerLive />,
  delayMs: 1500,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Skeleton shimmer is visible
    const skeleton = document.querySelector('[data-slot="skeleton"]');
    expect(skeleton).not.toBeNull();
    expect(skeleton).toBeVisible();

    // ImageDisplay container is present
    const display = document.querySelector('[data-slot="image-display"]');
    expect(display).not.toBeNull();
    expect(display).toBeVisible();

    // No error badge during loading
    const badge = document.querySelector('[aria-label="Image failed to load"]');
    expect(badge).toBeNull();

    goToScene(1);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Slow-loading variant — static story preserved alongside workflow exports
// ---------------------------------------------------------------------------

function SlowLoadingDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={MOCK_LARGE_IMAGE}
          entityTypeDisplayName="Item"
          propertyDisplayName="Product Image"
        />
      </div>
      <p className="text-xs text-muted-foreground max-w-48 text-center">
        Large image (2048&#215;2048) — shimmer visible briefly before the image loads.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/Loading Shimmer',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const LoadingShimmerInteractive: StoryObj = {
  ...LoadingShimmerInteractiveStory,
  name: 'Loading Shimmer (Interactive)',
};

export const LoadingShimmerStepwise: StoryObj = {
  ...LoadingShimmerStepwiseStory,
  name: 'Loading Shimmer (Stepwise)',
};

export const LoadingShimmerAutomated: StoryObj = {
  ...LoadingShimmerAutomatedStory,
  name: 'Loading Shimmer (Automated)',
};

/** Large remote image — shimmer briefly visible then transitions to loaded. */
export const SlowLoad: StoryObj = {
  render: () => <SlowLoadingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Uses a 2048&#215;2048 picsum image to demonstrate the shimmer-to-loaded transition in a real network context.',
      },
    },
  },
};
