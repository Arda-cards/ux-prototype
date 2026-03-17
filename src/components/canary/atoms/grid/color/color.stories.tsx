import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { useState } from 'react';

import { ColorCellDisplay, DEFAULT_COLOR_MAP } from './color-cell-display';
import { ColorCellEditor } from './color-cell-editor';

const meta: Meta<typeof ColorCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Color',
  component: ColorCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'select',
      options: ['', ...Object.keys(DEFAULT_COLOR_MAP)],
      description: 'Color enum value',
      table: { category: 'Runtime' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorCellDisplay>;

// ============================================================================
// Display — All Colors
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-4" style={{ width: 200 }}>
      <div className="text-sm text-muted-foreground font-medium mb-2">All default colors</div>
      {Object.keys(DEFAULT_COLOR_MAP).map((color) => (
        <div key={color} className="border border-border p-2 bg-white">
          <ColorCellDisplay value={color} />
        </div>
      ))}
      <div className="text-sm text-muted-foreground font-medium mt-2">Empty</div>
      <div className="border border-border p-2 bg-white">
        <ColorCellDisplay />
      </div>
      <div className="text-sm text-muted-foreground font-medium mt-2">Unknown value</div>
      <div className="border border-border p-2 bg-white">
        <ColorCellDisplay value="CUSTOM" />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('RED');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value || '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ColorCellEditor value={value} stopEditing={() => console.log('stopEditing called')} />
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
    value: 'BLUE',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Blue')).toBeInTheDocument();
  },
};
