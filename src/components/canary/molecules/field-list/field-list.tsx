import { cn } from '@/types/canary/utilities/utils';
import { ReadOnlyField } from '../../atoms/read-only-field/read-only-field';

// --- Interfaces ---

/** A single field definition for the field list. */
export interface FieldDef {
  /** Unique key for React list rendering. */
  key: string;
  /** Field label. */
  label: string;
  /** Field value (plain text). */
  value?: string;
  /** Custom render for the value. Overrides `value`. */
  children?: React.ReactNode;
}

export interface ArdaFieldListProps {
  /* --- Model / Data Binding --- */
  /** Fields to display as label/value pairs. */
  fields: FieldDef[];
  /* --- View / Layout / Controller --- */
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

/**
 * ArdaFieldList — renders a list of read-only label/value fields with dividers.
 *
 * Data-driven: pass a `fields[]` array. Each field renders as a ReadOnlyField.
 * For custom value rendering (links, formatted numbers), use the `children` property.
 */
export function ArdaFieldList({ fields, className }: ArdaFieldListProps) {
  if (fields.length === 0) return null;

  return (
    <div className={cn('divide-y divide-border/60 px-5', className)}>
      {fields.map((field) => (
        <div key={field.key} className="py-3">
          <ReadOnlyField label={field.label} value={field.value}>
            {field.children}
          </ReadOnlyField>
        </div>
      ))}
    </div>
  );
}
