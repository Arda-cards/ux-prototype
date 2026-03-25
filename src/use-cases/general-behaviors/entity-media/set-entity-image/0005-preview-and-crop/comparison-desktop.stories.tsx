/**
 * GEN-MEDIA-0001::0005.FS — Preview and Crop
 * Scene: Comparison Desktop
 *
 * Renders ImageComparisonLayout with an existing image and ImagePreviewEditor
 * as children (new image). Desktop viewport shows the side-by-side layout:
 * a small reference on the left and the full preview editor on the right.
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

interface ComparisonDesktopPageProps {
  existingImageUrl: string;
  newImageUrl: string;
  aspectRatio: number;
  onCropChange: (cropData: CropData) => void;
  onReset: () => void;
}

function ComparisonDesktopPage({
  existingImageUrl,
  newImageUrl,
  aspectRatio,
  onCropChange,
  onReset,
}: ComparisonDesktopPageProps) {
  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 &#8212; Preview and Crop: Comparison Desktop
      </h1>
      <p className="text-sm text-muted-foreground">
        Side-by-side layout: the existing image appears as a small reference on the left, and the
        new image editor fills the right panel.
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

const meta: Meta<typeof ComparisonDesktopPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/Comparison Desktop',
  component: ComparisonDesktopPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Desktop side-by-side comparison of existing vs new image. ' +
          'The left panel shows the current image at thumbnail size; ' +
          'the right panel hosts the full ImagePreviewEditor.',
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
type Story = StoryObj<typeof ComparisonDesktopPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Desktop side-by-side layout &#8212; resize the Storybook canvas to a wide viewport
 * to see the full layout. On narrow screens the component automatically switches
 * to the tabbed mobile layout.
 */
export const Default: Story = {};

/** Playground &#8212; use Controls to try different image URLs and aspect ratios. */
export const Playground: Story = {};
