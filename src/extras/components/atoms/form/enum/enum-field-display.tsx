import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for enum field display. */
export interface EnumFieldDisplayStaticConfig<V extends string> extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Mapping from enum value to human-readable display label. */
  options: Readonly<Record<V, string>>;
}

/** Runtime configuration for enum field display. */
export interface EnumFieldDisplayRuntimeConfig<V extends string> {
  /* --- Model / Data Binding --- */
  /** The enum value to display. */
  value?: V;
}

export interface ArdaEnumFieldDisplayProps<V extends string>
  extends EnumFieldDisplayStaticConfig<V>, EnumFieldDisplayRuntimeConfig<V> {}

/** Read-only enum display for form fields. */
export function ArdaEnumFieldDisplay<V extends string>({
  value,
  options,
  label,
  labelPosition,
}: ArdaEnumFieldDisplayProps<V>) {
  let display: string;
  if (value === undefined || value === null) {
    display = '—';
  } else if (value in options) {
    display = options[value];
  } else {
    console.warn(`EnumFieldDisplay: value "${value}" not found in options`);
    display = value;
  }

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        {display}
      </div>
    </FieldLabel>
  );
}
