import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { MOCK_ITEM_IMAGE, MOCK_LARGE_IMAGE } from '@/components/canary/__mocks__/image-story-data';
import { Button } from '@/components/canary/primitives/button';

import { ImageInspectorOverlay } from './image-inspector-overlay';

const meta = {
  title: 'Components/Canary/Molecules/ImageInspectorOverlay',
  component: ImageInspectorOverlay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Full-size image modal overlay with optional Edit button. ' +
          'Dismiss via Escape, click-outside, or the close button.',
      },
    },
  },
  argTypes: {
    imageUrl: { control: 'text' },
    open: { control: 'boolean' },
    onEdit: { control: false },
  },
} satisfies Meta<typeof ImageInspectorOverlay>;

export default meta;
type Story = StoryObj<typeof ImageInspectorOverlay>;

/**
 * Playground &#8212; use the Controls panel to toggle `open` and adjust `imageUrl`.
 * Click the button below to open the overlay programmatically.
 */
export const Playground: Story = {
  args: {
    imageUrl: MOCK_ITEM_IMAGE,
    open: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open ?? false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Open Inspector</Button>
        <ImageInspectorOverlay
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onEdit={() => {
            alert('Edit clicked');
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

/**
 * ViewOnly &#8212; no `onEdit` callback. Only the close button and Escape / click-outside
 * are available for dismissal.
 */
export const ViewOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>View Image</Button>
        <ImageInspectorOverlay
          imageUrl={MOCK_ITEM_IMAGE}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * WithEditButton &#8212; `onEdit` is provided so the Edit button appears in the footer.
 * Clicking Edit calls the handler and closes the overlay.
 */
export const WithEditButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [edited, setEdited] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Inspect Image</Button>
        {edited && <p className="text-xs text-muted-foreground">Edit was triggered</p>}
        <ImageInspectorOverlay
          imageUrl={MOCK_LARGE_IMAGE}
          open={open}
          onClose={() => setOpen(false)}
          onEdit={() => {
            setEdited(true);
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

/**
 * DismissMethods &#8212; try all three ways to close the overlay:
 * press Escape, click outside the image panel, or click the X button.
 */
export const DismissMethods: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Open Inspector</Button>
        <p className="text-xs text-muted-foreground max-w-64 text-center">
          Dismiss by pressing Escape, clicking the backdrop, or clicking the X button in the corner.
        </p>
        <ImageInspectorOverlay
          imageUrl={MOCK_ITEM_IMAGE}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
};
