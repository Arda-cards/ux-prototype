/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: Loading Shimmer
 *
 * Renders ImageDisplay with a blob URL that never resolves, keeping the
 * skeleton shimmer permanently visible for inspection.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { MOCK_LARGE_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// ---------------------------------------------------------------------------
// Wrapper that uses a Blob URL that never resolves, keeping the shimmer
// permanently visible in Storybook. The story description explains this
// technique; the real loading state occurs with MOCK_LARGE_IMAGE in browsers.
// ---------------------------------------------------------------------------

function LoadingShimmerDemo() {
  // A blob URL created from empty content — the browser starts loading but
  // never fires onLoad or onError, so the skeleton stays visible indefinitely.
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
// Slow-loading variant using MOCK_LARGE_IMAGE (2048×2048) — demonstrates the
// real transition from shimmer to loaded in a browser context.
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

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/Loading Shimmer',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

/** Skeleton shimmer held permanently visible via an unresolvable Blob URL. */
export const Default: Story = {
  render: () => <LoadingShimmerDemo />,
  play: async ({ canvasElement, step }) => {
    await step('Skeleton shimmer is visible while image is loading', async () => {
      // The skeleton uses data-slot="skeleton" from the Skeleton primitive
      const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');
      expect(skeleton).not.toBeNull();
      expect(skeleton).toBeVisible();
    });

    await step('ImageDisplay container is present', async () => {
      const display = canvasElement.querySelector('[data-slot="image-display"]');
      expect(display).not.toBeNull();
      expect(display).toBeVisible();
    });

    await step('No error badge is shown during loading', async () => {
      // Error badge has aria-label "Image failed to load"
      const badge = canvasElement.querySelector('[aria-label="Image failed to load"]');
      expect(badge).toBeNull();
    });
  },
};

/** Large remote image — shimmer briefly visible then transitions to loaded. */
export const SlowLoad: Story = {
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
