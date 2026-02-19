import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import type { AtomMode } from '@/lib/data-types/atom-types';
import { ArdaCustomFieldDisplay } from './custom-field-display';
import { ArdaCustomFieldEditor } from './custom-field-editor';
import { ArdaCustomFieldInteractive } from './custom-field-interactive';

const meta: Meta<typeof ArdaCustomFieldInteractive> = {
  title: 'Components/Atoms/Form/Custom',
  component: ArdaCustomFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current field value.',
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
  },
};

export default meta;
type Story = StoryObj<typeof ArdaCustomFieldInteractive>;

// Example render functions
const colorRender = (
  value: unknown,
  mode: AtomMode,
  onChange: (orig: unknown, cur: unknown) => void,
) => {
  const color = value as string;
  if (mode === 'display') {
    return <div style={{ background: color, width: 24, height: 24, borderRadius: 4 }} />;
  }
  return <input type="color" value={color} onChange={(e) => onChange(color, e.target.value)} />;
};

const textAreaRender = (
  value: unknown,
  mode: AtomMode,
  onChange: (orig: unknown, cur: unknown) => void,
  errors?: string[],
) => {
  const text = value as string;
  if (mode === 'display') {
    return <span className="text-sm">{text || '\u2014'}</span>;
  }
  return (
    <div>
      <textarea
        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
        value={text}
        onChange={(e) => onChange(text, e.target.value)}
        rows={3}
      />
      {errors && errors.length > 0 && (
        <div className="mt-1 space-y-0.5">
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

const tagListRender = (
  value: unknown,
  mode: AtomMode,
  _onChange: (orig: unknown, cur: unknown) => void,
  errors?: string[],
) => {
  const tags = value as string[];
  if (mode === 'display') {
    return (
      <div className="flex gap-1 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
            {tag}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
            {tag}
          </span>
        ))}
      </div>
      {errors && errors.length > 0 && (
        <div className="mt-1 space-y-0.5">
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
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Color swatch</label>
        <ArdaCustomFieldDisplay value="#3b82f6" render={colorRender} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Text area</label>
        <ArdaCustomFieldDisplay value="Some long text content" render={textAreaRender} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [color, setColor] = useState('#3b82f6');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Color picker
          </label>
          <ArdaCustomFieldEditor
            value={color}
            render={colorRender}
            onChange={(_original, current) => setColor(current as string)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{color}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive &#8212; Display Mode
// ============================================================================

export const InteractiveDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaCustomFieldInteractive
        value="#3b82f6"
        mode="display"
        onChange={fn()}
        render={colorRender}
        label="Color"
      />
    </div>
  ),
};

// ============================================================================
// Interactive &#8212; Edit Mode
// ============================================================================

export const InteractiveEdit: Story = {
  render: () => {
    const [value, setValue] = useState('Editable text content');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <ArdaCustomFieldInteractive
          value={value}
          mode="edit"
          onChange={(_original, current) => setValue(current as string)}
          render={textAreaRender}
          label="Notes"
        />
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive &#8212; Error Mode
// ============================================================================

export const InteractiveError: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <ArdaCustomFieldInteractive
        value={['alpha', 'beta']}
        mode="error"
        onChange={fn()}
        errors={['At least 3 tags required', 'Missing required tag: gamma']}
        render={tagListRender}
        label="Tags"
      />
    </div>
  ),
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
      <ArdaCustomFieldInteractive
        value="#ef4444"
        mode="edit"
        editable={false}
        onChange={fn()}
        render={colorRender}
        label="Color"
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
      <ArdaCustomFieldInteractive
        value="#3b82f6"
        mode="display"
        onChange={fn()}
        render={colorRender}
        label="Color"
        labelPosition="left"
      />
      <ArdaCustomFieldInteractive
        value="#3b82f6"
        mode="edit"
        onChange={fn()}
        render={colorRender}
        label="Color"
        labelPosition="left"
      />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaCustomFieldInteractive
        value="#3b82f6"
        mode="display"
        onChange={fn()}
        render={colorRender}
        label="Color"
        labelPosition="top"
      />
      <ArdaCustomFieldInteractive
        value="#3b82f6"
        mode="edit"
        onChange={fn()}
        render={colorRender}
        label="Color"
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
    value: '#3b82f6',
    mode: 'display',
    editable: true,
    label: 'Color',
    labelPosition: 'left',
    render: colorRender,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Color')).toBeInTheDocument();
  },
};
