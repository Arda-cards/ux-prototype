import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaImageCellDisplay } from './image-cell-display';
import { ArdaImageCellEditor } from './image-cell-editor';
import { ArdaImageCellInteractive } from './image-cell-interactive';

const meta: Meta<typeof ArdaImageCellInteractive> = {
  title: 'Components/Atoms/Grid/Image',
  component: ArdaImageCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Image URL string',
      table: { category: 'Runtime' },
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Called when value changes via editing',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether editing is disabled',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaImageCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaImageCellDisplay value="https://picsum.photos/200/100" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaImageCellDisplay value={undefined} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaImageCellDisplay value="https://invalid-url-that-will-break.test/image.jpg" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState<string | undefined>('https://picsum.photos/200/100');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaImageCellEditor
            value={value}
            placeholder="Enter image URL…"
            stopEditing={() => console.log('stopEditing called')}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('https://picsum.photos/200/100');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the cell below to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaImageCellInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 'https://picsum.photos/200/100',
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img')).toBeInTheDocument();
  },
};
