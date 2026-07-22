import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { useState } from 'react';
import {
  MultiSelectTypeaheadInput,
  type MultiSelectOption,
  type MultiSelectSource,
} from './multiselect-typeahead-input';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

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
  optionDestroy?: import('./multiselect-typeahead-input').MultiSelectOptionDestroy;
  bare?: boolean;
  editOnDoubleClick?: boolean;
}

function Harness({
  initialValue = [],
  lookup = asyncRoleLookup,
  onValueChange,
  ...rest
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  // Token/option tooltips need the consumer-provided TooltipProvider (same
  // convention as Button's tooltip prop).
  return (
    <TooltipProvider>
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
    </TooltipProvider>
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
      render(<Harness initialValue={['a@x.com', 'b@x.com']} tokenAction={action} bare />);
      const btn = screen.getByRole('button', { name: 'Set b@x.com as default' });
      await user.pointer({ keys: '[MouseLeft]', target: btn });
      expect(action.onAction).toHaveBeenCalledWith('b@x.com');
    });

    it('does not remove the token when the action is clicked', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const action = starAction();
      render(
        <Harness
          initialValue={['a@x.com']}
          tokenAction={action}
          onValueChange={onValueChange}
          bare
        />,
      );
      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Set a@x.com as default' }),
      });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('hides the action for tokens where isVisible is false', () => {
      const action = starAction({ isVisible: (v: string) => v !== 'a@x.com' });
      render(<Harness initialValue={['a@x.com', 'b@x.com']} tokenAction={action} bare />);
      expect(screen.queryByRole('button', { name: 'Set a@x.com as default' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Set b@x.com as default' })).toBeInTheDocument();
    });

    it('fires via Shift+Space on a focused token', async () => {
      const user = userEvent.setup();
      const action = starAction();
      render(<Harness initialValue={['a@x.com']} tokenAction={action} bare />);
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowLeft}'); // focus the token
      await user.keyboard('{Shift>} {/Shift}');
      expect(action.onAction).toHaveBeenCalledWith('a@x.com');
    });
  });

  describe('outside-click commit', () => {
    it('with allowCreate, clicking out commits the exact typed text as a token', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <div>
          <Harness onValueChange={onValueChange} allowCreate bare />
          <button type="button">outside</button>
        </div>,
      );
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('new@x.com');
      await screen.findByText('No results');
      await user.click(screen.getByRole('button', { name: 'outside' }));
      expect(onValueChange).toHaveBeenCalledWith(['new@x.com']);
      expect(screen.getByRole('combobox')).toHaveValue('');
    });

    it('without allowCreate, clicking out selects the highlighted result', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <div>
          <Harness onValueChange={onValueChange} bare />
          <button type="button">outside</button>
        </div>,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.keyboard('Vend');
      await waitFor(() => expect(screen.queryByText('Customer')).toBeNull());
      await user.click(screen.getByRole('button', { name: 'outside' }));
      expect(onValueChange).toHaveBeenCalledWith(['Vendor']);
    });

    it('does not pick a highlighted result that belongs to an older query (mid-debounce)', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <div>
          <Harness onValueChange={onValueChange} bare />
          <button type="button">outside</button>
        </div>,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox'); // focus-search ('') resolved: all roles listed
      await user.keyboard('Vend'); // debounced search not fired yet
      await user.click(screen.getByRole('button', { name: 'outside' }));
      // The visible options came from the '' query, not 'Vend' — no pick.
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('without allowCreate and no results, clicking out discards the text', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <div>
          <Harness onValueChange={onValueChange} bare />
          <button type="button">outside</button>
        </div>,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.keyboard('zzz');
      await screen.findByText('No results');
      await user.click(screen.getByRole('button', { name: 'outside' }));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox')).toHaveValue('');
    });
  });

  describe('optionDestroy', () => {
    it('fires with the option value without selecting it, and drops the row', async () => {
      const user = userEvent.setup();
      const onDestroy = vi.fn();
      const onValueChange = vi.fn();
      render(
        <Harness
          lookup={['a@x.com', 'b@x.com']}
          onValueChange={onValueChange}
          optionDestroy={{ label: (v) => `Forget ${v}`, onDestroy }}
          bare
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Forget a@x.com' }),
      });
      expect(onDestroy).toHaveBeenCalledWith('a@x.com');
      expect(onValueChange).not.toHaveBeenCalled();
      // The destroyed row is dropped from the open result list optimistically.
      expect(within(screen.getByRole('listbox')).queryByText('a@x.com')).toBeNull();
      expect(within(screen.getByRole('listbox')).getByText('b@x.com')).toBeInTheDocument();
    });

    it('fires via Shift+Delete on the highlighted row', async () => {
      const user = userEvent.setup();
      const onDestroy = vi.fn();
      render(
        <Harness
          lookup={['a@x.com', 'b@x.com']}
          optionDestroy={{ label: (v) => `Forget ${v}`, onDestroy }}
          bare
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.keyboard('{Shift>}{Delete}{/Shift}'); // first row is highlighted
      expect(onDestroy).toHaveBeenCalledWith('a@x.com');
      expect(within(screen.getByRole('listbox')).queryByText('a@x.com')).toBeNull();
    });

    it('hides the destroy button for options where isVisible is false', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          lookup={['a@x.com', 'b@x.com']}
          optionDestroy={{
            label: (v) => `Forget ${v}`,
            onDestroy: vi.fn(),
            isVisible: (v) => v !== 'a@x.com',
          }}
          bare
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      expect(screen.queryByRole('button', { name: 'Forget a@x.com' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Forget b@x.com' })).toBeInTheDocument();
    });
  });

  describe('token × remove button', () => {
    it('removes the token without opening the dropdown or firing tokenAction', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onAction = vi.fn();
      render(
        <Harness
          initialValue={['a@x.com', 'b@x.com']}
          onValueChange={onValueChange}
          tokenAction={{
            label: (v) => `Set ${v} as default`,
            icon: <span>*</span>,
            onAction,
          }}
          bare
        />,
      );
      await user.pointer({
        keys: '[MouseLeft]',
        target: screen.getByRole('button', { name: 'Remove a@x.com' }),
      });
      expect(onValueChange).toHaveBeenCalledWith(['b@x.com']);
      expect(onAction).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('bare', () => {
    it('renders all tokens without the "+N more" collapse when idle', () => {
      // jsdom reports zero widths, so the default (chromed) variant collapses
      // everything behind "+N more" while idle — bare must never collapse.
      render(<Harness initialValue={ROLES} bare />);
      for (const role of ROLES) {
        expect(screen.getByRole('button', { name: `${role}, remove` })).toBeInTheDocument();
      }
      expect(screen.queryByText(/more/)).toBeNull();
    });

    it('drops the input chrome from the token container', () => {
      render(<Harness initialValue={['Vendor']} bare />);
      const container = screen.getByRole('combobox').parentElement as HTMLElement;
      expect(container.className).not.toMatch(/border-input/);
      expect(container.className).toContain('flex-wrap');
    });
  });

  describe('editOnDoubleClick', () => {
    it('double-clicking a token removes it and puts its text in the input', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      // bare keeps tokens mounted in jsdom (zero measured widths would
      // otherwise collapse the idle field to "+N more" and detach the target).
      render(
        <Harness
          initialValue={['a@x.com', 'b@x.com']}
          onValueChange={onValueChange}
          allowCreate
          editOnDoubleClick
          bare
        />,
      );
      await user.dblClick(screen.getByRole('button', { name: 'a@x.com, remove' }));
      expect(onValueChange).toHaveBeenCalledWith(['b@x.com']);
      expect(screen.getByRole('combobox')).toHaveValue('a@x.com');
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('is inert without the prop', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness initialValue={['a@x.com']} onValueChange={onValueChange} bare />);
      await user.dblClick(screen.getByRole('button', { name: 'a@x.com, remove' }));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox')).toHaveValue('');
    });

    it('Shift+Enter on a focused token pulls it into the input', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          initialValue={['a@x.com', 'b@x.com']}
          onValueChange={onValueChange}
          allowCreate
          editOnDoubleClick
          bare
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{ArrowLeft}'); // focus last token (b@x.com)
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      expect(onValueChange).toHaveBeenCalledWith(['a@x.com']);
      expect(screen.getByRole('combobox')).toHaveValue('b@x.com');
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });

  describe('case-insensitive token identity', () => {
    it('choosing an option that differs only by case does not add a duplicate', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          initialValue={['alice@x.com']}
          lookup={['Alice@x.com']}
          onValueChange={onValueChange}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      // Marked selected despite the case difference…
      expect(optionByLabel('Alice@x.com')).toHaveAttribute('aria-selected', 'true');
      // …and choosing it adds nothing (defaultOne never unchecks).
      await user.click(optionByLabel('Alice@x.com'));
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('toggle mode removes the existing token when a case-variant option is clicked', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          initialValue={['alice@x.com']}
          lookup={['Alice@x.com']}
          onValueChange={onValueChange}
          defaultOne={false}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('listbox');
      await user.click(optionByLabel('Alice@x.com'));
      expect(onValueChange).toHaveBeenCalledWith([]);
    });
  });
});
