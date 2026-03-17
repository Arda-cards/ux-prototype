import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { IHeaderParams } from 'ag-grid-community';

// SortMenuHeader is an internal sub-component — not exported from the barrel.

/**
 * Custom AG Grid header component that renders column name + optional ↑/↓
 * indicator + ⋮ button that opens a sort dropdown rendered via portal into
 * document.body (to escape overflow:hidden containers).
 */
export const SortMenuHeader: React.FC<IHeaderParams> = (params) => {
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(() => {
    const s = params.column.getSort?.() ?? null;
    return s === 'asc' || s === 'desc' ? s : null;
  });
  const [menuAnchor, setMenuAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Keep sortDir in sync with AG Grid's column sort state
  useEffect(() => {
    const syncSort = () => {
      const s = params.column.getSort?.() ?? null;
      setSortDir(s === 'asc' || s === 'desc' ? s : null);
    };
    params.column.addEventListener('sortChanged', syncSort);
    return () => {
      params.column.removeEventListener('sortChanged', syncSort);
    };
  }, [params.column]);

  // Close menu on outside click (but not if click is on the button or inside dropdown)
  useEffect(() => {
    if (!menuAnchor) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('.arda-sort-menu-dropdown')) return;
      setMenuAnchor(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuAnchor]);

  // Toggle menu open / closed using functional state update (stable callback)
  const openMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor((prev) => {
      if (prev) return null;
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return { top: rect.bottom + 4, left: rect.left };
    });
  }, []);

  const applySort = useCallback(
    (dir: 'asc' | 'desc' | null) => {
      params.setSort(dir);
      setMenuAnchor(null);
    },
    [params],
  );

  return (
    <div className="arda-sort-header">
      <span className="arda-sort-header-text">{params.displayName}</span>
      {sortDir && (
        <span className="arda-sort-header-icon" aria-hidden="true">
          {sortDir === 'asc' ? '↑' : '↓'}
        </span>
      )}
      {params.enableSorting && (
        <button
          ref={btnRef}
          className={`arda-sort-header-btn${sortDir ? ' arda-sort-header-btn-active' : ''}`}
          onClick={openMenu}
          title="Sort options"
          aria-label="Sort options"
          aria-expanded={menuAnchor !== null}
        >
          &#8942;
        </button>
      )}
      {menuAnchor !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="arda-sort-menu-dropdown"
            style={{ top: menuAnchor.top, left: menuAnchor.left }}
          >
            <button onClick={() => applySort('asc')}>
              <span aria-hidden="true">↑</span> Sort Ascending
            </button>
            <button onClick={() => applySort('desc')}>
              <span aria-hidden="true">↓</span> Sort Descending
            </button>
            {sortDir && (
              <button onClick={() => applySort(null)}>
                <span aria-hidden="true">↕</span> Clear Sort
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

SortMenuHeader.displayName = 'SortMenuHeader';
