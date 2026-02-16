import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import { createArdaEntityDataGrid, type EntityDataGridRef } from './create-entity-data-grid';

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
  {
    headerName: 'Name',
    field: 'name',
    width: 200,
  },
  {
    headerName: 'Notes',
    field: 'notes',
    width: 150,
  },
];

const testDefaultColDef: ColDef<TestEntity> = {
  sortable: true,
  filter: false,
  resizable: true,
};

// ============================================================================
// Tests
// ============================================================================

describe('createArdaEntityDataGrid', () => {
  it('renders with data', () => {
    const { Component } = createArdaEntityDataGrid<TestEntity>({
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

    // AG Grid renders asynchronously — verify the grid container is present
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when empty', () => {
    const { Component } = createArdaEntityDataGrid<TestEntity>({
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

    // Grid container should still render
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when loading', () => {
    const { Component } = createArdaEntityDataGrid<TestEntity>({
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

    // Grid container should render even when loading
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('applies editing enhancement when enabled', () => {
    const enhanceEditableColumnDefs = vi.fn((defs) => defs);

    const { Component } = createArdaEntityDataGrid<TestEntity>({
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

    // AG Grid should be present
    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();

    // Enhancement function should have been called
    expect(enhanceEditableColumnDefs).toHaveBeenCalledWith(expect.any(Array), { enabled: true });
  });

  it('tracks unsaved changes', async () => {
    const onUnsavedChangesChange = vi.fn();
    const onEntityUpdated = vi.fn();

    const { Component } = createArdaEntityDataGrid<TestEntity>({
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
          onUnsavedChangesChange={onUnsavedChangesChange}
          onEntityUpdated={onEntityUpdated}
        />
      </div>,
    );

    // Wait for grid to render
    await waitFor(() => {
      expect(screen.getByText(testEntities[0].name)).toBeInTheDocument();
    });

    // Initial state should be no unsaved changes
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(false);
  });

  it('ref API works', () => {
    const { Component } = createArdaEntityDataGrid<TestEntity>({
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
          <button onClick={() => ref.current?.saveAllDrafts()}>Save</button>
          <button onClick={() => ref.current?.discardAllDrafts()}>Discard</button>
          <button
            onClick={() => {
              const hasChanges = ref.current?.getHasUnsavedChanges();
              console.log('Has changes:', hasChanges);
            }}
          >
            Check
          </button>
          <Component
            ref={ref}
            data={testEntities.slice(0, 2)}
            activeTab="test"
            enableCellEditing={true}
          />
        </div>
      );
    }

    render(<TestComponent />);

    // Verify buttons render (ref is connected)
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });

  it('applies column visibility', () => {
    const { Component } = createArdaEntityDataGrid<TestEntity>({
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
          columnVisibility={{
            name: true,
            notes: false,
          }}
        />
      </div>,
    );

    // AG Grid should be present
    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('handles pagination', () => {
    const onNextPage = vi.fn();
    const onPreviousPage = vi.fn();
    const onFirstPage = vi.fn();

    const { Component } = createArdaEntityDataGrid<TestEntity>({
      displayName: 'TestEntityDataGrid',
      persistenceKeyPrefix: 'test-entity-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (entity) => entity.id,
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

    // Pagination controls should be present
    const pagination = document.querySelector('.ag-pagination-footer');
    expect(pagination).toBeInTheDocument();
  });
});
