import type { BusinessAffiliate } from '@/extras/types/reference/business-affiliates/business-affiliate';
import type {
  ValidationResult,
  UpdateResult,
} from '@/extras/components/organisms/shared/entity-viewer';

// ============================================================================
// Mock Data
// ============================================================================

/** Fully populated sample supplier with all nested objects. */
export const mockSupplier: BusinessAffiliate = {
  eId: 'ba-001',
  name: 'Fastenal Corp.',
  legal: {
    name: 'Fastenal Corp.',
    legalName: 'Fastenal Company',
    country: 'US',
    taxId: '41-0948415',
    registrationId: 'MN-12345678',
    naicsCode: '423710',
  },
  roles: [{ role: 'VENDOR', notes: 'Primary MRO supplier' }, { role: 'CUSTOMER' }],
  contact: {
    salutation: 'Ms.',
    firstName: 'Sarah',
    lastName: 'Chen',
    jobTitle: 'Account Manager',
    email: 'sarah.chen@fastenal.com',
    phone: '+1-507-454-5374',
    postalAddress: {
      addressLine1: '2001 Theurer Blvd',
      city: 'Winona',
      state: 'MN',
      postalCode: '55987',
      country: 'US',
      geoLocation: { latitude: 44.0478, longitude: -91.6393 },
    },
  },
  mainAddress: {
    addressLine1: '2001 Theurer Blvd',
    addressLine2: 'Suite 100',
    city: 'Winona',
    state: 'MN',
    postalCode: '55987',
    country: 'US',
    geoLocation: { latitude: 44.0478, longitude: -91.6393 },
  },
  notes: 'Preferred vendor for fasteners and MRO supplies.',
};

// ============================================================================
// Factory
// ============================================================================

/** Creates an empty BusinessAffiliate for the create flow. */
export function createSupplierInstance(): BusinessAffiliate {
  return {
    eId: '',
    name: '',
    roles: [],
  };
}

// ============================================================================
// Validation
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,}$/;
const US_EIN_RE = /^\d{2}-\d{7}$/;
const CA_BN_RE = /^\d{9}$/;
const US_ZIP_RE = /^\d{5}(-\d{4})?$/;
const CA_POSTAL_RE = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

/** Validates a BusinessAffiliate, returning field and entity errors. */
export function validateBusinessAffiliate(
  _previous: BusinessAffiliate,
  updated: BusinessAffiliate,
): ValidationResult {
  const fieldErrors: { message: string; fieldPath: string }[] = [];
  const entityErrors: { message: string }[] = [];

  // Name required
  if (!updated.name || updated.name.trim() === '') {
    fieldErrors.push({ message: 'Name is required.', fieldPath: 'name' });
  }

  // At least one role
  if (!updated.roles || updated.roles.length === 0) {
    fieldErrors.push({
      message: 'At least one business role is required.',
      fieldPath: 'roles',
    });
  }

  // Email format
  if (updated.contact?.email && !EMAIL_RE.test(updated.contact.email)) {
    fieldErrors.push({
      message: 'Invalid email format.',
      fieldPath: 'contact',
    });
  }

  // Phone format
  if (updated.contact?.phone && !PHONE_RE.test(updated.contact.phone)) {
    fieldErrors.push({
      message: 'Invalid phone number format.',
      fieldPath: 'contact',
    });
  }

  // Tax ID format based on country
  if (updated.legal?.taxId && updated.legal.country) {
    const { taxId, country } = updated.legal;
    if (country === 'US' && !US_EIN_RE.test(taxId)) {
      fieldErrors.push({
        message: 'US Tax ID must be in XX-XXXXXXX (EIN) format.',
        fieldPath: 'legal',
      });
    }
    if (country === 'CA' && !CA_BN_RE.test(taxId)) {
      fieldErrors.push({
        message: 'Canadian Business Number must be 9 digits.',
        fieldPath: 'legal',
      });
    }
  }

  // Postal code format based on country
  const addr = updated.mainAddress;
  if (addr?.postalCode && addr.country) {
    if (addr.country === 'US' && !US_ZIP_RE.test(addr.postalCode)) {
      fieldErrors.push({
        message: 'US postal code must be 5 or 9 digits (XXXXX or XXXXX-XXXX).',
        fieldPath: 'mainAddress',
      });
    }
    if (addr.country === 'CA' && !CA_POSTAL_RE.test(addr.postalCode)) {
      fieldErrors.push({
        message: 'Canadian postal code must be in A1A 1A1 format.',
        fieldPath: 'mainAddress',
      });
    }
  }

  return { fieldErrors, entityErrors };
}

// ============================================================================
// Async Mock Operations
// ============================================================================

/** Simulates fetching a supplier by ID. Returns mockSupplier after a short delay. */
export async function getSupplier(_eId: string): Promise<BusinessAffiliate> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return structuredClone(mockSupplier);
}

/** Simulates updating a supplier. Returns the updated entity after a short delay. */
export async function updateSupplier(
  _eId: string,
  _original: BusinessAffiliate,
  updated: BusinessAffiliate,
): Promise<UpdateResult<BusinessAffiliate>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { entity: structuredClone(updated) };
}
