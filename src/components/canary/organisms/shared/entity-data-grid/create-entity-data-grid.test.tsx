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

  it('tracks unsaved changes callback on initial render', async () => {
    const onUnsavedChangesChange = vi.fn();

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
          onUnsavedChangesChange={onUnsavedChangesChange}
        />
      </div>,
    );

    await waitFor(() => {
      expect(onUnsavedChangesChange).toHaveBeenCalledWith(false);
    });
  });

  it('ref API is accessible', () => {
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
          <button onClick={() => ref.current?.saveAllDrafts()}>Save</button>
          <button onClick={() => ref.current?.discardAllDrafts()}>Discard</button>
          <button
            onClick={() => {
              void ref.current?.getHasUnsavedChanges();
            }}
          >
            Check
          </button>
          <Component ref={ref} data={testEntities.slice(0, 2)} activeTab="test" />
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
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

  it('renders pagination footer when paginationData provided', () => {
    const onNextPage = vi.fn();
    const onPreviousPage = vi.fn();
    const onFirstPage = vi.fn();

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

  it('accepts a custom dirty tracking hook via injection', () => {
    const customHook = vi.fn(() => ({
      dirtyCount: 0,
      hasUnsavedChanges: false,
      handleCellValueChanged: vi.fn(),
      saveAllDrafts: vi.fn(),
      discardAllDrafts: vi.fn(),
    }));

    const { Component } = createEntityDataGrid<TestEntity>(
      {
        displayName: 'TestEntityDataGrid',
        persistenceKeyPrefix: 'test-entity-grid',
        columnDefs: testColumnDefs,
        defaultColDef: testDefaultColDef,
        getEntityId: (entity) => entity.id,
      },
      customHook,
    );

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    expect(customHook).toHaveBeenCalled();
  });
});
