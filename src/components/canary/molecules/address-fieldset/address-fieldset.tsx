import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Input } from '@/components/canary/primitives/input';
import {
  TypeaheadInput,
  type TypeaheadOption,
} from '@/components/canary/molecules/typeahead-input/typeahead-input';
import {
  COUNTRY_SYMBOLS,
  type CountrySymbol,
  type PostalAddress,
} from '@/types/canary/model/general/geo/postal-address';

/** Display names for the supported country symbols (fuzzy-search haystack). */
const COUNTRY_NAMES: Record<CountrySymbol, string> = {
  US: 'United States',
  CA: 'Canada',
  DE: 'Germany',
  EU: 'European Union',
  GB: 'United Kingdom',
  JP: 'Japan',
  AU: 'Australia',
  CN: 'China',
  IN: 'India',
  RU: 'Russia',
  BR: 'Brazil',
  ZA: 'South Africa',
  MX: 'Mexico',
  KR: 'South Korea',
  SG: 'Singapore',
  HK: 'Hong Kong',
  NZ: 'New Zealand',
  CH: 'Switzerland',
  SV: 'El Salvador',
};

/** Loose subsequence match, e.g. "untd sts" → "united states". */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return i === needle.length;
}

/** Fuzzy country lookup: prefix > substring > subsequence, over name + code. */
async function lookupCountries(search: string): Promise<TypeaheadOption[]> {
  const q = search.trim().toLowerCase().replace(/\s+/g, ' ');
  const scored = COUNTRY_SYMBOLS.flatMap((sym) => {
    const name = COUNTRY_NAMES[sym];
    const hay = `${name} ${sym}`.toLowerCase();
    let score: number;
    if (!q) score = 0;
    else if (sym.toLowerCase() === q || hay.startsWith(q)) score = 3;
    else if (hay.includes(q)) score = 2;
    else if (isSubsequence(q.replace(/ /g, ''), hay)) score = 1;
    else return [];
    return [{ label: `${name} (${sym})`, value: sym, score }];
  });
  return scored
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .map(({ label, value }) => ({ label, value }));
}

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

  // bg-background: the fields sit on the sidebar's muted surface and
  // must read as standard (white) form inputs. autoComplete="one-time-code"
  // (on every field): Chrome ignores autocomplete=off for address-shaped
  // clusters — it both suggests saved addresses into them and offers to SAVE
  // typed ones ("Save address?"); OTC is the one valid token it leaves alone.
  const fieldClass = 'h-9 bg-background text-sm';

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
          autoComplete="one-time-code"
        />
        <Input
          className={cn(fieldClass, 'col-span-6')}
          value={value?.addressLine2 ?? ''}
          onChange={(e) => set({ addressLine2: e.target.value })}
          placeholder="Apt, suite, unit (optional)"
          aria-label={`${label} address line 2`}
          autoComplete="one-time-code"
        />
        <Input
          className={cn(fieldClass, 'col-span-2')}
          value={value?.city ?? ''}
          onChange={(e) => set({ city: e.target.value })}
          placeholder="City"
          aria-label={`${label} city`}
          autoComplete="one-time-code"
        />
        <Input
          className={cn(fieldClass, 'col-span-1')}
          value={value?.state ?? ''}
          onChange={(e) => set({ state: e.target.value })}
          placeholder="State"
          aria-label={`${label} state`}
          autoComplete="one-time-code"
        />
        <Input
          className={cn(fieldClass, 'col-span-2')}
          value={value?.postalCode ?? ''}
          onChange={(e) => set({ postalCode: e.target.value })}
          placeholder="ZIP"
          aria-label={`${label} postal code`}
          autoComplete="one-time-code"
        />
        <div className="col-span-3">
          <TypeaheadInput
            value={value?.country ?? ''}
            // '' is scrubbed by set()'s empty-key cleanup, clearing the field
            // (exactOptionalPropertyTypes forbids an explicit undefined).
            onValueChange={(v) => set({ country: v as CountrySymbol })}
            lookup={lookupCountries}
            maxResults={COUNTRY_SYMBOLS.length}
            // Select-like: focusing clears the committed code so the full
            // country list shows; blur without a pick restores it.
            clearOnFocus
            placeholder="Country"
            aria-label={`${label} country`}
            className={cn('[&_input]:h-9 [&_input]:bg-background')}
          />
        </div>
      </div>
    </fieldset>
  );
}
