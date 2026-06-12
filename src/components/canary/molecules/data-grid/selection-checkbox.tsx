'use client';

import { useEffect, useState } from 'react';
import type { CustomCellRendererProps, CustomHeaderProps } from 'ag-grid-react';
import type { IRowNode } from 'ag-grid-community';
import { Checkbox } from '@/components/canary/atoms/checkbox/checkbox';

/**
 * Row-selection cell renderer for AG Grid's selection column. Renders the
 * Arda canary `Checkbox` and wires it to the AG Grid row node's selection
 * state — checked toggles via `node.setSelected(v)`, and external selection
 * changes (shift-click, select-all, programmatic) re-sync via the
 * `rowSelected` event.
 *
 * Stops propagation on the click so the parent row's onClick / cell-focus
 * handlers don't also fire.
 */
export function SelectionCheckboxCell<T = unknown>(params: CustomCellRendererProps<T, unknown>) {
  const node = params.node as IRowNode<T>;
  const [checked, setChecked] = useState(node.isSelected() ?? false);

  useEffect(() => {
    const sync = () => setChecked(node.isSelected() ?? false);
    node.addEventListener('rowSelected', sync);
    return () => node.removeEventListener('rowSelected', sync);
  }, [node]);

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => {
        node.setSelected(value === true);
      }}
      onClick={(event) => event.stopPropagation()}
      aria-label="Select row"
    />
  );
}

/**
 * Header cell renderer for the selection column's select-all checkbox.
 * Reflects three states: none selected (unchecked), some (indeterminate), all
 * (checked). Toggling drives `api.selectAll()` / `api.deselectAll()`. Listens
 * to AG Grid's `selectionChanged`, `rowDataUpdated`, and `modelUpdated` to
 * stay in sync after filtering / paging / data reloads.
 */
export function SelectionHeaderCheckbox(params: CustomHeaderProps) {
  const { api } = params;
  const [state, setState] = useState<boolean | 'indeterminate'>(false);

  useEffect(() => {
    const sync = () => {
      let displayedCount = 0;
      api.forEachNodeAfterFilter(() => {
        displayedCount += 1;
      });
      const selectedCount = api.getSelectedRows().length;
      if (selectedCount === 0) setState(false);
      else if (selectedCount >= displayedCount) setState(true);
      else setState('indeterminate');
    };
    api.addEventListener('selectionChanged', sync);
    api.addEventListener('rowDataUpdated', sync);
    api.addEventListener('modelUpdated', sync);
    sync();
    return () => {
      api.removeEventListener('selectionChanged', sync);
      api.removeEventListener('rowDataUpdated', sync);
      api.removeEventListener('modelUpdated', sync);
    };
  }, [api]);

  return (
    <Checkbox
      checked={state}
      onCheckedChange={(value) => {
        if (value === true) api.selectAll();
        else api.deselectAll();
      }}
      aria-label="Select all rows"
    />
  );
}
