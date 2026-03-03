import type { AtomProps, AtomMode } from '@/lib/data-types/atom-types';
import type { CompanyInformation } from '@/extras/types/model/assets/company-information';
import type { Contact } from '@/extras/types/model/assets/contact';
import type { PostalAddress, CountrySymbol } from '@/extras/types/model/general/geo/postal-address';
import { ArdaTextFieldInteractive } from '@/extras/components/atoms/form/text';
import { ArdaEnumFieldInteractive } from '@/extras/components/atoms/form/enum';

// ============================================================================
// Helpers
// ============================================================================

const COUNTRY_OPTIONS: Readonly<Record<CountrySymbol, string>> = {
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

/**
 * Set or remove an optional key from an object.
 * Needed because exactOptionalPropertyTypes prevents assigning undefined.
 */
function withOptional<T extends object, K extends keyof T>(obj: T, key: K, value: string): T {
  const copy = { ...obj };
  if (value) {
    (copy as Record<string, unknown>)[key as string] = value;
  } else {
    delete (copy as Record<string, unknown>)[key as string];
  }
  return copy;
}

/**
 * Build the optional `editable` prop conditionally.
 * exactOptionalPropertyTypes forbids passing `{ editable: undefined }`.
 */
function editableProp(
  editable: boolean | undefined,
): { editable: boolean } | Record<string, never> {
  return editable !== undefined ? { editable } : {};
}

/**
 * Build the optional `errors` prop conditionally.
 */
function errorsProp(errors: string[] | undefined): { errors: string[] } | Record<string, never> {
  return errors !== undefined ? { errors } : {};
}

// ============================================================================
// PostalAddressSubViewer
// ============================================================================

/**
 * Sub-viewer for PostalAddress fields.
 * Reusable for both contact.postalAddress and mainAddress.
 */
export function PostalAddressSubViewer({
  value,
  onChange,
  mode,
  errors,
  editable,
}: AtomProps<PostalAddress | undefined>) {
  const address = value ?? {};
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const updateField = (key: keyof PostalAddress, fieldValue: string) => {
    const updated = withOptional(address, key as keyof typeof address, fieldValue);
    onChange(value as PostalAddress | undefined, updated as PostalAddress | undefined);
  };

  const updateCountry = (_original: CountrySymbol, current: CountrySymbol) => {
    const updated = { ...address, country: current };
    onChange(value as PostalAddress | undefined, updated as PostalAddress | undefined);
  };

  const fieldErrors = errors ?? [];
  const ep = editableProp(editable);

  return (
    <div className="space-y-3">
      <ArdaTextFieldInteractive
        value={address.addressLine1 ?? ''}
        onChange={(_o, c) => updateField('addressLine1', c)}
        mode={effectiveMode}
        label="Address Line 1"
        {...ep}
      />
      <ArdaTextFieldInteractive
        value={address.addressLine2 ?? ''}
        onChange={(_o, c) => updateField('addressLine2', c)}
        mode={effectiveMode}
        label="Address Line 2"
        {...ep}
      />
      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
        <ArdaTextFieldInteractive
          value={address.city ?? ''}
          onChange={(_o, c) => updateField('city', c)}
          mode={effectiveMode}
          label="City"
          {...ep}
        />
        <ArdaTextFieldInteractive
          value={address.state ?? ''}
          onChange={(_o, c) => updateField('state', c)}
          mode={effectiveMode}
          label="State"
          {...ep}
        />
      </div>
      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
        <ArdaTextFieldInteractive
          value={address.postalCode ?? ''}
          onChange={(_o, c) => updateField('postalCode', c)}
          mode={fieldErrors.length > 0 ? 'error' : effectiveMode}
          label="Postal Code"
          {...ep}
          {...errorsProp(fieldErrors.length > 0 ? fieldErrors : undefined)}
        />
        <ArdaEnumFieldInteractive<CountrySymbol>
          value={address.country ?? 'US'}
          onChange={updateCountry}
          mode={effectiveMode}
          label="Country"
          options={COUNTRY_OPTIONS}
          {...ep}
        />
      </div>
      {address.geoLocation && (
        <div className="text-xs text-muted-foreground">
          Location: {address.geoLocation.latitude.toFixed(4)},{' '}
          {address.geoLocation.longitude.toFixed(4)}
          {address.geoLocation.elevation !== undefined && ` (${address.geoLocation.elevation}m)`}
        </div>
      )}
    </div>
  );
}
PostalAddressSubViewer.displayName = 'PostalAddressSubViewer';

// ============================================================================
// ContactSubViewer
// ============================================================================

/** Sub-viewer for Contact fields, including nested PostalAddress. */
export function ContactSubViewer({
  value,
  onChange,
  mode,
  errors,
  editable,
}: AtomProps<Contact | undefined>) {
  const contact = value ?? {};
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const updateField = (key: keyof Contact, fieldValue: string) => {
    const updated = withOptional(contact, key as keyof typeof contact, fieldValue);
    onChange(value as Contact | undefined, updated as Contact | undefined);
  };

  const fieldErrors = errors ?? [];
  const hasEmailError = fieldErrors.some((e) => e.toLowerCase().includes('email'));
  const hasPhoneError = fieldErrors.some((e) => e.toLowerCase().includes('phone'));
  const ep = editableProp(editable);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
        <ArdaTextFieldInteractive
          value={contact.salutation ?? ''}
          onChange={(_o, c) => updateField('salutation', c)}
          mode={effectiveMode}
          label="Salutation"
          {...ep}
        />
        <ArdaTextFieldInteractive
          value={contact.jobTitle ?? ''}
          onChange={(_o, c) => updateField('jobTitle', c)}
          mode={effectiveMode}
          label="Job Title"
          {...ep}
        />
      </div>
      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
        <ArdaTextFieldInteractive
          value={contact.firstName ?? ''}
          onChange={(_o, c) => updateField('firstName', c)}
          mode={effectiveMode}
          label="First Name"
          {...ep}
        />
        <ArdaTextFieldInteractive
          value={contact.lastName ?? ''}
          onChange={(_o, c) => updateField('lastName', c)}
          mode={effectiveMode}
          label="Last Name"
          {...ep}
        />
      </div>
      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
        <ArdaTextFieldInteractive
          value={contact.email ?? ''}
          onChange={(_o, c) => updateField('email', c)}
          mode={hasEmailError ? 'error' : effectiveMode}
          label="Email"
          {...ep}
          {...errorsProp(
            hasEmailError
              ? fieldErrors.filter((e) => e.toLowerCase().includes('email'))
              : undefined,
          )}
        />
        <ArdaTextFieldInteractive
          value={contact.phone ?? ''}
          onChange={(_o, c) => updateField('phone', c)}
          mode={hasPhoneError ? 'error' : effectiveMode}
          label="Phone"
          {...ep}
          {...errorsProp(
            hasPhoneError
              ? fieldErrors.filter((e) => e.toLowerCase().includes('phone'))
              : undefined,
          )}
        />
      </div>
      {contact.postalAddress && (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Contact Address</p>
          <PostalAddressSubViewer
            value={contact.postalAddress}
            onChange={(_orig, updated) => {
              const updatedContact = { ...contact, postalAddress: updated };
              onChange(value as Contact | undefined, updatedContact as Contact | undefined);
            }}
            mode={effectiveMode}
            {...ep}
          />
        </div>
      )}
    </div>
  );
}
ContactSubViewer.displayName = 'ContactSubViewer';

// ============================================================================
// CompanyInfoSubViewer
// ============================================================================

/** Sub-viewer for CompanyInformation fields. */
export function CompanyInfoSubViewer({
  value,
  onChange,
  mode,
  errors,
  editable,
}: AtomProps<CompanyInformation | undefined>) {
  const info = value ?? {};
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const updateField = (key: keyof CompanyInformation, fieldValue: string) => {
    const updated = withOptional(info, key as keyof typeof info, fieldValue);
    onChange(value as CompanyInformation | undefined, updated as CompanyInformation | undefined);
  };

  const updateCountry = (_original: CountrySymbol, current: CountrySymbol) => {
    const updated = { ...info, country: current };
    onChange(value as CompanyInformation | undefined, updated as CompanyInformation | undefined);
  };

  const fieldErrors = errors ?? [];
  const hasTaxIdError = fieldErrors.some((e) => e.toLowerCase().includes('tax'));
  const ep = editableProp(editable);

  return (
    <div className="space-y-3">
      <ArdaTextFieldInteractive
        value={info.legalName ?? ''}
        onChange={(_o, c) => updateField('legalName', c)}
        mode={effectiveMode}
        label="Legal Name"
        {...ep}
      />
      <ArdaEnumFieldInteractive<CountrySymbol>
        value={info.country ?? 'US'}
        onChange={updateCountry}
        mode={effectiveMode}
        label="Country"
        options={COUNTRY_OPTIONS}
        {...ep}
      />
      <ArdaTextFieldInteractive
        value={info.taxId ?? ''}
        onChange={(_o, c) => updateField('taxId', c)}
        mode={hasTaxIdError ? 'error' : effectiveMode}
        label="Tax ID"
        {...ep}
        {...errorsProp(
          hasTaxIdError ? fieldErrors.filter((e) => e.toLowerCase().includes('tax')) : undefined,
        )}
      />
      <ArdaTextFieldInteractive
        value={info.registrationId ?? ''}
        onChange={(_o, c) => updateField('registrationId', c)}
        mode={effectiveMode}
        label="Registration ID"
        {...ep}
      />
      <ArdaTextFieldInteractive
        value={info.naicsCode ?? ''}
        onChange={(_o, c) => updateField('naicsCode', c)}
        mode={effectiveMode}
        label="NAICS Code"
        {...ep}
      />
    </div>
  );
}
CompanyInfoSubViewer.displayName = 'CompanyInfoSubViewer';
