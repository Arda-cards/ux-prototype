import type {
  ColTypeDef,
  DataTypeDefinition,
  KeyCreatorParams,
  ObjectDataTypeDefinition,
} from 'ag-grid-community';
import type { CustomCellRendererProps } from 'ag-grid-react';

import { TokenList } from '@/components/canary/molecules/token-list/token-list';
import {
  createMultiSelectCellEditor,
  type MultiSelectCellEditorConfig,
} from '@/components/canary/molecules/typeahead-input/multiselect-cell-editor';
import {
  createTypeaheadCellEditor,
  type TypeaheadCellEditorConfig,
} from '@/components/canary/molecules/typeahead-input/typeahead-cell-editor';

// --- Types ---

/**
 * Config for a token cell data type. The entire typeahead / multiselect surface
 * passes straight through `editor` — `lookup` (async fn OR static list),
 * `maxResults`, `placeholder`, plus `defaultOne` (multi) and `allowCreate` +
 * `clearOnFocus` (single). The data type adds the value round trip; it does not
 * restrict the editor.
 */
export type TokenDataTypeConfig =
  | {
      multiple: true;
      editor: MultiSelectCellEditorConfig;
      /** Badge variant: filled (multi) or outline (single), by convention. */
      variant?: 'secondary' | 'outline';
      /** Closed list for paste validation. Defaults to a static `editor.lookup`. */
      validValues?: string[];
    }
  | {
      multiple: false;
      editor: TypeaheadCellEditorConfig;
      variant?: 'secondary' | 'outline';
      validValues?: string[];
    };

export interface TokenDataType {
  /** Value round trip — drives copy/paste, bulk paste, fill-down, and export. */
  dataType: DataTypeDefinition;
  /** Renderer + editor + filter/group key — referenced by the data type by name. */
  columnType: ColTypeDef;
}

// --- Helpers ---

/** value -> display string. Array joins with ", "; scalar passes through. */
const toText = (value: unknown): string =>
  Array.isArray(value)
    ? value.join(', ')
    : value === null || value === undefined
      ? ''
      : String(value);

/** Pull a static option list out of an `editor.lookup` (string[] or {value}[]). */
function staticOptions(lookup: TokenDataTypeConfig['editor']['lookup']): string[] | undefined {
  if (!Array.isArray(lookup)) return undefined;
  return (lookup as Array<string | { value: string }>).map((o) =>
    typeof o === 'string' ? o : o.value,
  );
}

// --- Factory ---

/**
 * Creates the two halves of a "tokens" cell data type — single- or multi-select
 * — bound by a renderer ({@link TokenList}), an editor (typeahead / multiselect),
 * and a value <-> string round trip. Register the returned `dataType` under a
 * `cellDataType` name and the `columnType` under the matching `columnTypes` key:
 *
 * ```tsx
 * const roles = createTokenDataType({
 *   multiple: true,
 *   editor: { lookup: ROLE_OPTIONS, placeholder: 'Select roles…', defaultOne: true },
 * });
 * const columnTypes = { rolesColType: roles.columnType };
 * const dataTypeDefinitions = { roles: { ...roles.dataType, columnTypes: 'rolesColType' } };
 * // column: { field: 'roles', editable: true, cellDataType: 'roles' }
 * ```
 */
export function createTokenDataType(config: TokenDataTypeConfig): TokenDataType {
  // Full passthrough — every typeahead / multiselect prop is honored.
  const editor = config.multiple
    ? createMultiSelectCellEditor(config.editor)
    : createTypeaheadCellEditor(config.editor);

  // Paste/fill validation list: an explicit `validValues`, else a static
  // `lookup` array. With an async `lookup` function there is no synchronous
  // list, so paste shape-parses and option validation is deferred.
  const closedList = config.validValues ?? staticOptions(config.editor.lookup);

  // string -> value. When a closed list exists, junk is rejected.
  const parse = (text: string | null | undefined): string[] | string | null => {
    if (!text) return null;
    let parts = String(text)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (closedList) parts = parts.filter((p) => closedList.includes(p));
    if (parts.length === 0) return null;
    return config.multiple ? parts : (parts[0] ?? null);
  };

  function TokenCellRenderer(p: CustomCellRendererProps) {
    const values = Array.isArray(p.value)
      ? (p.value as string[])
      : p.value
        ? [String(p.value)]
        : [];
    return <TokenList values={values} {...(config.variant ? { variant: config.variant } : {})} />;
  }
  TokenCellRenderer.displayName = 'TokenCellRenderer';

  const columnType: ColTypeDef = {
    cellRenderer: TokenCellRenderer,
    cellEditor: editor,
    // Both render as popup editors ('over' the cell): the multi-select grows
    // downward as tokens wrap, and both match the cell width with a min-width
    // floor so narrow columns stay usable. An inline editor is locked to the
    // cell box, so a popup is required for the consistent, cell-matched look.
    cellEditorPopup: true,
    keyCreator: (p: KeyCreatorParams) => toText(p.value),
  };

  // Object data type. AG Grid passes "lite" params here (no row data/node, e.g.
  // from the Set Filter), so the formatter/parser read only `value`/`newValue`.
  const dataType: ObjectDataTypeDefinition<unknown, string[] | string, unknown> = {
    baseDataType: 'object',
    extendsDataType: 'object',
    valueFormatter: (p) => toText(p.value),
    valueParser: (p) => parse(p.newValue),
    // `columnTypes` (the binding name) is assigned at registration.
  };

  return { columnType, dataType };
}
