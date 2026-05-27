import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useRowEditing } from './use-row-editing';

interface Row extends Record<string, any> {
  eId: string;
  name: string;
}

/** Minimal client-row-model GridApi stub for the transaction + focus surface we use. */
function makeApi() {
  const nodes = new Map<string, { id: string; data: Row; rowIndex: number }>();
  return {
    applyTransaction: vi.fn((tx: { add?: Row[]; remove?: Row[]; addIndex?: number }) => {
      const add = (tx.add ?? []).map((data, i) => {
        const node = { id: data.eId, data, rowIndex: i };
        nodes.set(data.eId, node);
        return node;
      });
      for (const data of tx.remove ?? []) nodes.delete(data.eId);
      return { add, remove: tx.remove ?? [], update: [] };
    }),
    getRowNode: vi.fn((id: string) => nodes.get(id) ?? null),
    // First editable displayed column is `name`.
    getAllDisplayedColumns: () => [
      { getColDef: () => ({ editable: true }), getColId: () => 'name' },
      { getColDef: () => ({ editable: false }), getColId: () => 'email' },
    ],
    ensureIndexVisible: vi.fn(),
    setFocusedCell: vi.fn(),
    startEditingCell: vi.fn(),
    _nodes: nodes,
  };
}

describe('useRowEditing', () => {
  const getNewRowId = () => 'new-fixed';

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('addRow inserts a row with a minted eId and emits onRowsAdded(source:user)', () => {
    const api = makeApi();
    const onRowsAdded = vi.fn();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => api as any, getNewRowId, onRowsAdded }),
    );

    let id = '';
    act(() => {
      id = result.current.addRow({ name: 'Acme' } as Partial<Row>);
    });

    expect(id).toBe('new-fixed');
    expect(api.applyTransaction).toHaveBeenCalledWith({
      add: [{ eId: 'new-fixed', name: 'Acme' }],
      addIndex: 0,
    });
    expect(onRowsAdded).toHaveBeenCalledWith({
      rows: [{ eId: 'new-fixed', name: 'Acme' }],
      source: 'user',
    });
  });

  it('addRow honours a seed-provided eId', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => api as any, getNewRowId }),
    );

    let id = '';
    act(() => {
      id = result.current.addRow({ eId: 'seeded', name: 'X' } as Partial<Row>);
    });

    expect(id).toBe('seeded');
  });

  it('focuses + opens the editor on startEditingField, deferred to the next tick', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => api as any, getNewRowId }),
    );

    act(() => {
      result.current.addRow({ name: '' } as Partial<Row>, { startEditingField: 'name' });
    });

    // Deferred until the grid has reconciled the new row.
    expect(api.startEditingCell).not.toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    expect(api.ensureIndexVisible).toHaveBeenCalledWith(0);
    expect(api.setFocusedCell).toHaveBeenCalledWith(0, 'name');
    expect(api.startEditingCell).toHaveBeenCalledWith({ rowIndex: 0, colKey: 'name' });
  });

  it('defaults focus to the first editable column when no startEditingField is given', () => {
    const api = makeApi();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => api as any, getNewRowId }),
    );

    act(() => {
      result.current.addRow({ name: '' } as Partial<Row>);
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(api.startEditingCell).toHaveBeenCalledWith({ rowIndex: 0, colKey: 'name' });
  });

  it('addRow returns empty string and does nothing when the grid is not ready', () => {
    const onRowsAdded = vi.fn();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => null, getNewRowId, onRowsAdded }),
    );

    let id = 'x';
    act(() => {
      id = result.current.addRow();
    });

    expect(id).toBe('');
    expect(onRowsAdded).not.toHaveBeenCalled();
  });

  it('removeRows removes existing rows and emits onRowsRemoved', () => {
    const api = makeApi();
    const onRowsRemoved = vi.fn();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => api as any, getNewRowId, onRowsRemoved }),
    );

    act(() => {
      result.current.addRow({ eId: 'r1', name: 'A' } as Partial<Row>);
    });
    act(() => {
      result.current.removeRows(['r1']);
    });

    expect(api.applyTransaction).toHaveBeenLastCalledWith({ remove: [{ eId: 'r1', name: 'A' }] });
    expect(onRowsRemoved).toHaveBeenCalledWith({
      rows: [{ eId: 'r1', name: 'A' }],
      source: 'user',
    });
  });

  it('removeRows is a no-op for unknown ids', () => {
    const api = makeApi();
    const onRowsRemoved = vi.fn();
    const { result } = renderHook(() =>
      useRowEditing<Row>({ getApi: () => api as any, getNewRowId, onRowsRemoved }),
    );

    act(() => {
      result.current.removeRows(['missing']);
    });

    expect(onRowsRemoved).not.toHaveBeenCalled();
  });
});
