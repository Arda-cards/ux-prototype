/**
 * Configuration DSL types for the AbstractEntityViewer.
 *
 * The entity viewer uses a two-phase configuration model:
 * - **DesignConfig** is provided once at component creation (factory time).
 * - **MountConfig** is provided at render time and can vary per mount site.
 *
 * All properties are readonly to enforce immutability of configuration objects.
 */

import type { AtomProps } from '@/lib/data-types/atom-types';

// ============================================================================
// Primitive Type Aliases
// ============================================================================

/** The three viewer modes: displaying data, editing data, or showing errors. */
export type ViewerMode = 'display' | 'edit' | 'errored';

/** Layout strategies for field arrangement. */
export type LayoutMode = 'continuous-scroll' | 'stepped';

// ============================================================================
// Error & Validation Types
// ============================================================================

/** A single validation or update error. */
export interface ViewerError {
  /** Human-readable error message. */
  readonly message: string;
  /** Dot-path to the field that caused the error, if field-specific. */
  readonly fieldPath?: string;
}

/** Aggregated validation result returned by the validate callback. */
export interface ValidationResult {
  /** Errors associated with individual fields. */
  readonly fieldErrors: readonly ViewerError[];
  /** Errors that apply to the entity as a whole. */
  readonly entityErrors: readonly ViewerError[];
}

/** Result returned by the update callback after a save attempt. */
export interface UpdateResult<T> {
  /** The persisted (or rolled-back) entity. */
  readonly entity: T;
  /** Errors returned by the server, if any. */
  readonly errors?: readonly ViewerError[];
}

// ============================================================================
// Tab Configuration
// ============================================================================

/** Defines a single tab in the stepped layout. */
export interface TabConfig {
  /** Unique programmatic name for the tab. */
  readonly name: string;
  /** Human-readable label displayed in the tab header. */
  readonly label: string;
  /** Field keys assigned to this tab. */
  readonly fieldKeys: readonly string[];
  /** Sort order (lower values appear first). */
  readonly order: number;
}

// ============================================================================
// Field Descriptor
// ============================================================================

/** Describes a single field's rendering and behavior within the viewer. */
export interface FieldDescriptor<V> {
  /** The atom component used to render this field. */
  readonly component: React.ComponentType<AtomProps<V>>;
  /** Human-readable label for the field. */
  readonly label: string;
  /** Placeholder text shown when the field value is empty. */
  readonly placeholder?: string;
  /** Whether this field is editable when the viewer is in edit mode. */
  readonly editable: boolean;
  /** Tab name this field belongs to (stepped layout only). */
  readonly tabName?: string;
  /** Whether this field is visible. */
  readonly visible: boolean;
  /** Per-field validation returning an error message or undefined if valid. */
  readonly validate?: (value: V) => string | undefined;
}

// ============================================================================
// Design-Time Configuration (Factory)
// ============================================================================

/**
 * Configuration provided once at component creation time.
 * Defines entity-level callbacks and default mount overrides.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 */
export interface DesignConfig<T> {
  /** Validates the entity, comparing previous and updated states. */
  readonly validate: (previous: T, updated: T) => ValidationResult;
  /** Fetches an entity by its ID. */
  readonly get: (entityId: string) => Promise<T>;
  /** Persists changes to an entity. */
  readonly update: (entityId: string, original: T, updated: T) => Promise<UpdateResult<T>>;
  /** Creates a new default entity instance. */
  readonly newInstance: () => T;
  /** Called when the viewer enters edit mode. */
  readonly onEnterEdit?: (entity: T) => void;
  /** Called when submitting fails with validation or server errors. */
  readonly onExitWithErrors?: (errors: ViewerError[]) => void;
  /** Called after a successful save. */
  readonly onExitWithSuccess?: (entity: T) => void;
  /** Defaults merged into every MountConfig for this viewer. */
  readonly defaultMountConfig?: Partial<MountConfig<T>>;
}

// ============================================================================
// Mount-Time Configuration (Render Site)
// ============================================================================

/**
 * Configuration provided at each render site.
 * Controls layout, editability, field visibility/order, and tab assignment.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 */
export interface MountConfig<T> {
  /** Layout strategy for field arrangement. */
  readonly layoutMode: LayoutMode;
  /** Whether the viewer starts in edit mode. */
  readonly editable: boolean;
  /** ID of an existing entity to load, or omit for a new instance. */
  readonly entityId?: string;
  /** Title displayed at the top of the viewer. */
  readonly title: string;
  /** Per-field visibility overrides. */
  readonly fieldVisibility?: Partial<Record<keyof T, boolean>>;
  /** Ordered list of field keys controlling display order. */
  readonly fieldOrder?: (keyof T)[];
  /** Assigns fields to named tabs (stepped layout). */
  readonly tabAssignment?: Partial<Record<keyof T, string>>;
  /**
   * Per-field component overrides for heterogeneous field types.
   *
   * Uses `React.ComponentType<any>` because each field may accept a different
   * value type V, and there is no single generic that unifies them at the
   * record level.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly viewerSelection?: Partial<Record<keyof T, React.ComponentType<any>>>;
  /** Per-field editability overrides. */
  readonly fieldEditability?: Partial<Record<keyof T, boolean>>;
  /** Label for the submit/save button. */
  readonly submitLabel?: string;
  /** Called when the user attempts to navigate away with unsaved changes. */
  readonly onDirtyNavigate?: (discard: () => void, cancel: () => void) => void;
  /** Tab definitions for the stepped layout. */
  readonly tabs?: readonly TabConfig[];
}

// ============================================================================
// Viewer State & Actions (Hook API)
// ============================================================================

/**
 * Internal state managed by the useEntityViewer hook.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 */
export interface EntityViewerState<T> {
  /** Current viewer mode. */
  readonly mode: ViewerMode;
  /** Immutable reference copy of the entity as loaded/saved. */
  readonly original: T | null;
  /** Working copy that accumulates edits. */
  readonly current: T | null;
  /** Field-level validation errors. */
  readonly fieldErrors: readonly ViewerError[];
  /** Entity-level validation errors. */
  readonly entityErrors: readonly ViewerError[];
  /** Whether the working copy differs from the original. */
  readonly isDirty: boolean;
  /** Whether an async operation (load/save) is in progress. */
  readonly isLoading: boolean;
  /** Active tab index for stepped layout. */
  readonly currentTabIndex: number;
}

/**
 * Actions exposed by the useEntityViewer hook.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 */
export interface EntityViewerActions<T> {
  /** Transition to edit mode. */
  enterEditMode: () => void;
  /** Discard edits and return to display mode. */
  cancelEdit: () => void;
  /** Run validation and, if clean, persist changes. */
  validateAndSubmit: () => Promise<void>;
  /** Update a single field value on the working copy. */
  handleFieldChange: <K extends keyof T>(fieldKey: K, value: T[K]) => void;
  /** Navigate to a tab by index; returns false if validation prevents it. */
  navigateToTab: (tabIndex: number) => Promise<boolean>;
  /** Clear displayed errors. */
  dismissErrors: () => void;
}

// ============================================================================
// Sub-Viewer Props
// ============================================================================

/**
 * Props for sub-viewer components that extend the base atom interface
 * with viewer-specific capabilities.
 *
 * @typeParam V - The field value type.
 */
export interface SubViewerProps<V> extends AtomProps<V> {
  /** Whether the sub-viewer section starts collapsed. */
  readonly defaultCollapsed?: boolean;
  /** Programmatically trigger validation on this sub-viewer. */
  readonly triggerValidation?: () => void;
  /** Report validation results back to the parent viewer. */
  readonly onValidationResult?: (errors: ViewerError[]) => void;
}
