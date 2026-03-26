/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: Playground
 *
 * Interactive playground allowing reviewers to toggle between all visual
 * states via Storybook controls.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_BROKEN_IMAGE,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

const meta: Meta<typeof ImageDisplay> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/Playground',
  component: ImageDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toggle between all thumbnail fallback states using the controls panel below. ' +
          'Set imageUrl to a valid URL (loaded), a broken URL (error badge), or clear it (no image / initials only).',
      },
    },
  },
  argTypes: {
    imageUrl: {
      control: 'text',
      description:
        'Image URL. Use a valid URL for the loaded state, a broken URL for the error state, or leave empty for the no-image state.',
      options: [MOCK_ITEM_IMAGE, MOCK_BROKEN_IMAGE, null],
      mapping: {
        [MOCK_ITEM_IMAGE]: MOCK_ITEM_IMAGE,
        [MOCK_BROKEN_IMAGE]: MOCK_BROKEN_IMAGE,
        null: null,
      },
    },
    entityTypeDisplayName: {
      control: 'text',
      description: 'Display name of the entity type (e.g. "Item"). Used to derive initials.',
    },
    propertyDisplayName: {
      control: 'text',
      description: 'Display name of this image property (e.g. "Product Image").',
    },
  },
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
    propertyDisplayName: 'Product Image',
  },
};

export default meta;
type Story = StoryObj<typeof ImageDisplay>;

export const Default: Story = {
  render: (args) => (
    <div className="w-32 h-32">
      <ImageDisplay {...args} />
    </div>
  ),
};

/** Pre-configured to show the error state with a broken URL. */
export const ErrorState: Story = {
  args: {
    imageUrl: MOCK_BROKEN_IMAGE,
    entityTypeDisplayName: 'Item',
    propertyDisplayName: 'Product Image',
  },
  render: (args) => (
    <div className="w-32 h-32">
      <ImageDisplay {...args} />
    </div>
  ),
};

/** Pre-configured to show the no-image state with imageUrl=null. */
export const NoImage: Story = {
  args: {
    imageUrl: null,
    entityTypeDisplayName: 'Item',
    propertyDisplayName: 'Product Image',
  },
  render: (args) => (
    <div className="w-32 h-32">
      <ImageDisplay {...args} />
    </div>
  ),
};
