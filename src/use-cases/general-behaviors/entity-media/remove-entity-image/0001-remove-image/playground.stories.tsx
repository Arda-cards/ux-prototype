/**
 * GEN-MEDIA-0002::0001.UC — Remove Image
 * Scene: Playground
 *
 * Interactive playground for ImageFormField removal flow. Reviewer can toggle
 * imageUrl (valid URL, broken URL, null) and entityTypeDisplayName via Controls
 * to explore all states and manually trigger removal.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import {
  MOCK_ITEM_IMAGE,
  MOCK_BROKEN_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';
import { ImageFormField } from '@/components/canary/molecules/form/image/image-form-field';

// ---------------------------------------------------------------------------
// Playground config — separate from ITEM_IMAGE_CONFIG so entityTypeDisplayName
// is controllable via argTypes.
// ---------------------------------------------------------------------------

const BASE_CONFIG: ImageFieldConfig = {
  aspectRatio: 1,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxDimension: 2048,
  entityTypeDisplayName: 'Item',
  propertyDisplayName: 'Product Image',
};

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface PlaygroundPageProps {
  imageUrl: string | null;
  entityTypeDisplayName: string;
  onChange: (url: string | null) => void;
}

function PlaygroundPage({
  imageUrl: initialImageUrl,
  entityTypeDisplayName,
  onChange,
}: PlaygroundPageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);

  // Sync when controls change
  const config: ImageFieldConfig = { ...BASE_CONFIG, entityTypeDisplayName };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0002 — Remove Image: Playground
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-80">
          Use the Controls panel to toggle the image URL and entity type. Hover the thumbnail and
          click Trash to trigger the removal confirmation flow.
        </p>
      </div>

      <ImageFormField
        config={config}
        imageUrl={imageUrl}
        onChange={(url) => {
          setImageUrl(url);
          onChange(url);
        }}
      />

      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground max-w-64 w-full">
        <p className="font-medium text-foreground mb-1">Current state</p>
        <p>
          imageUrl:{' '}
          <span className="font-mono break-all">{imageUrl === null ? 'null' : imageUrl}</span>
        </p>
        <p>
          entityTypeDisplayName: <span className="font-mono">{entityTypeDisplayName}</span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof PlaygroundPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0002 Remove Entity Image/0001 Remove Image/Playground',
  component: PlaygroundPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Playground for the Remove Image use case. ' +
          'Toggle imageUrl (valid, broken, null) and entityTypeDisplayName via Controls ' +
          'to explore all states. Hover the thumbnail and click Trash to trigger the confirmation dialog.',
      },
    },
  },
  argTypes: {
    imageUrl: {
      control: 'text',
      description:
        'Current image URL. Use a valid picsum URL, a broken URL, or clear the field for null (no image).',
      table: { category: 'Runtime' },
    },
    entityTypeDisplayName: {
      control: 'text',
      description:
        'The entity type label shown in the confirmation dialog (e.g., "Item", "Product", "Supplier").',
      table: { category: 'Config' },
    },
    onChange: {
      description: 'Called when the image is removed (with null) or changed.',
      table: { category: 'Callbacks' },
    },
  },
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof PlaygroundPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** WithImage — starts with a valid image. Hover and remove to test the flow. */
export const WithImage: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
  },
};

/** WithBrokenImage — starts with a broken URL. Eye and Trash are still shown. */
export const WithBrokenImage: Story = {
  args: {
    imageUrl: MOCK_BROKEN_IMAGE,
  },
};

/** WithNoImage — starts with null (no image set). Trash is suppressed; only Pencil shows. */
export const WithNoImage: Story = {
  args: {
    imageUrl: null,
  },
};

/** Playground — fully configurable via Controls. */
export const Playground: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
  },
};
