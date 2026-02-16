import { useState, useEffect, useCallback } from 'react';
import type { IHeaderParams, IRowNode } from 'ag-grid-community';
import { MessageSquare } from 'lucide-react';

import type { Item } from '@/types/reference/items/item-domain';

/**
 * Simplified select-all header component for client-side grids.
 * Toggles selection of all visible rows without cross-page tracking.
 */
export function SelectAllHeaderComponent(params: IHeaderParams) {
  const [isChecked, setIsChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  useEffect(() => {
    const updateSelectionState = () => {
      const api = params.api;
      if (!api) return;

      const displayedRowCount = api.getDisplayedRowCount();
      const selectedRowCount = api.getSelectedRows().length;

      if (selectedRowCount === 0) {
        setIsChecked(false);
        setIsIndeterminate(false);
      } else if (selectedRowCount === displayedRowCount && displayedRowCount > 0) {
        setIsChecked(true);
        setIsIndeterminate(false);
      } else {
        setIsChecked(false);
        setIsIndeterminate(true);
      }
    };

    updateSelectionState();

    const onSelectionChanged = () => {
      updateSelectionState();
    };

    params.api.addEventListener('selectionChanged', onSelectionChanged);

    return () => {
      params.api?.removeEventListener('selectionChanged', onSelectionChanged);
    };
  }, [params.api]);

  const handleSelectAll = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const api = params.api;
    if (!api) return;

    try {
      if (isChecked || isIndeterminate) {
        api.deselectAll();
      } else {
        api.forEachNodeAfterFilterAndSort((node) => {
          if (node.data) {
            node.setSelected(true, false);
          }
        });
      }
    } catch (error) {
      console.error('Error selecting/deselecting all:', error);
    }
  };

  if (!params || !params.api) {
    return (
      <div className="flex items-center justify-center w-full h-full p-0 min-h-[48px]">
        <div className="w-4 h-4 border border-gray-300 bg-white" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-start w-full h-full p-0 pl-0 min-h-[48px] bg-transparent cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <input
        type="checkbox"
        className="rounded cursor-pointer m-0 w-4 h-4 min-w-[16px] min-h-[16px] flex-shrink-0 block visible opacity-100"
        checked={isChecked}
        ref={(input) => {
          if (input) {
            input.indeterminate = isIndeterminate;
          }
        }}
        onChange={(e) => {
          e.stopPropagation();
        }}
        onClick={handleSelectAll}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
}

/**
 * Notes cell renderer - displays a notes icon with tooltip showing the notes text.
 */
export function NotesCell({ item }: { item: Item }) {
  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!item.notes) {
    return <span>-</span>;
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      onClick={handleMouseEvent}
      onMouseDown={handleMouseEvent}
    >
      <button
        className="bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
        title={item.notes}
        onClick={handleMouseEvent}
        onMouseDown={handleMouseEvent}
      >
        <MessageSquare className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

/**
 * Card count cell renderer - displays static card count.
 * Full async loading tracked in issue #718.
 */
export function CardCountCell({ item: _item }: { item: Item }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Static placeholder - async loading deferred to #718
  const cardCount = 0;

  return (
    <div className="flex items-center gap-1" onClick={handleClick} onMouseDown={handleClick}>
      <span className="text-blue-600 font-medium">{cardCount}</span>
    </div>
  );
}

/**
 * Quick actions cell renderer - STATIC PLACEHOLDER.
 * Shows disabled action icons. Full implementation tracked in issue #716.
 */
export function QuickActionsCell({ item: _item }: { item: Item }) {
  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      onClick={handleMouseEvent}
      onMouseDown={handleMouseEvent}
    >
      <div className="flex items-center relative gap-1 flex-shrink-0">
        <span className="text-xs text-gray-400">Actions</span>
      </div>
    </div>
  );
}

/**
 * Selection checkbox cell renderer for the select column.
 * Extracted as a component to avoid handler re-creation on every cell render.
 */
export function SelectionCheckboxCell({ node }: { node: IRowNode }) {
  const handleMouseEvent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
      e.preventDefault();
      node.setSelected(!node.isSelected(), false);
    },
    [node],
  );

  return (
    <div
      className="flex items-center justify-start w-full h-full p-0 pl-0"
      onClick={handleMouseEvent}
      onMouseDown={handleMouseEvent}
    >
      <input
        type="checkbox"
        className="rounded cursor-pointer"
        checked={node.isSelected()}
        onChange={handleMouseEvent}
        onClick={handleCheckboxClick}
        onMouseDown={handleMouseEvent}
      />
    </div>
  );
}
