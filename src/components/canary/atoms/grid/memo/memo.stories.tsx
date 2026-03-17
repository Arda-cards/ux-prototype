import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import { useState } from 'react';

import { MemoCellDisplay } from './memo-cell-display';
import { MemoCellEditor } from './memo-cell-editor';
import { MemoButtonCell } from './memo-button-cell';

const meta: Meta<typeof MemoCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Memo',
  component: MemoCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Memo text value',
      table: { category: 'Runtime' },
    },
    maxLength: {
      control: 'number',
      description: 'Maximum characters before truncation',
      table: { category: 'Static' },
    },
    hoverDelay: {
      control: 'number',
      description: 'Milliseconds before hover overlay appears',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MemoCellDisplay>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
      <div className="text-sm text-muted-foreground font-medium">Empty</div>
      <div className="border border-border p-2 bg-white">
        <MemoCellDisplay />
      </div>
      <div className="text-sm text-muted-foreground font-medium">Short text</div>
      <div className="border border-border p-2 bg-white">
        <MemoCellDisplay value="A brief note about this item." />
      </div>
      <div className="text-sm text-muted-foreground font-medium">Long text (hover to see full)</div>
      <div className="border border-border p-2 bg-white">
        <MemoCellDisplay
          value="This is a very long note that exceeds the maximum length and will be truncated with an ellipsis. Hover to see the complete text in a tooltip overlay."
          maxLength={50}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor (AG Grid textarea)
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, _setValue] = useState('Line 1\nLine 2\nLine 3');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground">
          Shift+Enter for newline, Enter to submit, Escape to cancel.
        </div>
        <div className="border border-border bg-white">
          <MemoCellEditor
            value={value}
            placeholder="Add a note..."
            stopEditing={() => console.log('stopEditing called')}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// MemoButton (icon + modal pattern)
// ============================================================================

export const MemoButton: Story = {
  render: () => {
    const [notes, setNotes] = useState('Initial notes for this item.');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 300 }}>
        <div className="text-sm text-muted-foreground font-medium">Editable (click icon)</div>
        <div className="border border-border p-2 bg-white" style={{ height: 48 }}>
          <MemoButtonCell value={notes} editable onSave={setNotes} title="Item Notes" />
        </div>
        <div className="text-sm text-muted-foreground">
          Current: <span className="font-medium">{notes}</span>
        </div>

        <div className="text-sm text-muted-foreground font-medium mt-4">Read-only</div>
        <div className="border border-border p-2 bg-white" style={{ height: 48 }}>
          <MemoButtonCell value="Read-only note content" title="Read Only" />
        </div>

        <div className="text-sm text-muted-foreground font-medium mt-4">Empty (no value)</div>
        <div className="border border-border p-2 bg-white" style={{ height: 48 }}>
          <MemoButtonCell editable onSave={setNotes} />
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
    value: 'A sample memo note for testing the display component.',
    maxLength: 50,
    hoverDelay: 500,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/A sample memo/)).toBeInTheDocument();
  },
};

// ============================================================================
// MemoButton Interactive Test
// ============================================================================

export const MemoButtonInteraction: Story = {
  render: () => {
    const onSave = fn();
    return (
      <div className="p-4" style={{ width: 300, height: 48 }}>
        <MemoButtonCell value="Editable note" editable onSave={onSave} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Edit note' });
    await userEvent.click(button);

    // Modal should be open
    const doneButton = await within(document.body).findByRole('button', { name: 'Done' });
    await expect(doneButton).toBeVisible();

    await userEvent.click(doneButton);
  },
};
