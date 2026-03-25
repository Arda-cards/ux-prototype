/**
 * GEN-MEDIA-0003::0002.FS — Image Inspector Overlay
 * Scene: No Edit
 *
 * Renders the ImageInspectorOverlay WITHOUT an onEdit callback. No Edit button
 * is rendered — only read-only inspection is available. The play function opens
 * the overlay and verifies that no Edit button exists.
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

function NoEditPage() {
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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof NoEditPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0002 Inspector Overlay/No Edit',
  component: NoEditPage,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof NoEditPage>;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ step }) => {
    // -----------------------------------------------------------------------
    // Step 1 — Open overlay
    // -----------------------------------------------------------------------
    await step('Click thumbnail to open the inspector overlay', async () => {
      const thumbnail = screen.getByTestId('open-thumbnail');
      await userEvent.click(thumbnail);
    });

    await step('Full-size image is visible in the overlay', async () => {
      await waitFor(
        () => {
          expect(screen.getByAltText('Full size preview')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    // -----------------------------------------------------------------------
    // Step 2 — Verify no Edit button is rendered
    // -----------------------------------------------------------------------
    await step('No Edit button is present in read-only mode', async () => {
      expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    });

    await step('Close button is still available', async () => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await storyStepDelay();
  },
};
