import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { SelectCellDisplay } from './select-cell-display';
import { SelectCellEditor, type SelectOption } from './select-cell-editor';
import { storyStepDelay } from '@/use-cases/reference/business-affiliates/_shared/story-step-delay';

// ============================================================================
// Sample data
// ============================================================================

const orderStatusOptions: SelectOption[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
];

const orderStatusRecord: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

const manyOptions: SelectOption[] = [
  { value: 'OPT_01', label: 'Option One' },
  { value: 'OPT_02', label: 'Option Two' },
  { value: 'OPT_03', label: 'Option Three' },
  { value: 'OPT_04', label: 'Option Four' },
  { value: 'OPT_05', label: 'Option Five' },
  { value: 'OPT_06', label: 'Option Six' },
  { value: 'OPT_07', label: 'Option Seven' },
  { value: 'OPT_08', label: 'Option Eight' },
  { value: 'OPT_09', label: 'Option Nine' },
  { value: 'OPT_10', label: 'Option Ten' },
  { value: 'OPT_11', label: 'Option Eleven' },
  { value: 'OPT_12', label: 'Option Twelve' },
  { value: 'OPT_13', label: 'Option Thirteen' },
  { value: 'OPT_14', label: 'Option Fourteen' },
  { value: 'OPT_15', label: 'Option Fifteen' },
  { value: 'OPT_16', label: 'Option Sixteen' },
  { value: 'OPT_17', label: 'Option Seventeen' },
  { value: 'OPT_18', label: 'Option Eighteen' },
  { value: 'OPT_19', label: 'Option Nineteen' },
  { value: 'OPT_20', label: 'Option Twenty' },
  { value: 'OPT_21', label: 'Option Twenty-One' },
  { value: 'OPT_22', label: 'Option Twenty-Two' },
];

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof SelectCellDisplay> = {
  title: 'Components/Canary/Atoms/Grid/Select',
  component: SelectCellDisplay,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The stored value to look up and display',
      table: { category: 'Runtime' },
    },
    options: {
      control: false,
      description: 'Available options. Accepts SelectOption[] or Record<string, string>.',
      table: { category: 'Static' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectCellDisplay>;

// ============================================================================
// Default — basic fixed-list dropdown
// ============================================================================

/**
 * The SelectCellEditor rendered as a standalone popup (as AG Grid would present
 * it when `cellEditorPopup: true` is set). Click an option or use Arrow keys to
 * navigate and Enter to confirm.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>('PENDING');
    const [committed, setCommitted] = useState<string>('PENDING');

    const handleValueChange = (v: string | null) => {
      if (v !== null) setValue(v);
    };
    const handleStopEditing = () => {
      setCommitted(value);
    };

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Committed value:{' '}
          <span className="font-medium text-foreground">
            {orderStatusOptions.find((o) => o.value === committed)?.label ?? committed}
          </span>
        </div>
        <div className="border border-border rounded bg-popover shadow-md overflow-hidden">
          <SelectCellEditor
            value={value}
            options={orderStatusOptions}
            onValueChange={handleValueChange}
            stopEditing={handleStopEditing}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Arrow Up/Down to navigate, Enter to select, Escape to cancel.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('listbox')).toBeInTheDocument();
    await expect(canvas.getAllByRole('option').length).toBeGreaterThan(0);
  },
};

// ============================================================================
// WithManyOptions — scroll behavior at 240px max-height
// ============================================================================

/**
 * Demonstrates the 240px max-height constraint with a 22-item list. The popup
 * becomes scrollable, and the highlighted item scrolls into view as you
 * navigate with Arrow keys.
 */
export const WithManyOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>('OPT_01');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Current value: <span className="font-medium text-foreground">{value}</span>
        </div>
        <div
          className="border border-border rounded bg-popover shadow-md overflow-hidden"
          style={{ width: 240 }}
        >
          <SelectCellEditor
            value={value}
            options={manyOptions}
            onValueChange={(v) => {
              if (v !== null) setValue(v);
            }}
            stopEditing={() => {}}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          22 options — popup is capped at 240px and scrolls. Arrow Down navigates and auto-scrolls.
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const listbox = canvas.getByRole('listbox');
    await expect(listbox).toBeInTheDocument();
    const options = canvas.getAllByRole('option');
    await expect(options.length).toBe(22);
  },
};

// ============================================================================
// KeyboardNavigation — step-by-step play function
// ============================================================================

/**
 * Demonstrates keyboard navigation: Arrow Down x3, then Enter to select.
 * The play function runs the full interaction automatically.
 *
 * Navigation rules:
 * - Arrow Down: move highlight down, wrap from last to first
 * - Arrow Up: move highlight up, wrap from first to last
 * - Enter: commit the highlighted option
 * - Escape: cancel (no value change)
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [value, setValue] = useState<string>('PENDING');
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm font-medium text-foreground">
          Current value:{' '}
          <span className="text-primary">
            {orderStatusOptions.find((o) => o.value === value)?.label ?? value}
          </span>
        </div>
        <div className="border border-border rounded bg-popover shadow-md overflow-hidden">
          <SelectCellEditor
            value={value}
            options={orderStatusOptions}
            onValueChange={(v) => {
              if (v !== null) {
                setValue(v);
                addLog(`Selected: ${v}`);
              }
            }}
            stopEditing={(cancel) => {
              addLog(cancel ? 'Cancelled' : 'Committed');
            }}
          />
        </div>
        {log.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const listbox = canvas.getByRole('listbox');

    await step('Editor is open and listbox is visible', async () => {
      await expect(listbox).toBeInTheDocument();
      await expect(canvas.getAllByRole('option').length).toBe(4);
    });

    await storyStepDelay(600);

    await step(
      'Navigate down 3 times (wraps: PENDING -> PROCESSING -> SHIPPED -> DELIVERED)',
      async () => {
        listbox.focus();
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('{ArrowDown}');
      },
    );

    await storyStepDelay(600);

    await step('Confirm selection with Enter — DELIVERED should be selected', async () => {
      await userEvent.keyboard('{Enter}');
      const label = canvas.getByText('Selected: DELIVERED');
      await expect(label).toBeInTheDocument();
    });
  },
};

// ============================================================================
// BothFormats — SelectOption[] and Record<string,string> are equivalent
// ============================================================================

/**
 * Shows that both options formats produce identical UI output.
 * Left panel uses SelectOption[]; right panel uses Record<string,string>.
 * The displayed items should look identical.
 */
export const BothFormats: Story = {
  render: () => {
    const [arrayValue, setArrayValue] = useState<string>('PENDING');
    const [recordValue, setRecordValue] = useState<string>('PENDING');

    return (
      <div className="flex gap-6 p-4">
        <div className="flex flex-col gap-3" style={{ width: 260 }}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            SelectOption[] format
          </div>
          <div className="border border-border rounded bg-popover shadow-md overflow-hidden">
            <SelectCellEditor
              value={arrayValue}
              options={orderStatusOptions}
              onValueChange={(v) => {
                if (v !== null) setArrayValue(v);
              }}
              stopEditing={() => {}}
            />
          </div>
          <SelectCellDisplay value={arrayValue} options={orderStatusOptions} />
        </div>

        <div className="flex flex-col gap-3" style={{ width: 260 }}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Record&lt;string,string&gt; format
          </div>
          <div className="border border-border rounded bg-popover shadow-md overflow-hidden">
            <SelectCellEditor
              value={recordValue}
              options={orderStatusRecord}
              onValueChange={(v) => {
                if (v !== null) setRecordValue(v);
              }}
              stopEditing={() => {}}
            />
          </div>
          <SelectCellDisplay value={recordValue} options={orderStatusRecord} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Both formats render the same options', async () => {
      const listboxes = canvas.getAllByRole('listbox');
      await expect(listboxes.length).toBe(2);

      // Both should have 4 options each
      const allOptions = canvas.getAllByRole('option');
      await expect(allOptions.length).toBe(8);
    });

    await step('Display components render the same label', async () => {
      const pendingLabels = canvas.getAllByText('Pending');
      // At least 2 "Pending" texts — one per display component
      await expect(pendingLabels.length).toBeGreaterThanOrEqual(2);
    });
  },
};
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Selected value</span>
        <div className="border border-border p-2 bg-white flex-1">
          <SelectCellDisplay value="SHIPPED" options={orderStatusOptions} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Empty</span>
        <div className="border border-border p-2 bg-white flex-1">
          <SelectCellDisplay options={orderStatusOptions} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Unknown value</span>
        <div className="border border-border p-2 bg-white flex-1">
          <SelectCellDisplay value="UNKNOWN_STATUS" options={orderStatusOptions} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Editor (interactive)</span>
        <div className="border border-border rounded bg-popover shadow-md overflow-hidden flex-1">
          <SelectCellEditor
            value="PENDING"
            options={orderStatusOptions}
            onValueChange={() => {}}
            stopEditing={() => {}}
          />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Playground — args-only, no render override; responds to Controls panel
// ============================================================================

/**
 * Interactive Controls playground for SelectCellDisplay.
 * Edit `value` in the Controls panel to see the label lookup in action.
 * `options` is fixed (complex type — cannot be driven by a control).
 */
export const Playground: Story = {
  args: {
    value: 'PENDING',
    options: orderStatusOptions,
  },
};

// ============================================================================
// AllVariants
// ============================================================================
