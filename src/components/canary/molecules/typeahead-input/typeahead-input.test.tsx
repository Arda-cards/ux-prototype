import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { useState } from 'react';
import { TypeaheadInput, type TypeaheadOption, type TypeaheadSource } from './typeahead-input';

// jsdom doesn't implement scrollIntoView, which the dropdown calls on highlight.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry', 'Date', 'Elderberry'];

function asyncFruitLookup(search: string): Promise<TypeaheadOption[]> {
  const q = search.trim().toLowerCase();
  const matches = q ? FRUITS.filter((f) => f.toLowerCase().includes(q)) : FRUITS;
  return Promise.resolve(matches.map((f) => ({ label: f, value: f })));
}

interface HarnessProps {
  initialValue?: string;
  lookup?: TypeaheadSource;
  onValueChange?: (v: string) => void;
  allowCreate?: boolean;
  disabled?: boolean;
  clearOnFocus?: boolean;
  maxResults?: number;
  cellEditorMode?: boolean;
}

function Harness({
  initialValue = '',
  lookup = asyncFruitLookup,
  onValueChange,
  ...rest
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <TypeaheadInput
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValueChange?.(v);
      }}
      lookup={lookup}
      placeholder="Select fruit"
      {...rest}
    />
  );
}

describe('TypeaheadInput', () => {
  it('shows results when the input is focused', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('auto-highlights the first result', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    const first = await screen.findByText('Apple');
    expect(first.closest('[role="option"]')).toHaveAttribute('aria-selected', 'true');
  });

  it('commits the highlighted result on Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Apple');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('Apple');
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Cherry'));
    expect(onValueChange).toHaveBeenCalledWith('Cherry');
  });

  it('filters results as the user types', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'ap');
    // "Apple" and "Apricot" match "ap"; "Banana" does not
    expect(await screen.findByText('Apricot')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Banana')).not.toBeInTheDocument());
  });

  it('accepts a static string[] as the lookup source', async () => {
    const user = userEvent.setup();
    render(<Harness lookup={['Red', 'Green', 'Blue']} />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Green')).toBeInTheDocument();
  });

  it('caps the number of results at maxResults', async () => {
    const user = userEvent.setup();
    render(<Harness maxResults={2} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Apple');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('shows a create row and creates a value when allowCreate is set', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness allowCreate onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Mango');
    // Wait for the debounced search to settle (no fruit matches "Mango"),
    // leaving only the create row.
    await waitFor(() => expect(screen.queryByText('Apple')).not.toBeInTheDocument());
    expect(screen.getByText('Mango')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('Mango');
  });

  it('is disabled when disabled is set', () => {
    render(<Harness disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('navigates results with ArrowDown and selects on Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Apple');
    await user.keyboard('{ArrowDown}'); // move from Apple (0) to Apricot (1)
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('Apricot');
  });

  it('closes the dropdown on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('reopens the dropdown when the focused input is clicked again', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.click(input);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('shows an error row and a retry control when the lookup rejects', async () => {
    const user = userEvent.setup();
    const failing = () => Promise.reject(new Error('boom'));
    render(<Harness lookup={failing} />);
    await user.click(screen.getByRole('combobox'));
    // The retry text is unique to the error row (the live region only says
    // "Failed to load results").
    expect(await screen.findByText(/Click to retry/i)).toBeInTheDocument();
  });

  it('shows a loading indicator while the lookup is pending', async () => {
    const user = userEvent.setup();
    const pending = () => new Promise<TypeaheadOption[]>(() => {});
    render(<Harness lookup={pending} />);
    await user.click(screen.getByRole('combobox'));
    // "Searching" appears in both the live region and the indicator row.
    await waitFor(() => expect(screen.getAllByText(/Searching/i).length).toBeGreaterThan(0));
  });

  it('navigates upward with ArrowUp', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Apple');
    // From Apple (0), ArrowUp wraps to the last option (Elderberry)
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('Elderberry');
  });

  it('commits the highlighted option on Tab', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByText('Apple');
    await user.keyboard('{Tab}');
    expect(onValueChange).toHaveBeenCalledWith('Apple');
  });

  it('reopens with ArrowDown after the dropdown was closed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('accepts a static TypeaheadOption[] as the lookup source', async () => {
    const user = userEvent.setup();
    const options: TypeaheadOption[] = [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
    ];
    const onValueChange = vi.fn();
    render(<Harness lookup={options} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Canada'));
    // The option's value (not label) is committed
    expect(onValueChange).toHaveBeenCalledWith('CA');
  });

  it('retries the lookup when the error row is clicked', async () => {
    const user = userEvent.setup();
    const lookup = vi.fn(() => Promise.reject(new Error('boom')));
    render(<Harness lookup={lookup} />);
    await user.click(screen.getByRole('combobox'));
    const retry = await screen.findByText(/Click to retry/i);
    const callsBefore = lookup.mock.calls.length;
    await user.click(retry);
    await waitFor(() => expect(lookup.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it('creates a value when the create row is clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness allowCreate onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Guava');
    const createRow = await screen.findByText('Guava');
    await user.click(createRow);
    expect(onValueChange).toHaveBeenCalledWith('Guava');
  });

  it('reverts to the confirmed value on blur when nothing matches (form mode)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Harness initialValue="Apple" />
        <button type="button">outside</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'xyz');
    await user.click(screen.getByText('outside'));
    expect(input.value).toBe('Apple');
  });

  it('selects an exact match on blur even when create is off (form mode)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Harness onValueChange={onValueChange} />
        <button type="button">outside</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'Banana');
    await screen.findByRole('option', { name: 'Banana' });
    await user.click(screen.getByText('outside'));
    expect(onValueChange).toHaveBeenLastCalledWith('Banana');
    expect(input.value).toBe('Banana');
  });

  it('selects the highlighted row on blur for a partial match (create off)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Harness onValueChange={onValueChange} />
        <button type="button">outside</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    // 'Ap' matches Apple (default-highlighted) and Apricot.
    await user.type(input, 'Ap');
    // Wait for the debounced search to apply (Banana should be filtered out).
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: 'Banana' })).not.toBeInTheDocument(),
    );
    await user.click(screen.getByText('outside'));
    expect(onValueChange).toHaveBeenLastCalledWith('Apple');
  });

  it('honors an arrowed-to row on blur instead of the first result (create off)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Harness onValueChange={onValueChange} />
        <button type="button">outside</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'Ap');
    await screen.findByRole('option', { name: 'Apricot' });
    // Move highlight from Apple (index 0) down to Apricot (index 1).
    await user.keyboard('{ArrowDown}');
    await user.click(screen.getByText('outside'));
    expect(onValueChange).toHaveBeenLastCalledWith('Apricot');
  });

  it('commits the typed text on blur when create is on and nothing matches exactly', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Harness allowCreate onValueChange={onValueChange} />
        <button type="button">outside</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'Guava');
    await user.click(screen.getByText('outside'));
    expect(onValueChange).toHaveBeenLastCalledWith('Guava');
    expect(input.value).toBe('Guava');
  });

  it('accepts the typed value on blur in cell editor mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Harness cellEditorMode onValueChange={onValueChange} />
        <button type="button">outside</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Kiwi');
    await user.click(screen.getByText('outside'));
    expect(onValueChange).toHaveBeenCalledWith('Kiwi');
  });

  describe('clearOnFocus', () => {
    it('clears the input on focus to show the full list', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue="Apple" clearOnFocus />);
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.value).toBe('Apple');
      await user.click(input);
      await waitFor(() => expect(input.value).toBe(''));
      // Full list visible, including options other than the prior value
      expect(await screen.findByText('Banana')).toBeInTheDocument();
    });

    it('restores the original value on blur (outside click)', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Harness initialValue="Apple" clearOnFocus />
          <button type="button">outside</button>
        </>,
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      await user.click(input);
      await waitFor(() => expect(input.value).toBe(''));
      await user.click(screen.getByText('outside'));
      expect(input.value).toBe('Apple');
    });

    it('restores the original value on Escape', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue="Apple" clearOnFocus />);
      const input = screen.getByRole('combobox') as HTMLInputElement;
      await user.click(input);
      await waitFor(() => expect(input.value).toBe(''));
      await user.keyboard('{Escape}');
      expect(input.value).toBe('Apple');
    });

    it('clears the value when Delete is pressed on an empty input', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness initialValue="Apple" clearOnFocus onValueChange={onValueChange} />);
      const input = screen.getByRole('combobox');
      await user.click(input);
      await waitFor(() => expect((input as HTMLInputElement).value).toBe(''));
      await user.keyboard('{Delete}');
      expect(onValueChange).toHaveBeenCalledWith('');
    });
  });
});
