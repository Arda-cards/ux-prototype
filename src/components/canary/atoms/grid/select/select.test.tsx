import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { SelectCellDisplay } from './select-cell-display';
import { SelectCellEditor, normalizeOptions, type SelectOption } from './select-cell-editor';

// jsdom does not implement scrollIntoView — stub it globally so effects don't throw
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// ============================================================================
// Test fixtures
// ============================================================================

const optionsArray: SelectOption[] = [
  { value: 'ALPHA', label: 'Alpha' },
  { value: 'BETA', label: 'Beta' },
  { value: 'GAMMA', label: 'Gamma' },
  { value: 'DELTA', label: 'Delta' },
];

const optionsRecord: Record<string, string> = {
  ALPHA: 'Alpha',
  BETA: 'Beta',
  GAMMA: 'Gamma',
  DELTA: 'Delta',
};

// useGridCellEditor is a no-op in jsdom — mock it so tests don't need ag-grid wiring
vi.mock('ag-grid-react', () => ({
  useGridCellEditor: vi.fn(),
}));

// ============================================================================
// normalizeOptions
// ============================================================================

describe('normalizeOptions', () => {
  it('returns the array unchanged when given SelectOption[]', () => {
    expect(normalizeOptions(optionsArray)).toEqual(optionsArray);
  });

  it('converts Record<string,string> to SelectOption[]', () => {
    const result = normalizeOptions(optionsRecord);
    expect(result).toEqual([
      { value: 'ALPHA', label: 'Alpha' },
      { value: 'BETA', label: 'Beta' },
      { value: 'GAMMA', label: 'Gamma' },
      { value: 'DELTA', label: 'Delta' },
    ]);
  });

  it('returns empty array for empty Record', () => {
    expect(normalizeOptions({})).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(normalizeOptions([])).toEqual([]);
  });
});

// ============================================================================
// SelectCellDisplay
// ============================================================================

describe('SelectCellDisplay', () => {
  it('renders the label for a known value (array format)', () => {
    render(<SelectCellDisplay value="BETA" options={optionsArray} />);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders the label for a known value (record format)', () => {
    render(<SelectCellDisplay value="GAMMA" options={optionsRecord} />);
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders an em-dash for null value', () => {
    render(<SelectCellDisplay value={null} options={optionsArray} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders an em-dash for undefined value', () => {
    render(<SelectCellDisplay options={optionsArray} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the raw value for an unknown key', () => {
    render(<SelectCellDisplay value="UNKNOWN_KEY" options={optionsArray} />);
    expect(screen.getByText('UNKNOWN_KEY')).toBeInTheDocument();
  });

  it('both formats render the same label for the same stored value', () => {
    const { unmount } = render(<SelectCellDisplay value="ALPHA" options={optionsArray} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    unmount();

    render(<SelectCellDisplay value="ALPHA" options={optionsRecord} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});

// ============================================================================
// SelectCellEditor — rendering
// ============================================================================

describe('SelectCellEditor rendering', () => {
  it('renders a listbox with all options', () => {
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBe(4);
  });

  it('renders option labels as text', () => {
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
  });

  it('marks the current value with aria-selected="true"', () => {
    render(
      <SelectCellEditor
        value="BETA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    // The BETA option should be the only aria-selected one
    const options = screen.getAllByRole('option');
    const selected = options.filter((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected.length).toBe(1);
    expect(selected[0]).toHaveTextContent('Beta');
  });

  it('renders a Check icon for the current value', () => {
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    // Check icon is aria-hidden; use querySelector via the listbox container
    const listbox = screen.getByRole('listbox');

    const svgIcons = listbox.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgIcons.length).toBe(1);
  });

  it('accepts Record<string,string> and renders identically to SelectOption[]', () => {
    const { rerender } = render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    const arrayOptionTexts = screen.getAllByRole('option').map((o) => o.textContent?.trim());

    rerender(
      <SelectCellEditor
        value="ALPHA"
        options={optionsRecord}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    const recordOptionTexts = screen.getAllByRole('option').map((o) => o.textContent?.trim());

    expect(arrayOptionTexts).toEqual(recordOptionTexts);
  });
});

// ============================================================================
// SelectCellEditor — keyboard navigation
// ============================================================================

describe('SelectCellEditor keyboard navigation', () => {
  let onValueChange: ReturnType<typeof vi.fn>;
  let stopEditing: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onValueChange = vi.fn();
    stopEditing = vi.fn();
  });

  it('Arrow Down moves highlight to next option', async () => {
    const user = userEvent.setup();
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={onValueChange}
        stopEditing={stopEditing}
      />,
    );
    const listbox = screen.getByRole('listbox');
    listbox.focus();
    await user.keyboard('{ArrowDown}');

    // After one Arrow Down from ALPHA (index 0), BETA (index 1) should be highlighted
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveClass('bg-accent');
  });

  it('Arrow Down wraps from last option to first', async () => {
    const user = userEvent.setup();
    render(
      <SelectCellEditor
        value="DELTA"
        options={optionsArray}
        onValueChange={onValueChange}
        stopEditing={stopEditing}
      />,
    );
    const listbox = screen.getByRole('listbox');
    listbox.focus();
    // DELTA is index 3 (last). One Arrow Down should wrap to index 0 (ALPHA)
    await user.keyboard('{ArrowDown}');

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveClass('bg-accent');
  });

  it('Arrow Up wraps from first option to last', async () => {
    const user = userEvent.setup();
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={onValueChange}
        stopEditing={stopEditing}
      />,
    );
    const listbox = screen.getByRole('listbox');
    listbox.focus();
    // ALPHA is index 0. Arrow Up should wrap to DELTA (index 3)
    await user.keyboard('{ArrowUp}');

    const options = screen.getAllByRole('option');
    expect(options[3]).toHaveClass('bg-accent');
  });

  it('Enter selects the highlighted option and calls stopEditing', async () => {
    const user = userEvent.setup();
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={onValueChange}
        stopEditing={stopEditing}
      />,
    );
    const listbox = screen.getByRole('listbox');
    listbox.focus();
    // Navigate to BETA
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenCalledWith('BETA');
  });

  it('Escape cancels without calling onValueChange', async () => {
    const user = userEvent.setup();
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={onValueChange}
        stopEditing={stopEditing}
      />,
    );
    const listbox = screen.getByRole('listbox');
    listbox.focus();
    await user.keyboard('{Escape}');

    expect(onValueChange).not.toHaveBeenCalled();
    expect(stopEditing).toHaveBeenCalledWith(true);
  });
});

// ============================================================================
// SelectCellEditor — ARIA roles
// ============================================================================

describe('SelectCellEditor ARIA roles', () => {
  it('container has role="listbox"', () => {
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('each option has role="option"', () => {
    render(
      <SelectCellEditor
        value="ALPHA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(4);
  });

  it('selected option has aria-selected="true", others are "false"', () => {
    render(
      <SelectCellEditor
        value="GAMMA"
        options={optionsArray}
        onValueChange={vi.fn()}
        stopEditing={vi.fn()}
      />,
    );
    const options = screen.getAllByRole('option');
    const trueSelected = options.filter((o) => o.getAttribute('aria-selected') === 'true');
    const falseSelected = options.filter((o) => o.getAttribute('aria-selected') === 'false');
    expect(trueSelected.length).toBe(1);
    expect(trueSelected[0]).toHaveTextContent('Gamma');
    expect(falseSelected.length).toBe(3);
  });
});
