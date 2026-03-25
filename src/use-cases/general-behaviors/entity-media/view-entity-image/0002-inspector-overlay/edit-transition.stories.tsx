/**
 * GEN-MEDIA-0003::0002.FS — Image Inspector Overlay
 * Scene: Edit Transition
 *
 * Renders the ImageInspectorOverlay with an onEdit callback. The Edit button is
 * visible in the overlay footer. The play function opens the overlay, clicks
 * the Edit button, verifies the overlay closes and onEdit was called.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, screen } from 'storybook/test';

import { MOCK_ITEM_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface EditTransitionPageProps {
  onEdit: () => void;
}

function EditTransitionPage({ onEdit }: EditTransitionPageProps) {
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
          onEdit();
          setOpen(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof EditTransitionPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0002 Inspector Overlay/Edit Transition',
  component: EditTransitionPage,
  args: {
    onEdit: fn(),
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof EditTransitionPage>;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ args, step }) => {
    // -----------------------------------------------------------------------
    // Step 1 — Open overlay
    // -----------------------------------------------------------------------
    await step('Click thumbnail to open the inspector overlay', async () => {
      const thumbnail = screen.getByTestId('open-thumbnail');
      await userEvent.click(thumbnail);
    });

    await step('Overlay is open and Edit button is visible', async () => {
      await waitFor(
        () => {
          expect(screen.getByAltText('Full size preview')).toBeVisible();
          expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    // -----------------------------------------------------------------------
    // Step 2 — Click the Edit button
    // -----------------------------------------------------------------------
    await step('Click the Edit button', async () => {
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await userEvent.click(editButton);
    });

    // -----------------------------------------------------------------------
    // Step 3 — Verify overlay closed and onEdit was called
    // -----------------------------------------------------------------------
    await step('Overlay closes after Edit is clicked', async () => {
      await waitFor(
        () => {
          expect(screen.queryByAltText('Full size preview')).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    await step('onEdit callback was called once', async () => {
      expect(args.onEdit).toHaveBeenCalledTimes(1);
    });

    await storyStepDelay();
  },
};
