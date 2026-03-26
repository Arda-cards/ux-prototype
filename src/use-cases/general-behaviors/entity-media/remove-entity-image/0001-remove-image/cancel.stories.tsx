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

interface CancelLiveProps {
  onChange: (url: string | null) => void;
}

function CancelLive({ onChange }: CancelLiveProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(MOCK_ITEM_IMAGE);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0002 &#8212; Remove Image: Cancel
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

      <p className="text-xs text-muted-foreground" data-testid="state-label">
        {imageUrl !== null ? 'Image still set &#8212; cancel preserved it.' : 'Image removed.'}
      </p>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function CancelSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Image is visible in the form field
    case 0:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Remove Image: Cancel</h1>
          <ImageFormField config={ITEM_IMAGE_CONFIG} imageUrl={MOCK_ITEM_IMAGE} onChange={noop} />
          <p className="text-xs text-muted-foreground">Image set &#8212; hover to reveal icons</p>
        </div>
      );

    // Scene 2: Hovering — trash icon is visible
    case 1:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Remove Image: Cancel</h1>
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

    // Scene 4: Dialog dismissed — image still set
    case 3:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Remove Image: Cancel</h1>
          <ImageFormField config={ITEM_IMAGE_CONFIG} imageUrl={MOCK_ITEM_IMAGE} onChange={noop} />
          <p className="text-xs text-muted-foreground" data-testid="state-label">
            Image still set &#8212; cancel preserved it.
          </p>
        </div>
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const cancelScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Image Visible',
    description:
      'The ImageFormField renders with a valid product image thumbnail. The field is in its default state — no action icons are visible yet.',
    interaction: 'Hover over the thumbnail to reveal the action icons.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Hover Reveals Trash Icon',
    description:
      'Hovering over the image area reveals the action overlay including the Trash (Remove image) icon.',
    interaction: 'Click the Trash icon to open the removal confirmation dialog.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Confirmation Dialog',
    description:
      'An AlertDialog opens asking the user to confirm removal. The user decides to keep the image and will click Cancel.',
    interaction: 'Click "Cancel" to dismiss the dialog without removing the image.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Image Preserved',
    description:
      'The dialog has closed. The image is still displayed in the form field. onChange was NOT called — the cancel path correctly preserves the existing image.',
    interaction: 'The workflow is complete. The image remains unchanged.',
  },
];

const onChangeFn = fn();

const {
  Interactive: CancelInteractive,
  Stepwise: CancelStepwise,
  Automated: CancelAutomated,
} = createWorkflowStories({
  scenes: cancelScenes,
  renderScene: (i) => <CancelSceneRenderer sceneIndex={i} />,
  renderLive: () => <CancelLive onChange={onChangeFn} />,
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

    // Scene 4: Click Cancel
    goToScene(3);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    await waitFor(
      () => {
        expect(screen.queryByRole('alertdialog')).toBeNull();
      },
      { timeout: 3000 },
    );

    // Verify onChange was NOT called
    expect(onChangeFn).not.toHaveBeenCalled();

    // Verify state label confirms image is still set
    const label = document.querySelector('[data-testid="state-label"]');
    expect(label?.textContent).toContain('still set');
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0002 Remove Entity Image/0001 Remove Image/Cancel',
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
  },
};

export default meta;

export const CancelInteractiveStory: StoryObj = {
  ...CancelInteractive,
  name: 'Cancel (Interactive)',
};

export const CancelStepwiseStory: StoryObj = {
  ...CancelStepwise,
  name: 'Cancel (Stepwise)',
};

export const CancelAutomatedStory: StoryObj = {
  ...CancelAutomated,
  tags: ['skip-ci'],
  name: 'Cancel (Automated)',
};
