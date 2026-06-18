// Pure state model for ItemCardEditor.
//
// Holds the data types and the mirror-state machine that decides what the
// next `ItemCardFields` value is for a given field edit. Lives in a `.ts`
// file (not `.tsx`) so the rendering layer can stay focused on JSX and DOM
// wiring; consumers and tests can exercise the state transitions without
// mounting the React tree.

/** Field values for the item card. */
export interface ItemCardFields {
  title: string;
  minQty: string;
  minUnit: string;
  orderQty: string;
  orderUnit: string;
  imageUrl: string | null;
  accentColor: string;
}

// Field-key constants. The MIN→ORDER mirror state machine compares `key`
// equality against these literals; defining them once keeps the runtime
// checks and the `ItemCardFields` interface in sync if a field is ever
// renamed.
export const MIN_QTY = 'minQty' as const satisfies keyof ItemCardFields;
export const MIN_UNIT = 'minUnit' as const satisfies keyof ItemCardFields;
export const ORDER_QTY = 'orderQty' as const satisfies keyof ItemCardFields;
export const ORDER_UNIT = 'orderUnit' as const satisfies keyof ItemCardFields;

/**
 * Per-cell "user has manually diverged ORDER from MINIMUM" tracking. While
 * a side is `false`, MINIMUM edits auto-mirror into ORDER; once `true`, the
 * two cells stay independent until the editor's `formInstanceKey` changes.
 */
export interface OrderTouchedState {
  qty: boolean;
  unit: boolean;
}

/**
 * Derive touched state from a `fields` snapshot. Used for the initial seed
 * and whenever the editor reseeds on `formInstanceKey` change: cells whose
 * MIN and ORDER values match are treated as still-linked; cells that differ
 * are treated as already user-diverged.
 */
export function deriveOrderTouched(fields: ItemCardFields): OrderTouchedState {
  return {
    qty: fields.minQty !== fields.orderQty,
    unit: fields.minUnit !== fields.orderUnit,
  };
}

/** Result of applying a single field edit. */
export interface FieldUpdateResult {
  /** Next `ItemCardFields` to publish via `onChange`. */
  fields: ItemCardFields;
  /** Updated touched state to carry forward. */
  touched: OrderTouchedState;
}

/**
 * Compute the next fields and touched state for a single edit.
 *
 * - ORDER edits flip the matching `touched` flag once the new value differs
 *   from the current MIN counterpart.
 * - MIN edits mirror into ORDER while the matching side is still untouched;
 *   otherwise the MIN field updates alone.
 * - Any other field (title, image, color) updates straight through.
 */
export function applyFieldUpdate<K extends keyof ItemCardFields>(
  current: ItemCardFields,
  touched: OrderTouchedState,
  key: K,
  value: ItemCardFields[K],
): FieldUpdateResult {
  // ORDER edits: mark the matching cell as diverged once the user changes
  // it to a value that differs from the current MINIMUM.
  let nextTouched = touched;
  if (key === ORDER_QTY && value !== current.minQty) {
    nextTouched = { ...touched, qty: true };
  } else if (key === ORDER_UNIT && value !== current.minUnit) {
    nextTouched = { ...touched, unit: true };
  }

  // MINIMUM edits: auto-mirror into ORDER while the matching cell is still
  // linked. The `typeof` check narrows the generic `value` to `string` so
  // the mirrored writes are type-safe without a cast.
  if (key === MIN_QTY && !nextTouched.qty && typeof value === 'string') {
    return {
      fields: { ...current, minQty: value, orderQty: value },
      touched: nextTouched,
    };
  }
  if (key === MIN_UNIT && !nextTouched.unit && typeof value === 'string') {
    return {
      fields: { ...current, minUnit: value, orderUnit: value },
      touched: nextTouched,
    };
  }

  return {
    fields: { ...current, [key]: value },
    touched: nextTouched,
  };
}

/** Default empty fields for creating a new item. */
export const EMPTY_ITEM_CARD_FIELDS: ItemCardFields = {
  title: '',
  minQty: '',
  minUnit: '',
  orderQty: '',
  orderUnit: '',
  imageUrl: null,
  accentColor: 'GRAY',
};
