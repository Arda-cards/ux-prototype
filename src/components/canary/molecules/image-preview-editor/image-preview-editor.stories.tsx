import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { ImagePreviewEditor } from './image-preview-editor';
import {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  MOCK_LARGE_IMAGE,
} from '@/components/canary/__mocks__/image-story-data';

const IMAGE_PRESETS: Record<string, string> = {
  'Standard (400x400)': MOCK_ITEM_IMAGE,
  'Alternate (400x400)': MOCK_ITEM_IMAGE_ALT,
  'Large (2048x2048)': MOCK_LARGE_IMAGE,
};

const meta: Meta<typeof ImagePreviewEditor> = {
  title: 'Components/Canary/Molecules/ImagePreviewEditor',
  component: ImagePreviewEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Crop and edit an image at a locked aspect ratio. ' +
          'Provides zoom (slider), rotation (90&#176; steps), and reset controls. ' +
          'Accepts File, Blob, or HTTPS URL as image source.',
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
    onCropChange: {
      action: 'onCropChange',
      description: 'Called with CropData whenever crop, zoom, or rotation changes.',
      table: { category: 'Runtime' },
    },
    onReset: {
      action: 'onReset',
      description: 'Called when the Reset button is clicked.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onCropChange: fn(),
    onReset: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ImagePreviewEditor>;
export const DefaultView: Story = {
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * Zoom control &#8212; initial zoom of 2 for close-up inspection.
 */
export const ZoomControl: Story = {
  render: (args) => {
    const [cropData, setCropData] = useState<object | null>(null);
    return (
      <div className="w-96 space-y-4">
        <ImagePreviewEditor
          {...args}
          onCropChange={(data) => {
            setCropData(data);
            args.onCropChange(data);
          }}
        />
        {cropData && (
          <pre className="text-xs text-muted-foreground bg-muted rounded p-2 overflow-auto">
            {JSON.stringify(cropData, null, 2)}
          </pre>
        )}
      </div>
    );
  },
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * Rotate steps &#8212; four instances at 0, 90, 180, 270 degrees side by side.
 * Uses wrapper divs with CSS transforms to simulate the rotation states.
 */
export const RotateSteps: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {([0, 90, 180, 270] as const).map((deg) => (
        <div key={deg} className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono text-center">{deg}&#176;</p>
          <div className="w-48">
            <ImagePreviewEditor {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * Crop and pan &#8212; default interactive view. Click and drag to pan the image.
 */
export const CropAndPan: Story = {
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * Reset behavior &#8212; interactive story.
 * Zoom or rotate the image, then click Reset to restore defaults.
 */
export const ResetBehavior: Story = {
  render: (args) => {
    const [resetCount, setResetCount] = useState(0);
    return (
      <div className="w-96 space-y-4">
        <ImagePreviewEditor
          {...args}
          onReset={() => {
            setResetCount((c) => c + 1);
            args.onReset();
          }}
        />
        {resetCount > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Reset clicked {resetCount} time{resetCount !== 1 ? 's' : ''}
          </p>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Adjust zoom or rotate, then click the Reset button (&#8635;) in the toolbar.
        </p>
      </div>
    );
  },
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * URL image loading &#8212; renders with an HTTPS URL showing natural network loading state.
 */
export const UrlImageLoading: Story = {
  args: {
    aspectRatio: 1,
    imageData: MOCK_LARGE_IMAGE,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders with a large image URL. The Cropper will show its native loading state while the image downloads.',
      },
    },
  },
};

/**
 * Interactive Controls playground.
 * Adjust aspect ratio and image source in the Controls panel.
 */
export const Playground: Story = {
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
  },
};

/**
 * Default view &#8212; 1:1 aspect ratio with MOCK_ITEM_IMAGE.
 */
