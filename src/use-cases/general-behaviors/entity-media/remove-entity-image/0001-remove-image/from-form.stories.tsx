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

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageFormField } from '@/components/canary/molecules/form/image/image-form-field';
import { Button } from '@/components/canary/primitives/button';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

interface FromFormLiveProps {
  onChange: (url: string | null) => void;
}

function FromFormLive({ onChange }: FromFormLiveProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(MOCK_ITEM_IMAGE);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0002 &#8212; Remove Image: From Form
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
        {imageUrl !== null ? `Image set: ${imageUrl}` : 'No image &#8212; placeholder shown.'}
      </p>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function FromFormSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Image is visible in the form field
    case 0:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Remove Image: From Form</h1>
          <ImageFormField config={ITEM_IMAGE_CONFIG} imageUrl={MOCK_ITEM_IMAGE} onChange={noop} />
          <p className="text-xs text-muted-foreground">Image set &#8212; hover to reveal icons</p>
        </div>
      );

    // Scene 2: Hovering — trash icon is visible
    case 1:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Remove Image: From Form</h1>
          <p className="text-sm text-muted-foreground border border-border rounded px-3 py-1">
            Hovering over the thumbnail reveals the Trash (Remove image) icon
          </p>
          <ImageFormField config={ITEM_IMAGE_CONFIG} imageUrl={MOCK_ITEM_IMAGE} onChange={noop} />
        </div>
      );

    // Scene 3: Confirmation dialog visible
    case 2:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="border border-border rounded-lg p-6 bg-background max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-2">Remove image?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently remove the image from this item.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Remove</Button>
            </div>
          </div>
        </div>
      );

    // Scene 4: Image removed — placeholder shown
    case 3:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Remove Image: From Form</h1>
          <ImageFormField config={ITEM_IMAGE_CONFIG} imageUrl={null} onChange={noop} />
          <p className="text-xs text-muted-foreground" data-testid="state-label">
            No image &#8212; placeholder shown.
          </p>
        </div>
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const fromFormScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Image Visible',
    description:
      'The ImageFormField renders with a valid product image thumbnail. The field is in its default state — no icons are visible yet.',
    interaction: 'Hover over the thumbnail to reveal the action icons.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Hover Reveals Trash Icon',
    description:
      'Hovering over the image area reveals the action overlay. The Trash (Remove image) icon becomes visible. The Edit icon is also visible for image replacement.',
    interaction: 'Click the Trash icon to open the removal confirmation dialog.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Confirmation Dialog',
    description:
      'An AlertDialog opens asking the user to confirm removal. Two actions are available: Cancel (dismiss without removing) and Remove (proceed with removal).',
    interaction: 'Click "Remove" to confirm and permanently remove the image.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Image Removed',
    description:
      'The dialog has closed. The ImageFormField now shows the placeholder state (no image). The onChange callback was called with null.',
    interaction: 'The workflow is complete. The image has been removed.',
  },
];

const onChangeFn = fn();

const {
  Interactive: FromFormInteractive,
  Stepwise: FromFormStepwise,
  Automated: FromFormAutomated,
} = createWorkflowStories({
  scenes: fromFormScenes,
  renderScene: (i) => <FromFormSceneRenderer sceneIndex={i} />,
  renderLive: () => <FromFormLive onChange={onChangeFn} />,
  delayMs: 2000,
  maxWidth: 560,
  play: async ({ goToScene, delay }) => {
    goToScene(0);

    // Scene 1: Wait for image form field to be visible
    await waitFor(
      () => {
        const field = document.querySelector('[data-slot="image-form-field"]');
        expect(field).not.toBeNull();
        expect(field).toBeVisible();
      },
      { timeout: 5000 },
    );
    await delay();

    // Scene 2: Hover over the image thumbnail
    goToScene(1);
    const field = document.querySelector('[data-slot="image-form-field"]') as HTMLElement | null;
    if (!field) throw new Error('ImageFormField not found');
    const imageButton = field.querySelector('[role="button"]') as HTMLElement | null;
    if (!imageButton) throw new Error('Image button area not found');
    await userEvent.hover(imageButton);
    await delay();

    // Scene 3: Click trash icon
    goToScene(2);
    const trashButton = screen.getByRole('button', { name: /remove image/i });
    await userEvent.click(trashButton);

    await waitFor(
      () => {
        expect(screen.getByRole('alertdialog')).toBeVisible();
      },
      { timeout: 5000 },
    );
    await delay();

    // Scene 4: Click Remove to confirm
    goToScene(3);
    const removeButton = screen.getByRole('button', { name: /^remove$/i });
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(onChangeFn).toHaveBeenCalledWith(null);
    });

    await waitFor(
      () => {
        const label = document.querySelector('[data-testid="state-label"]');
        expect(label?.textContent).toContain('No image');
      },
      { timeout: 3000 },
    );
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0002 Remove Entity Image/0001 Remove Image/From Form',
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
  },
};

export default meta;

export const FromFormInteractiveStory: StoryObj = {
  ...FromFormInteractive,
  name: 'From Form (Interactive)',
};

export const FromFormStepwiseStory: StoryObj = {
  ...FromFormStepwise,
  name: 'From Form (Stepwise)',
};

export const FromFormAutomatedStory: StoryObj = {
  ...FromFormAutomated,

  name: 'From Form (Automated)',
};
