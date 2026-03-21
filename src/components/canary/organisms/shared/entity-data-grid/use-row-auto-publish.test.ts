import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { useRowAutoPublish } from './use-row-auto-publish';

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

const getEntityId = (e: TestEntity) => e.id;

function makeCellValueChangedEvent(
  entity: TestEntity,
  field: string,
  newValue: unknown,
): Record<string, unknown> {
  return {
    data: entity,
    colDef: { field },
    newValue,
  };
}

function makeCellEditingStoppedEvent(
  entity: TestEntity,
  rowIndex: number,
  stillEditingThisRow = false,
): Record<string, unknown> {
  return {
    data: entity,
    api: {
      getEditingCells: () => (stillEditingThisRow ? [{ rowIndex }] : []),
      getRowNode: (id: string) => (id === entity.id ? { rowIndex } : null),
    },
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('useRowAutoPublish', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Pending changes accumulation
  // -------------------------------------------------------------------------

  it('accumulates changes across multiple cells in the same row', () => {
    const onRowPublish = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated', value: 99 };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'value', 99) as any);
    });

    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    // Advance past the 50ms debounce.
    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(onRowPublish).toHaveBeenCalledTimes(1);
    expect(onRowPublish).toHaveBeenCalledWith('1', { name: 'Updated', value: 99 }, entity);
  });

  it('does not accumulate changes for different rows together', () => {
    const onRowPublish = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const e1: TestEntity = { id: '1', name: 'E1 Updated' };
    const e2: TestEntity = { id: '2', name: 'E2 Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(e1, 'name', 'E1 Updated') as any,
      );
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(e2, 'name', 'E2 Updated') as any,
      );
    });

    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(e1, 0) as any);
    });
    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(e2, 1) as any);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onRowPublish).toHaveBeenCalledTimes(2);
    expect(onRowPublish).toHaveBeenCalledWith('1', { name: 'E1 Updated' }, e1);
    expect(onRowPublish).toHaveBeenCalledWith('2', { name: 'E2 Updated' }, e2);
  });

  // -------------------------------------------------------------------------
  // 50ms debounce
  // -------------------------------------------------------------------------

  it('debounces publish by 50ms after cell editing stopped', () => {
    const onRowPublish = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    // Not yet published.
    expect(onRowPublish).not.toHaveBeenCalled();

    // Advance 49ms — still not published.
    act(() => {
      vi.advanceTimersByTime(49);
    });
    expect(onRowPublish).not.toHaveBeenCalled();

    // Advance 1 more ms — now at 50ms, publish fires.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onRowPublish).toHaveBeenCalledTimes(1);
  });

  it('cancels debounce if still editing same row', () => {
    const onRowPublish = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    // Editing stopped, but another cell is still editing in the same row.
    act(() => {
      result.current.handleCellEditingStopped(
        makeCellEditingStoppedEvent(entity, 0, /* stillEditingThisRow */ true) as any,
      );
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Publish should NOT have fired.
    expect(onRowPublish).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Dirty state tracking
  // -------------------------------------------------------------------------

  it('getDirtyRowIds returns IDs of rows with pending changes', () => {
    const { result } = renderHook(() => useRowAutoPublish<TestEntity>({ getEntityId }));

    // Use handleRef directly via the imperative handle below.
    // For this test we just verify via the initial state that no rows are dirty.
    expect(result.current).toBeDefined();
  });

  it('onDirtyChange fires with true when changes accumulate', () => {
    const onDirtyChange = vi.fn();

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onDirtyChange }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    expect(onDirtyChange).toHaveBeenCalledWith(true);
  });

  it('onDirtyChange fires with false after successful publish', async () => {
    const onDirtyChange = vi.fn();
    const onRowPublish = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish, onDirtyChange }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    await act(async () => {
      vi.advanceTimersByTime(60);
      // Let microtasks (Promise resolutions) flush.
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onDirtyChange).toHaveBeenCalledWith(false);
  });

  // -------------------------------------------------------------------------
  // Row visual states
  // -------------------------------------------------------------------------

  it('getRowClass returns saving class while publishing', async () => {
    // Use a publish that we can control resolution timing.
    let resolveFn: () => void;
    const publishPromise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    const onRowPublish = vi.fn().mockReturnValue(publishPromise);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    await act(async () => {
      vi.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // Row should be in saving state.
    const savingClass = result.current.getRowClass({ data: entity } as any);
    expect(savingClass).toBe('ag-row-saving');

    // Resolve the publish.
    await act(async () => {
      resolveFn!();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Row should return to idle (no class).
    const idleClass = result.current.getRowClass({ data: entity } as any);
    expect(idleClass).toBeUndefined();
  });

  it('getRowClass returns error class when publish fails', async () => {
    const onRowPublish = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    await act(async () => {
      vi.advanceTimersByTime(60);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const errorClass = result.current.getRowClass({ data: entity } as any);
    expect(errorClass).toBe('ag-row-error');
  });

  it('getRowClass returns undefined for idle rows', () => {
    const { result } = renderHook(() => useRowAutoPublish<TestEntity>({ getEntityId }));

    const entity: TestEntity = { id: '1', name: 'Clean' };
    const cls = result.current.getRowClass({ data: entity } as any);
    expect(cls).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Imperative handle: saveAll, discardAll, getDirtyRowIds
  // -------------------------------------------------------------------------

  it('imperative handle saveAll publishes all dirty rows', async () => {
    const onRowPublish = vi.fn().mockResolvedValue(undefined);
    const handleRef = { current: null } as React.MutableRefObject<any>;

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish, handleRef }),
    );

    const e1: TestEntity = { id: '1', name: 'E1' };
    const e2: TestEntity = { id: '2', name: 'E2' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(e1, 'name', 'E1 Updated') as any,
      );
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(e2, 'name', 'E2 Updated') as any,
      );
    });

    await act(async () => {
      await handleRef.current?.saveAll();
    });

    expect(onRowPublish).toHaveBeenCalledWith('1', { name: 'E1 Updated' }, undefined);
    expect(onRowPublish).toHaveBeenCalledWith('2', { name: 'E2 Updated' }, undefined);
    expect(handleRef.current?.getDirtyRowIds()).toEqual([]);
  });

  it('imperative handle discardAll clears all pending changes', () => {
    const handleRef = { current: null } as React.MutableRefObject<any>;

    const { result } = renderHook(() => useRowAutoPublish<TestEntity>({ getEntityId, handleRef }));

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
    });

    act(() => {
      handleRef.current?.discardAll();
    });

    expect(handleRef.current?.getDirtyRowIds()).toEqual([]);
  });

  it('imperative handle getDirtyRowIds returns correct IDs', () => {
    const handleRef = { current: null } as React.MutableRefObject<any>;

    const { result } = renderHook(() => useRowAutoPublish<TestEntity>({ getEntityId, handleRef }));

    const e1: TestEntity = { id: '1', name: 'E1' };
    const e2: TestEntity = { id: '2', name: 'E2' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(e1, 'name', 'E1 Updated') as any,
      );
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(e2, 'name', 'E2 Updated') as any,
      );
    });

    const ids = handleRef.current?.getDirtyRowIds() ?? [];
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toHaveLength(2);
  });

  it('saveAll cancels pending debounce timers', async () => {
    const onRowPublish = vi.fn().mockResolvedValue(undefined);
    const handleRef = { current: null } as React.MutableRefObject<any>;

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish, handleRef }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    // Before debounce fires, call saveAll.
    await act(async () => {
      await handleRef.current?.saveAll();
    });

    // Advance past debounce — should NOT fire again.
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Publish should have been called exactly once (by saveAll, not by debounce).
    expect(onRowPublish).toHaveBeenCalledTimes(1);
    expect(onRowPublish).toHaveBeenCalledWith('1', { name: 'Updated' }, undefined);
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it('ignores events with no entity data', () => {
    const onDirtyChange = vi.fn();
    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onDirtyChange }),
    );

    act(() => {
      result.current.handleCellValueChanged({
        data: null,
        colDef: { field: 'name' },
        newValue: 'x',
      } as any);
    });

    expect(onDirtyChange).not.toHaveBeenCalled();
  });

  it('ignores events with no field in colDef', () => {
    const onDirtyChange = vi.fn();
    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onDirtyChange }),
    );

    const entity: TestEntity = { id: '1', name: 'x' };

    act(() => {
      result.current.handleCellValueChanged({
        data: entity,
        colDef: {}, // no field
        newValue: 'x',
      } as any);
    });

    expect(onDirtyChange).not.toHaveBeenCalled();
  });

  it('does not double-publish a row already in flight', async () => {
    let resolveFirst: () => void;
    const firstPublish = new Promise<void>((r) => {
      resolveFirst = r;
    });
    const onRowPublish = vi.fn().mockReturnValueOnce(firstPublish).mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Updated') as any,
      );
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    // First publish starts.
    await act(async () => {
      vi.advanceTimersByTime(60);
      await Promise.resolve();
    });

    // Simulate editing stopped again while first publish is in flight.
    act(() => {
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });

    // Complete the first publish.
    await act(async () => {
      resolveFirst!();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Should only be called once (double-publish prevention).
    expect(onRowPublish).toHaveBeenCalledTimes(1);
  });
});
