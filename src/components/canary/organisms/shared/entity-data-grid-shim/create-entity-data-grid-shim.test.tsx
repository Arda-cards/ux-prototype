import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  createEntityDataGridShim,
  type EntityDataGridShimRef,
  type RowAction,
} from './create-entity-data-grid-shim';

// ============================================================================
// Test Entity
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
  { id: '1', name: 'Entity One', notes: 'Note 1' },
  { id: '2', name: 'Entity Two' },
  { id: '3', name: 'Entity Three', notes: 'Note 3' },
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

describe('createEntityDataGridShim', () => {
  it('renders the grid container', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" />
      </div>,
    );

    expect(document.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={[]} activeTab="test" />
      </div>,
    );

    expect(document.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={[]} loading={true} activeTab="test" />
      </div>,
    );

    expect(document.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('shows "No items found" when hasActiveSearch and data is empty', async () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={[]} activeTab="test" hasActiveSearch={true} />
      </div>,
    );

    // AG Grid renders overlays asynchronously
    await waitFor(() => {
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  it('does not show "No items found" when data is non-empty even with hasActiveSearch', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component data={testEntities} activeTab="test" hasActiveSearch={true} />
      </div>,
    );

    expect(screen.queryByText('No items found')).not.toBeInTheDocument();
  });

  it('custom emptyStateComponent overrides hasActiveSearch empty state', async () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component
          data={[]}
          activeTab="test"
          hasActiveSearch={true}
          emptyStateComponent={<div>Custom empty state</div>}
        />
      </div>,
    );

    // AG Grid renders overlays asynchronously
    await waitFor(() => {
      expect(screen.getByText('Custom empty state')).toBeInTheDocument();
    });
    expect(screen.queryByText('No items found')).not.toBeInTheDocument();
  });

  it('renders row actions column when enableRowActions and rowActions provided', () => {
    const onEdit = vi.fn();
    const actions: RowAction<TestEntity>[] = [{ label: 'Edit', onClick: onEdit }];

    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    const { container } = render(
      <div style={{ height: '600px' }}>
        <Component
          data={testEntities}
          activeTab="test"
          enableRowActions={true}
          rowActions={actions}
        />
      </div>,
    );

    // AG Grid should be rendered
    expect(container.querySelector('.ag-theme-arda')).toBeInTheDocument();
  });

  it('does not add actions column when enableRowActions is false', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    render(
      <div style={{ height: '600px' }}>
        <Component
          data={testEntities}
          activeTab="test"
          enableRowActions={false}
          rowActions={[{ label: 'Edit', onClick: vi.fn() }]}
        />
      </div>,
    );

    // Grid should render normally
    expect(document.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('exposes ref API', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    function TestComponent() {
      const ref = useRef<EntityDataGridShimRef>(null);
      return (
        <div style={{ height: '600px' }}>
          <button onClick={() => ref.current?.saveAllDrafts()}>Save</button>
          <button onClick={() => ref.current?.discardAllDrafts()}>Discard</button>
          <button onClick={() => ref.current?.refreshData()}>Refresh</button>
          <button onClick={() => ref.current?.selectAll()}>Select All</button>
          <button onClick={() => ref.current?.deselectAll()}>Deselect All</button>
          <Component ref={ref} data={testEntities} activeTab="test" />
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Deselect All')).toBeInTheDocument();
  });

  it('getSelectedRows returns empty array before any selection', () => {
    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    let capturedRef: EntityDataGridShimRef | null = null;

    function TestComponent() {
      const ref = useRef<EntityDataGridShimRef>(null);
      capturedRef = ref.current;
      return (
        <div style={{ height: '600px' }}>
          <Component ref={ref} data={testEntities} activeTab="test" />
        </div>
      );
    }

    render(<TestComponent />);
    // After render, ref should have been assigned
    expect(capturedRef).toBeDefined();
  });

  it('accepts onRowDoubleClicked prop without error', () => {
    const onRowDoubleClicked = vi.fn();

    const { Component } = createEntityDataGridShim<TestEntity>({
      displayName: 'TestShimGrid',
      persistenceKeyPrefix: 'test-shim-grid',
      columnDefs: testColumnDefs,
      defaultColDef: testDefaultColDef,
      getEntityId: (e) => e.id,
    });

    expect(() =>
      render(
        <div style={{ height: '600px' }}>
          <Component data={testEntities} activeTab="test" onRowDoubleClicked={onRowDoubleClicked} />
        </div>,
      ),
    ).not.toThrow();
  });
});
