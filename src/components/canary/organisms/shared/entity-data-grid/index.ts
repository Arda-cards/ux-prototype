// Canonical: ConnectedDataGrid (DQ-008) — the stateful container.
export { createConnectedDataGrid } from './create-entity-data-grid';
export type {
  ConnectedDataGridConfig,
  ConnectedDataGridModelProps,
  ConnectedDataGridViewProps,
  ConnectedDataGridProps,
  ConnectedDataGridRef,
  ForwardedDataGridProps,
  OwnedByContainer,
  EntityDataSource,
  BlockRequest,
  PaginationMode,
} from './create-entity-data-grid';

// Deprecated aliases — kept so existing callers compile untouched.
export { createEntityDataGrid } from './create-entity-data-grid';
export type {
  EntityDataGridConfig,
  EntityDataGridModelProps,
  EntityDataGridViewProps,
  EntityDataGridProps,
  EntityDataGridRef,
} from './create-entity-data-grid';

// Bulk write path — the commit pipeline (DQ-003 / DQ-004).
export { useCommitPipeline } from './use-commit-pipeline';
export type {
  RowChange,
  CommitResult,
  CommitPipelineHandle,
  UseCommitPipelineOptions,
} from './use-commit-pipeline';

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
