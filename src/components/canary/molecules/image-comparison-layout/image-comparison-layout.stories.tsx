import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_ITEM_IMAGE,
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/components/canary/__mocks__/image-story-data';

import { ImageComparisonLayout } from './image-comparison-layout';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

/** Placeholder representing new image content (e.g. ImagePreviewEditor). */
function NewImagePlaceholder({ label = 'New Image Area' }: { label?: string }) {
  return (
    <div
      className="w-full aspect-square max-w-64 rounded bg-muted/50 border border-dashed border-border flex items-center justify-center"
      aria-label={label}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

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
export const DesktopSideBySide: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ImageComparisonLayout
        existingImageUrl={MOCK_ITEM_IMAGE}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <NewImagePlaceholder label="Drop or select new image" />
      </ImageComparisonLayout>
    </div>
  ),
};

/**
 * Mobile tabbed layout.
 *
 * The viewport is hinted to mobile1 so Storybook renders at a phone width,
 * showing the Tabs interface instead of the desktop side-by-side layout.
 */
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
      <NewImagePlaceholder label="Drop or select new image" />
    </ImageComparisonLayout>
  ),
};

/**
 * No existing image &#8212; pass-through mode.
 *
 * When `existingImageUrl` is `null` the component renders only `children`
 * without any comparison UI.
 */
export const NoExistingImage: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ImageComparisonLayout
        existingImageUrl={null}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <NewImagePlaceholder label="No existing image — full width" />
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
export const ExistingImageBroken: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ImageComparisonLayout
        existingImageUrl={MOCK_BROKEN_IMAGE}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <NewImagePlaceholder label="Replace with new image" />
      </ImageComparisonLayout>
    </div>
  ),
};

/**
 * With loaded new image &#8212; both Current and New panels show real images.
 * This demonstrates the comparison layout with actual image content on both sides.
 */
export const WithLoadedNewImage: Story = {
  render: () => (
    <div className="max-w-2xl">
      <ImageComparisonLayout
        existingImageUrl={MOCK_ITEM_IMAGE}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <div className="w-full aspect-square max-w-64">
          <ImageDisplay
            imageUrl="https://picsum.photos/seed/arda-new-image/400/400"
            entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
            propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
          />
        </div>
      </ImageComparisonLayout>
    </div>
  ),
};

/**
 * Interactive &#8212; double-click the Current image to trigger `onEditExisting`.
 * The New image also supports double-click via `onEdit` on ImageDisplay.
 */
export const InteractiveEdit: Story = {
  render: () => {
    const [editTarget, setEditTarget] = React.useState<string | null>(null);

    return (
      <div className="max-w-2xl flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Double-click either image to trigger its edit callback. The last action is shown below.
        </p>
        <ImageComparisonLayout
          existingImageUrl={MOCK_ITEM_IMAGE}
          entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
          propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
          onEditExisting={() => setEditTarget('Editing CURRENT image')}
        >
          <div className="w-full aspect-square max-w-64">
            <ImageDisplay
              imageUrl="https://picsum.photos/seed/arda-new-image/400/400"
              entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
              propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
              onEdit={() => setEditTarget('Editing NEW image')}
            />
          </div>
        </ImageComparisonLayout>
        {editTarget && <p className="text-sm font-medium text-primary">{editTarget}</p>}
      </div>
    );
  },
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
        <NewImagePlaceholder />
      </ImageComparisonLayout>
    </div>
  ),
};

/** Desktop side-by-side layout with an existing image and a new image placeholder. */
