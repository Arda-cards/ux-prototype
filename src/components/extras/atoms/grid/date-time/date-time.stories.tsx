import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaDateTimeCellDisplay } from './date-time-cell-display';
import { ArdaDateTimeCellEditor } from './date-time-cell-editor';
import { ArdaDateTimeCellInteractive } from './date-time-cell-interactive';
import { COMMON_TIMEZONES } from '@/extras/types/model/general/time/timezone';

const meta: Meta<typeof ArdaDateTimeCellInteractive> = {
  title: 'Components/Extras/Atoms/Grid/Date Time',
  component: ArdaDateTimeCellInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO datetime string value',
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
    timezone: {
      control: 'select',
      options: COMMON_TIMEZONES,
      description: 'IANA timezone for display formatting. Defaults to browser timezone.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onChange: fn(),
    onComplete: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaDateTimeCellInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaDateTimeCellDisplay />
      </div>
      <div className="border border-border p-2 bg-white">
        <ArdaDateTimeCellDisplay value="2024-12-31T23:59:59Z" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ArdaDateTimeCellEditor
            value={value}
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
      <div className="text-sm text-muted-foreground">Mode: display (read-only presentation)</div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaDateTimeCellInteractive value="2024-03-15T14:30:00Z" mode="display" onChange={fn()} />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Mode: edit (inline editor shown immediately)
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaDateTimeCellInteractive
            value={value}
            mode="edit"
            onChange={(_original, current) => setValue(current)}
            onComplete={(v) => setValue(v)}
            onCancel={() => {}}
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
// Interactive — Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Mode: error (inline editor with error styling)
        </div>
        <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
          <ArdaDateTimeCellInteractive
            value={value}
            mode="error"
            errors={['Date/time must be in the future', 'Date/time is required']}
            onChange={(_original, current) => setValue(current)}
            onComplete={(v) => setValue(v)}
            onCancel={() => {}}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// Editable Override
// ============================================================================

export const EditableOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground">
        Mode is &quot;edit&quot; but editable=false forces display mode
      </div>
      <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
        <ArdaDateTimeCellInteractive
          value="2024-03-15T14:30:00Z"
          mode="edit"
          editable={false}
          onChange={fn()}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// With Timezone
// ============================================================================

export const WithTimezone: Story = {
  render: () => {
    const [utcValue, setUtcValue] = useState('2024-03-15T14:30:00Z');
    const [nyValue, setNyValue] = useState('2024-03-15T14:30:00Z');
    const [tokyoValue, setTokyoValue] = useState('2024-03-15T14:30:00Z');

    return (
      <div className="flex flex-col gap-6 p-4" style={{ width: 300 }}>
        {/* UTC */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">UTC — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="Etc/UTC" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">UTC — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaDateTimeCellEditor value="2024-03-15T14:30:00Z" timezone="Etc/UTC" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">UTC — Interactive Edit</div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <ArdaDateTimeCellInteractive
              value={utcValue}
              mode="edit"
              onChange={(_orig, cur) => setUtcValue(cur)}
              onComplete={(v) => setUtcValue(v)}
              timezone="Etc/UTC"
            />
          </div>
        </div>

        {/* New York */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">New York (EST) — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaDateTimeCellEditor value="2024-03-15T14:30:00Z" timezone="America/New_York" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            New York (EST) — Interactive Edit
          </div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <ArdaDateTimeCellInteractive
              value={nyValue}
              mode="edit"
              onChange={(_orig, cur) => setNyValue(cur)}
              onComplete={(v) => setNyValue(v)}
              timezone="America/New_York"
            />
          </div>
        </div>

        {/* Tokyo */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Display</div>
          <div className="border border-border p-2 bg-white">
            <ArdaDateTimeCellDisplay value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">Tokyo (JST) — Editor</div>
          <div className="border border-border bg-white" style={{ height: 32 }}>
            <ArdaDateTimeCellEditor value="2024-03-15T14:30:00Z" timezone="Asia/Tokyo" />
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            Tokyo (JST) — Interactive Edit
          </div>
          <div className="border border-border p-2 bg-white" style={{ minHeight: 32 }}>
            <ArdaDateTimeCellInteractive
              value={tokyoValue}
              mode="edit"
              onChange={(_orig, cur) => setTokyoValue(cur)}
              onComplete={(v) => setTokyoValue(v)}
              timezone="Asia/Tokyo"
            />
          </div>
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
    value: '2024-03-15T14:30:00Z',
    mode: 'display',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/03\/15\/2024/)).toBeInTheDocument();
  },
};
