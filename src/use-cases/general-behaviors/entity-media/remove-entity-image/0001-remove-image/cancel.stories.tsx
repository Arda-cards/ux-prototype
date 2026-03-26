/**
 * GEN-MEDIA-0002::0001.UC — Remove Image
 * Scene: Cancel
 *
 * Renders ImageFormField with a valid image. Hovering and clicking Trash opens
 * the confirmation AlertDialog. Clicking Cancel closes the dialog and the image
 * remains unchanged.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, fn, screen } from 'storybook/test';

import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageFormField } from '@/components/canary/molecules/form/image/image-form-field';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface CancelPageProps {
  onChange: (url: string | null) => void;
}

function CancelPage({ onChange }: CancelPageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(MOCK_ITEM_IMAGE);
  const [cancelCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0002 — Remove Image: Cancel
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-72">
          Hover the thumbnail, click Trash, then click Cancel on the confirmation dialog. The image
          is preserved.
        </p>
      </div>

      <ImageFormField
        config={ITEM_IMAGE_CONFIG}
        imageUrl={imageUrl}
        onChange={(url) => {
          setImageUrl(url);
          onChange(url);
        }}
      />

      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-muted-foreground" data-testid="state-label">
          {imageUrl !== null ? 'Image still set — cancel preserved it.' : 'Image removed.'}
        </p>
        {cancelCount > 0 && (
          <p className="text-xs text-muted-foreground" data-testid="cancel-count">
            Dialog cancelled {cancelCount} time{cancelCount > 1 ? 's' : ''}.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AlertDialog cancel tracking
// ---------------------------------------------------------------------------
// We track cancel via an MutationObserver in the play function. The AlertDialog
// Cancel button closes the dialog without calling onChange — that's the
// assertion we want.

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CancelPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0002 Remove Entity Image/0001 Remove Image/Cancel',
  component: CancelPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Cancel path for image removal. ' +
          'Opening the Trash confirmation dialog and clicking Cancel leaves the image unchanged. ' +
          'onChange is never called.',
      },
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CancelPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — field with image. Hover, click Trash, then Cancel to see the image preserved. */
export const Default: Story = {};

/**
 * Automated — hovers the thumbnail, clicks Trash, verifies the confirmation dialog,
 * clicks Cancel, confirms the dialog closes and onChange was NOT called.
 */
export const Automated: Story = {
  play: async ({ args, step }) => {
    await step('Image form field is visible', async () => {
      await waitFor(
        () => {
          const field = document.querySelector('[data-slot="image-form-field"]');
          expect(field).not.toBeNull();
          expect(field).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay(300);

    await step('Hover over the image thumbnail to reveal action icons', async () => {
      const field = document.querySelector('[data-slot="image-form-field"]') as HTMLElement | null;
      if (!field) throw new Error('ImageFormField not found');
      const imageButton = field.querySelector('[role="button"]') as HTMLElement | null;
      if (!imageButton) throw new Error('Image button area not found');
      await userEvent.hover(imageButton);
    });

    await storyStepDelay(300);

    await step('Click Trash icon to open confirmation dialog', async () => {
      const trashButton = screen.getByRole('button', { name: /remove image/i });
      await userEvent.click(trashButton);
    });

    await step('Confirmation AlertDialog is visible', async () => {
      await waitFor(
        () => {
          const dialog = screen.getByRole('alertdialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay(500);

    await step('Click Cancel to dismiss without removing', async () => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
    });

    await step('Dialog closes after Cancel', async () => {
      await waitFor(
        () => {
          const dialog = screen.queryByRole('alertdialog');
          expect(dialog).toBeNull();
        },
        { timeout: 3000 },
      );
    });

    await step('onChange was NOT called — image is preserved', async () => {
      expect(args.onChange).not.toHaveBeenCalled();
    });

    await step('State label confirms image is still set', async () => {
      const label = document.querySelector('[data-testid="state-label"]');
      expect(label?.textContent).toContain('still set');
    });
  },
};
