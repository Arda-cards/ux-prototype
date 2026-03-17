import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ColorCellDisplay } from './color-cell-display';
import { ColorCellEditor, type ColorCellEditorHandle } from './color-cell-editor';

describe('ColorCellDisplay', () => {
  it('renders dash for undefined', () => {
    render(<ColorCellDisplay />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders swatch and label for known color', () => {
    render(<ColorCellDisplay value="RED" />);
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('renders swatch and label for another color', () => {
    render(<ColorCellDisplay value="BLUE" />);
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('falls back to gray swatch for unknown value', () => {
    render(<ColorCellDisplay value="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('uses custom colorMap when provided', () => {
    const customMap = {
      CUSTOM: { hex: '#112233', name: 'Custom Color' },
    };
    render(<ColorCellDisplay value="CUSTOM" colorMap={customMap} />);
    expect(screen.getByText('Custom Color')).toBeInTheDocument();
  });

  it('renders all 10 default colors', () => {
    const expected: [string, string][] = [
      ['RED', 'Red'],
      ['GREEN', 'Green'],
      ['BLUE', 'Blue'],
      ['YELLOW', 'Yellow'],
      ['ORANGE', 'Orange'],
      ['PURPLE', 'Purple'],
      ['PINK', 'Pink'],
      ['GRAY', 'Gray'],
      ['BLACK', 'Black'],
      ['WHITE', 'White'],
    ];
    for (const [value, label] of expected) {
      const { unmount } = render(<ColorCellDisplay value={value} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});

describe('ColorCellEditor', () => {
  it('renders select with initial value', () => {
    render(<ColorCellEditor value="RED" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('RED');
  });

  it('renders empty option and all default colors', () => {
    render(<ColorCellEditor />);
    const options = screen.getAllByRole('option');
    // 1 empty + 10 colors = 11
    expect(options).toHaveLength(11);
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<ColorCellEditorHandle>();
    render(<ColorCellEditor ref={ref} value="GREEN" />);
    expect(ref.current?.getValue()).toBe('GREEN');
  });

  it('calls stopEditing on selection change', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ColorCellEditor value="RED" stopEditing={stopEditing} />);
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'BLUE');
    // Auto-commits via setTimeout
    await vi.waitFor(() => expect(stopEditing).toHaveBeenCalledWith(false));
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<ColorCellEditor value="RED" stopEditing={stopEditing} />);
    const select = screen.getByRole('combobox');
    await user.type(select, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<ColorCellEditor value="RED" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveFocus();
  });

  it('accepts custom colors prop', () => {
    const customColors = [
      { value: 'A', label: 'Alpha', hex: '#000' },
      { value: 'B', label: 'Beta', hex: '#fff' },
    ];
    render(<ColorCellEditor colors={customColors} />);
    const options = screen.getAllByRole('option');
    // 1 empty + 2 custom = 3
    expect(options).toHaveLength(3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
