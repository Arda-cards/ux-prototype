import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  MOCK_LARGE_IMAGE,
} from '@/components/canary/__mocks__/image-story-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

import { ImageHoverPreview } from './image-hover-preview';

const meta = {
  title: 'Components/Canary/Molecules/ImageHoverPreview',
  component: ImageHoverPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Lightweight hover popover showing a larger image preview after ~500 ms. ' +
          'Wraps any trigger element. No focus trap or backdrop overlay.',
      },
    },
  },
  argTypes: {
    imageUrl: { control: 'text' },
    entityTypeDisplayName: { control: 'text' },
    propertyDisplayName: { control: 'text' },
  },
} satisfies Meta<typeof ImageHoverPreview>;

export default meta;
type Story = StoryObj<typeof ImageHoverPreview>;
export const HoverToPreview: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <ImageHoverPreview
        imageUrl={MOCK_LARGE_IMAGE}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      >
        <div className="w-16 h-16 cursor-pointer rounded overflow-hidden">
          <ImageDisplay
            imageUrl={MOCK_LARGE_IMAGE}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
          />
        </div>
      </ImageHoverPreview>
      <p className="text-xs text-muted-foreground">Hover the thumbnail to preview</p>
    </div>
  ),
};

/**
 * NoPreviewOnError &#8212; when `imageUrl` is null, hovering does nothing.
 * The popover is fully suppressed.
 */
export const NoPreviewOnError: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <ImageHoverPreview
        imageUrl={null}
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      >
        <div className="w-16 h-16 cursor-pointer rounded overflow-hidden">
          <ImageDisplay
            imageUrl={null}
            entityTypeDisplayName="Item"
            propertyDisplayName="Product Image"
          />
        </div>
      </ImageHoverPreview>
      <p className="text-xs text-muted-foreground">imageUrl is null &#8212; hover has no effect</p>
    </div>
  ),
};

/**
 * MultipleInRow &#8212; three thumbnails in a flex row, each with an independent
 * hover preview. Hover each thumbnail to see its own popover.
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
            <ImageHoverPreview
              imageUrl={item.imageUrl}
              entityTypeDisplayName="Item"
              propertyDisplayName="Product Image"
            >
              <div className="w-16 h-16 cursor-pointer rounded overflow-hidden">
                <ImageDisplay
                  imageUrl={item.imageUrl}
                  entityTypeDisplayName="Item"
                  propertyDisplayName="Product Image"
                />
              </div>
            </ImageHoverPreview>
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
    <ImageHoverPreview {...args}>
      <div className="w-16 h-16 cursor-pointer">
        <ImageDisplay
          imageUrl={args.imageUrl}
          entityTypeDisplayName={args.entityTypeDisplayName}
          propertyDisplayName={args.propertyDisplayName}
        />
      </div>
    </ImageHoverPreview>
  ),
};

/**
 * HoverToPreview &#8212; hover the thumbnail to reveal the 256&#215;256 preview popover.
 * The delay is ~500 ms.
 */
