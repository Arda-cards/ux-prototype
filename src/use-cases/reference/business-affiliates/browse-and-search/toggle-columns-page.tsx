/**
 * Local wrapper for the Toggle Column Visibility story (BA::0001::0003).
 *
 * Wraps SuppliersPage with a deferred-commit column visibility dropdown:
 * pending changes are applied only on Save and discarded on Cancel or
 * outside-click. The built-in ColumnVisibilityDropdown inside SuppliersPage
 * is hidden via the columnVisibilityOverride prop.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Columns3 } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { SuppliersPage } from '../_shared/suppliers-page';

// ---------------------------------------------------------------------------
// Column registry
// ---------------------------------------------------------------------------

const ALL_COLUMNS = [
  { id: 'name', name: 'Name', alwaysVisible: true },
  { id: 'contact', name: 'Contact', alwaysVisible: false },
  { id: 'phone', name: 'Phone', alwaysVisible: false },
  { id: 'city', name: 'City', alwaysVisible: false },
  { id: 'state', name: 'State', alwaysVisible: false },
  { id: 'roles', name: 'Roles', alwaysVisible: false },
];

const ALL_COLUMN_IDS = new Set(ALL_COLUMNS.map((c) => c.id));

// ---------------------------------------------------------------------------
// ToggleColumnsSuppliersPage
// ---------------------------------------------------------------------------

export function ToggleColumnsSuppliersPage() {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(ALL_COLUMN_IDS),
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingColumns, setPendingColumns] = useState<Set<string>>(
    new Set(ALL_COLUMN_IDS),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click — behaves as Cancel (pending changes discarded)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        // Pending changes are discarded; visibleColumns is untouched.
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleOpen = () => {
    // Initialise pending from committed state each time the dropdown opens.
    setPendingColumns(new Set(visibleColumns));
    setDropdownOpen(true);
  };

  const handleToggle = (colId: string) => {
    // Name column is always visible — ignore toggle attempts.
    if (colId === 'name') return;
    setPendingColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
      } else {
        next.add(colId);
      }
      return next;
    });
  };

  const handleShowAll = () => setPendingColumns(new Set(ALL_COLUMN_IDS));
  const handleHideAll = () => setPendingColumns(new Set(['name']));

  const handleSave = () => {
    setVisibleColumns(new Set(pendingColumns));
    setDropdownOpen(false);
  };

  const handleCancel = () => setDropdownOpen(false);

  const viewDropdown = (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1"
        onClick={handleOpen}
        aria-label="Toggle column visibility"
      >
        <Columns3 className="w-4 h-4" />
        View
      </Button>
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
          {ALL_COLUMNS.map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={pendingColumns.has(col.id)}
                onChange={() => handleToggle(col.id)}
                disabled={col.alwaysVisible}
                className="rounded"
              />
              {col.name}
            </label>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1 px-3 pb-1 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShowAll}>
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={handleHideAll}>
              Hide All
            </Button>
          </div>
          <div className="border-t border-gray-200 mt-1 pt-1 px-3 pb-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <SuppliersPage
      toolbarActions={() => viewDropdown}
      columnVisibilityOverride={visibleColumns}
    />
  );
}
