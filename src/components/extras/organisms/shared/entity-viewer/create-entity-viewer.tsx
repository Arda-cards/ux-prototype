/**
 * Factory function for the AbstractEntityViewer.
 *
 * Creates a fully-typed React component that binds a {@link DesignConfig}
 * (factory-time) to an {@link EntityViewerShell}, bridging them with the
 * {@link useEntityViewer} state-machine hook.
 *
 * Follows the same `{ Component }` return pattern as `createArdaEntityDataGrid`.
 *
 * Usage:
 * ```ts
 * const { Component: ItemViewer } = createArdaEntityViewer<Item>(designConfig, fieldDescriptors);
 * // later…
 * <ItemViewer title="Edit Item" layoutMode="continuous-scroll" editable entityId={id} />
 * ```
 *
 * @module
 */

import React, { useEffect, useMemo } from 'react';

import type { DesignConfig, MountConfig, FieldDescriptor } from './types';
import { useEntityViewer } from './use-entity-viewer';
import { EntityViewerShell } from './entity-viewer-shell';

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = '[EntityViewer]';

/** Built-in defaults applied when neither designConfig.defaultMountConfig nor mount props specify a value. */
const BUILT_IN_DEFAULTS: Pick<MountConfig<unknown>, 'editable' | 'layoutMode'> = {
  editable: false,
  layoutMode: 'continuous-scroll',
};

// ============================================================================
// Design-Time Validation
// ============================================================================

/**
 * Validates the design-time configuration at factory creation.
 * Logs console errors for missing required callbacks but does not throw.
 */
function validateDesignConfig<T>(config: DesignConfig<T>): void {
  if (typeof config.validate !== 'function') {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'validate' callback is required and must be a function (context: DesignConfig.validate)`,
    );
  }
  if (typeof config.get !== 'function') {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'get' callback is required and must be a function (context: DesignConfig.get)`,
    );
  }
  if (typeof config.update !== 'function') {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'update' callback is required and must be a function (context: DesignConfig.update)`,
    );
  }
  if (typeof config.newInstance !== 'function') {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'newInstance' callback is required and must be a function (context: DesignConfig.newInstance)`,
    );
  }
}

// ============================================================================
// Mount-Time Validation
// ============================================================================

/**
 * Validates the mount-time configuration.
 * Logs warnings/errors for missing or inconsistent properties.
 */
function validateMountConfig<T>(
  config: MountConfig<T>,
  fieldDescriptors?: Partial<Record<keyof T, FieldDescriptor<unknown>>>,
): void {
  // Required fields
  if (!config.title) {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'title' is required (context: MountConfig.title)`,
    );
  }
  if (!config.layoutMode) {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'layoutMode' is required (context: MountConfig.layoutMode)`,
    );
  }

  // Stepped layout requires tabs
  if (config.layoutMode === 'stepped' && (!config.tabs || config.tabs.length === 0)) {
    console.error(
      `${LOG_PREFIX} Configuration Error: 'tabs' must be defined when layoutMode is 'stepped' (context: MountConfig.tabs)`,
    );
  }

  // Warn about field references to non-existent fields
  if (fieldDescriptors) {
    const knownKeys = new Set(Object.keys(fieldDescriptors));

    if (config.fieldVisibility) {
      for (const key of Object.keys(config.fieldVisibility)) {
        if (!knownKeys.has(key)) {
          console.warn(
            `${LOG_PREFIX} Configuration Warning: fieldVisibility references unknown field '${key}' (context: MountConfig.fieldVisibility)`,
          );
        }
      }
    }

    if (config.fieldOrder) {
      for (const key of config.fieldOrder) {
        if (!knownKeys.has(key as string)) {
          console.warn(
            `${LOG_PREFIX} Configuration Warning: fieldOrder references unknown field '${String(key)}' (context: MountConfig.fieldOrder)`,
          );
        }
      }
    }

    if (config.tabAssignment) {
      for (const key of Object.keys(config.tabAssignment)) {
        if (!knownKeys.has(key)) {
          console.warn(
            `${LOG_PREFIX} Configuration Warning: tabAssignment references unknown field '${key}' (context: MountConfig.tabAssignment)`,
          );
        }
      }
    }
  }
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Creates a configured EntityViewer component bound to the given design-time
 * configuration and optional field descriptors.
 *
 * The returned `Component` accepts {@link MountConfig} props at each render
 * site, merging them with `designConfig.defaultMountConfig` and built-in
 * defaults.
 *
 * @typeParam T - The entity type whose fields the viewer manages.
 *
 * @param designConfig      Factory-time configuration (callbacks, defaults).
 * @param fieldDescriptors  Optional per-field descriptors for validation and rendering.
 *
 * @returns An object containing the configured `Component`.
 *
 * @example
 * ```tsx
 * const { Component: ItemViewer } = createArdaEntityViewer<Item>(
 *   itemDesignConfig,
 *   itemFieldDescriptors,
 * );
 *
 * function ItemPage({ id }: { id: string }) {
 *   return (
 *     <ItemViewer
 *       title="Item Details"
 *       layoutMode="continuous-scroll"
 *       editable
 *       entityId={id}
 *     />
 *   );
 * }
 * ```
 */
export function createArdaEntityViewer<T>(
  designConfig: DesignConfig<T>,
  fieldDescriptors?: Partial<Record<keyof T, FieldDescriptor<unknown>>>,
): { Component: React.ComponentType<MountConfig<T>> } {
  // ---- Design-time validation (runs once at factory creation) ----
  validateDesignConfig(designConfig);

  // ---- Inner component -------------------------------------------
  function ArdaEntityViewer(props: MountConfig<T>) {
    // Merge: built-in defaults < designConfig.defaultMountConfig < mount props
    const mergedConfig = useMemo<MountConfig<T>>(
      () =>
        ({
          ...BUILT_IN_DEFAULTS,
          ...designConfig.defaultMountConfig,
          ...props,
        }) as MountConfig<T>,
      [props],
    );

    // Mount-time validation (runs once on mount)
    useEffect(() => {
      validateMountConfig(mergedConfig, fieldDescriptors);
      // Only validate on mount, not on every re-render.
    }, []);

    // Drive the state machine
    const { state, actions } = useEntityViewer<T>(designConfig, mergedConfig, fieldDescriptors);

    // Build shell props — only include fieldDescriptors if defined
    // (exactOptionalPropertyTypes does not allow passing `undefined` for optional props)
    const shellProps = {
      designConfig,
      mountConfig: mergedConfig,
      state,
      actions,
      ...(fieldDescriptors !== null &&
        fieldDescriptors !== undefined && {
          fieldDescriptors: fieldDescriptors as Partial<Record<string, FieldDescriptor<unknown>>>,
        }),
    };

    return <EntityViewerShell<T> {...shellProps} />;
  }

  ArdaEntityViewer.displayName = 'ArdaEntityViewer';

  return { Component: ArdaEntityViewer };
}
