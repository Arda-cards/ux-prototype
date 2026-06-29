import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { useDraftPersistence } from './use-draft-persistence';

interface Vendor extends Record<string, any> {
  eId: string;
  name: string;
  serverId?: string;
}

const getEntityId = (v: Vendor) => v.eId;

function makeApi() {
  return {
    applyTransaction: vi.fn(),
    getEditingCells: () => [] as Array<{ rowIndex: number }>,
    getRowNode: (id: string) => ({ rowIndex: id === 'new-1' ? 0 : 1 }),
  };
}

function added(...rows: Vendor[]) {
  return { rows, source: 'user' as const };
}
function cellChanged(row: Vendor) {
  return { data: row, colDef: { field: 'name' }, newValue: row.name } as any;
}
function editingStopped(row: Vendor, api: ReturnType<typeof makeApi>) {
  return { data: row, api } as any;
}

describe('useDraftPersistence', () => {
  const requiredFields: (keyof Vendor)[] = ['name'];

  it('markAdded marks rows as drafts (isDraft true)', () => {
    const onCreate = vi.fn(async (r: Vendor) => r);
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({
        getEntityId,
        getApi: () => makeApi() as any,
        requiredFields,
        onCreate,
      }),
    );

    act(() => result.current.markAdded(added({ eId: 'new-1', name: '' })));
    expect(result.current.isDraft('new-1')).toBe(true);
  });

  it('markAdded is a no-op without an onCreate seam', () => {
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({ getEntityId, getApi: () => makeApi() as any, requiredFields }),
    );
    act(() => result.current.markAdded(added({ eId: 'new-1', name: '' })));
    expect(result.current.isDraft('new-1')).toBe(false);
  });

  it('creates the draft on row blur once required fields are complete; reconciles preserving the grid id', async () => {
    const api = makeApi();
    const onCreate = vi.fn(async (r: Vendor) => ({ ...r, serverId: 'ba-1' }));
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({
        getEntityId,
        getApi: () => api as any,
        requiredFields,
        onCreate,
      }),
    );

    act(() => result.current.markAdded(added({ eId: 'new-1', name: '' })));
    act(() => result.current.handleCellValueChanged(cellChanged({ eId: 'new-1', name: 'Acme' })));

    await act(async () => {
      result.current.handleCellEditingStopped(editingStopped({ eId: 'new-1', name: 'Acme' }, api));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith({ eId: 'new-1', name: 'Acme' });
    // Reconcile keeps the grid id (DQ-005): update carries the same eId + serverId.
    expect(api.applyTransaction).toHaveBeenCalledWith({
      update: [{ eId: 'new-1', name: 'Acme', serverId: 'ba-1' }],
    });
    expect(result.current.isDraft('new-1')).toBe(false);
  });

  it('does not create while required fields are incomplete', async () => {
    const api = makeApi();
    const onCreate = vi.fn(async (r: Vendor) => r);
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({
        getEntityId,
        getApi: () => api as any,
        requiredFields,
        onCreate,
      }),
    );

    act(() => result.current.markAdded(added({ eId: 'new-1', name: '' })));
    await act(async () => {
      result.current.handleCellEditingStopped(editingStopped({ eId: 'new-1', name: '' }, api));
      await Promise.resolve();
    });

    expect(onCreate).not.toHaveBeenCalled();
    expect(result.current.isDraft('new-1')).toBe(true);
  });

  it('leaves the row a draft when onCreate throws (retryable, no tint)', async () => {
    const api = makeApi();
    const onCreate = vi.fn(async () => {
      throw new Error('rejected');
    });
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({
        getEntityId,
        getApi: () => api as any,
        requiredFields,
        onCreate,
      }),
    );

    act(() => result.current.markAdded(added({ eId: 'new-1', name: 'Acme' })));
    act(() => result.current.handleCellValueChanged(cellChanged({ eId: 'new-1', name: 'Acme' })));
    await act(async () => {
      result.current.handleCellEditingStopped(editingStopped({ eId: 'new-1', name: 'Acme' }, api));
      await Promise.resolve();
      await Promise.resolve();
    });

    // Still a draft (so a re-blur retries); the consumer surfaces the error.
    expect(result.current.isDraft('new-1')).toBe(true);
  });

  it('paste/fill flush creates every complete draft', async () => {
    const api = makeApi();
    const onCreate = vi.fn(async (r: Vendor) => ({ ...r, serverId: `srv-${r.eId}` }));
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({
        getEntityId,
        getApi: () => api as any,
        requiredFields,
        onCreate,
      }),
    );

    act(() => {
      result.current.markAdded(added({ eId: 'new-1', name: '' }, { eId: 'new-2', name: '' }));
      result.current.handleCellValueChanged(cellChanged({ eId: 'new-1', name: 'Acme' }));
      result.current.handleCellValueChanged(cellChanged({ eId: 'new-2', name: 'Globex' }));
    });

    await act(async () => {
      result.current.handlePasteEnd();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onCreate).toHaveBeenCalledTimes(2);
    expect(result.current.isDraft('new-1')).toBe(false);
    expect(result.current.isDraft('new-2')).toBe(false);
  });

  it('stays a draft while create is in flight, then becomes saved once it resolves', async () => {
    const api = makeApi();
    let resolveCreate: (v: Vendor) => void;
    const pending = new Promise<Vendor>((resolve) => {
      resolveCreate = resolve;
    });
    const onCreate = vi.fn(() => pending);
    const { result } = renderHook(() =>
      useDraftPersistence<Vendor>({
        getEntityId,
        getApi: () => api as any,
        requiredFields,
        onCreate,
      }),
    );

    act(() => result.current.markAdded(added({ eId: 'new-1', name: 'Acme' })));
    act(() => result.current.handleCellValueChanged(cellChanged({ eId: 'new-1', name: 'Acme' })));
    await act(async () => {
      result.current.handleCellEditingStopped(editingStopped({ eId: 'new-1', name: 'Acme' }, api));
      await Promise.resolve();
    });

    // In flight — still a draft until the server record comes back.
    expect(result.current.isDraft('new-1')).toBe(true);

    await act(async () => {
      resolveCreate!({ eId: 'new-1', name: 'Acme', serverId: 'ba-1' });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isDraft('new-1')).toBe(false);
    expect(api.applyTransaction).toHaveBeenCalledWith({
      update: [{ eId: 'new-1', name: 'Acme', serverId: 'ba-1' }],
    });
  });
});
