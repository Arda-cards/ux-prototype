import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaTextCellDisplay } from './text-cell-display';
import { ArdaTextCellEditor } from './text-cell-editor';
import { ArdaTextCellInteractive } from './text-cell-interactive';

const meta: Meta<typeof ArdaTextCellInteractive> = {
  title: 'Components/Atoms/Grid/Text',
  component: ArdaTextCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Text string value',
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
    onChange: {
      action: 'changed',
      description: 'Called when value changes (original, current)',
      table: { category: 'Events' },
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaTextCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaTextCellDisplay value="Widget Alpha" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaTextCellDisplay />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaTextCellDisplay
          value="A very long text value that should be truncated"
          maxLength={20}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('Widget Alpha');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaTextCellEditor
            value={value}
            placeholder="Enter text…"
            stopEditing={() => console.log('stopEditing called')}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive - Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        mode=&quot;display&quot; renders as read-only text.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaTextCellInteractive value="Widget Alpha" mode="display" onChange={() => {}} />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive - Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('Widget Alpha');
    const [original, setOriginal] = useState('Widget Alpha');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;edit&quot; renders the inline editor.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaTextCellInteractive
            value={value}
            mode="edit"
            onChange={(orig, current) => {
              setOriginal(orig);
              setValue(current);
            }}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Original: <span className="font-medium">{original}</span>
          {' | '}
          Current: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive - Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;error&quot; renders the inline editor with error styling.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaTextCellInteractive
            value={value}
            mode="error"
            errors={['This field is required', 'Must be at least 3 characters']}
            onChange={(_orig, current) => setValue(current)}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive - Editable Override
// ============================================================================

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        editable=false renders in display mode regardless of mode prop.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaTextCellInteractive
          value="Read-only value"
          mode="edit"
          editable={false}
          onChange={() => {}}
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
    value: 'Hello, World!',
    mode: 'display',
    editable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Hello, World!')).toBeInTheDocument();
  },
};
