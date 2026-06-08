import * as React from 'react';
import type { Column, IRowNode } from 'ag-grid-community';

/**
 * Default minimum width (px) for a popup cell editor. On narrow columns the
 * editor extends past the cell edge rather than squeezing its content; AG Grid
 * keeps the popup within the grid bounds.
 */
export const DEFAULT_CELL_EDITOR_MIN_WIDTH = 240;

export interface CellEditorGeometry {
  /** The editing cell's pixel width — the popup matches it so it looks attached. */
  cellWidth: number;
  /** The row height — the popup's minimum height, so a single line aligns with
   * the cell and taller content grows downward. Omitted if AG Grid has no row height. */
  cellMinHeight?: number;
}

/**
 * Reads the editing cell's geometry from AG Grid for a popup cell editor.
 *
 * A popup editor (`cellEditorPopup: true`) is not constrained to the cell, so to
 * look attached it should match the cell's width and use the row height as its
 * minimum. Shared by every popup cell editor (tokens, single-select, and future
 * notes/etc.) so they stay consistent. Pair with the `min-w-60` floor in the
 * input's `cellEditorMode` styling for narrow columns.
 */
export function useCellEditorGeometry(column: Column, node: IRowNode): CellEditorGeometry {
  return React.useMemo(() => {
    const cellWidth = column.getActualWidth();
    const cellMinHeight = node.rowHeight ?? undefined;
    return cellMinHeight !== undefined ? { cellWidth, cellMinHeight } : { cellWidth };
  }, [column, node]);
}
