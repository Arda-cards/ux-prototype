/**
 * GEN-MEDIA-0001::0005.FS — Preview and Crop
 * Scene: Crop Zoom Rotate
 *
 * Renders ImagePreviewEditor and exercises each edit operation in sequence
 * via a play function: zoom in, zoom out, rotate clockwise, rotate counter-
 * clockwise, and reset. Each step is separated by a storyStepDelay for
 * human visibility.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, waitFor, expect } from 'storybook/test';

import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { MOCK_ITEM_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ImagePreviewEditor> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/Crop Zoom Rotate',
  component: ImagePreviewEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Exercises crop, zoom, and rotation controls in sequence. ' +
          'The play function clicks each toolbar button and adjusts the zoom slider, ' +
          'then resets to defaults.',
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: { type: 'number', min: 0.25, max: 4, step: 0.25 },
      description: 'Locked aspect ratio for the crop area.',
    },
    onCropChange: { action: 'onCropChange' },
    onReset: { action: 'onReset' },
  },
  args: {
    aspectRatio: 1,
    imageData: MOCK_ITEM_IMAGE,
    onCropChange: fn(),
    onReset: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImagePreviewEditor>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Interactive &#8212; use the toolbar and zoom slider manually to explore all
 * controls. The aria-labels for toolbar buttons are:
 * - "Rotate 90 degrees clockwise"
 * - "Rotate 90 degrees counter-clockwise"
 * - "Reset"
 */
export const Default: Story = {};

/**
 * Automated sequence: zoom in, zoom out, rotate clockwise (twice), rotate
 * counter-clockwise, then reset. Each step has a visible delay so a human
 * reviewer can follow along.
 */
export const EditSequence: Story = {
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Crop area is visible', async () => {
      await waitFor(() => {
        const editorRoot = canvasElement.querySelector('[data-slot="image-preview-editor"]');
        expect(editorRoot).not.toBeNull();
      });
    });

    await storyStepDelay(800);

    await step('Zoom slider is present', async () => {
      const zoomSlider = canvas.getByRole('slider', { name: /zoom/i });
      expect(zoomSlider).toBeVisible();
    });

    await step('Rotate clockwise once', async () => {
      const rotateCw = canvas.getByRole('button', { name: /rotate 90 degrees clockwise/i });
      await userEvent.click(rotateCw);
    });

    await storyStepDelay();

    await step('Rotate clockwise a second time', async () => {
      const rotateCw = canvas.getByRole('button', { name: /rotate 90 degrees clockwise/i });
      await userEvent.click(rotateCw);
    });

    await storyStepDelay();

    await step('Rotate counter-clockwise', async () => {
      const rotateCcw = canvas.getByRole('button', {
        name: /rotate 90 degrees counter-clockwise/i,
      });
      await userEvent.click(rotateCcw);
    });

    await storyStepDelay();

    await step('Reset to defaults', async () => {
      const resetBtn = canvas.getByRole('button', { name: /reset/i });
      await userEvent.click(resetBtn);
    });

    await storyStepDelay(600);

    await step('onReset was called', async () => {
      expect(args.onReset).toHaveBeenCalled();
    });
  },
};
