/**
 * EntityViewerShell — the rendering layer for the AbstractEntityViewer.
 *
 * Receives pre-computed state and actions from the hook (via the factory) and
 * renders fields, navigation controls, error panels, and sub-viewer containers
 * according to the configured layout mode.
 *
 * @module
 */

import { useState, useCallback } from 'react';

import type {
  DesignConfig,
  MountConfig,
  EntityViewerState,
  EntityViewerActions,
  FieldDescriptor,
  TabConfig,
  ViewerMode,
} from './types';
import type { AtomMode } from '@/lib/data-types/atom-types';

// ============================================================================
// Props
// ============================================================================

/**
 * Props accepted by the EntityViewerShell component.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 */
export interface EntityViewerShellProps<T> {
  /** Factory-time configuration (callbacks & defaults). */
  readonly designConfig: DesignConfig<T>;
  /** Render-site configuration (layout, visibility, etc.). */
  readonly mountConfig: MountConfig<T>;
  /** Current viewer state from the hook. */
  readonly state: EntityViewerState<T>;
  /** Available actions from the hook. */
  readonly actions: EntityViewerActions<T>;
  /** Per-field rendering and behavior descriptors. */
  readonly fieldDescriptors?: Partial<Record<string, FieldDescriptor<unknown>>>;
}

// ============================================================================
// Sub-components
// ============================================================================

/** Chevron icon that rotates based on collapsed state. */
function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <span
      className="inline-block transition-transform duration-150"
      style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
      aria-hidden="true"
    >
      ▶
    </span>
  );
}

/** Collapsible wrapper for sub-viewer fields. */
function SubViewerContainer({
  label,
  defaultCollapsed = true,
  children,
}: {
  label: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="border border-gray-200 rounded-lg ml-4">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full p-3 text-left font-medium text-sm hover:bg-gray-50 rounded-t-lg"
      >
        <ChevronIcon collapsed={collapsed} />
        <span>{label}</span>
      </button>
      {!collapsed && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

/** Step indicator for the stepped layout. */
function StepIndicator({
  tabs,
  currentIndex,
  onStepClick,
}: {
  tabs: readonly TabConfig[];
  currentIndex: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <nav className="flex items-center gap-2 mb-4" aria-label="Steps">
      {tabs.map((tab, i) => {
        const isCurrent = i === currentIndex;
        const isPast = i < currentIndex;
        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => onStepClick(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isCurrent
                ? 'bg-blue-600 text-white'
                : isPast
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs border border-current">
              {i + 1}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

/** Error panel showing entity-level and field error summaries. */
function ErrorPanel({
  entityErrors,
  fieldErrorCount,
  onDismiss,
}: {
  entityErrors: readonly { message: string }[];
  fieldErrorCount: number;
  onDismiss: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4" role="alert">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {entityErrors.map((err, i) => (
            <p key={i} className="text-red-600 text-sm">
              {err.message}
            </p>
          ))}
          {fieldErrorCount > 0 && (
            <p className="text-red-600 text-sm">
              {fieldErrorCount} field{fieldErrorCount !== 1 ? 's have' : ' has'} errors. Please
              review the highlighted fields below.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-600 text-sm font-medium shrink-0"
          aria-label="Dismiss errors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Field Rendering
// ============================================================================

/** Determine the atom mode from the viewer mode. */
function toAtomMode(viewerMode: ViewerMode): AtomMode {
  if (viewerMode === 'display') return 'display';
  if (viewerMode === 'errored') return 'error';
  return 'edit';
}

/** Check whether a descriptor has sub-viewer traits (defaultCollapsed property in component). */
function isSubViewerDescriptor(descriptor: FieldDescriptor<unknown>): boolean {
  // Sub-viewer components declare defaultCollapsed in their propTypes or defaultProps.
  // We use a simple heuristic: the descriptor itself may carry a hint, or we check
  // the component's displayName/name for "SubViewer" or "Viewer".
  const name = descriptor.component.displayName ?? descriptor.component.name ?? '';
  return name.toLowerCase().includes('viewer') || name.toLowerCase().includes('subviewer');
}

/**
 * Renders a single field based on its descriptor and current state.
 */
function FieldRenderer<T>({
  fieldKey,
  descriptor,
  state,
  actions,
}: {
  fieldKey: string;
  descriptor: FieldDescriptor<unknown>;
  state: EntityViewerState<T>;
  actions: EntityViewerActions<T>;
}) {
  const isFieldEditable =
    descriptor.editable && (state.mode === 'edit' || state.mode === 'errored');
  const atomMode = toAtomMode(state.mode);
  const entity = (state.mode === 'display' ? state.original : state.current) as Record<
    string,
    unknown
  > | null;
  const fieldValue = entity?.[fieldKey];
  const fieldErrors = state.fieldErrors
    .filter((e) => e.fieldPath === fieldKey)
    .map((e) => e.message);
  const effectiveMode: AtomMode = fieldErrors.length > 0 ? 'error' : atomMode;

  const Component = descriptor.component;

  const handleChange = useCallback(
    (_original: unknown, current: unknown) => {
      actions.handleFieldChange(fieldKey as keyof T, current as T[keyof T]);
    },
    [actions, fieldKey],
  );

  const rendered = (
    <Component
      value={fieldValue}
      onChange={handleChange}
      mode={effectiveMode}
      editable={isFieldEditable}
      errors={fieldErrors}
      label={descriptor.label}
    />
  );

  if (isSubViewerDescriptor(descriptor)) {
    return (
      <SubViewerContainer label={descriptor.label} defaultCollapsed={true}>
        {rendered}
      </SubViewerContainer>
    );
  }

  return rendered;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * EntityViewerShell renders the entity viewer UI.
 *
 * It supports two layout modes:
 * - **stepped**: Tab-based navigation with step indicators, Next/Back/Done buttons.
 * - **continuous-scroll**: All fields in a single scrollable column.
 *
 * The shell does not manage state — it receives `state` and `actions` from the
 * parent (created by `useEntityViewer`).
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 */
export function EntityViewerShell<T>({
  mountConfig,
  state,
  actions,
  fieldDescriptors,
}: EntityViewerShellProps<T>) {
  const isStepped = mountConfig.layoutMode === 'stepped';
  const tabs = mountConfig.tabs;
  const isEditable = mountConfig.editable;

  // Derive ordered field keys
  const fieldOrder: string[] =
    (mountConfig.fieldOrder as string[] | undefined) ??
    (fieldDescriptors ? Object.keys(fieldDescriptors) : []);

  // Determine which fields are visible on the current tab (stepped) or all (continuous)
  const visibleFieldKeys =
    isStepped && tabs && tabs.length > 0
      ? ((tabs[state.currentTabIndex]?.fieldKeys ?? []) as string[])
      : fieldOrder;

  const handleStepClick = useCallback(
    (index: number) => {
      void actions.navigateToTab(index);
    },
    [actions],
  );

  const handleNext = useCallback(() => {
    void actions.navigateToTab(state.currentTabIndex + 1);
  }, [actions, state.currentTabIndex]);

  const handleBack = useCallback(() => {
    void actions.navigateToTab(state.currentTabIndex - 1);
  }, [actions, state.currentTabIndex]);

  const handleSubmit = useCallback(() => {
    void actions.validateAndSubmit();
  }, [actions]);

  // Loading overlay
  if (state.isLoading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">{mountConfig.title}</h2>
        <div className="flex items-center justify-center py-12 text-gray-400">Loading…</div>
      </div>
    );
  }

  const isLastTab = isStepped && tabs ? state.currentTabIndex === tabs.length - 1 : false;
  const isFirstTab = state.currentTabIndex === 0;

  return (
    <div className="p-4 space-y-4">
      {/* Title (R2.30) */}
      <h2 className="text-lg font-semibold">{mountConfig.title}</h2>

      {/* Error Panel (R2.29) */}
      {state.mode === 'errored' && (
        <ErrorPanel
          entityErrors={state.entityErrors}
          fieldErrorCount={state.fieldErrors.length}
          onDismiss={actions.dismissErrors}
        />
      )}

      {/* Step Indicator — stepped layout only (R2.21) */}
      {isStepped && tabs && tabs.length > 0 && (
        <StepIndicator
          tabs={tabs}
          currentIndex={state.currentTabIndex}
          onStepClick={handleStepClick}
        />
      )}

      {/* Fields (R2.24) */}
      <div className="space-y-4">
        {visibleFieldKeys.map((key) => {
          const descriptor = fieldDescriptors?.[key];
          if (!descriptor || !descriptor.visible) return null;

          return (
            <FieldRenderer<T>
              key={key}
              fieldKey={key}
              descriptor={descriptor}
              state={state}
              actions={actions}
            />
          );
        })}
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        {/* Edit button — display mode, editable viewer */}
        {state.mode === 'display' && isEditable && (
          <button
            type="button"
            onClick={actions.enterEditMode}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Edit
          </button>
        )}

        {/* Cancel button — edit or errored mode */}
        {(state.mode === 'edit' || state.mode === 'errored') && (
          <button
            type="button"
            onClick={actions.cancelEdit}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}

        {/* Stepped navigation: Back / Next / Done (R2.21) */}
        {isStepped && tabs && (state.mode === 'edit' || state.mode === 'errored') && (
          <>
            {!isFirstTab && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {!isLastTab && (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Next
              </button>
            )}
            {isLastTab && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
              >
                Done
              </button>
            )}
          </>
        )}

        {/* Continuous-scroll: Submit button (R2.22) — also visible in errored mode for re-submit */}
        {!isStepped && (state.mode === 'edit' || state.mode === 'errored') && (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            {mountConfig.submitLabel ?? 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
