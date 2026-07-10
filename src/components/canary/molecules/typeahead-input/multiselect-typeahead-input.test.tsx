import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { useState } from 'react';
import {
  MultiSelectTypeaheadInput,
  type MultiSelectOption,
  type MultiSelectSource,
} from './multiselect-typeahead-input';

// jsdom doesn't implement scrollIntoView, which the dropdown calls on highlight.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const ROLES = ['Vendor', 'Customer', 'Carrier', 'Operator', 'Distributor'];

function asyncRoleLookup(search: string): Promise<MultiSelectOption[]> {
  const q = search.trim().toLowerCase();
  const matches = q ? ROLES.filter((r) => r.toLowerCase().includes(q)) : ROLES;
  return Promise.resolve(matches.map((r) => ({ label: r, value: r })));
}

interface HarnessProps {
  initialValue?: string[];
  lookup?: MultiSelectSource;
  onValueChange?: (v: string[]) => void;
  onCommit?: () => void;
  defaultOne?: boolean;
  disabled?: boolean;
  maxResults?: number;
  cellEditorMode?: boolean;
  allowCreate?: boolean;
  tokenAction?: import('./multiselect-typeahead-input').MultiSelectTokenAction;
}

function Harness({
  initialValue = [],
  lookup = asyncRoleLookup,
  onValueChange,
  ...rest
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <MultiSelectTypeaheadInput
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValueChange?.(v);
      }}
      lookup={lookup}
      placeholder="Select roles"
      {...rest}
    />
  );
}

/** Returns the dropdown option element for a given label. */
function optionByLabel(label: string): HTMLElement {
  const listbox = screen.getByRole('listbox');
  return within(listbox).getByText(label).closest('[role="option"]') as HTMLElement;
}

describe('MultiSelectTypeaheadInput', () => {
  it('shows results when the input is focused', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(optionByLabel('Vendor')).toBeInTheDocument();
  });

  it('marks already-selected options as selected in the dropdown', async () => {
    const user = userEvent.setup();
    render(<Harness initialValue={['Vendor']} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(optionByLabel('Vendor')).toHaveAttribute('aria-selected', 'true');
    expect(optionByLabel('Customer')).toHaveAttribute('aria-selected', 'false');
  });

  it('accepts a static string[] as the lookup source', async () => {
    const user = userEvent.setup();
    render(<Harness lookup={['Email', 'EDI', 'Portal']} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(optionByLabel('Portal')).toBeInTheDocument();
  });

  it('caps the number of results at maxResults', async () => {
    const user = userEvent.setup();
    render(<Harness maxResults={2} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  describe('defaultOne (true)', () => {
    it('selects, commits, and closes the dropdown when an option is clicked', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onCommit = vi.fn();
      render(<Harness onValueChange={onValueChange} onCommit={onCommit} />);
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.click(optionByLabel('Carrier'));
      expect(onValueChange).toHaveBeenCalledWith(['Carrier']);
      expect(onCommit).toHaveBeenCalledOnce();
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    });

    it('does not uncheck an already-selected option on click', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness initialValue={['Vendor']} onValueChange={onValueChange} />);
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.click(optionByLabel('Vendor'));
      // Value is unchanged (still selected); never called with a value that drops Vendor
      expect(onValueChange).not.toHaveBeenCalledWith([]);
    });
  });

  describe('defaultOne (false)', () => {
    it('toggles selection and keeps the dropdown open', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness defaultOne={false} onValueChange={onValueChange} />);
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.click(optionByLabel('Vendor'));
      expect(onValueChange).toHaveBeenCalledWith(['Vendor']);
      // Dropdown stays open for further selection
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('removes a selected option when clicked again', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness defaultOne={false} initialValue={['Vendor']} onValueChange={onValueChange} />,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.click(optionByLabel('Vendor'));
      expect(onValueChange).toHaveBeenCalledWith([]);
    });
  });

  it('navigates results with ArrowDown and selects on Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}'); // Vendor (0) -> Customer (1)
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(['Customer']);
  });

  it('closes the dropdown on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('focuses the last token with ArrowLeft and removes it with Delete', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness initialValue={['Vendor', 'Customer']} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowLeft}'); // focus last token (Customer)
    await user.keyboard('{Delete}');
    expect(onValueChange).toHaveBeenCalledWith(['Vendor']);
  });

  it('shows an error row when the lookup rejects', async () => {
    const user = userEvent.setup();
    const failing = () => Promise.reject(new Error('boom'));
    render(<Harness lookup={failing} />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText(/Click to retry/i)).toBeInTheDocument();
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

  it('removes the last token on Backspace when the input is empty', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness initialValue={['Vendor', 'Customer']} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenCalledWith(['Vendor']);
  });

  it('is disabled when disabled is set', () => {
    render(<Harness disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  function focusedTokenText(): string | undefined {
    return document.querySelector('[data-token].ring-2')?.textContent ?? undefined;
  }

  describe('token navigation', () => {
    it('moves between tokens with ArrowLeft/ArrowRight and back to the input', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue={['Vendor', 'Customer', 'Carrier']} />);
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowLeft}'); // input -> last token (Carrier)
      expect(focusedTokenText()).toBe('Carrier');
      await user.keyboard('{ArrowLeft}'); // -> Customer
      expect(focusedTokenText()).toBe('Customer');
      await user.keyboard('{ArrowRight}'); // -> Carrier
      expect(focusedTokenText()).toBe('Carrier');
      await user.keyboard('{ArrowRight}'); // past last -> input
      expect(input).toHaveFocus();
    });

    it('returns to the input and opens the dropdown on ArrowDown from a token', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue={['Vendor']} />);
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{Escape}'); // close dropdown, keep focus
      await user.keyboard('{ArrowLeft}'); // focus the token
      expect(focusedTokenText()).toBe('Vendor');
      await user.keyboard('{ArrowDown}'); // back to input + open
      expect(input).toHaveFocus();
      expect(await screen.findByRole('listbox')).toBeInTheDocument();
    });

    it('returns focus to the input when typing on a focused token', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue={['Vendor']} />);
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowLeft}'); // focus token
      expect(focusedTokenText()).toBe('Vendor');
      await user.keyboard('a'); // printable char returns to input
      expect(input).toHaveFocus();
    });

    it('focuses the last token with ArrowUp from the top of the dropdown', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue={['Vendor']} />);
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.keyboard('{ArrowUp}'); // top result + has tokens -> focus last token
      expect(focusedTokenText()).toBe('Vendor');
    });

    it('clicking a token focuses it and opens the dropdown', async () => {
      const user = userEvent.setup();
      render(<Harness initialValue={['Vendor', 'Customer']} />);
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      // Click the rendered token (data-token marks real tokens, not the
      // off-screen measurer copies).
      const firstToken = document.querySelector('[data-token]') as HTMLElement;
      await user.click(firstToken);
      expect(focusedTokenText()).toBe('Vendor');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  it('commits and calls onCommit on Tab', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{Tab}');
    expect(onCommit).toHaveBeenCalledOnce();
  });

  it('accepts a static MultiSelectOption[] and commits the option value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Harness
        defaultOne={false}
        lookup={[
          { label: 'Air Freight', value: 'AIR' },
          { label: 'Sea Freight', value: 'SEA' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.click(optionByLabel('Sea Freight'));
    expect(onValueChange).toHaveBeenCalledWith(['SEA']);
  });

  it('auto-focuses and opens the dropdown on mount in cell editor mode', async () => {
    render(<Harness cellEditorMode />);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  describe('allowCreate', () => {
    it('offers a create row for unmatched text and adds it as a token', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness allowCreate defaultOne={false} onValueChange={onValueChange} />);
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('pepper@stark.example');
      const createRow = await screen.findByText('pepper@stark.example');
      await user.click(createRow.closest('[role="option"]') as HTMLElement);
      expect(onValueChange).toHaveBeenCalledWith(['pepper@stark.example']);
      // Input cleared, dropdown stays open (defaultOne={false})
      expect(screen.getByRole('combobox')).toHaveValue('');
    });

    it('plain Enter on typed text creates the token', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness allowCreate defaultOne={false} onValueChange={onValueChange} />);
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('zzz-unmatched');
      await screen.findByText('zzz-unmatched');
      // Wait out the search debounce so the stale focus-search options (and
      // their highlight) are gone -- otherwise Enter selects, not creates.
      await waitFor(() => expect(screen.queryByText('Vendor')).toBeNull());
      await user.keyboard('{Enter}');
      expect(onValueChange).toHaveBeenCalledWith(['zzz-unmatched']);
    });

    it('offers no create row when the text matches an option or a selected token', async () => {
      const user = userEvent.setup();
      render(<Harness allowCreate initialValue={['taken@x.com']} />);
      await user.click(screen.getByRole('combobox'));
      // Exact option match
      await user.keyboard('Vendor');
      await screen.findByRole('listbox');
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getAllByText('Vendor')).toHaveLength(1); // only the option, no create row
      // Already-selected token
      await user.clear(screen.getByRole('combobox'));
      await user.keyboard('taken@x.com');
      await waitFor(() => {
        const rows = screen.queryAllByRole('option');
        expect(rows.every((r) => !r.textContent?.includes('taken@x.com'))).toBe(true);
      });
    });

    it('does not duplicate an existing token on repeated create (case-insensitive)', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          allowCreate
          defaultOne={false}
          initialValue={['a@x.com']}
          onValueChange={onValueChange}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('A@X.COM');
      // Wait out the search debounce (see above) before Enter.
      await waitFor(() => expect(screen.queryByText('Vendor')).toBeNull());
      await user.keyboard('{Enter}');
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('tokenAction', () => {
    const starAction = (
      overrides: Partial<import('./multiselect-typeahead-input').MultiSelectTokenAction> = {},
    ) => ({
      label: (v: string) => `Set ${v} as default`,
      icon: <span data-testid="star-icon">*</span>,
      onAction: vi.fn(),
      ...overrides,
    });

    it('renders the action inside each token and fires with the token value', async () => {
      const user = userEvent.setup();
      const action = starAction();
      render(<Harness initialValue={['a@x.com', 'b@x.com']} tokenAction={action} />);
      const btn = screen.getByRole('button', { name: 'Set b@x.com as default' });
      await user.pointer({ keys: '[MouseLeft]', target: btn });
      expect(action.onAction).toHaveBeenCalledWith('b@x.com');
    });

    it('does not remove the token when the action is clicked', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const action = starAction();
      render(
        <Harness initialValue={['a@x.com']} tokenAction={action} onValueChange={onValueChange} />,
      );
      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Set a@x.com as default' }),
      });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('hides the action for tokens where isVisible is false', () => {
      const action = starAction({ isVisible: (v: string) => v !== 'a@x.com' });
      render(<Harness initialValue={['a@x.com', 'b@x.com']} tokenAction={action} />);
      expect(screen.queryByRole('button', { name: 'Set a@x.com as default' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Set b@x.com as default' })).toBeInTheDocument();
    });
  });
});
