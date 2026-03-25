import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_ITEM_IMAGE,
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/components/canary/__mocks__/image-story-data';

import { ImageDisplay } from './image-display';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

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
 * Double-click-to-edit demo &#8212; standalone thumbnail with ImageUploadDialog integration.
 * No AG Grid involved. Double-click the thumbnail to open the upload dialog. Confirm
 * to update the image URL; Cancel to keep the current image.
 */
export const DoubleClickToEdit: Story = {
  render: () => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(MOCK_ITEM_IMAGE);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleConfirm = (result: ImageUploadResult) => {
      setImageUrl(result.imageUrl);
      setDialogOpen(false);
    };

    const handleCancel = () => {
      setDialogOpen(false);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          Double-click the thumbnail to open the ImageUploadDialog. Confirm to change the image;
          Cancel to keep the current one.
        </p>

        {/* Clickable thumbnail */}
        <button
          type="button"
          onDoubleClick={() => setDialogOpen(true)}
          className="w-32 h-32 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Edit image"
        >
          <ImageDisplay
            imageUrl={imageUrl}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
          />
        </button>

        <span className="text-xs text-muted-foreground font-mono break-all max-w-xs text-center">
          {imageUrl ?? '(no image)'}
        </span>

        {/* Upload dialog */}
        <ImageUploadDialog
          config={ITEM_IMAGE_CONFIG}
          existingImageUrl={imageUrl}
          open={dialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
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

/** Image successfully loaded. */
