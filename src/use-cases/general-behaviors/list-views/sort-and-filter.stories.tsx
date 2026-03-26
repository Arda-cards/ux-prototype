/**
 * GEN::LST::0003 / GEN::LST::0004 — Sort and Filter Entity List
 *
 * Demonstrates single-column sort and global search filtering using
 * the canary entity-data-grid factory.
 *
 * Maps to:
 *   GEN::LST::0003 — Sort Entity List
 *   GEN::LST::0004 — Filter Entity List
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, screen } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';

import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { storyStepDelay } from '@/components/canary/organisms/shared/entity-data-grid/story-step-delay';

// ---------------------------------------------------------------------------
// Demo entity
// ---------------------------------------------------------------------------

interface DemoRow {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  unitCost: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const demoData: DemoRow[] = [
  {
    id: '1',
    name: 'Nitrile Gloves (M)',
    category: 'PPE',
    status: 'Active',
    quantity: 500,
    unitCost: 8.49,
  },
  {
    id: '2',
    name: 'Surgical Mask L3',
    category: 'PPE',
    status: 'Active',
    quantity: 200,
    unitCost: 12.0,
  },
  {
    id: '3',
    name: 'IPA 70%',
    category: 'Chemicals',
    status: 'Active',
    quantity: 50,
    unitCost: 22.5,
  },
  {
    id: '4',
    name: 'Thermometer Digital',
    category: 'Diagnostics',
    status: 'Low Stock',
    quantity: 8,
    unitCost: 45.0,
  },
  {
    id: '5',
    name: 'Gauze Dressing 4x4',
    category: 'Wound Care',
    status: 'Active',
    quantity: 300,
    unitCost: 3.25,
  },
  {
    id: '6',
    name: 'Latex-Free Tape',
    category: 'Wound Care',
    status: 'Active',
    quantity: 120,
    unitCost: 4.75,
  },
  {
    id: '7',
    name: 'Sharps Container 1L',
    category: 'Safety',
    status: 'Active',
    quantity: 30,
    unitCost: 11.0,
  },
  {
    id: '8',
    name: 'IV Solution 0.9%',
    category: 'IV Therapy',
    status: 'Reorder',
    quantity: 12,
    unitCost: 8.9,
  },
  {
    id: '9',
    name: 'Blood Glucose Meter',
    category: 'Diagnostics',
    status: 'Active',
    quantity: 5,
    unitCost: 89.0,
  },
  {
    id: '10',
    name: 'Sterile Saline 1L',
    category: 'IV Therapy',
    status: 'Active',
    quantity: 24,
    unitCost: 6.5,
  },
];

// ---------------------------------------------------------------------------
// Column definitions — sortable
// ---------------------------------------------------------------------------

const columnDefs: ColDef<DemoRow>[] = [
  { field: 'name', headerName: 'Name', width: 220, sortable: true },
  { field: 'category', headerName: 'Category', width: 140, sortable: true },
  { field: 'status', headerName: 'Status', width: 120, sortable: true },
  { field: 'quantity', headerName: 'Qty', width: 90, sortable: true },
  {
    field: 'unitCost',
    headerName: 'Unit Cost',
    width: 110,
    sortable: true,
    valueFormatter: (p) =>
      p.value !== null && p.value !== undefined ? `$${(p.value as number).toFixed(2)}` : '',
  },
];

// ---------------------------------------------------------------------------
// Grid factories
// ---------------------------------------------------------------------------

// Sort-only grid (no search)
const { Component: SortGrid } = createEntityDataGrid<DemoRow>({
  displayName: 'SortGrid',
  persistenceKeyPrefix: 'gbl-sort-demo',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true, filter: false },
  getEntityId: (r) => r.id,
});

// Search + filter grid
const { Component: FilterGrid } = createEntityDataGrid<DemoRow>({
  displayName: 'FilterGrid',
  persistenceKeyPrefix: 'gbl-filter-demo',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true, filter: false },
  getEntityId: (r) => r.id,
  searchConfig: {
    fields: ['name', 'category', 'status'],
    placeholder: 'Search items\u2026',
  },
});

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Use Cases/General Behaviors/List Views/GEN-LST-0003-0004 Sort and Filter',

  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '520px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

/**
 * SortByColumn — click a column header to sort ascending then descending.
 * Maps to GEN::LST::0003.
 */
export const SortByColumn: Story = {
  render: () => <SortGrid data={demoData} activeTab="sort" enableMultiSort />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with unsorted data', async () => {
      await canvas.findByText(
        'Nitrile Gloves (M)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Open Category sort menu and sort ascending', async () => {
      // SortMenuHeader renders a ⋮ button; clicking the header directly does not sort.
      // Find the sort options button inside the Category column header.
      const categoryHeader = canvas.getByRole('columnheader', { name: /category/i });
      const sortBtn = within(categoryHeader).getByRole('button', { name: /sort options/i });
      await userEvent.click(sortBtn);
      // The dropdown renders in a portal on document.body — use screen
      const ascOption = await screen.findByRole(
        'button',
        { name: /sort ascending/i },
        { timeout: 10000 },
      );
      await userEvent.click(ascOption);
    });

    await step('Grid rows are now sorted by category A-Z', async () => {
      await waitFor(
        () => {
          // After sorting A-Z, Chemicals should appear before PPE
          const cells = canvas.getAllByRole('gridcell');
          const categories = cells
            .filter((c) =>
              ['Chemicals', 'Diagnostics', 'IV Therapy', 'PPE', 'Safety', 'Wound Care'].includes(
                c.textContent ?? '',
              ),
            )
            .map((c) => c.textContent ?? '');
          expect(categories[0]).toBe('Chemicals');
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Open Category sort menu and sort descending', async () => {
      const categoryHeader = canvas.getByRole('columnheader', { name: /category/i });
      const sortBtn = within(categoryHeader).getByRole('button', { name: /sort options/i });
      await userEvent.click(sortBtn);
      // The dropdown renders in a portal on document.body — use screen
      const descOption = await screen.findByRole(
        'button',
        { name: /sort descending/i },
        { timeout: 10000 },
      );
      await userEvent.click(descOption);
    });

    await step('Grid rows are now sorted by category Z-A', async () => {
      await waitFor(
        () => {
          const cells = canvas.getAllByRole('gridcell');
          const categories = cells
            .filter((c) =>
              ['Chemicals', 'Diagnostics', 'IV Therapy', 'PPE', 'Safety', 'Wound Care'].includes(
                c.textContent ?? '',
              ),
            )
            .map((c) => c.textContent ?? '');
          expect(categories[0]).toBe('Wound Care');
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();
  },
};

/**
 * FilterBySearch — type in the search box to filter rows.
 * Maps to GEN::LST::0004.
 */
export const FilterBySearch: Story = {
  render: () => <FilterGrid data={demoData} activeTab="filter" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with search bar', async () => {
      await canvas.findByText(
        'Nitrile Gloves (M)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
      const searchInput = canvas.getByRole('searchbox');
      expect(searchInput).toBeVisible();
    });

    await step('Count shows total items initially', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('10 items')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Type "ppe" to filter by category', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.type(searchInput, 'ppe');
    });

    await step('Count updates to 2 of 10 items', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/2 of 10 items/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Clear search restores all 10 items', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.clear(searchInput);
      await waitFor(
        () => {
          expect(canvas.getByText('10 items')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Type "reorder" to filter by status', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.type(searchInput, 'reorder');
      await waitFor(
        () => {
          expect(canvas.getByText(/1 of 10 items/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};

/**
 * SortAndFilterCombined — demonstrates sort and search together.
 */
export const SortAndFilterCombined: Story = {
  render: () => <FilterGrid data={demoData} activeTab="sort-filter" enableMultiSort />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders', async () => {
      await canvas.findByText(
        'Nitrile Gloves (M)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Sort by Name ascending', async () => {
      // SortMenuHeader renders a ⋮ button; clicking the header directly does not sort.
      const nameHeader = canvas.getByRole('columnheader', { name: /name/i });
      const sortBtn = within(nameHeader).getByRole('button', { name: /sort options/i });
      await userEvent.click(sortBtn);
      // The dropdown renders in a portal on document.body — use screen
      const ascOption = await screen.findByRole(
        'button',
        { name: /sort ascending/i },
        { timeout: 10000 },
      );
      await userEvent.click(ascOption);
    });

    await storyStepDelay();

    await step('Filter to "diagnostics" while sorted', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.type(searchInput, 'diagnostics');
      await waitFor(
        () => {
          expect(canvas.getByText(/2 of 10 items/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};
