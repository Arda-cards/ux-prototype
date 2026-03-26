import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';

import {
  MOCK_ITEM_IMAGE,
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/components/canary/__mocks__/image-story-data';

import { ImageDisplay } from './image-display';

const meta = {
  title: 'Components/Canary/Molecules/ImageDisplay',
  component: ImageDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Foundational image rendering molecule. Handles loaded, loading, error, and no-image states.',
      },
    },
  },
  argTypes: {
    imageUrl: { control: 'text' },
    entityTypeDisplayName: { control: 'text' },
    propertyDisplayName: { control: 'text' },
  },
} satisfies Meta<typeof ImageDisplay>;

export default meta;
type Story = StoryObj<typeof ImageDisplay>;
export const Loaded: Story = {
  render: () => (
    <div className="w-32 h-32">
      <ImageDisplay
        imageUrl={MOCK_ITEM_IMAGE}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      />
    </div>
  ),
};

/**
 * Loading state &#8212; shows the skeleton shimmer that appears while the browser
 * fetches the image. Uses a Blob URL that never resolves to keep the skeleton
 * permanently visible for inspection.
 */
export const Loading: Story = {
  render: () => {
    // Create a blob URL from an empty blob — the <img> will stay in "loading"
    // state because the blob contains no valid image data, yet it won't fire
    // an error event like an invalid data URI would.
    const [blobUrl] = React.useState(() => URL.createObjectURL(new Blob([])));
    return (
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={blobUrl}
          entityTypeDisplayName="Item"
          propertyDisplayName="Product Image"
        />
      </div>
    );
  },
};

/** Broken URL &#8212; initials placeholder with error badge. */
export const ErrorState: Story = {
  render: () => (
    <div className="w-32 h-32">
      <ImageDisplay
        imageUrl={MOCK_BROKEN_IMAGE}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      />
    </div>
  ),
};

/** No image URL &#8212; initials placeholder, no error badge. */
export const NoImage: Story = {
  render: () => (
    <div className="w-32 h-32">
      <ImageDisplay
        imageUrl={null}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      />
    </div>
  ),
};

/** All four visual states side-by-side in a 2x2 grid. */
export const AllStates: Story = {
  render: () => {
    const [blobUrl] = React.useState(() => URL.createObjectURL(new Blob([])));
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-32 h-32">
            <ImageDisplay
              imageUrl={MOCK_ITEM_IMAGE}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            />
          </div>
          <span className="text-xs text-muted-foreground">Loaded</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-32 h-32">
            <ImageDisplay
              imageUrl={blobUrl}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            />
          </div>
          <span className="text-xs text-muted-foreground">Loading</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-32 h-32">
            <ImageDisplay
              imageUrl={MOCK_BROKEN_IMAGE}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            />
          </div>
          <span className="text-xs text-muted-foreground">Error</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-32 h-32">
            <ImageDisplay
              imageUrl={null}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            />
          </div>
          <span className="text-xs text-muted-foreground">No Image</span>
        </div>
      </div>
    );
  },
};

/** Same image at 32, 64, 128, and 256px to verify the component scales. */
export const SizeResponsiveness: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {[32, 64, 128, 256].map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <div style={{ width: size, height: size }}>
            <ImageDisplay
              imageUrl={MOCK_ITEM_IMAGE}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            />
          </div>
          <span className="text-xs text-muted-foreground">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * White image on bg-muted background &#8212; verifies that the muted background
 * provides sufficient contrast even without a border.
 */
export const WhiteImageContrast: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={null}
          entityTypeDisplayName="Item"
          propertyDisplayName="Product Image"
        />
      </div>
      <div className="w-32 h-32 bg-muted flex items-center justify-center rounded overflow-hidden">
        {/* Simulates a white product image inside the bg-muted container */}
        <div className="w-full h-full bg-white" aria-label="Simulated white image" />
      </div>
      <p className="text-xs text-muted-foreground max-w-48 text-center">
        bg-muted provides contrast without a border, even for white images.
      </p>
    </div>
  ),
};

/**
 * Double-click-to-edit demo &#8212; standalone thumbnail with baked-in ImageUploadDialog.
 * No AG Grid involved. Double-click the thumbnail (or focus and press Enter) to open
 * the upload dialog. The dialog enters EditExisting mode because an image is present.
 * Confirm to update the image URL; Dismiss to keep the current image.
 *
 * The edit flow is entirely managed inside ImageDisplay &#8212; no external dialog wiring needed.
 */
export const DoubleClickToEdit: Story = {
  render: () => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(MOCK_ITEM_IMAGE);
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          Double-click the thumbnail (or focus it and press Enter) to open the editor. With an image
          present the dialog opens in EditExisting mode (crop/rotate + side-by-side). Accept to
          apply changes; Dismiss to keep the current image.
        </p>
        <div className="w-32 h-32">
          <ImageDisplay
            imageUrl={imageUrl}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
            config={ITEM_IMAGE_CONFIG}
            onImageChange={(result) => setImageUrl(result.imageUrl)}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono break-all max-w-xs text-center">
          {imageUrl ?? '(no image)'}
        </span>
      </div>
    );
  },
};

/**
 * Double-click-to-edit with no initial image &#8212; dialog opens in EmptyImage (upload) mode.
 * Drop a file or paste a URL to stage an image, then confirm to set it.
 */
export const DoubleClickToEditNoImage: Story = {
  render: () => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          Double-click the thumbnail (or focus it and press Enter) to open the upload surface. No
          image is set yet &#8212; the dialog opens in EmptyImage mode.
        </p>
        <div className="w-32 h-32">
          <ImageDisplay
            imageUrl={imageUrl}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
            config={ITEM_IMAGE_CONFIG}
            onImageChange={(result) => setImageUrl(result.imageUrl)}
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono break-all max-w-xs text-center">
          {imageUrl ?? '(no image)'}
        </span>
      </div>
    );
  },
};

/** Interactive playground — adjust props via the Controls panel. */
export const Playground: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
    propertyDisplayName: 'Product Image',
  },
  render: (args) => (
    <div className="w-32 h-32">
      <ImageDisplay {...args} />
    </div>
  ),
};

// ============================================================================
// Happy Path Workflow — Interactive / Stepwise / Automated
// ============================================================================

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { ImageComparisonLayout } from '@/components/canary/molecules/image-comparison-layout/image-comparison-layout';
import { CopyrightAcknowledgment } from '@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment';
import { Progress } from '@/components/canary/primitives/progress';
import { Button } from '@/components/canary/primitives/button';

const MOCK_NEW_IMAGE = 'https://picsum.photos/seed/arda-new/400/400';
const MOCK_UPLOADED_IMAGE = 'https://picsum.photos/seed/arda-uploaded/400/400';

/** Live component used by Interactive and Automated modes. */
function ImageEditLive() {
  const [imageUrl, setImageUrl] = React.useState<string | null>(MOCK_ITEM_IMAGE);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32">
        <ImageDisplay
          imageUrl={imageUrl}
          entityTypeDisplayName="Item"
          propertyDisplayName="Product Image"
          config={ITEM_IMAGE_CONFIG}
          onImageChange={(result) => setImageUrl(result.imageUrl)}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono break-all max-w-xs text-center">
        {imageUrl ?? '(no image)'}
      </span>
    </div>
  );
}

/** Dialog-like wrapper for Stepwise scenes that show dialog content. */
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

/** Static snapshots used by Stepwise mode — renders actual components per scene. */
function ImageEditScene({ sceneIndex }: { sceneIndex: number }) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Thumbnail with existing image
    case 0:
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-32">
            <ImageDisplay
              imageUrl={MOCK_ITEM_IMAGE}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
              config={ITEM_IMAGE_CONFIG}
              onImageChange={noop}
            />
          </div>
          <span className="text-xs text-muted-foreground">Double-click to edit</span>
        </div>
      );

    // Scene 2: EditExisting — side-by-side comparison with baked-in action buttons
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
              onCropChange={noop}
              onReset={noop}
            />
          </ImageComparisonLayout>
        </DialogFrame>
      );

    // Scene 3: EmptyImage — drop zone
    case 2:
      return (
        <DialogFrame
          title="Add Product Image"
          footer={
            <Button variant="secondary" disabled>
              Cancel
            </Button>
          }
        >
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </DialogFrame>
      );

    // Scene 4: ProvidedImage — crop editor with new image
    case 3:
      return (
        <DialogFrame title="Edit Product Image">
          <ImagePreviewEditor
            aspectRatio={1}
            imageData={MOCK_NEW_IMAGE}
            onCropChange={noop}
            onReset={noop}
          />
          <div className="mt-4">
            <CopyrightAcknowledgment acknowledged={false} onAcknowledge={noop} />
          </div>
        </DialogFrame>
      );

    // Scene 5: Zoomed — crop editor with zoom applied
    case 4:
      return (
        <DialogFrame title="Edit Product Image">
          <ImagePreviewEditor
            aspectRatio={1}
            imageData={MOCK_NEW_IMAGE}
            onCropChange={noop}
            onReset={noop}
          />
          <div className="mt-4">
            <CopyrightAcknowledgment acknowledged={false} onAcknowledge={noop} />
          </div>
        </DialogFrame>
      );

    // Scene 6: Copyright acknowledged — Confirm enabled
    case 5:
      return (
        <DialogFrame
          title="Edit Product Image"
          footer={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button variant="default" className="bg-primary text-primary-foreground">
                Confirm
              </Button>
            </>
          }
        >
          <ImagePreviewEditor
            aspectRatio={1}
            imageData={MOCK_NEW_IMAGE}
            onCropChange={noop}
            onReset={noop}
          />
          <div className="mt-4">
            <CopyrightAcknowledgment acknowledged={true} onAcknowledge={noop} />
          </div>
        </DialogFrame>
      );

    // Scene 7: Uploading — progress bar
    case 6:
      return (
        <DialogFrame
          title="Edit Product Image"
          footer={
            <Button variant="secondary" disabled>
              Uploading&#8230;
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">Uploading image&#8230;</p>
            <Progress value={65} className="bg-muted" />
          </div>
        </DialogFrame>
      );

    // Scene 8: Done — new image in thumbnail
    case 7:
    default:
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-32">
            <ImageDisplay
              imageUrl={MOCK_UPLOADED_IMAGE}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">{MOCK_UPLOADED_IMAGE}</span>
        </div>
      );
  }
}

const happyPathScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 8 \u2014 Existing Image',
    description:
      'The thumbnail shows the current product image. The component is in interactive mode (onImageChange + config provided), so double-clicking or pressing Enter opens the upload dialog.',
    interaction: 'Double-click the thumbnail to open the editor.',
  },
  {
    title: 'Scene 2 of 8 \u2014 EditExisting Mode',
    description:
      'The dialog opens in EditExisting mode showing a side-by-side comparison: the current image on the left, and an ImagePreviewEditor with crop/zoom/rotate controls on the right.',
    interaction: 'Click "Upload New Image" to replace the image with a new one.',
  },
  {
    title: 'Scene 3 of 8 \u2014 Drop Zone',
    description:
      'The dialog switches to EmptyImage mode, showing the ImageDropZone. The user can drag-and-drop a file, paste from clipboard, or enter a URL.',
    interaction: 'Type an image URL in the text field and click "Go".',
  },
  {
    title: 'Scene 4 of 8 \u2014 URL Submitted',
    description:
      'The URL passes validation (starts with https://) and the reachability check. The dialog transitions to ProvidedImage, showing the crop editor with the new image.',
    interaction: 'Adjust the zoom slider to crop the image.',
  },
  {
    title: 'Scene 5 of 8 \u2014 Zoom Adjusted',
    description:
      'The zoom slider has been moved to the right, enlarging the image within the crop area. The user can also rotate using the toolbar buttons.',
    interaction: 'Check the copyright acknowledgment checkbox.',
  },
  {
    title: 'Scene 6 of 8 \u2014 Copyright Acknowledged',
    description:
      'The copyright checkbox is checked, enabling the "Confirm" button. This gate ensures the user asserts they have rights to use the image.',
    interaction: 'Click "Confirm" to start the upload.',
  },
  {
    title: 'Scene 7 of 8 \u2014 Uploading',
    description:
      'The dialog shows a progress bar while the image is being uploaded. The footer shows a disabled "Uploading\u2026" button. The dialog cannot be dismissed during upload.',
    interaction: 'Wait for the upload to complete.',
  },
  {
    title: 'Scene 8 of 8 \u2014 Image Updated',
    description:
      'The upload is complete. The dialog has closed and the thumbnail now shows the new image. The URL below the thumbnail has changed to the uploaded image URL.',
    interaction: 'The workflow is complete. Double-click again to start a new edit.',
  },
];

const {
  Interactive: HappyPathInteractive,
  Stepwise: HappyPathStepwise,
  Automated: HappyPathAutomated,
} = createWorkflowStories({
  scenes: happyPathScenes,
  renderScene: (i) => <ImageEditScene sceneIndex={i} />,
  renderLive: () => <ImageEditLive />,
  delayMs: 1500,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Step 1 → 2: Double-click to open dialog
    const button = canvas.getByRole('button', { name: /edit.*image/i });
    await userEvent.dblClick(button);
    await waitFor(
      () => {
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toBeTruthy();
      },
      { timeout: 5000 },
    );
    goToScene(1);
    await delay();

    // Step 2 → 3: Click "Upload New Image"
    const uploadNewBtn = within(document.body).getByRole('button', { name: /upload new/i });
    await userEvent.click(uploadNewBtn);
    goToScene(2);
    await delay();

    // Step 3 → 4: Enter URL and click Go
    const urlInput = within(document.body).getByPlaceholderText(/paste an image url/i);
    await userEvent.click(urlInput);
    await userEvent.type(urlInput, 'https://picsum.photos/seed/arda-new/400/400', { delay: 20 });
    const goBtn = within(document.body).getByRole('button', { name: 'Go' });
    await userEvent.click(goBtn);
    goToScene(3);
    await delay();

    // Step 4 → 5: Adjust zoom
    await waitFor(
      () => {
        const slider = document.querySelector('[role="slider"]');
        expect(slider).toBeTruthy();
      },
      { timeout: 5000 },
    );
    const slider = document.querySelector('[role="slider"]') as HTMLElement;
    if (slider) {
      slider.focus();
      for (let i = 0; i < 5; i++) {
        await userEvent.keyboard('{ArrowRight}');
      }
    }
    goToScene(4);
    await delay();

    // Step 5 → 6: Check copyright
    const checkbox = within(document.body).getByRole('checkbox', { name: /copyright/i });
    await userEvent.click(checkbox);
    goToScene(5);
    await delay();

    // Step 6 → 7: Click Confirm
    const confirmBtn = within(document.body).getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmBtn);
    goToScene(6);
    await delay();

    // Step 7 → 8: Wait for upload to complete
    await waitFor(
      () => {
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toBeFalsy();
      },
      { timeout: 10000 },
    );
    goToScene(7);
    await delay();

    // Final assertion
    await waitFor(() => {
      expect(canvas.getByText(/arda-uploaded/i)).toBeInTheDocument();
    });
  },
});

// Re-export under the ImageDisplay stories. These use StoryObj (not Story)
// because the workflow viewers don't receive ImageDisplayProps args.
export const EditFlowInteractive: StoryObj = {
  ...HappyPathInteractive,
  name: 'Edit Flow (Interactive)',
};

export const EditFlowStepwise: StoryObj = {
  ...HappyPathStepwise,
  name: 'Edit Flow (Stepwise)',
};

export const EditFlowAutomated: StoryObj = {
  ...HappyPathAutomated,
  name: 'Edit Flow (Automated)',
};

/** Image successfully loaded. */
