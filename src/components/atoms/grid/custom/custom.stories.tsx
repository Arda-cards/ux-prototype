import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import React, { useState } from 'react';

import type { AtomMode } from '@/lib/data-types/atom-types';
import { ArdaCustomCellDisplay } from './custom-cell-display';
import { ArdaCustomCellEditor, type CustomCellEditorHandle } from './custom-cell-editor';
import { ArdaCustomCellInteractive } from './custom-cell-interactive';

const meta: Meta<typeof ArdaCustomCellInteractive> = {
  title: 'Components/Atoms/Grid/Custom',
  component: ArdaCustomCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Field value',
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
type Story = StoryObj<typeof ArdaCustomCellInteractive>;

// Example render functions
const colorRender = (
  value: unknown,
  mode: AtomMode,
  onChange: (orig: unknown, cur: unknown) => void,
) => {
  const color = value as string;
  if (mode === 'display') {
    return <div style={{ background: color, width: 16, height: 16, borderRadius: 2 }} />;
  }
  return <input type="color" value={color} onChange={(e) => onChange(color, e.target.value)} />;
};

const tagRender = (
  value: unknown,
  _mode: AtomMode,
  _onChange: (orig: unknown, cur: unknown) => void,
  errors?: string[],
) => {
  const tags = value as string[];
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
            {tag}
          </span>
        ))}
      </div>
      {errors && errors.length > 0 && (
        <div className="px-2 py-0.5">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaCustomCellDisplay value="#3b82f6" render={colorRender} />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaCustomCellDisplay value={['alpha', 'beta']} render={tagRender} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const ref = React.createRef<CustomCellEditorHandle>();

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaCustomCellEditor ref={ref} value="#3b82f6" render={colorRender} stopEditing={fn()} />
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
        mode=&quot;display&quot; renders via render prop in display mode.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaCustomCellInteractive
          value="#3b82f6"
          mode="display"
          onChange={() => {}}
          render={colorRender}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive - Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('#3b82f6');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          mode=&quot;edit&quot; renders via render prop in edit mode.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaCustomCellInteractive
            value={value}
            mode="edit"
            onChange={(_orig, current) => setValue(current as string)}
            render={colorRender}
          />
        </div>
        <div className="text-sm text-muted-foreground">
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
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        mode=&quot;error&quot; renders with error context.
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaCustomCellInteractive
          value={['alpha']}
          mode="error"
          errors={['At least 2 tags required']}
          onChange={() => {}}
          render={tagRender}
        />
      </div>
    </div>
  ),
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
        <ArdaCustomCellInteractive
          value="#ef4444"
          mode="edit"
          editable={false}
          onChange={() => {}}
          render={colorRender}
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
    value: '#3b82f6',
    mode: 'display',
    editable: true,
    render: colorRender,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const generics = canvas.getAllByRole('generic');
    await expect(generics.length).toBeGreaterThan(0);
  },
};
