import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  MOCK_LARGE_IMAGE,
} from '@/components/canary/__mocks__/image-story-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

import { ImagePreviewPopover } from './image-preview-popover';

const meta = {
  title: 'Components/Canary/Molecules/ImagePreviewPopover',
  component: ImagePreviewPopover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Click-to-open popover showing a larger image preview. ' +
          'Wraps a trigger element. No focus trap or backdrop overlay.',
      },
    },
  },
  argTypes: {
    imageUrl: { control: 'text' },
    entityTypeDisplayName: { control: 'text' },
    propertyDisplayName: { control: 'text' },
  },
} satisfies Meta<typeof ImagePreviewPopover>;

export default meta;
type Story = StoryObj<typeof ImagePreviewPopover>;

/**
 * ClickToPreview &#8212; click the thumbnail to reveal the 256&#215;256 preview popover.
 * Click again, click outside, or press Escape to close it.
 */
export const ClickToPreview: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <ImagePreviewPopover
        imageUrl={MOCK_LARGE_IMAGE}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      >
        <button type="button" className="w-16 h-16 cursor-pointer rounded overflow-hidden">
          <ImageDisplay
            imageUrl={MOCK_LARGE_IMAGE}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
          />
        </button>
      </ImagePreviewPopover>
      <p className="text-xs text-muted-foreground">Click the thumbnail to preview</p>
    </div>
  ),
};

/**
 * NoPreviewWhenEmpty &#8212; when `imageUrl` is null there is nothing to preview:
 * the trigger renders unwrapped and clicking does nothing.
 */
export const NoPreviewWhenEmpty: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <ImagePreviewPopover
        imageUrl={null}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      >
        <button type="button" className="w-16 h-16 cursor-pointer rounded overflow-hidden">
          <ImageDisplay
            imageUrl={null}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
          />
        </button>
      </ImagePreviewPopover>
      <p className="text-xs text-muted-foreground">imageUrl is null &#8212; click has no effect</p>
    </div>
  ),
};

/**
 * MultipleInRow &#8212; three thumbnails in a flex row, each with an independent
 * click preview. Click each thumbnail to see its own popover.
 */
export const MultipleInRow: Story = {
  render: () => {
    const items = [
      { id: '1', imageUrl: MOCK_ITEM_IMAGE, label: 'Item A' },
      { id: '2', imageUrl: MOCK_ITEM_IMAGE_ALT, label: 'Item B' },
      { id: '3', imageUrl: null, label: 'Item C (no image)' },
    ];

    return (
      <div className="flex items-end gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1">
            <ImagePreviewPopover
              imageUrl={item.imageUrl}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            >
              <button type="button" className="w-16 h-16 cursor-pointer rounded overflow-hidden">
                <ImageDisplay
                  imageUrl={item.imageUrl}
                  entityTypeDisplayName="Item"
                  propertyDisplayName="Product Image"
                />
              </button>
            </ImagePreviewPopover>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Playground &#8212; adjust `imageUrl`, `entityTypeDisplayName`, and `propertyDisplayName`
 * in the Controls panel. The trigger is a 64&#215;64 ImageDisplay thumbnail.
 */
export const Playground: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
    propertyDisplayName: 'Product Image',
  },
  render: (args) => (
    <ImagePreviewPopover {...args}>
      <button type="button" className="w-16 h-16 cursor-pointer rounded overflow-hidden">
        <ImageDisplay
          imageUrl={args.imageUrl}
          entityTypeDisplayName={args.entityTypeDisplayName}
          propertyDisplayName={args.propertyDisplayName}
        />
      </button>
    </ImagePreviewPopover>
  ),
};
