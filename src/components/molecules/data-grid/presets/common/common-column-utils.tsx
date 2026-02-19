import type { ColDef, ICellRendererParams } from 'ag-grid-community';

import {
  SelectAllHeaderComponent,
  SelectionCheckboxCell,
  NotesIconCell,
  QuickActionsPlaceholderCell,
} from './common-cell-renderers';

/**
 * Common default column configuration shared by all data grids.
 */
export const COMMON_DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  filter: false,
  resizable: true,
  suppressMovable: false,
};

/**
 * Factory function to create a select column definition.
 * Returns a column with select-all header and selection checkboxes.
 */
export function createSelectColumn<T>(): ColDef<T> {
  return {
    colId: 'select',
    headerName: '',
    field: 'select' as any,
    width: 50,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    wrapHeaderText: false,
    autoHeaderHeight: false,
    checkboxSelection: false,
    headerCheckboxSelection: false,
    suppressMovable: true,
    headerComponent: SelectAllHeaderComponent,
    cellStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    headerClass: 'flex items-center justify-start p-0 w-full cursor-pointer',
    cellRenderer: (params: ICellRendererParams<T>) => <SelectionCheckboxCell node={params.node} />,
  };
}

/**
 * Factory function to create a notes icon column definition.
 * Accepts a notes accessor function to extract notes string from entity data.
 */
export function createNotesColumn<T>(notesAccessor: (data: T) => string | undefined): ColDef<T> {
  return {
    headerName: 'Notes',
    field: 'notes' as any,
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: ICellRendererParams<T>) => {
      if (!params.data) return <span>{'\u2014'}</span>;
      const notes = notesAccessor(params.data);
      return <NotesIconCell {...(notes !== undefined ? { notes } : {})} />;
    },
  };
}

/**
 * Factory function to create a quick actions placeholder column definition.
 */
export function createQuickActionsColumn<T>(): ColDef<T> {
  return {
    headerName: 'Quick Actions',
    field: 'quickActions' as any,
    colId: 'quickActions',
    width: 123,
    cellStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    cellRenderer: () => <QuickActionsPlaceholderCell />,
  };
}
