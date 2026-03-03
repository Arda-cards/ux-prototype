/**
 * Core state-machine hook for the AbstractEntityViewer.
 *
 * Manages the full lifecycle of viewing and editing an entity:
 * - **Edit flow** (entityId present): Get → Display → Edit → Validate → Update → re-Get → Display
 * - **Create flow** (entityId absent): NewInstance → Edit → Validate → Update → success callback
 *
 * @module
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import type {
  DesignConfig,
  MountConfig,
  EntityViewerState,
  EntityViewerActions,
  FieldDescriptor,
  ViewerError,
  ViewerMode,
} from './types';
import { validateTab } from './tab-validator';

// ============================================================================
// Helpers
// ============================================================================

/** Create a deep copy of a value, preferring structuredClone where available. */
function deepCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Determine whether we are in the "create" flow (no entityId). */
function isCreateFlow(entityId: string | undefined): boolean {
  return entityId === undefined || entityId === '';
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook that drives the entity viewer state machine.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 *
 * @param designConfig  Factory-time configuration (callbacks & defaults).
 * @param mountConfig   Render-time configuration (layout, visibility, etc.).
 * @param fieldDescriptors Optional per-field descriptors used for field-level validation.
 *
 * @returns An object containing the current `state` and available `actions`.
 */
export function useEntityViewer<T>(
  designConfig: DesignConfig<T>,
  mountConfig: MountConfig<T>,
  fieldDescriptors?: Partial<Record<keyof T, FieldDescriptor<unknown>>>,
): { state: EntityViewerState<T>; actions: EntityViewerActions<T> } {
  // ----- internal state -----------------------------------------------------

  const [mode, setMode] = useState<ViewerMode>('display');
  const [original, setOriginal] = useState<T | null>(null);
  const [current, setCurrent] = useState<T | null>(null);
  const [fieldErrors, setFieldErrors] = useState<readonly ViewerError[]>([]);
  const [entityErrors, setEntityErrors] = useState<readonly ViewerError[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  // Refs to keep stable references in callbacks without stale closures.
  const originalRef = useRef(original);
  originalRef.current = original;
  const currentRef = useRef(current);
  currentRef.current = current;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const { entityId } = mountConfig;
  const creating = isCreateFlow(entityId);

  // ----- mount: load or create entity ---------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (creating) {
        // Create flow: generate a new instance and start in edit mode.
        const instance = designConfig.newInstance();
        const copy = deepCopy(instance);
        setOriginal(instance);
        setCurrent(copy);
        setMode('edit');
      } else {
        // Edit flow: fetch the existing entity.
        setIsLoading(true);
        try {
          // entityId is guaranteed non-null in the edit flow (creating === false).
          const entity = await designConfig.get(entityId as string);
          if (cancelled) return;
          setOriginal(entity);
          setCurrent(null);
          setMode('display');
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
    // entityId is the discriminator; designConfig identity should be stable.
  }, [entityId]);

  // ----- beforeunload guard -------------------------------------------------

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ----- field-level validation helper --------------------------------------

  const runFieldValidation = useCallback((): ViewerError[] => {
    if (!fieldDescriptors || !currentRef.current) return [];

    const errors: ViewerError[] = [];
    const entity = currentRef.current as Record<string, unknown>;

    for (const [key, descriptor] of Object.entries(fieldDescriptors) as [
      string,
      FieldDescriptor<unknown> | undefined,
    ][]) {
      if (!descriptor) continue;
      if (!descriptor.visible || !descriptor.editable) continue;
      if (!descriptor.validate) continue;

      const value = entity[key];
      const message = descriptor.validate(value);
      if (message) {
        errors.push({ message, fieldPath: key });
      }
    }

    return errors;
  }, [fieldDescriptors]);

  // ----- actions ------------------------------------------------------------

  /** Transition from display → edit. */
  const enterEditMode = useCallback(() => {
    const orig = originalRef.current;
    if (!orig) return;

    const copy = deepCopy(orig);
    setCurrent(copy);
    setFieldErrors([]);
    setEntityErrors([]);
    setMode('edit');
    designConfig.onEnterEdit?.(orig);
  }, [designConfig]);

  /** Discard edits and return to display. */
  const cancelEdit = useCallback(() => {
    setCurrent(creating ? originalRef.current : null);
    setFieldErrors([]);
    setEntityErrors([]);
    setIsDirty(false);
    setMode('display');
  }, [creating]);

  /** Clear all errors and return to edit mode. */
  const dismissErrors = useCallback(() => {
    setFieldErrors([]);
    setEntityErrors([]);
    setMode('edit');
  }, []);

  /** Update a single field on the working copy. */
  const handleFieldChange = useCallback(<K extends keyof T>(fieldKey: K, value: T[K]) => {
    setCurrent((prev) => {
      if (!prev) return prev;
      return { ...prev, [fieldKey]: value };
    });
    setIsDirty(true);
  }, []);

  /** Run validation then persist changes. */
  const validateAndSubmit = useCallback(async () => {
    const orig = originalRef.current;
    const cur = currentRef.current;
    if (!orig || !cur) return;

    // 1. Field-level validation
    const fErrors = runFieldValidation();
    if (fErrors.length > 0) {
      setFieldErrors(fErrors);
      setEntityErrors([]);
      setMode('errored');
      return;
    }

    // 2. Entity-level validation
    const validation = designConfig.validate(orig, cur);
    if (validation.fieldErrors.length > 0 || validation.entityErrors.length > 0) {
      setFieldErrors(validation.fieldErrors);
      setEntityErrors(validation.entityErrors);
      setMode('errored');
      return;
    }

    // 3. Persist
    setIsLoading(true);
    try {
      const result = await designConfig.update(entityId ?? '', orig, cur);

      if (result.errors && result.errors.length > 0) {
        const allErrors = [...result.errors];
        setFieldErrors(allErrors.filter((e) => e.fieldPath));
        setEntityErrors(allErrors.filter((e) => !e.fieldPath));
        setMode('errored');
        designConfig.onExitWithErrors?.([...allErrors]);
        return;
      }

      // Success
      setIsDirty(false);

      if (creating) {
        // Create flow: notify caller of success.
        setOriginal(result.entity);
        setCurrent(null);
        setMode('display');
        designConfig.onExitWithSuccess?.(result.entity);
      } else {
        // Edit flow: re-fetch to get the canonical server state.
        // entityId is guaranteed non-null in the edit flow (creating === false).
        const refreshed = await designConfig.get(entityId as string);
        setOriginal(refreshed);
        setCurrent(null);
        setMode('display');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      const viewerError: ViewerError = { message };
      setEntityErrors([viewerError]);
      setMode('errored');
      designConfig.onExitWithErrors?.([viewerError]);
    } finally {
      setIsLoading(false);
    }
  }, [designConfig, entityId, creating, runFieldValidation]);

  /** Navigate to a tab by index, validating the current tab first. */
  const navigateToTab = useCallback(
    async (tabIndex: number): Promise<boolean> => {
      const cur = currentRef.current;
      const tabs = mountConfig.tabs;

      // If not in edit mode or no tabs, allow navigation freely.
      if (modeRef.current !== 'edit' || !tabs || !cur) {
        setCurrentTabIndex(tabIndex);
        return true;
      }

      const currentTab = tabs[currentTabIndex];
      if (!currentTab) {
        setCurrentTabIndex(tabIndex);
        return true;
      }

      // Validate fields on the current tab before leaving.
      const descriptors = (fieldDescriptors ?? {}) as Partial<
        Record<string, FieldDescriptor<unknown>>
      >;
      const errors = validateTab<T>(currentTab, cur, descriptors);
      if (errors.length > 0) {
        setFieldErrors(errors);
        return false;
      }

      setCurrentTabIndex(tabIndex);
      return true;
    },
    [mountConfig.tabs, currentTabIndex, fieldDescriptors],
  );

  // ----- assemble return value ----------------------------------------------

  const state: EntityViewerState<T> = {
    mode,
    original,
    current,
    fieldErrors,
    entityErrors,
    isDirty,
    isLoading,
    currentTabIndex,
  };

  const actions: EntityViewerActions<T> = {
    enterEditMode,
    cancelEdit,
    validateAndSubmit,
    handleFieldChange,
    navigateToTab,
    dismissErrors,
  };

  return { state, actions };
}
