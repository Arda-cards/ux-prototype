import { describe, it, expect } from 'vitest';

import type { ConnectedDataGridProps, EntityDataSource } from './create-entity-data-grid';

// ============================================================================
// Compile-time contract for the Omit-extend prop forwarding (DQ-006).
//
// These assertions are validated by `tsc` (make typecheck). The `@ts-expect-error`
// lines MUST error — if a container-owned prop ever becomes assignable, tsc fails
// the build. The capability props below MUST stay error-free — they are the
// molecule props that flow through for free.
// ============================================================================

interface Row extends Record<string, any> {
  id: string;
  name: string;
}

describe('ConnectedDataGridProps (DQ-006 prop forwarding)', () => {
  it('rejects container-owned props at compile time', () => {
    const props = {} as ConnectedDataGridProps<Row>;

    // @ts-expect-error — `rowData` is owned by the container (data source).
    void props.rowData;
    // @ts-expect-error — `columnDefs` is supplied via the factory config.
    void props.columnDefs;
    // @ts-expect-error — `defaultColDef` is supplied via the factory config.
    void props.defaultColDef;
    // @ts-expect-error — `onCellValueChanged` is owned (write lifecycle).
    void props.onCellValueChanged;
    // @ts-expect-error — `gridRef` is owned (container holds the inner ref).
    void props.gridRef;

    expect(true).toBe(true);
  });

  it('forwards molecule capability props untouched', () => {
    const props = {} as ConnectedDataGridProps<Row>;

    // No `@ts-expect-error`: these are the pass-through capability props.
    void props.clipboardPaste;
    void props.cellSelection;
    void props.undoRedoLimit;
    void props.dataTypeDefinitions;
    void props.columnTypes;
    void props.onPasteEnd;
    void props.onFillEnd;
    void props.onCutEnd;

    expect(true).toBe(true);
  });

  it('accepts a discriminated client data source and forbids invalid combinations', () => {
    const client: EntityDataSource<Row> = { mode: 'client', data: [{ id: '1', name: 'A' }] };
    const server: EntityDataSource<Row> = {
      mode: 'server',
      getRows: async () => ({ rows: [], lastRow: 0 }),
    };

    // @ts-expect-error — `client` mode requires `data`.
    const invalid: EntityDataSource<Row> = { mode: 'client' };

    expect(client.mode).toBe('client');
    expect(server.mode).toBe('server');
    void invalid;
  });
});
