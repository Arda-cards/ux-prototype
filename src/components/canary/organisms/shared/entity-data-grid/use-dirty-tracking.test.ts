import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { useDirtyTracking } from './use-dirty-tracking';

// ============================================================================
// Test Entity
// ============================================================================

interface TestEntity {
  id: string;
  name: string;
  value?: number;
}

// ============================================================================
// Helpers
// ============================================================================

function makeCellValueChangedEvent(
  entity: TestEntity,
  field: string,
  oldValue: unknown,
): Record<string, unknown> {
  return {
    data: entity,
    colDef: { field },
    oldValue,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('useDirtyTracking', () => {
  const getEntityId = (e: TestEntity) => e.id;

  it('starts with no dirty items', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('marks entity dirty after cell value change', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

    const entity: TestEntity = { id: '1', name: 'Updated Name', value: 42 };
    const event = makeCellValueChangedEvent(entity, 'name', 'Original Name');

    act(() => {
      result.current.handleCellValueChanged(event);
    });

    expect(result.current.dirtyCount).toBe(1);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('counts each unique entity once even if edited multiple times', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

    const entity: TestEntity = { id: '1', name: 'Name v2' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Name v1'));
    });
    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Name v2'));
    });

    expect(result.current.dirtyCount).toBe(1);
  });

  it('counts different entities separately', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

    const e1: TestEntity = { id: '1', name: 'E1 Updated' };
    const e2: TestEntity = { id: '2', name: 'E2 Updated' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(e1, 'name', 'E1 Original'));
      result.current.handleCellValueChanged(makeCellValueChangedEvent(e2, 'name', 'E2 Original'));
    });

    expect(result.current.dirtyCount).toBe(2);
  });

  it('notifies onUnsavedChangesChange when changes appear', () => {
    const onUnsavedChangesChange = vi.fn();

    const { result } = renderHook(() =>
      useDirtyTracking<TestEntity>({ getEntityId, onUnsavedChangesChange }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Original'));
    });

    expect(onUnsavedChangesChange).toHaveBeenCalledWith(true);
  });

  it('calls onUnsavedChangesChange with false on initial render (no dirty items)', () => {
    const onUnsavedChangesChange = vi.fn();

    renderHook(() => useDirtyTracking<TestEntity>({ getEntityId, onUnsavedChangesChange }));

    expect(onUnsavedChangesChange).toHaveBeenCalledWith(false);
  });

  it('saveAllDrafts clears dirty state', () => {
    const onUnsavedChangesChange = vi.fn();

    const { result } = renderHook(() =>
      useDirtyTracking<TestEntity>({ getEntityId, onUnsavedChangesChange }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Original'));
    });

    expect(result.current.dirtyCount).toBe(1);

    act(() => {
      result.current.saveAllDrafts();
    });

    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(onUnsavedChangesChange).toHaveBeenLastCalledWith(false);
  });

  it('discardAllDrafts clears dirty state and restores original data via grid API', () => {
    const onUnsavedChangesChange = vi.fn();

    const { result } = renderHook(() =>
      useDirtyTracking<TestEntity>({ getEntityId, onUnsavedChangesChange }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Original'));
    });

    expect(result.current.dirtyCount).toBe(1);

    // Mock grid API
    const mockGridApi = {
      forEachNode: vi.fn((cb: (node: any) => void) => {
        cb({ data: entity });
      }),
      refreshCells: vi.fn(),
    };

    act(() => {
      result.current.discardAllDrafts(mockGridApi);
    });

    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(mockGridApi.forEachNode).toHaveBeenCalled();
    expect(mockGridApi.refreshCells).toHaveBeenCalledWith({ force: true });
    expect(onUnsavedChangesChange).toHaveBeenLastCalledWith(false);

    // Original name should be restored on the entity object
    expect(entity.name).toBe('Original');
  });

  it('discardAllDrafts is safe when grid API is null', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Original'));
    });

    // Should not throw when gridApi is null
    act(() => {
      result.current.discardAllDrafts(null);
    });

    expect(result.current.dirtyCount).toBe(0);
  });

  it('ignores cell change event when entity data is missing', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

    act(() => {
      result.current.handleCellValueChanged({
        data: null,
        colDef: { field: 'name' },
        oldValue: 'x',
      });
    });

    expect(result.current.dirtyCount).toBe(0);
  });

  it('ignores cell change when entityId is empty string', () => {
    const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId: () => '' }));

    const entity: TestEntity = { id: '', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', 'Original'));
    });

    expect(result.current.dirtyCount).toBe(0);
  });

  describe('original snapshot capture', () => {
    it('captures original snapshot on first edit only', () => {
      const { result } = renderHook(() => useDirtyTracking<TestEntity>({ getEntityId }));

      const entity: TestEntity = { id: '1', name: 'V3' };

      // First edit: oldValue is the true original
      act(() => {
        result.current.handleCellValueChanged(
          makeCellValueChangedEvent({ ...entity, name: 'V2' }, 'name', 'V1'),
        );
      });

      // Second edit of same entity: original snapshot should NOT be overwritten
      act(() => {
        result.current.handleCellValueChanged(
          makeCellValueChangedEvent({ ...entity, name: 'V3' }, 'name', 'V2'),
        );
      });

      // Discarding should restore to V1, not V2
      const mockEntity: TestEntity = { id: '1', name: 'V3' };
      const mockGridApi = {
        forEachNode: vi.fn((cb: (node: any) => void) => {
          cb({ data: mockEntity });
        }),
        refreshCells: vi.fn(),
      };

      act(() => {
        result.current.discardAllDrafts(mockGridApi);
      });

      expect(mockEntity.name).toBe('V1');
    });
  });
});
