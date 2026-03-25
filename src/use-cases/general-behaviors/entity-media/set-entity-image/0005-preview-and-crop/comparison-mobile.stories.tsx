/**
 * GEN-MEDIA-0001::0005.FS — Preview and Crop
 * Scene: Comparison Mobile
 *
 * Same as Comparison Desktop but at mobile viewport. The ImageComparisonLayout
 * switches to a tabbed interface with "Current" and "New" tabs.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { ImageComparisonLayout } from '@/components/canary/molecules/image-comparison-layout/image-comparison-layout';
import {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  ITEM_IMAGE_CONFIG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { CropData } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface ComparisonMobilePageProps {
  existingImageUrl: string;
  newImageUrl: string;
  aspectRatio: number;
  onCropChange: (cropData: CropData) => void;
  onReset: () => void;
}

function ComparisonMobilePage({
  existingImageUrl,
  newImageUrl,
  aspectRatio,
  onCropChange,
  onReset,
}: ComparisonMobilePageProps) {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">
        GEN-MEDIA-0001 &#8212; Preview and Crop: Comparison Mobile
      </h1>
      <p className="text-sm text-muted-foreground">
        On narrow viewports the comparison switches to a tabbed layout. Select the{' '}
        <strong>Current</strong> tab to view the existing image, or <strong>New</strong> to edit the
        replacement.
      </p>

      <ImageComparisonLayout
        existingImageUrl={existingImageUrl}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      >
        <ImagePreviewEditor
          aspectRatio={aspectRatio}
          imageData={newImageUrl}
          onCropChange={onCropChange}
          onReset={onReset}
        />
      </ImageComparisonLayout>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ComparisonMobilePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/Comparison Mobile',
  component: ComparisonMobilePage,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        component:
          'Mobile tabbed comparison layout. ' +
          'ImageComparisonLayout renders "Current" and "New" tabs below the md: breakpoint. ' +
          'Set the Storybook viewport to mobile1 to see the tabbed interface.',
      },
    },
  },
  argTypes: {
    existingImageUrl: {
      control: 'text',
      description: 'URL of the existing (current) image.',
    },
    newImageUrl: {
      control: 'text',
      description: 'URL of the new image to edit.',
    },
    aspectRatio: {
      control: { type: 'number', min: 0.25, max: 4, step: 0.25 },
      description: 'Locked aspect ratio for the crop area.',
    },
    onCropChange: { action: 'onCropChange' },
    onReset: { action: 'onReset' },
  },
  args: {
    existingImageUrl: MOCK_ITEM_IMAGE,
    newImageUrl: MOCK_ITEM_IMAGE_ALT,
    aspectRatio: 1,
    onCropChange: fn(),
    onReset: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ComparisonMobilePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Mobile tabbed layout &#8212; the Storybook viewport is set to mobile1 so the
 * "Current" / "New" Tabs interface is shown by default.
 */
export const Default: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

/** Playground &#8212; use Controls to try different image URLs and aspect ratios. */
export const Playground: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
