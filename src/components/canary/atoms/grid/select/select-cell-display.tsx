import { type SelectOptions, normalizeOptions } from './select-cell-editor';

/** Design-time configuration for select cell display. */
export interface SelectCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Available options. Accepts SelectOption[] or Record<string, string>. */
  options: SelectOptions;
}

/** Runtime configuration for select cell display. */
export interface SelectCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The stored value to look up and display as a label. */
  value?: string | null;
}

export interface SelectCellDisplayProps
  extends SelectCellDisplayStaticConfig, SelectCellDisplayRuntimeConfig {}

/**
 * Compact read-only renderer for AG Grid cells backed by a fixed option list.
 *
 * Looks up the stored value in the normalized options array and renders the
 * human-readable label. Falls back to the raw value for unrecognised keys, and
 * renders an em-dash for null/undefined values.
 */
export function SelectCellDisplay({ value, options }: SelectCellDisplayProps) {
  let display: string;

  if (value === undefined || value === null) {
    display = '—';
  } else {
    const normalizedOptions = normalizeOptions(options);
    const found = normalizedOptions.find((o) => o.value === value);
    if (found) {
      display = found.label;
    } else {
      display = value;
    }
  }

  return <span className="truncate text-sm leading-normal">{display}</span>;
}
