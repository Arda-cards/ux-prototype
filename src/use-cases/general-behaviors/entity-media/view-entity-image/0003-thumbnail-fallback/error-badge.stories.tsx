/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: Error Badge
 *
 * Renders ImageDisplay with a broken/unreachable URL, verifying that a muted
 * alert icon is shown centred in the frame.
 *
 * Three story variants via createWorkflowStories:
 *   ErrorBadgeInteractive  — live component for manual exploration
 *   ErrorBadgeStepwise     — static snapshots with scene annotations
 *   ErrorBadgeAutomated    — automated play verifying the error state
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { TriangleAlert } from 'lucide-react';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function ErrorBadgeLive() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={MOCK_BROKEN_IMAGE}
          entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
          propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
        />
      </div>
      <p className="text-xs text-muted-foreground max-w-48 text-center">
        Broken image URL — initials placeholder shown with error badge overlay.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function ErrorBadgeScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Initial state — component mounted, image loading
    case 0:
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded bg-muted border border-border flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Loading&#8230;</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-48 text-center">
            ImageDisplay mounted with broken URL. Browser is attempting to load the image.
          </p>
        </div>
      );

    // Scene 1: Error state verified — centred alert icon
    case 1:
    default:
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded bg-muted border border-border flex items-center justify-center relative overflow-hidden">
            <TriangleAlert
              role="img"
              aria-label="Image failed to load"
              className="w-1/3 h-1/3 max-w-8 max-h-8 text-muted-foreground [&>path:first-child]:fill-current [&>path:not(:first-child)]:stroke-background"
            />
          </div>
          <p className="text-xs text-muted-foreground max-w-48 text-center">
            &#10003; Alert icon centred in the frame &#8226; &#10003; No alarmist red badge &#8226;
            &#10003; Broken image not rendered
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
    title: 'Scene 1 of 2 \u2014 Initial State',
    description:
      'ImageDisplay is mounted with a broken/unreachable URL. The browser attempts to load the image. A skeleton shimmer may appear briefly while the image fetch is in progress.',
    interaction: 'Wait for the image load to fail and the error state to render.',
  },
  {
    title: 'Scene 2 of 2 \u2014 Error Badge Verified',
    description:
      'The image failed to load. ImageDisplay shows the initials placeholder ("I" for "Item") with an error badge in the bottom-right corner. The broken img element is invisible (CSS class applied). No skeleton shimmer is shown.',
    interaction: 'The workflow is complete.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: ErrorBadgeInteractiveStory,
  Stepwise: ErrorBadgeStepwiseStory,
  Automated: ErrorBadgeAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <ErrorBadgeScene sceneIndex={i} />,
  renderLive: () => <ErrorBadgeLive />,
  delayMs: 1500,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Wait for the alert icon to appear after the broken image fails to load
    await waitFor(
      () => {
        const alertIcon = document.querySelector(
          '[aria-label="Image failed to load"]',
        ) as HTMLElement;
        expect(alertIcon).toBeVisible();
      },
      { timeout: 10000 },
    );

    // Broken img is not visible
    const img = document.querySelector('img[src]');
    if (img) {
      expect(img).not.toBeVisible();
    }

    goToScene(1);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/Error Badge',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const ErrorBadgeInteractive: StoryObj = {
  ...ErrorBadgeInteractiveStory,
  name: 'Error Badge (Interactive)',
};

export const ErrorBadgeStepwise: StoryObj = {
  ...ErrorBadgeStepwiseStory,
  name: 'Error Badge (Stepwise)',
};

export const ErrorBadgeAutomated: StoryObj = {
  ...ErrorBadgeAutomatedStory,
  name: 'Error Badge (Automated)',
};
