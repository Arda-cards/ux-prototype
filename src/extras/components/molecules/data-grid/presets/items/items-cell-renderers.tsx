import type { Item } from '@/extras/types/reference/items/item-domain';

import {
  SelectAllHeaderComponent as CommonSelectAllHeaderComponent,
  SelectionCheckboxCell as CommonSelectionCheckboxCell,
  NotesIconCell,
} from '../common/common-cell-renderers';

// Re-export common components for backward compatibility
export const SelectAllHeaderComponent = CommonSelectAllHeaderComponent;
export const SelectionCheckboxCell = CommonSelectionCheckboxCell;

/**
 * Notes cell renderer - displays a notes icon with tooltip showing the notes text.
 * Delegates to the generic NotesIconCell.
 */
export function NotesCell({ item }: { item: Item }) {
  return <NotesIconCell {...(item.notes !== undefined ? { notes: item.notes } : {})} />;
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
