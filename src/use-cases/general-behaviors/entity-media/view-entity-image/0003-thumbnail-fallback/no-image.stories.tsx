/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: No Image
 *
 * Renders ImageDisplay with imageUrl={null}, showing the initials placeholder
 * WITHOUT an error badge. Distinguishes "no image set" from "broken image".
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

const meta: Meta<typeof ImageDisplay> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/No Image',
  component: ImageDisplay,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ImageDisplay>;

export const Default: Story = {
  render: () => (
    <div className="w-32 h-32">
      <ImageDisplay
        imageUrl={null}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Initials placeholder is visible', async () => {
      // getInitials("Item") → "I"
      const initials = canvas.getByText('I');
      expect(initials).toBeVisible();
    });

    await step('No error badge is present (no image is not an error)', async () => {
      // The error badge has aria-label "Image failed to load"
      const badge = canvasElement.querySelector('[aria-label="Image failed to load"]');
      expect(badge).toBeNull();
    });

    await step('No img element is rendered when imageUrl is null', async () => {
      const img = canvasElement.querySelector('img');
      expect(img).toBeNull();
    });

    await step('No skeleton shimmer is shown', async () => {
      const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toBeNull();
    });
  },
};
