import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import type { ColDef } from 'ag-grid-community';
import { ArdaDataGrid, ArdaDataGridRef } from '@/components/molecules/data-grid/data-grid';
import type { PaginationData } from '@/types/model';

// ============================================================================
// Types - Model/Data Binding
// ============================================================================

/**
 * Factory configuration passed once at creation time.
 * Defines the data model binding and entity-specific behavior.
 */
export interface EntityDataGridConfig<T extends Record<string, any>> {
  /** Display name for the entity type (e.g., "Items", "Suppliers") */
  displayName: string;
  /** Persistence key prefix (e.g., "arda-items-data-grid") */
  persistenceKeyPrefix: string;
  /** Column definitions for this entity type */
  columnDefs: ColDef<T>[];
  /** Default column configuration */
  defaultColDef: ColDef<T>;
  /** Function to extract entity ID from an entity instance */
  getEntityId: (entity: T) => string;
  /** Optional function to enhance column defs with editing capabilities */
  enhanceEditableColumnDefs?: (defs: ColDef<T>[], options: { enabled: boolean }) => ColDef<T>[];
}

/**
 * Model/Data binding props passed at render time.
 * Controls the data and entity mutation callbacks.
 */
export interface EntityDataGridModelProps<T> {
  /** Row data array */
  data: T[];
  /** Called when an entity is updated via cell edit */
  onEntityUpdated?: (entity: T) => void;
  /** Called when unsaved changes state changes */
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

// ============================================================================
// Types - View/Layout/Controller
// ============================================================================

/**
 * View/Layout/Controller props passed at render time.
 * Controls visual presentation, column configuration, and UI interactions.
 */
export interface EntityDataGridViewProps<T> {
  /** Column visibility map (colId -> boolean) */
  columnVisibility?: Record<string, boolean>;
  /** Column order (array of colIds in desired order) */
  columnOrder?: string[];
  /** Loading state */
  loading?: boolean;
  /** Enable cell editing */
  enableCellEditing?: boolean;
  /** Active tab (for persistence key) */
  activeTab?: string;
  /** Called when a row is clicked */
  onRowClick?: (entity: T) => void;
  /** Called when selection changes */
  onSelectionChange?: (entities: T[]) => void;
  /** Pagination data */
  paginationData?: PaginationData;
  /** Called when next page button is clicked */
  onNextPage?: () => void;
  /** Called when previous page button is clicked */
  onPreviousPage?: () => void;
  /** Called when first page button is clicked */
  onFirstPage?: () => void;
  /** Empty state component */
  emptyStateComponent?: React.ReactNode;
}

// ============================================================================
// Types - Combined & Ref API
// ============================================================================

/**
 * Combined props interface for entity data grid.
 */
export interface EntityDataGridProps<T>
  extends EntityDataGridModelProps<T>, EntityDataGridViewProps<T> {}

/**
 * Ref API exposed by entity data grid.
 */
export interface EntityDataGridRef {
  /** Save all unsaved changes */
  saveAllDrafts: () => void;
  /** Check if there are unsaved changes */
  getHasUnsavedChanges: () => boolean;
  /** Discard all unsaved changes */
  discardAllDrafts: () => void;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a generic entity data grid component with dirty tracking and editing support.
 * Encapsulates all shared logic for entity grids (items, suppliers, etc.).
 *
 * @param config - Entity-specific configuration (column defs, ID accessor, etc.)
 * @returns Object with Component (forwardRef component) and type exports
 */
export function createArdaEntityDataGrid<T extends Record<string, any>>(
  config: EntityDataGridConfig<T>,
) {
  const Component = forwardRef<EntityDataGridRef, EntityDataGridProps<T>>(function EntityDataGrid(
    {
      // Model props
      data,
      onEntityUpdated,
      onUnsavedChangesChange,

      // View props
      columnVisibility = {},
      columnOrder,
      loading = false,
      enableCellEditing = false,
      activeTab = 'default',
      onRowClick,
      onSelectionChange,
      paginationData,
      onNextPage,
      onPreviousPage,
      onFirstPage,
      emptyStateComponent,
    },
    ref,
  ) {
    const gridRef = useRef<ArdaDataGridRef<T>>(null);

    // Track unsaved changes (edited entities that haven't been saved)
    const [dirtyItems, setDirtyItems] = useState<Set<string>>(new Set());
    const dirtyItemDataRef = useRef<Map<string, T>>(new Map());
    // Store original entity snapshots for discard/revert
    const originalItemDataRef = useRef<Map<string, T>>(new Map());

    // Apply column visibility filtering to columnDefs
    const applyColumnVisibility = useCallback(
      (defs: ColDef<T>[]) => {
        if (Object.keys(columnVisibility).length === 0) return defs;

        return defs.map((col) => {
          const colId = (col.colId as string) || (col.field as string);
          if (!colId) return col;

          // Check if this column should be visible
          const isVisible = columnVisibility[colId] !== false;

          return {
            ...col,
            hide: !isVisible,
          };
        });
      },
      [columnVisibility],
    );

    // Apply column order to columnDefs
    const applyColumnOrder = useCallback(
      (defs: ColDef<T>[]) => {
        if (!columnOrder || columnOrder.length === 0) return defs;

        // Create a map of colId -> columnDef
        const colMap = new Map(
          defs.map((col) => {
            const colId = (col.colId as string) || (col.field as string);
            return [colId, col];
          }),
        );

        // Build ordered array
        const ordered = columnOrder
          .map((colId) => colMap.get(colId))
          .filter((col): col is ColDef<T> => col !== undefined);

        // Add any columns not in the order array at the end
        const orderedSet = new Set(columnOrder);
        const remaining = defs.filter((col) => {
          const colId = (col.colId as string) || (col.field as string);
          return !orderedSet.has(colId);
        });

        return [...ordered, ...remaining];
      },
      [columnOrder],
    );

    // Build final column definitions
    const finalColumnDefs = useMemo(() => {
      let defs = [...config.columnDefs];

      // Apply visibility
      defs = applyColumnVisibility(defs);

      // Apply order
      defs = applyColumnOrder(defs);

      // Apply editing enhancements if enabled
      if (enableCellEditing && config.enhanceEditableColumnDefs) {
        defs = config.enhanceEditableColumnDefs(defs, { enabled: true });
      }

      return defs;
    }, [applyColumnVisibility, applyColumnOrder, enableCellEditing]);

    // Handle cell value changes
    const handleCellValueChanged = useCallback(
      (event: any) => {
        const entity = event.data as T;
        if (!entity) return;

        const entityId = config.getEntityId(entity);
        if (!entityId) return;

        // Store original snapshot before first edit
        if (!originalItemDataRef.current.has(entityId)) {
          // event.oldValue is the previous cell value; reconstruct original entity
          const original = { ...entity, [event.colDef.field as string]: event.oldValue } as T;
          originalItemDataRef.current.set(entityId, structuredClone(original));
        }

        // Mark this entity as dirty
        setDirtyItems((prev) => new Set(prev).add(entityId));
        dirtyItemDataRef.current.set(entityId, entity);

        // Notify parent
        onUnsavedChangesChange?.(true);
        onEntityUpdated?.(entity);
      },
      [onEntityUpdated, onUnsavedChangesChange],
    );

    // Update unsaved changes notification when dirty set changes
    useEffect(() => {
      onUnsavedChangesChange?.(dirtyItems.size > 0);
    }, [dirtyItems.size, onUnsavedChangesChange]);

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        saveAllDrafts: () => {
          // Clear all dirty state (optimistic save)
          setDirtyItems(new Set());
          dirtyItemDataRef.current.clear();
          onUnsavedChangesChange?.(false);
        },
        getHasUnsavedChanges: () => dirtyItems.size > 0,
        discardAllDrafts: () => {
          // Restore original entity values on the mutated row objects
          // AG Grid edits data in-place, so we copy original values back
          const api = gridRef.current?.getGridApi();
          if (api) {
            api.forEachNode((rowNode) => {
              const entity = rowNode.data as T | undefined;
              if (!entity) return;
              const entityId = config.getEntityId(entity);
              const original = originalItemDataRef.current.get(entityId);
              if (original) {
                Object.assign(entity, original);
              }
            });
            api.refreshCells({ force: true });
          }

          // Clear all dirty state
          setDirtyItems(new Set());
          dirtyItemDataRef.current.clear();
          originalItemDataRef.current.clear();
          onUnsavedChangesChange?.(false);
        },
      }),
      [dirtyItems.size, onUnsavedChangesChange],
    );

    return (
      <ArdaDataGrid<T>
        ref={gridRef}
        columnDefs={finalColumnDefs}
        defaultColDef={config.defaultColDef}
        persistenceKey={`${config.persistenceKeyPrefix}-${activeTab}`}
        rowData={data}
        loading={loading}
        enableCellEditing={enableCellEditing}
        onCellValueChanged={handleCellValueChanged}
        onRowClicked={
          onRowClick
            ? (event) => {
                if (event.data) onRowClick(event.data);
              }
            : undefined
        }
        onSelectionChanged={onSelectionChange}
        paginationData={paginationData}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        onFirstPage={onFirstPage}
        emptyStateComponent={emptyStateComponent}
        height="100%"
        className="h-full arda-hide-auto-selection"
      />
    );
  });

  Component.displayName = config.displayName;

  return {
    Component,
  };
}
