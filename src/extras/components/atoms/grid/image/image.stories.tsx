import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaImageCellDisplay } from './image-cell-display';
import { ArdaImageCellEditor } from './image-cell-editor';
import { ArdaImageCellInteractive } from './image-cell-interactive';

const meta: Meta<typeof ArdaImageCellInteractive> = {
  title: 'Components/Extras/Atoms/Grid/Image',
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
    mode: {
      control: 'select',
      options: ['display', 'edit', 'error'],
      description: 'Rendering mode',
      table: { category: 'Runtime' },
    },
    editable: {
      control: 'boolean',
      description: 'Per-field editability override',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onChange: fn(),
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
        <ArdaImageCellDisplay />
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
    const [value, _setValue] = useState('https://picsum.photos/200/100');

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
// Interactive — Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        Mode: display — read-only image thumbnail.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaImageCellInteractive
          value="https://picsum.photos/200/100"
          onChange={() => {}}
          mode="display"
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('https://picsum.photos/200/100');
    const [original, setOriginal] = useState('https://picsum.photos/200/100');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">Mode: edit — inline image URL editor.</div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaImageCellInteractive
            value={value}
            onChange={(orig, current) => {
              setOriginal(orig);
              setValue(current);
            }}
            mode="edit"
          />
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            Original: <span className="font-medium">{original}</span>
          </div>
          <div>
            Current: <span className="font-medium">{value}</span>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive — Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => {
    const [value, setValue] = useState('not-an-image-url');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Mode: error — inline editor with error styling and messages.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaImageCellInteractive
            value={value}
            onChange={(_orig, current) => setValue(current)}
            mode="error"
            errors={['Please enter a valid image URL', 'URL must point to an image file']}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive — Editable Override
// ============================================================================

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        Mode is &quot;edit&quot; but editable=false forces display mode.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaImageCellInteractive
          value="https://picsum.photos/200/100"
          onChange={() => {}}
          mode="edit"
          editable={false}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 'https://picsum.photos/200/100',
    mode: 'display',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img')).toBeInTheDocument();
  },
};
