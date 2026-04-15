/**
 * GEN-MEDIA-0001::0005.FS — Preview and Crop
 * Scene: New Image
 *
 * Renders ImagePreviewEditor with a valid image at 1:1 locked aspect ratio
 * and no existing image to compare against. The Controls panel exposes
 * aspectRatio and imageData for interactive exploration.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  MOCK_LARGE_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';

// ---------------------------------------------------------------------------
// Image presets for the Controls panel
// ---------------------------------------------------------------------------

const IMAGE_PRESETS: Record<string, string> = {
  'Standard (400x400)': MOCK_ITEM_IMAGE,
  'Alternate (400x400)': MOCK_ITEM_IMAGE_ALT,
  'Large (2048x2048)': MOCK_LARGE_IMAGE,
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ImagePreviewEditor> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/New Image',
  component: ImagePreviewEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ImagePreviewEditor with a new image and no existing image comparison. ' +
          'Use the Controls panel to adjust aspectRatio or switch between image presets.',
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: { type: 'number', min: 0.25, max: 4, step: 0.25 },
      description: 'Locked aspect ratio for the crop area (e.g. 1 for 1:1, 1.778 for 16:9).',
      table: { category: 'Static' },
    },
    imageData: {
      control: { type: 'select' },
      options: Object.keys(IMAGE_PRESETS),
      mapping: IMAGE_PRESETS,
      description: 'Image source &#8212; select a preset URL.',
      table: { category: 'Runtime' },
    },
    onCropComplete: {
      action: 'onCropComplete',
      description: 'Called with the final pixel crop when the crop area changes.',
      table: { category: 'Runtime' },
    },
    onZoomChange: {
      action: 'onZoomChange',
      description: 'Called when the zoom slider changes.',
      table: { category: 'Runtime' },
    },
    onRotationChange: {
      action: 'onRotationChange',
      description: 'Called when the user rotates clockwise or counter-clockwise.',
      table: { category: 'Runtime' },
    },
    onReset: {
      action: 'onReset',
      description: 'Called when the Reset button is clicked.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onCropComplete: fn(),
    onZoomChange: fn(),
    onRotationChange: fn(),
    onReset: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImagePreviewEditor>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default 1:1 view with MOCK_ITEM_IMAGE &#8212; no existing image, no comparison layout.
 */
export const Default: Story = {
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * Playground &#8212; adjust aspectRatio and image source in the Controls panel.
 */
export const Playground: Story = {
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};
