/**
 * GEN-MEDIA-0003::0001.UC — View Image in Grid
 * Scene: Playground
 *
 * Interactive playground that renders a standalone ImageCellDisplay.
 * Use the Controls panel to toggle between loaded, broken, and null image states.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_ITEM_IMAGE,
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// ---------------------------------------------------------------------------
// Playground wrapper component
// ---------------------------------------------------------------------------

interface PlaygroundProps {
  /** Image URL. Leave empty for no-image (null) state. */
  imageUrl: string;
  /** Entity type display name shown in the placeholder initials and hover preview. */
  entityTypeDisplayName: string;
}

function PlaygroundWrapper({ imageUrl, entityTypeDisplayName }: PlaygroundProps) {
  const resolvedUrl = imageUrl.trim() === '' ? null : imageUrl;

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight mb-1 text-center">
          GEN-MEDIA-0003 — Image Cell Playground
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Use the Controls panel to change <code>imageUrl</code> and{' '}
          <code>entityTypeDisplayName</code>. Try an empty string for the no-image state, or a
          broken URL to see the error badge.
        </p>
      </div>

      {/* Cell renderer size (32x32) */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Grid Cell (32&times;32)
        </span>
        <div className="border border-border rounded p-1 inline-flex bg-muted/30">
          <ImageCellDisplay
            config={{ ...ITEM_IMAGE_CONFIG, entityTypeDisplayName }}
            value={resolvedUrl}
            data={{}}
          />
        </div>
      </div>

      {/* Larger preview via ImageDisplay */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Full Preview (128&times;128)
        </span>
        <div className="w-32 h-32">
          <ImageDisplay
            imageUrl={resolvedUrl}
            entityTypeDisplayName={entityTypeDisplayName}
            propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
          />
        </div>
      </div>

      {/* Preset quick-switch chips */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Preset URLs (copy into Controls)
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded">{MOCK_ITEM_IMAGE}</code>
          <code className="text-xs bg-muted px-2 py-1 rounded">(empty string)</code>
          <code className="text-xs bg-muted px-2 py-1 rounded">{MOCK_BROKEN_IMAGE}</code>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<PlaygroundProps> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0001 View in Grid/Playground',
  component: PlaygroundWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    imageUrl: {
      control: 'text',
      description:
        'Image URL to display. Use an empty string for the no-image (null/placeholder) state, or a broken URL (e.g. https://example.com/nonexistent.jpg) to see the error badge.',
      table: { category: 'Image' },
    },
    entityTypeDisplayName: {
      control: 'text',
      description:
        'Entity type display name shown in placeholder initials and hover preview title.',
      table: { category: 'Labels' },
    },
  },
};

export default meta;
type Story = StoryObj<PlaygroundProps>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Loaded image state — valid URL resolves to a real image. */
export const Loaded: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
  },
};

/** No-image state — empty imageUrl renders the placeholder with initials. */
export const NoImage: Story = {
  args: {
    imageUrl: '',
    entityTypeDisplayName: 'Item',
  },
};

/** Error state — broken URL triggers the error badge alongside the initials placeholder. */
export const BrokenUrl: Story = {
  args: {
    imageUrl: MOCK_BROKEN_IMAGE,
    entityTypeDisplayName: 'Item',
  },
};

/** Interactive playground — adjust all props via the Controls panel. */
export const Default: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    entityTypeDisplayName: 'Item',
  },
};
