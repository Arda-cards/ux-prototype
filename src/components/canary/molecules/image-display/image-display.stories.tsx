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

// --- Helper ---
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Animated Happy Path &#8212; walks through the full edit-upload workflow:
 *
 * 1. Start with a pre-existing image
 * 2. Double-click to open the upload dialog (EditExisting mode)
 * 3. Click "Upload New Image" to switch to the drop zone
 * 4. Enter a URL and click Go
 * 5. Adjust zoom on the crop editor
 * 6. Check copyright acknowledgment
 * 7. Click Confirm &#8594; upload progress &#8594; new image displayed
 *
 * Each step pauses briefly so the viewer can follow along.
 */
export const AnimatedHappyPath: Story = {
  render: () => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(MOCK_ITEM_IMAGE);
    return (
      <div className="flex flex-col items-center gap-4" data-testid="happy-path-root">
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          Watch the full edit-upload workflow animate automatically.
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const STEP_DELAY = 1500;

    // Step 1: Wait for the image to load
    await step('Image loads in the thumbnail', async () => {
      await waitFor(
        () => {
          const img = canvasElement.querySelector('[data-slot="image-display"] img');
          expect(img).toBeTruthy();
        },
        { timeout: 5000 },
      );
      await delay(STEP_DELAY);
    });

    // Step 2: Double-click to open the upload dialog
    await step('Double-click thumbnail to open editor', async () => {
      const button = canvas.getByRole('button', { name: /edit.*image/i });
      await userEvent.dblClick(button);
      await delay(500);
      // Dialog should be open in EditExisting mode
      await waitFor(
        () => {
          const dialog = canvasElement.ownerDocument.querySelector('[role="dialog"]');
          expect(dialog).toBeTruthy();
        },
        { timeout: 3000 },
      );
      await delay(STEP_DELAY);
    });

    // Step 3: Click "Upload New Image" to go to drop zone
    await step('Click "Upload New Image" to switch to drop zone', async () => {
      const doc = canvasElement.ownerDocument;
      const uploadNewBtn = within(doc.body).getByRole('button', { name: /upload new/i });
      await userEvent.click(uploadNewBtn);
      await delay(STEP_DELAY);
    });

    // Step 4: Enter a URL and click Go
    await step('Enter an image URL and click Go', async () => {
      const doc = canvasElement.ownerDocument;
      const urlInput = within(doc.body).getByPlaceholderText(/paste an image url/i);
      await userEvent.click(urlInput);
      await userEvent.type(urlInput, 'https://picsum.photos/seed/arda-new/400/400', {
        delay: 20,
      });
      await delay(800);

      const goBtn = within(doc.body).getByRole('button', { name: 'Go' });
      await userEvent.click(goBtn);
      await delay(STEP_DELAY);
    });

    // Step 5: Interact with the crop editor — adjust zoom
    await step('Adjust zoom on the crop editor', async () => {
      const doc = canvasElement.ownerDocument;
      await waitFor(
        () => {
          const slider = doc.querySelector('[role="slider"]');
          expect(slider).toBeTruthy();
        },
        { timeout: 5000 },
      );
      // Click the slider area to adjust zoom
      const slider = doc.querySelector('[role="slider"]') as HTMLElement;
      if (slider) {
        // Press ArrowRight a few times to zoom in
        slider.focus();
        for (let i = 0; i < 5; i++) {
          await userEvent.keyboard('{ArrowRight}');
          await delay(150);
        }
      }
      await delay(STEP_DELAY);
    });

    // Step 6: Check copyright acknowledgment
    await step('Check copyright acknowledgment', async () => {
      const doc = canvasElement.ownerDocument;
      const checkbox = within(doc.body).getByRole('checkbox', { name: /copyright/i });
      await userEvent.click(checkbox);
      await delay(STEP_DELAY);
    });

    // Step 7: Click Confirm — triggers upload progress
    await step('Click Confirm and wait for upload to complete', async () => {
      const doc = canvasElement.ownerDocument;
      const confirmBtn = within(doc.body).getByRole('button', { name: /confirm/i });
      await userEvent.click(confirmBtn);
      // Wait for upload to complete and dialog to close (~2s)
      await waitFor(
        () => {
          const dialog = doc.querySelector('[role="dialog"]');
          expect(dialog).toBeFalsy();
        },
        { timeout: 10000 },
      );
      await delay(STEP_DELAY);
    });

    // Step 8: Verify the new image URL is displayed (mock handler returns arda-uploaded)
    await step('New image is displayed', async () => {
      await waitFor(() => {
        expect(canvas.getByText(/arda-uploaded/i)).toBeInTheDocument();
      });
    });
  },
};

/** Image successfully loaded. */
