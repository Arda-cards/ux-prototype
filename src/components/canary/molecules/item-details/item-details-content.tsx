import { cn } from '@/lib/utils';
import { ArdaDetailField } from '../../atoms/detail-field/detail-field';

// --- Interfaces ---

/** A single field definition for the detail content section. */
export interface DetailFieldDef {
  /** Unique key for React list rendering. */
  key: string;
  /** Field label. */
  label: string;
  /** Field value (plain text). */
  value?: string;
  /** Custom render for the value. Overrides `value`. */
  children?: React.ReactNode;
}

export interface ArdaItemDetailsContentProps {
  /* --- Model / Data Binding --- */
  /** Fields to display as label/value pairs. */
  fields: DetailFieldDef[];
  /* --- View / Layout / Controller --- */
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

/**
 * ArdaItemDetailsContent — renders a list of label/value detail fields.
 *
 * Data-driven: pass a `fields[]` array. Each field renders as an ArdaDetailField.
 * For custom value rendering (links, formatted numbers), use the `children` property.
 */
export function ArdaItemDetailsContent({ fields, className }: ArdaItemDetailsContentProps) {
  if (fields.length === 0) return null;

  return (
    <div className={cn('divide-y divide-border/60 px-5', className)}>
      {fields.map((field) => (
        <div key={field.key} className="py-3">
          <ArdaDetailField label={field.label} value={field.value}>
            {field.children}
          </ArdaDetailField>
        </div>
      ))}
    </div>
  );
}
