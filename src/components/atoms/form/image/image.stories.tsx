import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from '@storybook/test';
import { useState } from 'react';

import { ArdaImageFieldDisplay } from './image-field-display';
import { ArdaImageFieldEditor } from './image-field-editor';
import { ArdaImageFieldInteractive } from './image-field-interactive';

const meta: Meta<typeof ArdaImageFieldInteractive> = {
  title: 'Components/Atoms/Form/Image',
  component: ArdaImageFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Image URL value.',
      table: { category: 'Runtime' },
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Called when value changes via editing.',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether editing is disabled.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaImageFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With URL</label>
        <ArdaImageFieldDisplay value="https://picsum.photos/200/100" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaImageFieldDisplay value={undefined} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Broken URL</label>
        <ArdaImageFieldDisplay value="https://invalid-url-that-will-break.test/image.jpg" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, setValue] = useState('https://picsum.photos/200/100');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL</label>
          <ArdaImageFieldEditor
            value={value}
            onChange={setValue}
            onComplete={(v) => console.log('Completed:', v)}
            placeholder="Enter image URL…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
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
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the field to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Image</label>
          <ArdaImageFieldInteractive value={value} onValueChange={setValue} />
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
    await expect(canvasElement).toBeInTheDocument();
    const img = canvasElement.querySelector('img');
    await expect(img).toBeTruthy();
  },
};
