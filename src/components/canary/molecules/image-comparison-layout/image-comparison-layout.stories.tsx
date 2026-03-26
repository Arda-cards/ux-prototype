import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  MOCK_ITEM_IMAGE,
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/components/canary/__mocks__/image-story-data';

import { ImageComparisonLayout } from './image-comparison-layout';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';

const meta = {
  title: 'Components/Canary/Molecules/ImageComparisonLayout',
  component: ImageComparisonLayout,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Side-by-side (desktop) or tabbed (mobile) comparison of existing vs new image. ' +
          'When existingImageUrl is null, only children are rendered (pass-through mode).',
      },
    },
  },
  argTypes: {
    existingImageUrl: {
      control: 'text',
      description: 'URL of the existing image. Set to empty string or null to disable comparison.',
    },
    entityTypeDisplayName: { control: 'text' },
    propertyDisplayName: { control: 'text' },
  },
} satisfies Meta<typeof ImageComparisonLayout>;

export default meta;
type Story = StoryObj<typeof ImageComparisonLayout>;
/** Desktop side-by-side with baked-in Accept/Dismiss/Upload New buttons. */
export const DesktopSideBySide: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState<string | null>(null);
    return (
      <div className="max-w-2xl flex flex-col gap-4">
        <ImageComparisonLayout
          existingImageUrl={MOCK_ITEM_IMAGE}
          entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
          propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
          onAccept={() => setLastAction('Accept: apply edits')}
          onDismiss={() => setLastAction('Dismiss: discard changes')}
          onUploadNew={() => setLastAction('Upload New: switch to upload surface')}
        >
          <ImagePreviewEditor
            aspectRatio={ITEM_IMAGE_CONFIG.aspectRatio}
            imageData={MOCK_ITEM_IMAGE}
            onCropChange={() => {}}
            onReset={() => {}}
          />
        </ImageComparisonLayout>
        {lastAction !== null && (
          <p className="text-sm text-muted-foreground text-center">
            Last action: <span className="font-medium text-foreground">{lastAction}</span>
          </p>
        )}
      </div>
    );
  },
};

/**
 * Mobile tabbed layout.
 *
 * The viewport is hinted to mobile1 so Storybook renders at a phone width,
 * showing the Tabs interface instead of the desktop side-by-side layout.
 */
/** Mobile tabbed layout — viewport hinted to phone width. */
export const MobileTabs: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <ImageComparisonLayout
      existingImageUrl={MOCK_ITEM_IMAGE}
      entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
      propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
    >
      <ImagePreviewEditor
        aspectRatio={ITEM_IMAGE_CONFIG.aspectRatio}
        imageData={MOCK_ITEM_IMAGE}
        onCropChange={() => {}}
        onReset={() => {}}
      />
    </ImageComparisonLayout>
  ),
};

/**
 * No existing image &#8212; pass-through mode.
 *
 * When `existingImageUrl` is `null` the component renders only `children`
 * without any comparison UI.
 */
/** No existing image &#8212; pass-through mode, only children rendered. */
export const NoExistingImage: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ImageComparisonLayout
        existingImageUrl={null}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <ImagePreviewEditor
          aspectRatio={ITEM_IMAGE_CONFIG.aspectRatio}
          imageData="https://picsum.photos/seed/arda-new-image/400/400"
          onCropChange={() => {}}
          onReset={() => {}}
        />
      </ImageComparisonLayout>
    </div>
  ),
};

/**
 * Broken existing image &#8212; the existing image URL fails to load.
 *
 * The ImageDisplay for the existing image shows the initials placeholder with
 * an error badge, while the new image area remains functional.
 */
/** Broken existing image &#8212; shows initials + error badge on Current side. */
export const ExistingImageBroken: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ImageComparisonLayout
        existingImageUrl={MOCK_BROKEN_IMAGE}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <ImagePreviewEditor
          aspectRatio={ITEM_IMAGE_CONFIG.aspectRatio}
          imageData="https://picsum.photos/seed/arda-new-image/400/400"
          onCropChange={() => {}}
          onReset={() => {}}
        />
      </ImageComparisonLayout>
    </div>
  ),
};

/** Interactive playground &#8212; adjust props via the Controls panel. */
export const Playground: Story = {
  args: {
    existingImageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: ITEM_IMAGE_CONFIG.entityTypeDisplayName,
    propertyDisplayName: ITEM_IMAGE_CONFIG.propertyDisplayName,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <ImageComparisonLayout {...args}>
        <ImagePreviewEditor
          aspectRatio={ITEM_IMAGE_CONFIG.aspectRatio}
          imageData={args.existingImageUrl ?? MOCK_ITEM_IMAGE}
          onCropChange={() => {}}
          onReset={() => {}}
        />
      </ImageComparisonLayout>
    </div>
  ),
};
