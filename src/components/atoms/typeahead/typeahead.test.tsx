import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ArdaTypeahead, type TypeaheadOption } from './typeahead';

const sampleOptions: TypeaheadOption[] = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta', meta: 'Vendor' },
  { label: 'Gamma', value: 'gamma' },
];

const defaultProps = {
  value: '',
  options: [] as TypeaheadOption[],
  onInputChange: vi.fn(),
  onSelect: vi.fn(),
};

describe('ArdaTypeahead', () => {
  it('renders the input with placeholder', () => {
    render(<ArdaTypeahead {...defaultProps} placeholder="Search items..." />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('shows options when input has value and options are provided', () => {
    render(<ArdaTypeahead {...defaultProps} value="" options={sampleOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'a' } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('calls onInputChange after debounce delay', () => {
    vi.useFakeTimers();
    const onInputChange = vi.fn();
    render(<ArdaTypeahead {...defaultProps} onInputChange={onInputChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Before debounce fires
    expect(onInputChange).not.toHaveBeenCalled();

    // Advance past debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onInputChange).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });

  it('calls onSelect when an option is clicked', () => {
    const onSelect = vi.fn();
    render(
      <ArdaTypeahead {...defaultProps} value="a" options={sampleOptions} onSelect={onSelect} />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'a' } });

    const option = screen.getByText('Alpha');
    // Component uses onMouseDown to prevent blur from closing dropdown
    fireEvent.mouseDown(option);

    expect(onSelect).toHaveBeenCalledWith(sampleOptions[0]);
  });

  it('calls onCreate when create-new option is selected', () => {
    const onCreate = vi.fn();
    render(
      <ArdaTypeahead {...defaultProps} value="" options={[]} allowCreate onCreate={onCreate} />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'New Item' } });

    // The create-new option should appear
    const createOption = screen.getByRole('option');
    fireEvent.mouseDown(createOption);

    expect(onCreate).toHaveBeenCalledWith('New Item');
  });

  it('supports keyboard navigation with Arrow keys and Enter', () => {
    const onSelect = vi.fn();
    render(
      <ArdaTypeahead {...defaultProps} value="a" options={sampleOptions} onSelect={onSelect} />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'a' } });

    // Arrow down to first option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /Alpha/ })).toHaveAttribute('aria-selected', 'true');

    // Arrow down to second option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /Beta/ })).toHaveAttribute('aria-selected', 'true');

    // Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(sampleOptions[1]);
  });

  it('shows loading spinner when loading is true', () => {
    render(<ArdaTypeahead {...defaultProps} value="test" loading />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('closes dropdown on Escape key', () => {
    render(<ArdaTypeahead {...defaultProps} value="" options={sampleOptions} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'a' } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
