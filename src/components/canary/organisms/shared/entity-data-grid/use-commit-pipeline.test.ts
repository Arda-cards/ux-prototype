import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { useCommitPipeline, type RowChange, type CommitResult } from './use-commit-pipeline';

// ============================================================================
// Test Entity
// ============================================================================

interface TestEntity {
  id: string;
  name: string;
  value?: number;
}

const getEntityId = (e: TestEntity) => e.id;

// ============================================================================
// Helpers
// ============================================================================

function cellValueChanged(entity: TestEntity, field: string, newValue: unknown) {
  return { data: entity, colDef: { field }, newValue } as any;
}

function editingStopped(entity: TestEntity, rowIndex: number, stillEditingThisRow = false) {
  return {
    data: entity,
    api: {
      getEditingCells: () => (stillEditingThisRow ? [{ rowIndex }] : []),
      getRowNode: (id: string) => (id === entity.id ? { rowIndex } : null),
    },
  } as any;
}

// ============================================================================
// Tests
// ============================================================================

describe('useCommitPipeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Flush on bulk *End events (DQ-003): paste / fill / cut
  // -------------------------------------------------------------------------

  it('flushes every dirty row as one batch on paste end', async () => {
    const onCommit = vi.fn<(c: RowChange<TestEntity>[]) => Promise<CommitResult[]>>(
      async (changes) => changes.map((c) => ({ rowId: c.rowId, status: 'ok' as const })),
    );

    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    const e1: TestEntity = { id: '1', name: 'A' };
    const e2: TestEntity = { id: '2', name: 'B' };

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(e1, 'name', 'A'));
      result.current.handleCellValueChanged(cellValueChanged(e2, 'name', 'B'));
    });

    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
    });

    // One bulk call carrying both rows — no per-row fan-out.
    expect(onCommit).toHaveBeenCalledTimes(1);
    const batch = onCommit.mock.calls[0]![0];
    expect(batch).toHaveLength(2);
    expect(batch).toEqual(
      expect.arrayContaining([
        { rowId: '1', changes: { name: 'A' }, entity: e1 },
        { rowId: '2', changes: { name: 'B' }, entity: e2 },
      ]),
    );
  });

  it('flushes on fill end', async () => {
    const onCommit = vi.fn(async () => [{ rowId: '1', status: 'ok' as const }]);
    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged({ id: '1', name: 'x' }, 'name', 'x'));
    });
    await act(async () => {
      result.current.handleFillEnd({} as any);
      await Promise.resolve();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('flushes on cut end', async () => {
    const onCommit = vi.fn(async () => [{ rowId: '1', status: 'ok' as const }]);
    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged({ id: '1', name: '' }, 'name', ''));
    });
    await act(async () => {
      result.current.handleCutEnd({} as any);
      await Promise.resolve();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Single-cell edit flushes via editing-stopped (debounced)
  // -------------------------------------------------------------------------

  it('flushes a single-cell edit after the 50ms row-blur debounce', async () => {
    const onCommit = vi.fn<(c: RowChange<TestEntity>[]) => Promise<CommitResult[]>>(async () => [
      { rowId: '1', status: 'ok' as const },
    ]);
    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    const entity: TestEntity = { id: '1', name: 'Updated', value: 7 };

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(entity, 'name', 'Updated'));
      result.current.handleCellValueChanged(cellValueChanged(entity, 'value', 7));
      result.current.handleCellEditingStopped(editingStopped(entity, 0));
    });

    expect(onCommit).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(60);
      await Promise.resolve();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toEqual([
      { rowId: '1', changes: { name: 'Updated', value: 7 }, entity },
    ]);
  });

  it('does not flush on editing-stopped while another cell in the row is still editing', () => {
    const onCommit = vi.fn(async () => []);
    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    const entity: TestEntity = { id: '1', name: 'x' };
    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(entity, 'name', 'x'));
      result.current.handleCellEditingStopped(editingStopped(entity, 0, /* still editing */ true));
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onCommit).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Inert without onCommit
  // -------------------------------------------------------------------------

  it('is inert (no throw, no dirty flush) when onCommit is omitted', async () => {
    const onDirtyChange = vi.fn();
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onDirtyChange }),
    );

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged({ id: '1', name: 'x' }, 'name', 'x'));
    });
    // Still tracks dirty, but flushing does nothing without a commit sink.
    expect(onDirtyChange).toHaveBeenCalledWith(true);

    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
    });
    // No onDirtyChange(false) — nothing was committed.
    expect(onDirtyChange).not.toHaveBeenCalledWith(false);
  });

  // -------------------------------------------------------------------------
  // Atomicity: a thrown onCommit fails the whole batch
  // -------------------------------------------------------------------------

  it('marks every row in the batch as error and keeps them dirty when onCommit throws', async () => {
    const onDirtyChange = vi.fn();
    const onCommit = vi.fn(async () => {
      throw new Error('bulk rejected');
    });
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onCommit, onDirtyChange }),
    );

    const e1: TestEntity = { id: '1', name: 'A' };
    const e2: TestEntity = { id: '2', name: 'B' };
    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(e1, 'name', 'A'));
      result.current.handleCellValueChanged(cellValueChanged(e2, 'name', 'B'));
    });

    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.getRowClass({ data: e1 } as any)).toBe('ag-row-error');
    expect(result.current.getRowClass({ data: e2 } as any)).toBe('ag-row-error');
    // Still dirty after a failed atomic batch.
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('honours per-row error results: failed rows stay dirty, ok rows clear', async () => {
    const onCommit = vi.fn(async (changes: RowChange<TestEntity>[]) =>
      changes.map((c) => ({
        rowId: c.rowId,
        status: c.rowId === '2' ? ('error' as const) : ('ok' as const),
      })),
    );
    const handleRef = { current: null } as React.MutableRefObject<any>;
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onCommit, handleRef }),
    );

    const e1: TestEntity = { id: '1', name: 'A' };
    const e2: TestEntity = { id: '2', name: 'B' };
    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(e1, 'name', 'A'));
      result.current.handleCellValueChanged(cellValueChanged(e2, 'name', 'B'));
    });
    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.getRowClass({ data: e1 } as any)).toBeUndefined();
    expect(result.current.getRowClass({ data: e2 } as any)).toBe('ag-row-error');
    expect(handleRef.current?.getDirtyRowIds()).toEqual(['2']);
  });

  // -------------------------------------------------------------------------
  // Row visual states
  // -------------------------------------------------------------------------

  it('getRowClass returns saving while the commit is in flight, then idle', async () => {
    let resolveCommit: (r: CommitResult[]) => void;
    const pending = new Promise<CommitResult[]>((resolve) => {
      resolveCommit = resolve;
    });
    const onCommit = vi.fn(() => pending);
    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    const entity: TestEntity = { id: '1', name: 'A' };
    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(entity, 'name', 'A'));
    });
    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
    });

    expect(result.current.getRowClass({ data: entity } as any)).toBe('ag-row-saving');

    await act(async () => {
      resolveCommit!([{ rowId: '1', status: 'ok' }]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.getRowClass({ data: entity } as any)).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Imperative handle
  // -------------------------------------------------------------------------

  it('saveAll commits all dirty rows as one batch and clears dirty', async () => {
    const onCommit = vi.fn(async (changes: RowChange<TestEntity>[]) =>
      changes.map((c) => ({ rowId: c.rowId, status: 'ok' as const })),
    );
    const handleRef = { current: null } as React.MutableRefObject<any>;
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onCommit, handleRef }),
    );

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged({ id: '1', name: 'A' }, 'name', 'A'));
      result.current.handleCellValueChanged(cellValueChanged({ id: '2', name: 'B' }, 'name', 'B'));
    });

    await act(async () => {
      await handleRef.current?.saveAll();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toHaveLength(2);
    expect(handleRef.current?.getDirtyRowIds()).toEqual([]);
  });

  it('discardAll drops pending changes without committing', () => {
    const onCommit = vi.fn(async () => []);
    const handleRef = { current: null } as React.MutableRefObject<any>;
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onCommit, handleRef }),
    );

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged({ id: '1', name: 'A' }, 'name', 'A'));
    });
    act(() => {
      handleRef.current?.discardAll();
    });

    expect(handleRef.current?.getDirtyRowIds()).toEqual([]);
    expect(onCommit).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Dirty state + double-commit guard
  // -------------------------------------------------------------------------

  it('fires onDirtyChange(true) on accumulate and (false) after a successful commit', async () => {
    const onDirtyChange = vi.fn();
    const onCommit = vi.fn(async () => [{ rowId: '1', status: 'ok' as const }]);
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onCommit, onDirtyChange }),
    );

    act(() => {
      result.current.handleCellValueChanged(cellValueChanged({ id: '1', name: 'A' }, 'name', 'A'));
    });
    expect(onDirtyChange).toHaveBeenCalledWith(true);

    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('does not double-commit a row already in flight', async () => {
    let resolveFirst: (r: CommitResult[]) => void;
    const first = new Promise<CommitResult[]>((r) => {
      resolveFirst = r;
    });
    const onCommit = vi
      .fn<(c: RowChange<TestEntity>[]) => Promise<CommitResult[]>>()
      .mockReturnValueOnce(first)
      .mockResolvedValue([{ rowId: '1', status: 'ok' }]);

    const { result } = renderHook(() => useCommitPipeline<TestEntity>({ getEntityId, onCommit }));

    const entity: TestEntity = { id: '1', name: 'A' };
    act(() => {
      result.current.handleCellValueChanged(cellValueChanged(entity, 'name', 'A'));
    });
    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
    });

    // Second flush while the first is still in flight — must not re-commit row 1.
    await act(async () => {
      result.current.handlePasteEnd({} as any);
      await Promise.resolve();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst!([{ rowId: '1', status: 'ok' }]);
      await Promise.resolve();
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it('ignores cell-value events with no entity data or no field', () => {
    const onDirtyChange = vi.fn();
    const { result } = renderHook(() =>
      useCommitPipeline<TestEntity>({ getEntityId, onDirtyChange }),
    );

    act(() => {
      result.current.handleCellValueChanged({ data: null, colDef: { field: 'name' } } as any);
      result.current.handleCellValueChanged({ data: { id: '1' }, colDef: {} } as any);
    });

    expect(onDirtyChange).not.toHaveBeenCalled();
  });
});
