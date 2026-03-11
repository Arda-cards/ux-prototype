/**
 * BR::0002::0002 — Create on the Fly
 *
 * Standalone component story for the AffiliateTypeahead with
 * create-on-the-fly support. 6 variants: SelectExisting, CreateNew,
 * LoadingState, EmptySearch, KeyboardNavigation, EscapeDismiss.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { AffiliateTypeahead } from '../_shared/affiliate-typeahead';
import { businessAffiliateHandlers } from '../_shared/msw-handlers';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Default onCreate implementation (shared across stories)
// ---------------------------------------------------------------------------

const defaultOnCreate = async (name: string) => {
  const res = await fetch('/api/arda/business-affiliate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const json = await res.json();
  return { eId: json.data.payload.eId as string };
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof AffiliateTypeahead> = {
  title: 'Use Cases/Reference/Business Affiliates/BR-0002 Affiliate Typeahead/0002 Create on the Fly',
  component: AffiliateTypeahead,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: businessAffiliateHandlers,
    },
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
type Story = StoryObj<typeof AffiliateTypeahead>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Select an existing affiliate from the lookup dropdown.
 * Types "Med", waits for results, clicks "MedSupply Co.".
 */
export const SelectExisting: Story = {
  args: {
    roleFilter: 'VENDOR',
    placeholder: 'Search suppliers...',
    onSelect: fn(),
    onCreate: defaultOnCreate,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Click into the typeahead input
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);

    // 2. Type "Med" — matches MedSupply Co., Medical Essentials
    await userEvent.type(input, 'Med');

    // 3. Wait for debounce (250ms) + lookup (150ms) + buffer
    const option = await canvas.findByText('MedSupply Co.', {}, { timeout: 3000 });
    expect(option).toBeVisible();

    // 4. Verify dropdown is open
    const listbox = canvas.getByRole('listbox');
    expect(listbox).toBeVisible();
    await storyStepDelay();

    // 5. Click "MedSupply Co."
    await userEvent.click(option);

    // 6. Verify onSelect was called with the correct eId and name
    expect(args.onSelect).toHaveBeenCalledWith(
      expect.any(String), // eId (generated UUID)
      'MedSupply Co.',
    );

    // 7. Verify the dropdown is closed
    expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/**
 * Create a new supplier via the "[+] New supplier" option.
 * Types a name that doesn't match any existing affiliate.
 */
export const CreateNew: Story = {
  args: {
    roleFilter: 'VENDOR',
    placeholder: 'Search suppliers...',
    onSelect: fn(),
    onCreate: defaultOnCreate,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // 1. Type a name not in mock data
    await userEvent.type(input, 'Acme Industrial');

    // 2. Wait for debounce + lookup — no matches, create option should appear
    const createOption = await canvas.findByText(
      /\[\+\] New supplier.*Acme Industrial/,
      {},
      { timeout: 3000 },
    );
    expect(createOption).toBeVisible();
    await storyStepDelay();

    // 3. Click the create option
    await userEvent.click(createOption);

    // 4. Wait for the POST request to complete (300ms simulated latency)
    await waitFor(() => {
      expect(args.onSelect).toHaveBeenCalledWith(
        expect.any(String), // new eId
        'Acme Industrial',
      );
    });

    // 5. Verify the dropdown is closed
    expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

/**
 * Loading state — lookup handler delays 2 seconds.
 * Verifies loading spinner appears while waiting for results.
 */
export const LoadingState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/arda/business-affiliate/lookup', async () => {
          await new Promise((resolve) => setTimeout(resolve, 2_000));
          return HttpResponse.json({ ok: true, status: 200, data: [] });
        }),
      ],
    },
  },
  args: {
    roleFilter: 'VENDOR',
    placeholder: 'Search suppliers...',
    onSelect: fn(),
    onCreate: defaultOnCreate,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // 1. Type a search term
    await userEvent.type(input, 'Test');

    // 2. Verify loading spinner appears
    const spinner = await canvas.findByRole('status', {}, { timeout: 3000 });
    expect(spinner).toBeVisible();
  },
};

/**
 * Empty search — types a string that matches no existing affiliates.
 * Verifies the create option appears as the only option.
 */
export const EmptySearch: Story = {
  args: {
    roleFilter: 'VENDOR',
    placeholder: 'Search suppliers...',
    onSelect: fn(),
    onCreate: defaultOnCreate,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // 1. Type a string guaranteed to have no matches
    await userEvent.type(input, 'QQQQQ');

    // 2. Wait for debounce + lookup
    const createOption = await canvas.findByText(
      /\[\+\] New supplier.*QQQQQ/,
      {},
      { timeout: 3000 },
    );
    expect(createOption).toBeVisible();

    // 3. Verify only the create option is listed
    const options = canvas.getAllByRole('option');
    expect(options).toHaveLength(1);
  },
};

/**
 * Keyboard navigation — arrow keys and Enter to select.
 */
export const KeyboardNavigation: Story = {
  args: {
    roleFilter: 'VENDOR',
    placeholder: 'Search suppliers...',
    onSelect: fn(),
    onCreate: defaultOnCreate,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // 1. Type "MedSupply" to get a focused result set, wait for actual options to render
    await userEvent.type(input, 'MedSupply');
    // Wait for a specific option to appear (not just the listbox container)
    await canvas.findByText('MedSupply Co.', {}, { timeout: 3000 });
    await storyStepDelay();

    // 2. Press ArrowDown — first option highlighted
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      const opts = canvas.getAllByRole('option');
      expect(opts[0]).toHaveAttribute('aria-selected', 'true');
    });
    await storyStepDelay();

    // 3. Press Enter — first option selected
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(args.onSelect).toHaveBeenCalledTimes(1);
      expect(args.onSelect).toHaveBeenCalledWith(expect.any(String), 'MedSupply Co.');
    });

    // 4. Verify dropdown closed
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    });
  },
};

/**
 * Escape dismiss — pressing Escape closes the dropdown but preserves input text.
 */
export const EscapeDismiss: Story = {
  args: {
    roleFilter: 'VENDOR',
    placeholder: 'Search suppliers...',
    onSelect: fn(),
    onCreate: defaultOnCreate,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // 1. Type "Med" and wait for results
    await userEvent.type(input, 'Med');
    await canvas.findByRole('listbox', {}, { timeout: 3000 });

    // 2. Verify dropdown is open
    expect(canvas.getByRole('listbox')).toBeVisible();
    await storyStepDelay();

    // 3. Press Escape
    await userEvent.keyboard('{Escape}');

    // 4. Verify dropdown closes
    expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();

    // 5. Verify input text is preserved
    expect(input).toHaveValue('Med');
  },
};
