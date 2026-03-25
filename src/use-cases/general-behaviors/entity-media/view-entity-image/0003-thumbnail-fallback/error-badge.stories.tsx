/**
 * GEN-MEDIA-0003::0003.FS — Thumbnail Fallback and Error State
 * Scene: Error Badge
 *
 * Renders ImageDisplay with a broken/unreachable URL, verifying that the
 * initials placeholder is shown with an error badge overlay.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';

import {
  MOCK_BROKEN_IMAGE,
  ITEM_IMAGE_CONFIG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

const meta: Meta<typeof ImageDisplay> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0003 Thumbnail Fallback/Error Badge',
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
        imageUrl={MOCK_BROKEN_IMAGE}
        entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
        propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Error badge is visible after broken image fails to load', async () => {
      await waitFor(
        () => {
          const badge = canvas.getByRole('img', { name: /image failed to load/i });
          expect(badge).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await step('Initials placeholder is shown instead of a loaded image', async () => {
      // The initials span for "Item" → "I"
      await waitFor(
        () => {
          const initials = canvas.getByText('I');
          expect(initials).toBeVisible();
        },
        { timeout: 5000 },
      );

      // The img element should not be visible (invisible class applied until loaded)
      const img = canvasElement.querySelector('img');
      if (img) {
        expect(img).not.toBeVisible();
      }
    });
  },
};
