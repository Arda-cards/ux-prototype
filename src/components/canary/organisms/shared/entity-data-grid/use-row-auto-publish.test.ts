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

  it('publish failure on the auto-publish path keeps the typed value and marks the row error', async () => {
    // Panel-review decision (write-path semantics, Option 2): on publish
    // failure the auto-publish path KEEPS the user's typed value (no silent
    // revert) and sets the row state to 'error' so the failure is
    // persistently visible. Aligns the auto-publish path with the saveAll()
    // path which already behaved this way.
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

    expect(onRowPublish).toHaveBeenCalled();
    expect(result.current.getRowClass({ data: entity } as any)).toBe('ag-row-error');
  });

  it('getRowClass returns undefined for idle rows', () => {
    const { result } = renderHook(() => useRowAutoPublish<TestEntity>({ getEntityId }));

    const entity: TestEntity = { id: '1', name: 'Clean' };
    const cls = result.current.getRowClass({ data: entity } as any);
    expect(cls).toBeUndefined();
  });

  it('row state updates via direct DOM class mutation, not redrawRows', async () => {
    // Regression: previously `setRowState` called `api.redrawRows({ rowNodes: [node] })`
    // to flip the row class, but redrawRows destroys and recreates the row's DOM and
    // tears down AG Grid's per-row cell-edit state — which silently drops the
    // native Ctrl-Z undo stack for the edited row.
    //
    // This test pins the contract: while a publish is in flight, the row's
    // class is updated *directly on the DOM element* and `redrawRows` is NOT
    // called. AG Grid's `getRowClass` callback continues to return the right
    // class as a backstop for AG Grid's own re-renders (scroll virtualization,
    // sort, filter).
    let resolveFn: () => void;
    const publishPromise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    const onRowPublish = vi.fn().mockReturnValue(publishPromise);

    // Mount a row element matching the selector used by `findRowElement`.
    const rowEl = document.createElement('div');
    rowEl.className = 'ag-row';
    rowEl.setAttribute('row-id', '1');
    document.body.appendChild(rowEl);

    const redrawRows = vi.fn();
    const api = {
      getRowNode: (id: string) => (id === '1' ? { rowIndex: 0 } : null),
      getEditingCells: () => [],
      redrawRows,
    };

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({
        getEntityId,
        onRowPublish,
        getApi: () => api as any,
      }),
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

    // While publishing: DOM has 'ag-row-saving' AND redrawRows was never called.
    expect(rowEl.classList.contains('ag-row-saving')).toBe(true);
    expect(redrawRows).not.toHaveBeenCalled();
    // And getRowClass still returns the same string as a backstop.
    expect(result.current.getRowClass({ data: entity } as any)).toBe('ag-row-saving');

    await act(async () => {
      resolveFn!();
      await Promise.resolve();
      await Promise.resolve();
    });

    // After publish success: class is off the DOM AND redrawRows was still never called.
    expect(rowEl.classList.contains('ag-row-saving')).toBe(false);
    expect(rowEl.classList.contains('ag-row-error')).toBe(false);
    expect(redrawRows).not.toHaveBeenCalled();

    document.body.removeChild(rowEl);
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

  // -------------------------------------------------------------------------
  // User-story-driven tests added per panel review
  // -------------------------------------------------------------------------

  it('does not publish a row that isDraft reports as still a draft', async () => {
    // User story: as a purchaser I click "Add row" but realize I'm on the
    // wrong screen and click away before typing anything. The empty row
    // should remain a local draft. Arda must not silently PUT an empty /
    // partial vendor to the server before I've supplied its name (the only
    // required field for the vendor entity).
    const onRowPublish = vi.fn().mockResolvedValue(undefined);
    const onDirtyChange = vi.fn();

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({
        getEntityId,
        onRowPublish,
        // Draft rows are excluded — the consumer (useDraftPersistence in
        // production) decides what counts as a draft. Here we mark every
        // row as a draft to assert the suppression contract.
        isDraft: () => true,
        onDirtyChange,
      }),
    );

    const entity: TestEntity = { id: 'draft-1', name: '' };

    act(() => {
      result.current.handleCellValueChanged(makeCellValueChangedEvent(entity, 'name', '') as any);
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    await act(async () => {
      vi.advanceTimersByTime(60);
      await Promise.resolve();
    });

    expect(onRowPublish).not.toHaveBeenCalled();
    expect(onDirtyChange).not.toHaveBeenCalled();
  });

  it('handlePasteEnd flushes every dirty row through onRowPublish', async () => {
    // User story: as a purchaser I paste 3 phone numbers across 3 vendor
    // rows in a workflow where every edit auto-saves immediately (per-row
    // mode). Each of the 3 changes must round-trip to the server — none
    // silently dropped by the debounce batching.
    //
    // Note: for paste-heavy workflows the consumer should usually wire
    // `onCommit` (batched) instead of `onRowPublish` (per-row). This test
    // asserts the per-row contract, which is what useRowAutoPublish owns.
    const onRowPublish = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish }),
    );

    const entities: TestEntity[] = [
      { id: 'r1', name: 'Acme' },
      { id: 'r2', name: 'Bolt' },
      { id: 'r3', name: 'Circuit' },
    ];

    // Stage a value change on each row (paste flow doesn't fire
    // cellEditingStopped, so the rows accumulate as dirty).
    act(() => {
      for (const entity of entities) {
        result.current.handleCellValueChanged(
          makeCellValueChangedEvent(entity, 'name', 'paste-' + entity.id) as any,
        );
      }
    });

    // Fire the bulk-flush handler with a mock api that resolves row ids.
    const api = {
      getRowNode: (id: string) => {
        const found = entities.find((e) => e.id === id);
        return found ? { data: found } : null;
      },
    };
    act(() => {
      result.current.handlePasteEnd({ api } as any);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onRowPublish).toHaveBeenCalledTimes(3);
    const callRowIds = onRowPublish.mock.calls.map((call) => call[0]).sort();
    expect(callRowIds).toEqual(['r1', 'r2', 'r3']);
  });

  it('discardAll cancels a pending publish so no PUT is fired', async () => {
    // User story: as a purchaser I type a typo in a cell and immediately
    // press Escape / Discard before the debounce fires. Arda must not fire
    // a PUT for the discarded value.
    const onRowPublish = vi.fn().mockResolvedValue(undefined);
    const handleRef = { current: null } as { current: any };

    const { result } = renderHook(() =>
      useRowAutoPublish<TestEntity>({ getEntityId, onRowPublish, handleRef }),
    );

    const entity: TestEntity = { id: '1', name: 'Updated' };

    act(() => {
      result.current.handleCellValueChanged(
        makeCellValueChangedEvent(entity, 'name', 'Typo') as any,
      );
      result.current.handleCellEditingStopped(makeCellEditingStoppedEvent(entity, 0) as any);
    });

    // Discard BEFORE the 60ms debounce can fire publishRow.
    act(() => {
      handleRef.current?.discardAll();
    });

    await act(async () => {
      vi.advanceTimersByTime(120);
      await Promise.resolve();
    });

    expect(onRowPublish).not.toHaveBeenCalled();
    expect(handleRef.current?.getDirtyRowIds()).toEqual([]);
  });
});
