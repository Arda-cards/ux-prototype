/**
 * GEN-MEDIA-0002::0001.UC — Remove Image
 * Scene: From Form
 *
 * Renders ImageFormField with a valid image. Hovering reveals action icons;
 * clicking the Trash icon opens a confirmation AlertDialog. Confirming removes
 * the image and the placeholder is shown.
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

interface FromFormPageProps {
  onChange: (url: string | null) => void;
}

function FromFormPage({ onChange }: FromFormPageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(MOCK_ITEM_IMAGE);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0002 — Remove Image: From Form
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-72">
          Hover the thumbnail to reveal action icons. Click the Trash icon and confirm to remove the
          image.
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

      <p className="text-xs text-muted-foreground" data-testid="state-label">
        {imageUrl !== null ? `Image set: ${imageUrl}` : 'No image — placeholder shown.'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof FromFormPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0002 Remove Entity Image/0001 Remove Image/From Form',
  component: FromFormPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Interactive removal flow from ImageFormField. ' +
          'Hover the thumbnail, click Trash, confirm — onChange(null) fires and the placeholder replaces the image.',
      },
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FromFormPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — field starts with a valid image. Hover and click Trash to begin removal. */
export const Default: Story = {};

/**
 * Automated — hovers the image thumbnail, clicks the Trash icon, verifies the
 * confirmation dialog appears, clicks Remove to confirm, and verifies the
 * placeholder replaces the image.
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
      // Hover the inner image container (the role="button" area)
      const imageButton = field.querySelector('[role="button"]') as HTMLElement | null;
      if (!imageButton) throw new Error('Image button area not found');
      await userEvent.hover(imageButton);
    });

    await storyStepDelay(300);

    await step('Click the Trash icon to open confirmation dialog', async () => {
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

    await step('Click Remove to confirm', async () => {
      const removeButton = screen.getByRole('button', { name: /^remove$/i });
      await userEvent.click(removeButton);
    });

    await step('onChange called with null', async () => {
      await waitFor(() => {
        expect(args.onChange).toHaveBeenCalledWith(null);
      });
    });

    await step('Placeholder replaces the image', async () => {
      await waitFor(
        () => {
          const label = document.querySelector('[data-testid="state-label"]');
          expect(label?.textContent).toContain('No image');
        },
        { timeout: 3000 },
      );
    });
  },
};
