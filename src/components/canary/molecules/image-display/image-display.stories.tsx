import type { Meta, StoryObj } from '@storybook/react-vite';

import { MOCK_ITEM_IMAGE, MOCK_BROKEN_IMAGE } from '@/components/canary/__mocks__/image-story-data';

import { ImageDisplay } from './image-display';

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
 * Loading state &#8212; the skeleton shimmer is visible while the browser fetches
 * the image. This story renders with a URL but does not emit a load event,
 * which is the natural initial state.
 */
export const Loading: Story = {
  render: () => (
    <div className="w-32 h-32">
      {/*
        We pass a data URI that never resolves to keep the skeleton visible.
        A real browser URL would start loading immediately; the skeleton is only
        visible for a brief moment in the Loaded story.
      */}
      <ImageDisplay
        imageUrl="data:image/gif;base64,R0lGOD"
        entityTypeDisplayName="Item"
        propertyDisplayName="Product Image"
      />
    </div>
  ),
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
  render: () => (
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
            imageUrl="data:image/gif;base64,R0lGOD"
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
  ),
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
