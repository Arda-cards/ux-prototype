/**
 * GEN-MEDIA-0001::0005.FS — Preview and Crop
 * Scene: URL Loading
 *
 * Demonstrates ImagePreviewEditor loading states when the image source is an
 * HTTPS URL. Two variants are provided:
 *   - SlowLoad: a large image URL that takes time to download, showing the
 *     native loading state from react-easy-crop while the image loads.
 *   - TimeoutError: a broken/unreachable URL that the underlying Cropper
 *     will fail to load, leaving the crop area empty.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import {
  MOCK_LARGE_IMAGE,
  MOCK_BROKEN_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ImagePreviewEditor> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/URL Loading',
  component: ImagePreviewEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Demonstrates URL-based image loading in ImagePreviewEditor. ' +
          '**SlowLoad**: a large image URL that takes visible time to download, ' +
          'showing the Cropper native loading state. ' +
          '**TimeoutError**: an unreachable URL leaves the crop area empty.',
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: { type: 'number', min: 0.25, max: 4, step: 0.25 },
      description: 'Locked aspect ratio for the crop area.',
    },
    imageData: {
      control: 'text',
      description: 'Image URL to load.',
    },
    onCropComplete: { action: 'onCropComplete' },
    onZoomChange: { action: 'onZoomChange' },
    onRotationChange: { action: 'onRotationChange' },
    onReset: { action: 'onReset' },
  },
  args: {
    aspectRatio: 1,
    onCropComplete: fn(),
    onZoomChange: fn(),
    onRotationChange: fn(),
    onReset: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80 space-y-3">
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
 * Slow Load &#8212; uses a large 2048x2048 image URL. On first render the crop
 * area shows the Cropper&#x2019;s native loading indicator while the image
 * downloads over the network. Once loaded the crop and zoom controls become
 * active.
 */
export const SlowLoad: Story = {
  args: {
    imageData: MOCK_LARGE_IMAGE,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Large 2048x2048 image URL. The react-easy-crop component shows its ' +
          'native loading state (shimmer/spinner) until the image has fully downloaded.',
      },
    },
  },
};

/**
 * Timeout Error &#8212; passes a URL that will fail to load (404 / CORS error).
 * The react-easy-crop crop area remains blank and the toolbar is still shown,
 * allowing the user to reset or navigate away.
 */
export const TimeoutError: Story = {
  args: {
    imageData: MOCK_BROKEN_IMAGE,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Broken / unreachable URL. The Cropper canvas stays empty because the ' +
          'image fails to load. The toolbar remains visible so the user can reset.',
      },
    },
  },
};
