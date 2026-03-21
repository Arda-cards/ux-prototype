export { createEntityDataGrid } from './create-entity-data-grid';
export type {
  EntityDataGridConfig,
  EntityDataGridModelProps,
  EntityDataGridViewProps,
  EntityDataGridProps,
  EntityDataGridRef,
  PaginationMode,
} from './create-entity-data-grid';

export { useRowAutoPublish } from './use-row-auto-publish';
export type {
  PendingChanges,
  RowEditState,
  RowAutoPublishHandle,
  UseRowAutoPublishOptions,
} from './use-row-auto-publish';

// useDirtyTracking is kept for internal compatibility but removed from the primary API.
// New code should use useRowAutoPublish.
export { useDirtyTracking } from './use-dirty-tracking';
export type { DirtyTrackingOptions, DirtyTrackingResult } from './use-dirty-tracking';
