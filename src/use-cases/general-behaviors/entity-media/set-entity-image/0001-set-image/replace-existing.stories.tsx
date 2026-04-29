/**
 * GEN-MEDIA-0001::0001.UC — Set Image via Unified Input Surface
 * Scene: Replace Existing Image
 *
 * When an item already has an image, the upload dialog enters the EditExisting state
 * first, allowing the user to crop the current image or choose to upload a replacement.
 * Once a new file is provided, the ProvidedImage state shows a side-by-side comparison
 * (ImageComparisonLayout) on desktop, or a tabbed layout on mobile.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { ImageComparisonLayout } from '@/components/canary/molecules/image-comparison-layout/image-comparison-layout';
import { Button } from '@/components/canary/primitives/button';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function ReplaceExistingLive() {
  const [open, setOpen] = useState(false);
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

  const handleConfirm = (result: ImageUploadResult) => {
    setLastResult(result);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold tracking-tight mb-1">
          GEN-MEDIA-0001 &#8212; Replace Existing Image
        </h1>
        <p className="text-sm text-muted-foreground">
          The item already has a product image. Opening the dialog shows the existing image for
          editing or replacement. Providing a new file activates the comparison layout.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Current image
        </span>
        <img
          src={MOCK_ITEM_IMAGE}
          alt="Current product image"
          className="w-24 h-24 object-cover rounded-lg border border-border"
        />
      </div>

      <button
        type="button"
        data-testid="open-dialog-btn"
        onClick={() => {
          setLastResult(null);
          setOpen(true);
        }}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Replace Image
      </button>

      {lastResult && (
        <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
          <p className="font-semibold mb-2 text-green-700 dark:text-green-400">
            Image replaced successfully
          </p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={MOCK_ITEM_IMAGE}
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

function DialogFrame({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg p-6 bg-background max-w-2xl w-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
      {footer && <div className="flex justify-end gap-2 mt-4">{footer}</div>}
    </div>
  );
}

const noop = () => {};

function ReplaceExistingSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Idle — button visible, thumbnail shown
    case 0:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Replace Existing Image</h1>
          <img
            src={MOCK_ITEM_IMAGE}
            alt="Current product image"
            className="w-24 h-24 object-cover rounded-lg border border-border"
          />
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
            Replace Image
          </button>
        </div>
      );

    // Scene 2: Dialog opens in EditExisting — comparison layout visible with current image
    case 1:
      return (
        <DialogFrame title="Edit Product Image">
          <ImageComparisonLayout
            existingImageUrl={MOCK_ITEM_IMAGE}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
            onAccept={noop}
            onDismiss={noop}
            onUploadNew={noop}
          >
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropComplete={noop}
              onZoomChange={noop}
              onRotationChange={noop}
              onReset={noop}
            />
          </ImageComparisonLayout>
        </DialogFrame>
      );

    // Scene 3: Upload New clicked — drop zone shown
    case 2:
      return (
        <DialogFrame title="Add Product Image" footer={<Button variant="secondary">Cancel</Button>}>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </DialogFrame>
      );

    // Scene 4: New file staged — ProvidedImage with comparison, Confirm enabled
    case 3:
    case 4:
      return (
        <DialogFrame
          title="Edit Product Image"
          footer={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button>Confirm</Button>
            </>
          }
        >
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground font-medium uppercase">Current</span>
              <img
                src={MOCK_ITEM_IMAGE}
                alt="Current"
                className="w-full object-cover rounded border border-border"
              />
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground font-medium uppercase">New</span>
              <ImagePreviewEditor
                aspectRatio={1}
                imageData={MOCK_ITEM_IMAGE}
                onCropComplete={noop}
                onZoomChange={noop}
                onRotationChange={noop}
                onReset={noop}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            By confirming, you acknowledge that you own or have a license to use this image.
          </p>
        </DialogFrame>
      );

    // Scene 6: Upload confirmed — dialog closed, success visible
    case 5:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Replace Existing Image</h1>
          <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
            <p className="font-semibold mb-2 text-green-700 dark:text-green-400">
              Image replaced successfully
            </p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const replaceExistingScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 6 \u2014 Existing Image',
    description:
      'The page shows the current product image thumbnail and a "Replace Image" button. The item already has a valid image URL.',
    interaction: 'Click "Replace Image" to open the upload dialog.',
  },
  {
    title: 'Scene 2 of 6 \u2014 Dialog Opens in EditExisting Mode',
    description:
      'The ImageUploadDialog opens in EditExisting mode. The current image is shown along with action buttons: Accept (keep current), Upload New Image, and Dismiss.',
    interaction: 'Click "Upload New Image" to switch to the file selection flow.',
  },
  {
    title: 'Scene 3 of 6 \u2014 Drop Zone',
    description:
      'The dialog switches to EmptyImage mode showing the ImageDropZone. The user can drag-and-drop, paste from clipboard, or pick a file.',
    interaction: 'Select or drop a JPEG file to stage a new image.',
  },
  {
    title: 'Scene 4 of 6 \u2014 Comparison Layout',
    description:
      'A new file has been provided. The dialog renders ImageComparisonLayout showing the current image on the left and the new image preview on the right. The copyright checkbox must be checked before Confirm is enabled.',
    interaction: 'Review both images, then check the copyright acknowledgment.',
  },
  {
    title: 'Scene 5 of 6 \u2014 Copyright Acknowledged',
    description:
      'The copyright checkbox is checked, enabling the Confirm button. The user can still navigate back to change the image.',
    interaction: 'Click "Confirm" to upload and replace the image.',
  },
  {
    title: 'Scene 6 of 6 \u2014 Image Updated',
    description:
      'The upload is complete. The dialog has closed and the page shows confirmation that the image was replaced successfully.',
    interaction: 'The workflow is complete. Click "Replace Image" to try again.',
  },
];

const {
  Interactive: ReplaceInteractive,
  Stepwise: ReplaceStepwise,
  Automated: ReplaceAutomated,
} = createWorkflowStories({
  scenes: replaceExistingScenes,
  renderScene: (i) => <ReplaceExistingSceneRenderer sceneIndex={i} />,
  renderLive: () => <ReplaceExistingLive />,
  delayMs: 2000,
  maxWidth: 800,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Scene 1 -> 2: Open the dialog
    const openBtn = await waitFor(() => {
      const el = document.querySelector<HTMLButtonElement>('[data-testid="open-dialog-btn"]');
      if (!el) throw new Error('Open button not found');
      return el;
    });
    await userEvent.click(openBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
    goToScene(1);
    await delay();

    // Scene 2 -> 3: Click "Upload New Image"
    const uploadNewBtn = await waitFor(() =>
      screen.getByRole('button', { name: /upload new image/i }),
    );
    await userEvent.click(uploadNewBtn);

    await waitFor(() => {
      expect(screen.getByText(/drop image here/i)).toBeVisible();
    });
    goToScene(2);
    await delay();

    // Scene 3 -> 4: Upload a file
    const fileInput = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    goToScene(3);
    await delay();

    // Scene 4 -> 5: Confirm the upload (copyright is now passive subtext)
    const confirmBtn = await waitFor(() => {
      const btn = screen.getByRole('button', { name: /^confirm$/i });
      expect(btn).not.toBeDisabled();
      return btn;
    });
    await userEvent.click(confirmBtn);

    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    goToScene(5);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0001 Set Image/Replace Existing',
  tags: ['skip-ci'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const ReplaceExistingInteractive: StoryObj = {
  ...ReplaceInteractive,
  name: 'Replace Existing (Interactive)',
};

export const ReplaceExistingStepwise: StoryObj = {
  ...ReplaceStepwise,
  name: 'Replace Existing (Stepwise)',
};

export const ReplaceExistingAutomated: StoryObj = {
  ...ReplaceAutomated,

  name: 'Replace Existing (Automated)',
};
