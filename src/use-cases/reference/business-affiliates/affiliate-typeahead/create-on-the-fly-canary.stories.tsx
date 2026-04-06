/**
 * BR::0002::0002 — Create on the Fly (Canary Variant)
 *
 * Self-contained typeahead component with local filtering. No MSW, no
 * external component imports. Pure HTML/React combobox with a dropdown
 * listbox. Types text, filters a local supplier list, shows matches. If
 * no match, shows "[+] New supplier: {text}" option.
 *
 * Maps to: BR::0002::0002 — Create on the Fly
 */
import { useState, useCallback, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, fn } from 'storybook/test';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Local supplier names for typeahead filtering
// ---------------------------------------------------------------------------

interface SupplierOption {
  id: string;
  name: string;
}

const supplierOptions: SupplierOption[] = [
  { id: 'sup-001', name: 'Apex Medical Distributors' },
  { id: 'sup-002', name: 'BioTech Supplies Inc.' },
  { id: 'sup-003', name: 'Cardinal Health' },
  { id: 'sup-004', name: 'CleanRoom Solutions' },
  { id: 'sup-005', name: 'ColdChain Direct' },
  { id: 'sup-006', name: 'Delta Pharma Group' },
  { id: 'sup-007', name: 'Eppendorf AG' },
  { id: 'sup-008', name: 'Fisher Scientific' },
  { id: 'sup-009', name: 'MedSupply Co.' },
  { id: 'sup-010', name: 'Medical Essentials' },
];

// ---------------------------------------------------------------------------
// Typeahead component (self-contained, pure HTML/React)
// ---------------------------------------------------------------------------

function CanaryAffiliateTypeahead({
  onSelect,
  onCreate,
  placeholder = 'Search suppliers...',
}: {
  onSelect: (id: string, name: string) => void;
  onCreate: (name: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim().length > 0
    ? supplierOptions.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const hasExactMatch = filtered.some(
    (s) => s.name.toLowerCase() === query.trim().toLowerCase(),
  );

  const showCreateOption = query.trim().length > 0 && !hasExactMatch;
  const totalOptions = filtered.length + (showCreateOption ? 1 : 0);

  const handleSelect = useCallback(
    (supplier: SupplierOption) => {
      setQuery(supplier.name);
      setOpen(false);
      setHighlightIndex(-1);
      onSelect(supplier.id, supplier.name);
    },
    [onSelect],
  );

  const handleCreate = useCallback(() => {
    const name = query.trim();
    setQuery(name);
    setOpen(false);
    setHighlightIndex(-1);
    onCreate(name);
  }, [query, onCreate]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setOpen(e.target.value.trim().length > 0);
      setHighlightIndex(-1);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, totalOptions - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault();
        if (highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex]);
        } else if (showCreateOption) {
          handleCreate();
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
        setHighlightIndex(-1);
      }
    },
    [open, highlightIndex, totalOptions, filtered, showCreateOption, handleSelect, handleCreate],
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim().length > 0) setOpen(true);
        }}
        onBlur={() => {
          // Delay to allow click events on options to fire
          setTimeout(() => setOpen(false), 200);
        }}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {open && totalOptions > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.map((supplier, index) => (
            <li
              key={supplier.id}
              role="option"
              aria-selected={index === highlightIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === highlightIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(supplier);
              }}
            >
              {supplier.name}
            </li>
          ))}

          {showCreateOption && (
            <li
              role="option"
              aria-selected={highlightIndex === filtered.length}
              className={`cursor-pointer px-3 py-2 text-sm font-medium ${
                highlightIndex === filtered.length
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-blue-600 hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              [+] New supplier: {query.trim()}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CanaryAffiliateTypeahead> = {
  title:
    'Use Cases/Reference/Business Affiliates/BR-0002 Affiliate Typeahead/Create on the Fly (Canary)',
  component: CanaryAffiliateTypeahead,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CanaryAffiliateTypeahead>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Type "Med", verify matches appear, click one, verify onSelect called.
 */
export const SelectExisting: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
    placeholder: 'Search suppliers...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Click into the typeahead input
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);

    // 2. Type "Med" — matches MedSupply Co., Medical Essentials, Apex Medical Distributors
    await userEvent.type(input, 'Med');

    // 3. Wait for the listbox to appear
    const listbox = await canvas.findByRole('listbox', {}, { timeout: 3000 });
    expect(listbox).toBeVisible();

    // 4. Verify matching options appear
    const medSupplyOption = canvas.getByText('MedSupply Co.');
    expect(medSupplyOption).toBeVisible();
    await storyStepDelay();

    // 5. Click "MedSupply Co."
    await userEvent.click(medSupplyOption);

    // 6. Verify onSelect was called with the correct id and name
    expect(args.onSelect).toHaveBeenCalledWith('sup-009', 'MedSupply Co.');

    // 7. Verify the dropdown is closed
    expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/**
 * Type a name that doesn't match any existing affiliate.
 * Verify the "[+] New supplier" option appears and clicking it calls onCreate.
 */
export const CreateNew: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
    placeholder: 'Search suppliers...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // 1. Type a name not in mock data
    await userEvent.type(input, 'Acme Industrial');

    // 2. Wait for the listbox to appear with the create option
    const createOption = await canvas.findByText(
      /\[\+\] New supplier.*Acme Industrial/,
      {},
      { timeout: 3000 },
    );
    expect(createOption).toBeVisible();
    await storyStepDelay();

    // 3. Verify only the create option is listed (no existing matches)
    const options = canvas.getAllByRole('option');
    expect(options).toHaveLength(1);

    // 4. Click the create option
    await userEvent.click(createOption);

    // 5. Verify onCreate was called with the typed name
    await waitFor(() => {
      expect(args.onCreate).toHaveBeenCalledWith('Acme Industrial');
    });

    // 6. Verify the dropdown is closed
    expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/**
 * Type text and verify the dropdown opens with results, proving the
 * component is functional and responsive after input.
 */
export const LoadingState: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Type text and verify results appear (proving the component is functional)
    await userEvent.type(input, 'Apex');

    // Verify the listbox appears with results
    const listbox = await canvas.findByRole('listbox', {}, { timeout: 3000 });
    expect(listbox).toBeVisible();
  },
};

/**
 * Type a string that matches nothing, verify only the "[+] New supplier"
 * create option appears.
 */
export const EmptySearch: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Type a string guaranteed to have no matches
    await userEvent.type(input, 'QQQQQ');

    // Verify the create option appears
    const createOption = await canvas.findByText(
      /\[\+\] New supplier.*QQQQQ/,
      {},
      { timeout: 3000 },
    );
    expect(createOption).toBeVisible();

    // Verify only 1 option (the create option)
    const options = canvas.getAllByRole('option');
    expect(options).toHaveLength(1);
  },
};

/**
 * Type text, press ArrowDown to highlight first option, press Enter to select.
 */
export const KeyboardNavigation: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Type to get results
    await userEvent.type(input, 'Apex');
    await canvas.findByRole('listbox', {}, { timeout: 3000 });
    await storyStepDelay();

    // Press ArrowDown — first option highlighted
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      const opts = canvas.getAllByRole('option');
      expect(opts[0]).toHaveAttribute('aria-selected', 'true');
    });
    await storyStepDelay();

    // Press Enter — first option selected
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(args.onSelect).toHaveBeenCalledTimes(1);
    });

    // Verify dropdown closed
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    });
  },
};

/**
 * Type text, verify dropdown opens, press Escape, verify dropdown closes
 * but input text is preserved.
 */
export const EscapeDismiss: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Type text and wait for results
    await userEvent.type(input, 'Apex');
    await canvas.findByRole('listbox', {}, { timeout: 3000 });

    // Verify dropdown is open
    expect(canvas.getByRole('listbox')).toBeVisible();
    await storyStepDelay();

    // Press Escape
    await userEvent.keyboard('{Escape}');

    // Verify dropdown closes
    expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();

    // Verify input text is preserved
    expect(input).toHaveValue('Apex');
  },
};
