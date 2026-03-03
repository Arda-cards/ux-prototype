import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaUrlFieldDisplay } from './url-field-display';
import { ArdaUrlFieldEditor } from './url-field-editor';
import { ArdaUrlFieldInteractive } from './url-field-interactive';

const meta: Meta<typeof ArdaUrlFieldInteractive> = {
  title: 'Components/Extras/Atoms/Form/URL',
  component: ArdaUrlFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'URL string value.',
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
type Story = StoryObj<typeof ArdaUrlFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Link format</label>
        <ArdaUrlFieldDisplay value="https://example.com/page" displayFormat="link" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Button format
        </label>
        <ArdaUrlFieldDisplay value="https://example.com/page" displayFormat="button" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Custom button label
        </label>
        <ArdaUrlFieldDisplay
          value="https://example.com/page"
          displayFormat="button"
          buttonLabel="Visit Site"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaUrlFieldDisplay />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, setValue] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Website URL
          </label>
          <ArdaUrlFieldEditor
            value={value}
            onChange={(_original, current) => setValue(current)}
            onComplete={(v) => console.log('Completed:', v)}
            placeholder="Enter URL…"
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
      <ArdaUrlFieldInteractive
        value="https://example.com/page"
        mode="display"
        onChange={fn()}
        label="Website"
      />
    </div>
  ),
};

// ============================================================================
// Interactive — Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaUrlFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current)}
          onComplete={(v) => console.log('Completed:', v)}
          label="Website"
          placeholder="Enter URL…"
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
        <ArdaUrlFieldInteractive
          value={value}
          mode="error"
          onChange={(_original, current) => setValue(current)}
          errors={['URL is required', 'Must be a valid URL']}
          label="Website"
          placeholder="Enter URL…"
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
      <ArdaUrlFieldInteractive
        value="https://example.com/page"
        mode="edit"
        editable={false}
        onChange={fn()}
        label="Website"
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
      <ArdaUrlFieldInteractive
        value="https://example.com"
        mode="display"
        onChange={fn()}
        label="Website"
        labelPosition="left"
      />
      <ArdaUrlFieldInteractive
        value="https://example.com"
        mode="edit"
        onChange={fn()}
        label="Website"
        labelPosition="left"
      />
      <ArdaUrlFieldInteractive
        value="https://example.com"
        mode="error"
        onChange={fn()}
        errors={['Required']}
        label="Website"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaUrlFieldInteractive
        value="https://example.com"
        mode="display"
        onChange={fn()}
        label="Website"
        labelPosition="top"
      />
      <ArdaUrlFieldInteractive
        value="https://example.com"
        mode="edit"
        onChange={fn()}
        label="Website"
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
    value: 'https://example.com/page',
    mode: 'display',
    editable: true,
    label: 'Website',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('https://example.com/page')).toBeInTheDocument();
  },
};
