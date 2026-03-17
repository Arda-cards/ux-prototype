import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface DirtyTrackingOptions<T> {
  /** Function to extract the entity ID from an entity instance */
  getEntityId: (entity: T) => string;
  /** Called when the unsaved-changes state changes */
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

export interface DirtyTrackingResult {
  /** Number of entities with unsaved changes */
  dirtyCount: number;
  /** True when at least one entity has unsaved changes */
  hasUnsavedChanges: boolean;
  /**
   * Handler for AG Grid's `onCellValueChanged` event.
   * Captures the original entity snapshot on first edit and marks the entity dirty.
   */
  handleCellValueChanged: (event: any) => void;
  /**
   * Clears all dirty tracking state (optimistic save).
   * Does NOT call `onEntityUpdated`; the caller is responsible for persisting data.
   */
  saveAllDrafts: () => void;
  /**
   * Restores all original entity snapshots via the grid API and clears dirty state.
   * Requires a live `GridApi` reference to update in-place row data.
   */
  discardAllDrafts: (gridApi: any) => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Composable hook that adds dirty-row tracking to any component that wraps an
 * AG Grid.  It records the original entity snapshot on first edit so that
 * `discardAllDrafts` can restore every modified cell to its initial value.
 */
export function useDirtyTracking<T extends Record<string, any>>(
  options: DirtyTrackingOptions<T>,
): DirtyTrackingResult {
  const { getEntityId, onUnsavedChangesChange } = options;

  // Set of entity IDs that have been edited but not yet saved
  const [dirtyItems, setDirtyItems] = useState<Set<string>>(new Set());

  // Current (post-edit) entity data for each dirty ID
  const dirtyItemDataRef = useRef<Map<string, T>>(new Map());

  // Original entity snapshots captured before the first edit per entity
  const originalItemDataRef = useRef<Map<string, T>>(new Map());

  // Notify parent whenever the dirty count changes
  useEffect(() => {
    onUnsavedChangesChange?.(dirtyItems.size > 0);
  }, [dirtyItems.size, onUnsavedChangesChange]);

  const handleCellValueChanged = useCallback(
    (event: any) => {
      const entity = event.data as T | undefined;
      if (!entity) return;

      const entityId = getEntityId(entity);
      if (!entityId) return;

      // Capture original snapshot before the first edit on this entity
      if (!originalItemDataRef.current.has(entityId)) {
        const fieldName = event.colDef?.field as string | undefined;
        const original = fieldName
          ? ({ ...entity, [fieldName]: event.oldValue } as T)
          : ({ ...entity } as T);
        originalItemDataRef.current.set(entityId, structuredClone(original));
      }

      // Mark entity as dirty
      setDirtyItems((prev) => new Set(prev).add(entityId));
      dirtyItemDataRef.current.set(entityId, entity);
    },
    [getEntityId],
  );

  const saveAllDrafts = useCallback(() => {
    setDirtyItems(new Set());
    dirtyItemDataRef.current.clear();
    originalItemDataRef.current.clear();
    onUnsavedChangesChange?.(false);
  }, [onUnsavedChangesChange]);

  const discardAllDrafts = useCallback(
    (gridApi: any) => {
      if (gridApi) {
        gridApi.forEachNode((rowNode: any) => {
          const entity = rowNode.data as T | undefined;
          if (!entity) return;
          const entityId = getEntityId(entity);
          const original = originalItemDataRef.current.get(entityId);
          if (original) {
            Object.assign(entity, original);
          }
        });
        gridApi.refreshCells({ force: true });
      }

      setDirtyItems(new Set());
      dirtyItemDataRef.current.clear();
      originalItemDataRef.current.clear();
      onUnsavedChangesChange?.(false);
    },
    [getEntityId, onUnsavedChangesChange],
  );

  return {
    dirtyCount: dirtyItems.size,
    hasUnsavedChanges: dirtyItems.size > 0,
    handleCellValueChanged,
    saveAllDrafts,
    discardAllDrafts,
  };
}
