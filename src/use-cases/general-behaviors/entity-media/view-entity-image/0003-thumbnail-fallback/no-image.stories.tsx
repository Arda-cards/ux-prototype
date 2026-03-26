/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: No Image
 *
 * Renders ImageDisplay with imageUrl={null}, showing the initials placeholder
 * WITHOUT an error badge. Distinguishes "no image set" from "broken image".
 *
 * Three story variants via createWorkflowStories:
 *   NoImageInteractive  — live component for manual exploration
 *   NoImageStepwise     — static snapshots with scene annotations
 *   NoImageAutomated    — automated play verifying the placeholder state
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function NoImageLive() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={null}
          entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
          propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
        />
      </div>
      <p className="text-xs text-muted-foreground max-w-48 text-center">
        imageUrl is null — initials placeholder shown without an error badge. This is "no image
        set", not a broken image.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function NoImageScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Initial state — component mounted with null imageUrl
    case 0:
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded bg-muted border border-border flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">I</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-48 text-center">
            ImageDisplay mounted with imageUrl=null. Initials placeholder renders immediately — no
            loading state, no error state.
          </p>
        </div>
      );

    // Scene 1: Verified state — initials shown, no error badge, no img, no skeleton
    case 1:
    default:
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded bg-muted border border-border flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">I</span>
          </div>
          <div className="text-xs text-muted-foreground max-w-48 text-center space-y-1">
            <p>&#10003; Initials placeholder visible ("I" for "Item")</p>
            <p>&#10003; No error badge</p>
            <p>&#10003; No img element rendered</p>
            <p>&#10003; No skeleton shimmer</p>
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
    title: 'Scene 1 of 2 \u2014 Initial State',
    description:
      'ImageDisplay is mounted with imageUrl=null. No loading state occurs \u2014 the initials placeholder renders immediately. This represents an entity that has no image configured, which is not an error.',
    interaction: 'Observe the initials placeholder. No error badge should appear.',
  },
  {
    title: 'Scene 2 of 2 \u2014 No-Image State Verified',
    description:
      'Confirmed: the initials placeholder ("I" for "Item") is visible. No error badge, no img element, and no skeleton shimmer. This cleanly distinguishes "no image set" from the broken-URL error state.',
    interaction: 'The workflow is complete.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: NoImageInteractiveStory,
  Stepwise: NoImageStepwiseStory,
  Automated: NoImageAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <NoImageScene sceneIndex={i} />,
  renderLive: () => <NoImageLive />,
  delayMs: 1500,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Initials placeholder is visible — getInitials("Item") → "I"
    const initials = canvas.getByText('I');
    expect(initials).toBeVisible();

    // No error badge
    const badge = document.querySelector('[aria-label="Image failed to load"]');
    expect(badge).toBeNull();

    // No img element
    const img = document.querySelector('img');
    expect(img).toBeNull();

    // No skeleton shimmer
    const skeleton = document.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeNull();

    goToScene(1);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/No Image',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const NoImageInteractive: StoryObj = {
  ...NoImageInteractiveStory,
  name: 'No Image (Interactive)',
};

export const NoImageStepwise: StoryObj = {
  ...NoImageStepwiseStory,
  name: 'No Image (Stepwise)',
};

export const NoImageAutomated: StoryObj = {
  ...NoImageAutomatedStory,
  name: 'No Image (Automated)',
};
