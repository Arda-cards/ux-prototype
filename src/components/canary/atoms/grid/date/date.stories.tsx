import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { DateCellDisplay } from './date-cell-display';
import { DateCellEditor } from './date-cell-editor';

const TIMEZONE_OPTIONS = [
  'Etc/UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const meta: Meta<typeof DateCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Date',
  component: DateCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO date string value',
      table: { category: 'Runtime' },
    },
    timezone: {
      control: 'select',
      options: TIMEZONE_OPTIONS,
      description: 'IANA timezone for display formatting. Defaults to browser timezone.',
      table: { category: 'Runtime' },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof DateCellDisplay>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="border border-border p-2 bg-white">
        <DateCellDisplay value="2024-03-15" />
      </div>
      <div className="border border-border p-2 bg-white">
        <DateCellDisplay />
      </div>
      <div className="border border-border p-2 bg-white">
        <DateCellDisplay value="2024-12-31T23:59:59Z" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('2024-03-15');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value ?? '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <DateCellEditor value={value} stopEditing={() => console.log('stopEditing called')} />
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
    value: '2024-03-15',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('03/15/2024')).toBeInTheDocument();
  },
};

// ============================================================================
// AllVariants
// ============================================================================

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Recent date</span>
        <div className="border border-border p-2 bg-white flex-1">
          <DateCellDisplay value="2026-01-15" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Old date</span>
        <div className="border border-border p-2 bg-white flex-1">
          <DateCellDisplay value="1990-07-04" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Empty</span>
        <div className="border border-border p-2 bg-white flex-1">
          <DateCellDisplay />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Editor (interactive)</span>
        <div className="border border-border bg-white flex-1" style={{ height: 32 }}>
          <DateCellEditor value="2026-01-15" stopEditing={() => {}} />
        </div>
      </div>
    </div>
  ),
};

void fn;
