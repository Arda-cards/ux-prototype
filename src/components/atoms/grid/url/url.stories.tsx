import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaUrlCellDisplay } from './url-cell-display';
import { ArdaUrlCellEditor } from './url-cell-editor';
import { ArdaUrlCellInteractive } from './url-cell-interactive';

const meta: Meta<typeof ArdaUrlCellInteractive> = {
  title: 'Components/Atoms/Grid/URL',
  component: ArdaUrlCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'URL string value',
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
type Story = StoryObj<typeof ArdaUrlCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay value="https://example.com/page" displayFormat="link" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay value="https://example.com/page" displayFormat="button" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay
          value="https://example.com/page"
          displayFormat="button"
          buttonLabel="Visit"
        />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaUrlCellDisplay
          value="https://example.com/very-long-url-that-should-be-truncated"
          displayFormat="link"
          maxLength={25}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaUrlCellEditor
            value={value}
            placeholder="Enter URL…"
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
      <div className="text-sm text-muted-foreground">Mode: display — read-only URL link.</div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaUrlCellInteractive
          value="https://example.com/page"
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
    const [value, setValue] = useState('https://example.com/page');
    const [original, setOriginal] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">Mode: edit — inline URL editor.</div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaUrlCellInteractive
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
    const [value, setValue] = useState('not-a-url');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Mode: error — inline editor with error styling and messages.
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaUrlCellInteractive
            value={value}
            onChange={(_orig, current) => setValue(current)}
            mode="error"
            errors={['Please enter a valid URL', 'URL must start with https://']}
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
        <ArdaUrlCellInteractive
          value="https://example.com/page"
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
    value: 'https://example.com/page',
    mode: 'display',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('https://example.com/page')).toBeInTheDocument();
  },
};
