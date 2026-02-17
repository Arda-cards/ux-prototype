import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaTextFieldDisplay } from './text-field-display';
import { ArdaTextFieldEditor } from './text-field-editor';
import { ArdaTextFieldInteractive } from './text-field-interactive';

const meta: Meta<typeof ArdaTextFieldInteractive> = {
  title: 'Components/Atoms/Form/Text',
  component: ArdaTextFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current text value.',
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
type Story = StoryObj<typeof ArdaTextFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">With value</label>
        <ArdaTextFieldDisplay value="Widget Alpha" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaTextFieldDisplay />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Truncated</label>
        <ArdaTextFieldDisplay
          value="A very long text value that should be truncated"
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
    const [value, setValue] = useState('Widget Alpha');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
          <ArdaTextFieldEditor
            value={value}
            onChange={(_original, current) => setValue(current)}
            onComplete={(v) => console.log('Completed:', v)}
            placeholder="Enter name…"
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
      <ArdaTextFieldInteractive value="Widget Alpha" mode="display" onChange={fn()} label="Name" />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('Widget Alpha');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaTextFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          onComplete={(v) => console.log('Completed:', v)}
          label="Name"
          placeholder="Enter name…"
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
        <ArdaTextFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['Name is required', 'Must be at least 3 characters']}
          label="Name"
          placeholder="Enter name…"
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
      <ArdaTextFieldInteractive
        value="Locked Value"
        mode="edit"
        editable={false}
        onChange={fn()}
        label="Name"
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
      <ArdaTextFieldInteractive
        value="Widget Alpha"
        mode="display"
        onChange={fn()}
        label="Name"
        labelPosition="left"
      />
      <ArdaTextFieldInteractive
        value="Widget Alpha"
        mode="edit"
        onChange={fn()}
        label="Name"
        labelPosition="left"
      />
      <ArdaTextFieldInteractive
        value="Widget Alpha"
        mode="error"
        onChange={fn()}
        errors={['Required']}
        label="Name"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaTextFieldInteractive
        value="Widget Alpha"
        mode="display"
        onChange={fn()}
        label="Name"
        labelPosition="top"
      />
      <ArdaTextFieldInteractive
        value="Widget Alpha"
        mode="edit"
        onChange={fn()}
        label="Name"
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
    value: 'Widget Alpha',
    mode: 'display',
    editable: true,
    label: 'Name',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Widget Alpha')).toBeInTheDocument();
  },
};
