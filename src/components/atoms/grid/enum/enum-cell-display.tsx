/** Design-time configuration for enum cell display. */
export interface EnumCellDisplayStaticConfig<V extends string> {
  /* --- View / Layout / Controller --- */
  /** Mapping from enum value to human-readable display label. */
  options: Readonly<Record<V, string>>;
}

/** Runtime configuration for enum cell display. */
export interface EnumCellDisplayRuntimeConfig<V extends string> {
  /* --- Model / Data Binding --- */
  /** The enum value to display. */
  value?: V;
}

export interface ArdaEnumCellDisplayProps<V extends string>
  extends EnumCellDisplayStaticConfig<V>, EnumCellDisplayRuntimeConfig<V> {}

/** Compact read-only enum renderer for AG Grid cells. */
export function ArdaEnumCellDisplay<V extends string>({
  value,
  options,
}: ArdaEnumCellDisplayProps<V>) {
  let display: string;
  if (value === undefined || value === null) {
    display = '—';
  } else if (value in options) {
    display = options[value];
  } else {
    console.warn(`EnumCellDisplay: value "${value}" not found in options`);
    display = value;
  }

  return <span className="truncate text-sm leading-normal">{display}</span>;
}
