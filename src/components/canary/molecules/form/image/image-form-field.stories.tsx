import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';

import { ImageFormField } from './image-form-field';

const meta = {
  title: 'Components/Canary/Molecules/Form/ImageFormField',
  component: ImageFormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form field renderer for entity image fields. Wraps ImageDisplay in an ' +
          'ImageHoverPreview trigger with hover action icons (inspect, edit, remove).',
      },
    },
  },
  argTypes: {
    imageUrl: {
      control: 'text',
      description: 'Current image URL. null shows an initials placeholder.',
      table: { category: 'Runtime' },
    },
    disabled: {
      control: 'boolean',
      description: 'When true the field is read-only; all actions are blocked.',
      table: { category: 'Runtime' },
    },
    onChange: {
      action: 'onChange',
      description: 'Called with the new image URL, or null when removed.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    config: ITEM_IMAGE_CONFIG,
    onChange: fn(),
  },
} satisfies Meta<typeof ImageFormField>;

export default meta;
type Story = StoryObj<typeof ImageFormField>;
export const WithImage: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
  },
};

/**
 * WithoutImage &#8212; no image set (imageUrl is null).
 * Hover shows only the Pencil action icon (Eye and Trash are suppressed).
 */
export const WithoutImage: Story = {
  args: {
    imageUrl: null,
  },
};

/**
 * HoverAffordances &#8212; annotated layout showing each icon label.
 * Hover the thumbnail to reveal the overlay; labels explain each action.
 */
export const HoverAffordances: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-6">
      <ImageFormField {...args} />
      <div className="flex flex-col gap-2 text-sm text-muted-foreground max-w-56">
        <p className="font-medium text-foreground">Hover action icons</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Eye</strong> &#8212; open full-size inspector (requires image)
          </li>
          <li>
            <strong>Pencil</strong> &#8212; open upload/edit dialog
          </li>
          <li>
            <strong>Trash</strong> &#8212; remove image with confirmation (requires image)
          </li>
        </ul>
        <p className="text-xs">Double-click the thumbnail also triggers edit.</p>
      </div>
    </div>
  ),
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
  },
};

/**
 * Disabled &#8212; field is read-only. Thumbnail shows at 50% opacity and all actions are blocked.
 */
export const Disabled: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    disabled: true,
  },
};

/**
 * RemoveFlow &#8212; interactive story.
 * Start with an image, hover + click Trash + confirm Remove &#8212; image is removed.
 */
export const RemoveFlow: Story = {
  render: (args) => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(MOCK_ITEM_IMAGE);

    return (
      <div className="flex flex-col items-center gap-4">
        <ImageFormField
          {...args}
          imageUrl={imageUrl}
          onChange={(url) => {
            setImageUrl(url);
            args.onChange(url);
          }}
        />
        <p className="text-xs text-muted-foreground">
          {imageUrl !== null
            ? 'Hover the thumbnail, then click the Trash icon and confirm.'
            : 'Image removed. Refresh the story to reset.'}
        </p>
      </div>
    );
  },
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
  },
};

/**
 * EditFlow &#8212; interactive story with image.
 * Hover + click Pencil (or double-click) &#8212; the action logs to the Actions panel.
 */
export const EditFlow: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-4">
      <ImageFormField {...args} />
      <p className="text-xs text-muted-foreground">
        Hover the thumbnail and click the Pencil icon, or double-click the thumbnail. Check the
        Actions panel for the console log.
      </p>
    </div>
  ),
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
  },
};

/**
 * Playground &#8212; adjust `imageUrl` and `disabled` in the Controls panel.
 * Actions log `onChange` calls.
 */
export const Playground: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    disabled: false,
  },
};

/**
 * WithImage &#8212; field with a current image.
 * Hover the thumbnail to reveal three action icons: Eye, Pencil, Trash.
 */
