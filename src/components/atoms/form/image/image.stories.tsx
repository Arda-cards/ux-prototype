import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
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
    mode: {
      control: 'inline-radio',
      options: ['display', 'edit', 'error'],
      description: 'Rendering mode.',
      table: { category: 'Runtime' },
    },
    editable: {
      control: 'boolean',
      description: 'Per-field editability override.',
      table: { category: 'Runtime' },
    },
    label: {
      control: 'text',
      description: 'Static label displayed next to the field.',
      table: { category: 'Static' },
    },
    labelPosition: {
      control: 'inline-radio',
      options: ['left', 'top'],
      description: 'Position of the label relative to the field.',
      table: { category: 'Static' },
    },
  },
  args: {
    onChange: fn(),
    onComplete: fn(),
    onCancel: fn(),
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
        <ArdaImageFieldDisplay />
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
            onChange={(_original, current) => setValue(current)}
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
// Interactive — Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="display"
        onChange={fn()}
        label="Photo"
      />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('https://picsum.photos/200/100');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaImageFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          onComplete={(v) => console.log('Completed:', v)}
          label="Photo"
          placeholder="Enter image URL…"
        />
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
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
    const [value, setValue] = useState('');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaImageFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['Image URL is required', 'Must be a valid URL']}
          label="Photo"
          placeholder="Enter image URL…"
        />
      </div>
    );
  },
};

// ============================================================================
// Editable Override
// ============================================================================

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div className="text-sm text-muted-foreground">
        Even though mode is &quot;edit&quot;, editable=false forces display mode.
      </div>
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="edit"
        editable={false}
        onChange={fn()}
        label="Photo"
      />
    </div>
  ),
};

// ============================================================================
// With Label
// ============================================================================

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4" style={{ width: 480 }}>
      <div className="text-xs font-medium text-muted-foreground">Label left (default)</div>
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="display"
        onChange={fn()}
        label="Photo"
        labelPosition="left"
      />
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="edit"
        onChange={fn()}
        label="Photo"
        labelPosition="left"
      />
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="error"
        onChange={fn()}
        errors={['Required']}
        label="Photo"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="display"
        onChange={fn()}
        label="Photo"
        labelPosition="top"
      />
      <ArdaImageFieldInteractive
        value="https://picsum.photos/200/100"
        mode="edit"
        onChange={fn()}
        label="Photo"
        labelPosition="top"
      />
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
    editable: true,
    label: 'Photo',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeInTheDocument();
    const img = canvasElement.querySelector('img');
    await expect(img).toBeTruthy();
  },
};
