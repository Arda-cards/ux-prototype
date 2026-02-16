import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaSelectCellEditor, createSelectCellEditor } from './select-cell-editor';
import type { SelectCellEditorHandle } from './select-cell-editor';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('ArdaSelectCellEditor', () => {
  it('renders with provided options', () => {
    render(<ArdaSelectCellEditor options={mockOptions} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    mockOptions.forEach((option) => {
      expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument();
    });
  });

  it('renders with initial value', () => {
    render(<ArdaSelectCellEditor options={mockOptions} value="option2" />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('renders with placeholder', () => {
    render(<ArdaSelectCellEditor options={mockOptions} placeholder="Select an option..." />);

    expect(screen.getByRole('option', { name: 'Select an option...' })).toBeInTheDocument();
  });

  it('updates value when selection changes', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();

    render(
      <ArdaSelectCellEditor options={mockOptions} value="option1" stopEditing={stopEditing} />,
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'option3');

    expect((select as HTMLSelectElement).value).toBe('option3');
    expect(stopEditing).toHaveBeenCalled();
  });

  it('calls stopEditing when Escape is pressed', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();

    render(<ArdaSelectCellEditor options={mockOptions} stopEditing={stopEditing} />);

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.keyboard('{Escape}');

    expect(stopEditing).toHaveBeenCalled();
  });

  it('exposes getValue method through ref', () => {
    const ref = React.createRef<SelectCellEditorHandle>();

    render(<ArdaSelectCellEditor ref={ref} options={mockOptions} value="option2" />);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveProperty('getValue');
    expect(ref.current?.getValue()).toBe('option2');
  });

  it('auto-focuses on mount', () => {
    render(<ArdaSelectCellEditor options={mockOptions} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveFocus();
  });

  it('handles empty value with placeholder', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<SelectCellEditorHandle>();

    render(<ArdaSelectCellEditor ref={ref} options={mockOptions} placeholder="Choose..." />);

    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('');

    await user.selectOptions(select, 'option1');
    expect(ref.current?.getValue()).toBe('option1');
  });
});

describe('createSelectCellEditor', () => {
  it('returns a component function', () => {
    const editorComponent = createSelectCellEditor(mockOptions);
    expect(typeof editorComponent).toBe('function');
  });

  it('creates editor with options', () => {
    const EditorComponent = createSelectCellEditor(mockOptions);
    render(<EditorComponent />);

    mockOptions.forEach((option) => {
      expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument();
    });
  });

  it('creates editor with placeholder', () => {
    const EditorComponent = createSelectCellEditor(mockOptions, 'Select...');
    render(<EditorComponent />);

    expect(screen.getByRole('option', { name: 'Select...' })).toBeInTheDocument();
  });

  it('passes through AG Grid props', () => {
    const EditorComponent = createSelectCellEditor(mockOptions);
    const stopEditing = vi.fn();

    render(<EditorComponent value="option2" stopEditing={stopEditing} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });
});
