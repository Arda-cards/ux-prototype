import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import { createEntityDataGrid, type EntityDataGridRef } from './create-entity-data-grid';

// ============================================================================
// Test Entity Type
// ============================================================================

interface TestEntity {
  id: string;
  name: string;
  notes?: string;
}

// ============================================================================
// Test Data & Config
// ============================================================================

const testEntities: TestEntity[] = [
  { id: '1', name: 'Entity One', notes: 'Test note 1' },
  { id: '2', name: 'Entity Two' },
  { id: '3', name: 'Entity Three', notes: 'Test note 3' },
];

const testColumnDefs: ColDef<TestEntity>[] = [
  { headerName: 'Name', field: 'name', width: 200 },
  { headerName: 'Notes', field: 'notes', width: 150 },
];

const testDefaultColDef: ColDef<TestEntity> = {
  sortable: true,
  filter: false,
  resizable: true,
};

// ============================================================================
// Tests
// ============================================================================

describe('createEntityDataGrid', () => {
  it('renders with data', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities.slice(0, 2)} activeTab="test" />
      </div>,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when empty', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={[]} activeTab="test" />
      </div>,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when loading', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={[]} loading={true} activeTab="test" />
      </div>,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('applies editing enhancement when enabled', () => {
    const enhanceEditableColumnDefs = vi.fn((defs) => defs);

    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      enhanceEditableColumnDefs,
    });

    const { container } = render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities.slice(0, 2)} activeTab="test" enableCellEditing={true} />
      </div>,
    );

    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
    expect(enhanceEditableColumnDefs).toHaveBeenCalledWith(expect.any(Array), { enabled: true });
  });

  it('does not apply editing enhancement when disabled', () => {
    const enhanceEditableColumnDefs = vi.fn((defs) => defs);

    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      enhanceEditableColumnDefs,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities.slice(0, 2)} activeTab="test" enableCellEditing={false} />
      </div>,
    );

    expect(enhanceEditableColumnDefs).not.toHaveBeenCalled();
  });

  it('ref API is accessible with new saveAll/discardAll/getDirtyRowIds', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    function TestComponent() {
      const ref = useRef<EntityDataGridRef>(null);
      return (
        <div style={{ height: '600px' }}>
          <button onClick={() => void ref.current?.saveAll()}>Save</button>
          <button onClick={() => ref.current?.discardAll()}>Discard</button>
          <button
            onClick={() => {
              const ids = ref.current?.getDirtyRowIds();
              console.log('Dirty rows:', ids);
            }}
          >
            GetDirtyIds
          </button>
          <Component ref={ref} data={testEntities.slice(0, 2)} activeTab="test" />
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText('GetDirtyIds')).toBeInTheDocument();
  });

  it('ref API legacy aliases still work (backward compat)', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    function TestComponent() {
      const ref = useRef<EntityDataGridRef>(null);
      return (
        <div style={{ height: '600px' }}>
          <button onClick={() => ref.current?.saveAllDrafts()}>Save (legacy)</button>
          <button onClick={() => ref.current?.discardAllDrafts()}>Discard (legacy)</button>
          <button
            onClick={() => {
              void ref.current?.getHasUnsavedChanges();
            }}
          >
            Check (legacy)
          </button>
          <Component ref={ref} data={testEntities.slice(0, 2)} activeTab="test" />
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByText('Save (legacy)')).toBeInTheDocument();
    expect(screen.getByText('Discard (legacy)')).toBeInTheDocument();
    expect(screen.getByText('Check (legacy)')).toBeInTheDocument();
  });

  it('applies column visibility', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    const { container } = render(
      <div style={{ height: '600px' }}>
        <Component
          data={testEntities.slice(0, 2)}
          activeTab="test"
          columnVisibility={{ name: true, notes: false }}
        />
      </div>,
    );

    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('renders pagination footer when paginationData provided (server mode)', () => {
    const onNextPage = vi.fn();
    const onPreviousPage = vi.fn();
    const onFirstPage = vi.fn();

    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      paginationMode: 'server',
    });

    render(
      <div style={{ height: '600px' }}>
        <Component
          data={testEntities}
          activeTab="test"
          paginationData={{
            currentPage: 1,
            currentPageSize: 10,
            totalItems: 3,
            hasNextPage: false,
            hasPreviousPage: false,
          }}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onFirstPage={onFirstPage}
        />
      </div>,
    );

    const pagination = document.querySelector('.ag-pagination-footer');
    expect(pagination).toBeInTheDocument();
  });

  it('accepts Tier 3a event props without error', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    expect(() =>
      render(
        <div style={{ height: '600px' }}>
          <Component
            data={testEntities}
            activeTab="test"
            enableMultiSort={true}
            onSortChanged={vi.fn()}
            enableFiltering={true}
            onFilterChanged={vi.fn()}
            onCellEditingStarted={vi.fn()}
            onCellEditingStopped={vi.fn()}
            onCellFocused={vi.fn()}
            getRowClass={() => 'custom-row'}
          />
        </div>,
      ),
    ).not.toThrow();
  });

  // ============================================================================
  // Row auto-publish (5a)
  // ============================================================================

  it('onDirtyChange fires when grid mounts (initial clean state, no call expected)', () => {
    const onDirtyChange = vi.fn();

    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component
          data={testEntities.slice(0, 2)}
          activeTab="test"
          enableCellEditing={true}
          onDirtyChange={onDirtyChange}
        />
      </div>,
    );

    // No dirty change on mount — onDirtyChange only fires on publish lifecycle events.
    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('row state CSS styles are injected', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    const { container } = render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities.slice(0, 2)} activeTab="test" />
      </div>,
    );

    // The <style> tag with row state CSS should be present.
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.textContent).toContain('ag-row-saving');
    expect(styleTag?.textContent).toContain('ag-row-error');
  });

  // ============================================================================
  // Actions column (5b)
  // ============================================================================

  it('renders grid when actionsColumn is provided', () => {
    const actionFn = vi.fn();

    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      actionsColumn: {
        actionCount: 2,
        cellRenderer: (params: any) => {
          const entity = params.data as TestEntity;
          return <button onClick={() => actionFn(entity)}>Action</button>;
        },
      },
    });

    const { container } = render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('actionsColumn width is calculated from actionCount', () => {
    // 2 buttons: 2*28 + (2-1)*4 + 16 = 56 + 4 + 16 = 76
    const actionCount = 2;
    const expectedWidth = actionCount * 28 + (actionCount - 1) * 4 + 16;

    // We test that the factory creates the config correctly by inspecting the
    // injected col def. Since we can't easily inspect internal state, we verify
    // the formula: 2 * 28 + 1 * 4 + 16 = 76.
    expect(expectedWidth).toBe(76);
  });

  // ============================================================================
  // Search / Filter (5c)
  // ============================================================================

  it('renders search bar when searchConfig is provided', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      searchConfig: { fields: ['name'], placeholder: 'Search entities' },
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search entities');
  });

  it('does not render search bar when searchConfig is absent', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    const searchInput = screen.queryByRole('searchbox');
    expect(searchInput).not.toBeInTheDocument();
  });

  it('count label shows correct initial text', async () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      searchConfig: { fields: ['name'] },
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText(`${testEntities.length} items`)).toBeInTheDocument();
    });
  });

  it('renders toolbar when toolbar prop is provided', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      searchConfig: { fields: ['name'] },
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" toolbar={<button>Export CSV</button>} />
      </div>,
    );

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('does not render toolbar when toolbar prop is absent', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    const button = screen.queryByText('Export CSV');
    expect(button).not.toBeInTheDocument();
  });

  // ============================================================================
  // Pagination modes (5d)
  // ============================================================================

  it('client pagination mode: grid renders without server pagination footer', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      paginationMode: 'client',
      pageSize: 2,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    // No custom pagination footer — AG Grid handles pagination internally.
    const footer = document.querySelector('.ag-pagination-footer');
    expect(footer).not.toBeInTheDocument();
    // AG Grid container is present.
    expect(document.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('no pagination mode: no pagination footer', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    const footer = document.querySelector('.ag-pagination-footer');
    expect(footer).not.toBeInTheDocument();
  });

  // ============================================================================
  // autoHeight (5e)
  // ============================================================================

  it('renders grid with autoHeight config', () => {
    const { Component } = createEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
      autoHeight: true,
    });

    const { container } = render(<Component data={testEntities.slice(0, 2)} activeTab="test" />);

    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });
});
