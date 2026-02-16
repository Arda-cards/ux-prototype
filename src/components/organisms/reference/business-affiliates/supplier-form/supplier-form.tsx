'use client';

import { useState } from 'react';

import type {
  BusinessAffiliate,
  BusinessRole,
  BusinessRoleType,
} from '@/types/reference/business-affiliates/business-affiliate';

/* ------------------------------------------------------------------ */
/*  Config Interfaces                                                  */
/* ------------------------------------------------------------------ */

export interface ArdaSupplierFormStaticConfig {
  mode?: 'single-scroll' | 'stepped';
}

export interface ArdaSupplierFormRuntimeConfig {
  value: BusinessAffiliate;
  onChange: (value: BusinessAffiliate) => void;
  currentStep?: number; // 0-2 for stepped mode (step 3 = review, handled by parent)
}

export interface ArdaSupplierFormProps
  extends ArdaSupplierFormStaticConfig, ArdaSupplierFormRuntimeConfig {}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ROLE_DEFS: { role: BusinessRoleType; label: string }[] = [
  { role: 'VENDOR', label: 'Vendor' },
  { role: 'CUSTOMER', label: 'Customer' },
  { role: 'CARRIER', label: 'Carrier' },
  { role: 'OPERATOR', label: 'Operator' },
  { role: 'OTHER', label: 'Other' },
];

const fieldClasses =
  'w-full rounded-md border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

const labelClasses = 'block text-sm font-medium text-foreground mb-1';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function hasContactData(affiliate: BusinessAffiliate): boolean {
  const c = affiliate.contact;
  if (!c) return false;
  return Boolean(
    c.salutation || c.firstName || c.middleName || c.lastName || c.jobTitle || c.email || c.phone,
  );
}

function hasAddressOrLegalData(affiliate: BusinessAffiliate): boolean {
  const a = affiliate.mainAddress;
  const l = affiliate.legal;
  return Boolean(
    a?.addressLine1 ||
    a?.addressLine2 ||
    a?.city ||
    a?.state ||
    a?.postalCode ||
    a?.country ||
    l?.legalName ||
    l?.taxId ||
    l?.registrationId ||
    l?.naicsCode,
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Identity & Roles (Step 0)                                 */
/* ------------------------------------------------------------------ */

function IdentitySection({
  value,
  onChange,
}: {
  value: BusinessAffiliate;
  onChange: (v: BusinessAffiliate) => void;
}) {
  const selectedRoles = new Set(value.roles.map((r) => r.role));

  const toggleRole = (roleType: BusinessRoleType) => {
    const exists = value.roles.some((r) => r.role === roleType);
    onChange({
      ...value,
      roles: exists
        ? value.roles.filter((r) => r.role !== roleType)
        : [...value.roles, { role: roleType }],
    });
  };

  const updateRoleNotes = (roleType: BusinessRoleType, notes: string) => {
    onChange({
      ...value,
      roles: value.roles.map((r) => {
        if (r.role !== roleType) return r;
        const updated: BusinessRole = { ...r };
        if (notes) {
          updated.notes = notes;
        } else {
          delete updated.notes;
        }
        return updated;
      }),
    });
  };

  return (
    <>
      <div className="mb-3">
        <label htmlFor="supplier-form-name" className={labelClasses}>
          Company Name
        </label>
        <input
          id="supplier-form-name"
          type="text"
          value={value.name ?? ''}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="e.g. Fastenal Corp."
          className={fieldClasses}
        />
      </div>

      <div className="mb-3">
        <span className="block text-sm font-medium text-foreground mb-2">Business Roles</span>
        <div className="flex flex-col gap-3">
          {ROLE_DEFS.map((def) => {
            const isChecked = selectedRoles.has(def.role);
            const role = value.roles.find((r) => r.role === def.role);
            return (
              <div key={def.role}>
                <label className="flex items-center gap-1.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleRole(def.role)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  {def.label}
                </label>
                {isChecked && (
                  <div className="ml-[22px] mt-1">
                    <input
                      type="text"
                      placeholder={`Notes for ${def.label} role (optional)`}
                      value={role?.notes ?? ''}
                      onChange={(e) => updateRoleNotes(def.role, e.target.value)}
                      aria-label={`${def.label} Notes`}
                      className={fieldClasses}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="supplier-form-notes" className={labelClasses}>
          General Notes
        </label>
        <input
          id="supplier-form-notes"
          type="text"
          value={value.notes ?? ''}
          onChange={(e) => onChange(withOptional(value, 'notes', e.target.value))}
          placeholder="General notes about this affiliate (optional)"
          className={fieldClasses}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Contact (Step 1)                                          */
/* ------------------------------------------------------------------ */

function ContactSection({
  value,
  onChange,
}: {
  value: BusinessAffiliate;
  onChange: (v: BusinessAffiliate) => void;
}) {
  const contact = value.contact ?? {};

  const updateContact = (key: string, val: string) => {
    onChange({
      ...value,
      contact: withOptional(contact, key as keyof typeof contact, val),
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="supplier-form-salutation" className={labelClasses}>
            Salutation
          </label>
          <input
            id="supplier-form-salutation"
            type="text"
            value={contact.salutation ?? ''}
            onChange={(e) => updateContact('salutation', e.target.value)}
            placeholder="e.g. Ms."
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-job-title" className={labelClasses}>
            Job Title
          </label>
          <input
            id="supplier-form-job-title"
            type="text"
            value={contact.jobTitle ?? ''}
            onChange={(e) => updateContact('jobTitle', e.target.value)}
            placeholder="e.g. Account Manager"
            className={fieldClasses}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label htmlFor="supplier-form-first-name" className={labelClasses}>
            First Name
          </label>
          <input
            id="supplier-form-first-name"
            type="text"
            value={contact.firstName ?? ''}
            onChange={(e) => updateContact('firstName', e.target.value)}
            placeholder="e.g. Sarah"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-middle-name" className={labelClasses}>
            Middle Name
          </label>
          <input
            id="supplier-form-middle-name"
            type="text"
            value={contact.middleName ?? ''}
            onChange={(e) => updateContact('middleName', e.target.value)}
            placeholder="(optional)"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-last-name" className={labelClasses}>
            Last Name
          </label>
          <input
            id="supplier-form-last-name"
            type="text"
            value={contact.lastName ?? ''}
            onChange={(e) => updateContact('lastName', e.target.value)}
            placeholder="e.g. Chen"
            className={fieldClasses}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="supplier-form-email" className={labelClasses}>
            Email
          </label>
          <input
            id="supplier-form-email"
            type="email"
            value={contact.email ?? ''}
            onChange={(e) => updateContact('email', e.target.value)}
            placeholder="email@example.com"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-phone" className={labelClasses}>
            Phone
          </label>
          <input
            id="supplier-form-phone"
            type="tel"
            value={contact.phone ?? ''}
            onChange={(e) => updateContact('phone', e.target.value)}
            placeholder="+1-555-555-5555"
            className={fieldClasses}
          />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Address & Legal (Step 2)                                  */
/* ------------------------------------------------------------------ */

function AddressLegalSection({
  value,
  onChange,
}: {
  value: BusinessAffiliate;
  onChange: (v: BusinessAffiliate) => void;
}) {
  const address = value.mainAddress ?? {};
  const legal = value.legal ?? {};

  const updateAddress = (key: string, val: string) => {
    onChange({
      ...value,
      mainAddress: withOptional(address, key as keyof typeof address, val),
    });
  };

  const updateLegal = (key: string, val: string) => {
    onChange({
      ...value,
      legal: withOptional(legal, key as keyof typeof legal, val),
    });
  };

  return (
    <>
      <div className="mb-3">
        <label htmlFor="supplier-form-addr-line1" className={labelClasses}>
          Address Line 1
        </label>
        <input
          id="supplier-form-addr-line1"
          type="text"
          value={address.addressLine1 ?? ''}
          onChange={(e) => updateAddress('addressLine1', e.target.value)}
          placeholder="Street address"
          className={fieldClasses}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="supplier-form-addr-line2" className={labelClasses}>
          Address Line 2
        </label>
        <input
          id="supplier-form-addr-line2"
          type="text"
          value={address.addressLine2 ?? ''}
          onChange={(e) => updateAddress('addressLine2', e.target.value)}
          placeholder="Suite, floor, etc. (optional)"
          className={fieldClasses}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="supplier-form-city" className={labelClasses}>
            City
          </label>
          <input
            id="supplier-form-city"
            type="text"
            value={address.city ?? ''}
            onChange={(e) => updateAddress('city', e.target.value)}
            placeholder="City"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-state" className={labelClasses}>
            State
          </label>
          <input
            id="supplier-form-state"
            type="text"
            value={address.state ?? ''}
            onChange={(e) => updateAddress('state', e.target.value)}
            placeholder="State"
            className={fieldClasses}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="supplier-form-postal-code" className={labelClasses}>
            Postal Code
          </label>
          <input
            id="supplier-form-postal-code"
            type="text"
            value={address.postalCode ?? ''}
            onChange={(e) => updateAddress('postalCode', e.target.value)}
            placeholder="Zip"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-country" className={labelClasses}>
            Country
          </label>
          <input
            id="supplier-form-country"
            type="text"
            value={address.country ?? ''}
            onChange={(e) => updateAddress('country', e.target.value)}
            placeholder="US"
            className={fieldClasses}
          />
        </div>
      </div>

      <hr className="my-4 border-border" />

      <div className="mb-3">
        <label htmlFor="supplier-form-legal-name" className={labelClasses}>
          Legal Name
        </label>
        <input
          id="supplier-form-legal-name"
          type="text"
          value={legal.legalName ?? ''}
          onChange={(e) => updateLegal('legalName', e.target.value)}
          placeholder="Legal entity name"
          className={fieldClasses}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="supplier-form-tax-id" className={labelClasses}>
            Tax ID
          </label>
          <input
            id="supplier-form-tax-id"
            type="text"
            value={legal.taxId ?? ''}
            onChange={(e) => updateLegal('taxId', e.target.value)}
            placeholder="e.g. 41-0948415"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="supplier-form-registration-id" className={labelClasses}>
            Registration ID
          </label>
          <input
            id="supplier-form-registration-id"
            type="text"
            value={legal.registrationId ?? ''}
            onChange={(e) => updateLegal('registrationId', e.target.value)}
            placeholder="e.g. MN-12345678"
            className={fieldClasses}
          />
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="supplier-form-naics-code" className={labelClasses}>
          NAICS Code
        </label>
        <input
          id="supplier-form-naics-code"
          type="text"
          value={legal.naicsCode ?? ''}
          onChange={(e) => updateLegal('naicsCode', e.target.value)}
          placeholder="e.g. 423710"
          className={fieldClasses}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible Panel (single-scroll mode)                             */
/* ------------------------------------------------------------------ */

function CollapsiblePanel({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border border-border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-secondary transition-colors rounded-t-lg"
      >
        {title}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ArdaSupplierForm Component                                         */
/* ------------------------------------------------------------------ */

export function ArdaSupplierForm({
  value,
  onChange,
  mode = 'single-scroll',
  currentStep = 0,
}: ArdaSupplierFormProps) {
  if (mode === 'stepped') {
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        {currentStep === 0 && <IdentitySection value={value} onChange={onChange} />}
        {currentStep === 1 && <ContactSection value={value} onChange={onChange} />}
        {currentStep === 2 && <AddressLegalSection value={value} onChange={onChange} />}
      </form>
    );
  }

  // single-scroll mode: identity inline, contact & address/legal in collapsible panels
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <IdentitySection value={value} onChange={onChange} />
      <CollapsiblePanel title="Contact" defaultOpen={hasContactData(value)}>
        <ContactSection value={value} onChange={onChange} />
      </CollapsiblePanel>
      <CollapsiblePanel title="Address & Legal" defaultOpen={hasAddressOrLegalData(value)}>
        <AddressLegalSection value={value} onChange={onChange} />
      </CollapsiblePanel>
    </form>
  );
}
