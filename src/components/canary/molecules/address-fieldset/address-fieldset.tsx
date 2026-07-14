import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Input } from '@/components/canary/primitives/input';
import { ArdaSelect } from '@/components/canary/atoms/select';
import {
  COUNTRY_SYMBOLS,
  type CountrySymbol,
  type PostalAddress,
} from '@/types/canary/model/general/geo/postal-address';

// --- Types ---

export interface AddressFieldsetProps extends Omit<
  React.ComponentProps<'fieldset'>,
  'onChange' | 'value'
> {
  /** The structured address. `null` renders an empty form. */
  value: PostalAddress | null;
  /** Fires with the merged address; `null` when every field is blank. */
  onChange: (next: PostalAddress | null) => void;
  /** Prefix for the fields' accessible labels, e.g. "Deliver to". */
  label: string;
  disabled?: boolean;
}

const COUNTRY_OPTIONS = COUNTRY_SYMBOLS.map((s) => ({ label: s, value: s }));

function isBlank(a: PostalAddress): boolean {
  return !a.addressLine1 && !a.addressLine2 && !a.city && !a.state && !a.postalCode && !a.country;
}

// --- Component ---

/**
 * AddressFieldset — compact structured postal-address form (street / unit /
 * city / state / ZIP / country) over the `PostalAddress` value object. The
 * shared editing surface for anywhere an address is captured (PO deliver-to,
 * vendor details, company settings).
 *
 * Controlled and null-tolerant: an all-blank form reports `null`, so callers
 * can distinguish "no address" from a partial one.
 */
export function AddressFieldset({
  value,
  onChange,
  label,
  disabled = false,
  className,
  ...props
}: AddressFieldsetProps) {
  const set = (patch: Partial<PostalAddress>) => {
    const next: PostalAddress = { ...(value ?? {}), ...patch };
    // Drop empty-string keys so blank fields stay absent (backend optionals).
    for (const key of Object.keys(next) as (keyof PostalAddress)[]) {
      if (next[key] === '' || next[key] === undefined) delete next[key];
    }
    onChange(isBlank(next) ? null : next);
  };

  const fieldClass = 'h-8 text-sm';

  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0', className)}
      disabled={disabled}
      data-slot="address-fieldset"
      {...props}
    >
      <legend className="sr-only">{label}</legend>
      <div className="grid grid-cols-6 gap-1.5">
        <Input
          className={cn(fieldClass, 'col-span-6')}
          value={value?.addressLine1 ?? ''}
          onChange={(e) => set({ addressLine1: e.target.value })}
          placeholder="Street address"
          aria-label={`${label} street address`}
          autoComplete="off"
        />
        <Input
          className={cn(fieldClass, 'col-span-6')}
          value={value?.addressLine2 ?? ''}
          onChange={(e) => set({ addressLine2: e.target.value })}
          placeholder="Apt, suite, unit (optional)"
          aria-label={`${label} address line 2`}
          autoComplete="off"
        />
        <Input
          className={cn(fieldClass, 'col-span-3')}
          value={value?.city ?? ''}
          onChange={(e) => set({ city: e.target.value })}
          placeholder="City"
          aria-label={`${label} city`}
          autoComplete="off"
        />
        <Input
          className={cn(fieldClass, 'col-span-1')}
          value={value?.state ?? ''}
          onChange={(e) => set({ state: e.target.value })}
          placeholder="State"
          aria-label={`${label} state`}
          autoComplete="off"
        />
        <Input
          className={cn(fieldClass, 'col-span-2')}
          value={value?.postalCode ?? ''}
          onChange={(e) => set({ postalCode: e.target.value })}
          placeholder="ZIP"
          aria-label={`${label} postal code`}
          autoComplete="off"
        />
        <div className="col-span-6">
          <ArdaSelect
            value={value?.country ?? ''}
            // '' is scrubbed by set()'s empty-key cleanup, clearing the field
            // (exactOptionalPropertyTypes forbids an explicit undefined).
            onValueChange={(v) => set({ country: v as CountrySymbol })}
            options={COUNTRY_OPTIONS}
            placeholder="Country"
            aria-label={`${label} country`}
          />
        </div>
      </div>
    </fieldset>
  );
}
