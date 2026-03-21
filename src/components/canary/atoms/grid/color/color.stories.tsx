import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { useRef, useState } from 'react';

import { ColorCellDisplay, DEFAULT_COLOR_MAP } from './color-cell-display';
import { ColorCellEditor, type ColorCellEditorHandle } from './color-cell-editor';

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
    const [value, setValue] = useState('RED');
    const editorRef = useRef<ColorCellEditorHandle>(null);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium">{value || '(none)'}</span>
        </div>
        <div className="border border-border bg-white" style={{ height: 32 }}>
          <ColorCellEditor
            ref={editorRef}
            value={value}
            stopEditing={() => {
              const newValue = editorRef.current?.getValue() ?? '';
              setValue(newValue);
            }}
          />
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

// ============================================================================
// AllVariants
// ============================================================================

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      {Object.keys(DEFAULT_COLOR_MAP).map((color) => (
        <div key={color} className="flex items-center gap-3">
          <span className="w-36 text-sm text-muted-foreground">
            {DEFAULT_COLOR_MAP[color]?.name ?? color}
          </span>
          <div className="border border-border p-2 bg-white flex-1">
            <ColorCellDisplay value={color} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Empty</span>
        <div className="border border-border p-2 bg-white flex-1">
          <ColorCellDisplay />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Unknown value</span>
        <div className="border border-border p-2 bg-white flex-1">
          <ColorCellDisplay value="CUSTOM" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Editor (interactive)</span>
        <div className="border border-border bg-white flex-1" style={{ height: 32 }}>
          <ColorCellEditor value="RED" stopEditing={() => {}} />
        </div>
      </div>
    </div>
  ),
};
