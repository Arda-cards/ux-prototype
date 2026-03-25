/**
 * GEN-MEDIA-0003::0002.FS — Image Inspector Overlay
 * Scene: Open and Close
 *
 * Renders a clickable image thumbnail that opens the ImageInspectorOverlay in a
 * modal. The play function verifies the overlay opens with the full-size image,
 * then exercises all three dismiss methods: Escape key, click-outside, and
 * the close button.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';

import { MOCK_ITEM_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function OpenAndClosePage() {
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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof OpenAndClosePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0002 Inspector Overlay/Open and Close',
  component: OpenAndClosePage,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof OpenAndClosePage>;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ step }) => {
    // -----------------------------------------------------------------------
    // Step 1 — Open overlay by clicking the thumbnail
    // -----------------------------------------------------------------------
    await step('Click thumbnail to open the inspector overlay', async () => {
      const thumbnail = screen.getByTestId('open-thumbnail');
      await userEvent.click(thumbnail);
    });

    await step('Full-size image is visible in the overlay', async () => {
      await waitFor(
        () => {
          const overlayImage = screen.getByAltText('Full size preview');
          expect(overlayImage).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    // -----------------------------------------------------------------------
    // Step 2 — Dismiss via Escape key
    // -----------------------------------------------------------------------
    await step('Dismiss overlay with Escape key', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(
        () => {
          expect(screen.queryByAltText('Full size preview')).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    await storyStepDelay();

    // -----------------------------------------------------------------------
    // Step 3 — Re-open, then dismiss via click-outside
    // -----------------------------------------------------------------------
    await step('Re-open overlay', async () => {
      const thumbnail = screen.getByTestId('open-thumbnail');
      await userEvent.click(thumbnail);
      await waitFor(
        () => {
          expect(screen.getByAltText('Full size preview')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Dismiss overlay by clicking the backdrop', async () => {
      // The Radix DialogPrimitive.Overlay covers the screen behind the content;
      // click at the very edge of the viewport (top-left) to hit the backdrop.
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
    });

    await storyStepDelay();

    // -----------------------------------------------------------------------
    // Step 4 — Re-open, then dismiss via close button
    // -----------------------------------------------------------------------
    await step('Re-open overlay again', async () => {
      const thumbnail = screen.getByTestId('open-thumbnail');
      await userEvent.click(thumbnail);
      await waitFor(
        () => {
          expect(screen.getByAltText('Full size preview')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Dismiss overlay using the close button', async () => {
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);
      await waitFor(
        () => {
          expect(screen.queryByAltText('Full size preview')).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    await storyStepDelay();
  },
};
