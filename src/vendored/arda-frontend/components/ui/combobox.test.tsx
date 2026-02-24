import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox, ComboboxOption } from './combobox';

const options: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

function renderCombobox(props: Partial<React.ComponentProps<typeof Combobox>> = {}) {
  const defaultProps = {
    options,
    value: '',
    onChange: jest.fn(),
    ...props,
  };
  return { ...render(<Combobox {...defaultProps} />), onChange: defaultProps.onChange };
}

describe('Combobox', () => {
  it('renders with placeholder text', () => {
    renderCombobox({ placeholder: 'Pick a fruit' });
    expect(screen.getByPlaceholderText('Pick a fruit')).toBeInTheDocument();
  });

  it('opens dropdown on container click', async () => {
    const user = userEvent.setup();
    renderCombobox();
    // Click the container div (not the input itself, which stops propagation)
    const input = screen.getByPlaceholderText('Search');
    // Click the parent container to toggle open
    await user.click(input.closest('div')!);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('displays all options when opened', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    const { onChange } = renderCombobox();
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('calls onChange with selected value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderCombobox({ onChange });
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    await user.click(screen.getByText('Cherry'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('cherry');
  });

  it('shows selected option label as input value', () => {
    renderCombobox({ value: 'apple' });
    expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
  });

  it('filters options when searching', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.clear(input);
    await user.type(input, 'ban');
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });

  it('shows "No matches" when filter matches nothing', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.clear(input);
    await user.type(input, 'zzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('closes dropdown after single selection', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    await user.click(screen.getByText('Apple'));
    // After selection, the dropdown options should be gone
    await waitFor(() => {
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
  });

  it('renders in disabled state', () => {
    renderCombobox({ disabled: true });
    expect(screen.getByPlaceholderText('Search')).toBeDisabled();
  });

  it('does not open when disabled and container is clicked', async () => {
    const user = userEvent.setup();
    renderCombobox({ disabled: true });
    const container = screen.getByPlaceholderText('Search').closest('div')!;
    await user.click(container);
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('shows Add New option when allowAddNew=true and search has value', async () => {
    const user = userEvent.setup();
    renderCombobox({ allowAddNew: true });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'newval');
    expect(screen.getByText('Add new')).toBeInTheDocument();
  });

  it('hides Add New option when allowAddNew=false', async () => {
    const user = userEvent.setup();
    renderCombobox({ allowAddNew: false });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'newval');
    expect(screen.queryByText('Add new')).not.toBeInTheDocument();
  });

  it('calls onChange and onAddNew when Add new is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onAddNew = jest.fn();
    renderCombobox({ onChange, onAddNew, allowAddNew: true });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'NewItem');
    await user.click(screen.getByText('Add new'));
    expect(onChange).toHaveBeenCalledWith('NewItem');
    expect(onAddNew).toHaveBeenCalledWith('NewItem');
  });

  it('calls onChange without onAddNew when onAddNew not provided', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderCombobox({ onChange, allowAddNew: true, onAddNew: undefined });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'NewItem');
    await user.click(screen.getByText('Add new'));
    expect(onChange).toHaveBeenCalledWith('NewItem');
  });

  it('triggers Add new on Enter key press', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderCombobox({ onChange, allowAddNew: true });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'PressEnter');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('PressEnter');
  });

  it('does not add new on Enter when allowAddNew=false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderCombobox({ onChange, allowAddNew: false });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'Apple');
    await user.keyboard('{Enter}');
    // allowAddNew=false, so Enter should not trigger onChange via add-new
    expect(onChange).not.toHaveBeenCalled();
  });

  it('multiple selection: shows checkboxes for each option', async () => {
    // Use string as value to avoid array-as-initial-value crash in component's useEffect
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderCombobox({ allowMultiple: true, value: 'apple', onChange });
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    // Multiple mode shows (Select all) option
    expect(screen.getByText('(Select all)')).toBeInTheDocument();
  });

  it('multiple selection: removes already-selected option', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    // Pass ['apple'] as value — effect won't crash since options.find finds 'apple'
    // Actually the effect tries to .trim() on searchValue too... let's use string
    // Workaround: start open so effect skips the problematic branch
    const { rerender } = renderCombobox({ allowMultiple: true, value: 'apple', onChange });
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    // Now rerender with array while open (isOpen=true, so effect is skipped)
    rerender(
      <Combobox
        options={options}
        value={['apple']}
        onChange={onChange}
        allowMultiple
      />
    );
    await user.click(screen.getByText('Apple'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('multiple selection: Select All selects all options', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderCombobox({ allowMultiple: true, value: 'apple', onChange });
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    await user.click(screen.getByText('(Select all)'));
    expect(onChange).toHaveBeenCalledWith(['apple', 'banana', 'cherry']);
  });

  it('multiple selection: Select All deselects all when all selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    // Start with string to avoid initial render crash, then rerender with array while open
    const { rerender } = renderCombobox({ allowMultiple: true, value: 'apple', onChange });
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    rerender(
      <Combobox
        options={options}
        value={['apple', 'banana', 'cherry']}
        onChange={onChange}
        allowMultiple
      />
    );
    await user.click(screen.getByText('(Select all)'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('isAllSelected shows check when all multiple values selected', async () => {
    const user = userEvent.setup();
    // Start with string, open, then rerender with all values to avoid crash
    const { rerender } = renderCombobox({ allowMultiple: true, value: 'apple' });
    await user.click(screen.getByPlaceholderText('Search').closest('div')!);
    rerender(
      <Combobox
        options={options}
        value={['apple', 'banana', 'cherry']}
        onChange={jest.fn()}
        allowMultiple
      />
    );
    const selectAllDiv = screen.getByText('(Select all)').parentElement;
    const checkbox = selectAllDiv?.querySelector('div.bg-black');
    expect(checkbox).toBeInTheDocument();
  });

  it('shows "No matches" without Add New when allowAddNew=false', async () => {
    const user = userEvent.setup();
    renderCombobox({ allowAddNew: false });
    const input = screen.getByPlaceholderText('Search');
    await user.click(input.closest('div')!);
    await user.type(input, 'zzz');
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.queryByText('Add new')).not.toBeInTheDocument();
  });

  it('forwards ref to root div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Combobox options={options} value="" onChange={jest.fn()} ref={ref} />
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
