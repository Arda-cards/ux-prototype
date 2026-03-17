'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface RowAction<T> {
  /** Menu label displayed to the user */
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Handler invoked when the user selects this action */
  onClick: (rowData: T) => void;
}

export interface ActionCellRendererStaticConfig<T> {
  /** Actions to display in the dropdown */
  actions: RowAction<T>[];
}

export interface ActionCellRendererRuntimeConfig<T> {
  /** The row entity this cell represents */
  rowData: T;
  /** Whether the renderer is disabled */
  disabled?: boolean;
}

export interface ActionCellRendererProps<T>
  extends ActionCellRendererStaticConfig<T>, ActionCellRendererRuntimeConfig<T> {}

// ============================================================================
// Component
// ============================================================================

/**
 * `ActionCellRenderer` renders a vertical-ellipsis button (&#8942;) that opens
 * a dropdown menu of row-level actions.  The menu is rendered via a React
 * portal so it escapes any `overflow: hidden` container (e.g. an AG Grid cell).
 *
 * Design notes:
 * - Portal target is `document.body` to ensure overflow escape.
 * - Menu position is computed from the trigger button's bounding rect.
 * - Keyboard: `Escape` closes the menu; `Enter`/`Space` open it on the button.
 * - Click outside the menu closes it.
 */
export function ActionCellRenderer<T>({
  rowData,
  actions,
  disabled = false,
}: ActionCellRendererProps<T>) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Open menu and compute portal position
  const handleOpen = useCallback(() => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  // Close when clicking outside the menu
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, handleClose]);

  const handleActionClick = useCallback(
    (action: RowAction<T>) => {
      action.onClick(rowData);
      handleClose();
    },
    [rowData, handleClose],
  );

  // -----------------------------------------------------------------------
  // Dropdown menu portal
  // -----------------------------------------------------------------------

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Row actions"
          className={[
            'absolute z-50 min-w-[140px]',
            'bg-white border border-border rounded-md shadow-md',
            'py-1',
          ].join(' ')}
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              className={[
                'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:bg-accent focus:text-accent-foreground',
                'cursor-pointer',
              ].join(' ')}
              onClick={() => handleActionClick(action)}
            >
              {action.icon && (
                <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
                  {action.icon}
                </span>
              )}
              <span>{action.label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Row actions"
        disabled={disabled}
        onClick={handleOpen}
        className={[
          'flex items-center justify-center',
          'w-7 h-7 rounded',
          'text-muted-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          'transition-colors',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <MoreVertical className="w-4 h-4" aria-hidden="true" />
      </button>

      {menu}
    </div>
  );
}
