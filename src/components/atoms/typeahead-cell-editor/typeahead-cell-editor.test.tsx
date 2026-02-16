import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { TypeaheadOption } from '@/components/atoms/typeahead/typeahead';
import { ArdaTypeaheadCellEditor, createTypeaheadCellEditor } from './typeahead-cell-editor';
import type { TypeaheadCellEditorHandle } from './typeahead-cell-editor';

const mockOptions: TypeaheadOption[] = [
  { value: 'opt1', label: 'Option One', meta: 'Meta 1' },
  { value: 'opt2', label: 'Option Two', meta: 'Meta 2' },
  { value: 'opt3', label: 'Option Three', meta: 'Meta 3' },
];

describe('ArdaTypeaheadCellEditor', () => {
  it('renders with provided options', () => {
    render(<ArdaTypeaheadCellEditor dataSource={mockOptions} />);

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    render(<ArdaTypeaheadCellEditor dataSource={mockOptions} value="opt2" />);

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Option Two');
  });

  it('filters options based on input', async () => {
    const user = userEvent.setup();
    render(<ArdaTypeaheadCellEditor dataSource={mockOptions} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Two');

    // Wait for debounced filtering to complete (ArdaTypeahead debounces 250ms)
    await waitFor(() => {
      expect(screen.getByText('Option Two')).toBeInTheDocument();
      expect(screen.queryByText('Option One')).not.toBeInTheDocument();
      expect(screen.queryByText('Option Three')).not.toBeInTheDocument();
    });
  });

  it('calls stopEditing when option is selected', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();

    render(<ArdaTypeaheadCellEditor dataSource={mockOptions} stopEditing={stopEditing} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'One');

    await waitFor(() => {
      expect(screen.getByText('Option One')).toBeInTheDocument();
    });

    const option = screen.getByText('Option One');
    await user.click(option);

    await waitFor(() => {
      expect(stopEditing).toHaveBeenCalledWith(false);
    });
  });

  it('calls stopEditing with cancel=true when Escape is pressed', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();

    render(<ArdaTypeaheadCellEditor dataSource={mockOptions} stopEditing={stopEditing} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('exposes getValue method through ref', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<TypeaheadCellEditorHandle>();

    render(<ArdaTypeaheadCellEditor ref={ref} dataSource={mockOptions} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Two');

    await waitFor(() => {
      expect(screen.getByText('Option Two')).toBeInTheDocument();
    });

    const option = screen.getByText('Option Two');
    await user.click(option);

    await waitFor(() => {
      expect(ref.current).not.toBeNull();
      expect(ref.current?.getValue()).toBe('opt2');
    });
  });

  it('handles async data source', async () => {
    const user = userEvent.setup();
    const asyncDataSource = vi.fn(async (query: string) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return mockOptions.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
    });

    render(<ArdaTypeaheadCellEditor dataSource={asyncDataSource} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Three');

    await waitFor(() => {
      expect(asyncDataSource).toHaveBeenCalledWith('Three');
    });

    await waitFor(() => {
      expect(screen.getByText('Option Three')).toBeInTheDocument();
    });
  });

  it('shows loading indicator for async data source', async () => {
    const user = userEvent.setup();
    const asyncDataSource = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockOptions;
    });

    render(<ArdaTypeaheadCellEditor dataSource={asyncDataSource} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'test');

    // Loading indicator should appear
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    // Wait for options to load
    await waitFor(
      () => {
        expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();
      },
      { timeout: 200 },
    );
  });

  it('handles empty query with static data source', async () => {
    const user = userEvent.setup();
    render(<ArdaTypeaheadCellEditor dataSource={mockOptions} />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    // Type and then clear
    await user.type(input, 'test');
    await user.clear(input);

    // Should show all options
    await waitFor(() => {
      expect(screen.getByText('Option One')).toBeInTheDocument();
      expect(screen.getByText('Option Two')).toBeInTheDocument();
      expect(screen.getByText('Option Three')).toBeInTheDocument();
    });
  });

  it('uses custom placeholder', () => {
    render(
      <ArdaTypeaheadCellEditor dataSource={mockOptions} placeholder="Custom placeholder..." />,
    );

    const input = screen.getByPlaceholderText('Custom placeholder...');
    expect(input).toBeInTheDocument();
  });
});

describe('createTypeaheadCellEditor', () => {
  it('returns a component function', () => {
    const editorComponent = createTypeaheadCellEditor({ dataSource: mockOptions });
    expect(typeof editorComponent).toBe('function');
  });

  it('creates editor with static data source', () => {
    const EditorComponent = createTypeaheadCellEditor({ dataSource: mockOptions });
    render(<EditorComponent />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('creates editor with async data source', async () => {
    const asyncDataSource = vi.fn(async () => mockOptions);
    const EditorComponent = createTypeaheadCellEditor({ dataSource: asyncDataSource });

    render(<EditorComponent />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('creates editor with custom placeholder', () => {
    const EditorComponent = createTypeaheadCellEditor({
      dataSource: mockOptions,
      placeholder: 'Find user...',
    });

    render(<EditorComponent />);
    expect(screen.getByPlaceholderText('Find user...')).toBeInTheDocument();
  });

  it('passes through AG Grid props', () => {
    const EditorComponent = createTypeaheadCellEditor({ dataSource: mockOptions });
    const stopEditing = vi.fn();

    render(<EditorComponent value="opt1" stopEditing={stopEditing} />);

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Option One');
  });
});
