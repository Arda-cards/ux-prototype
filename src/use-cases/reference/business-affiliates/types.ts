/**
 * BusinessAffiliate types for the Suppliers list view.
 *
 * Mirrors the backend entity shape from operations/reference/businessaffiliates.
 * The ArdaResult wrapper and ArdaQueryResponse are reused from the vendored
 * arda-api types.
 */
import type * as general from '@frontend/types/general';
import type * as geo from '@frontend/types/geo';

export type BusinessRoleType = 'VENDOR' | 'CUSTOMER' | 'CARRIER' | 'OPERATOR' | 'OTHER';

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  address?: geo.PostalAddress;
}

export interface CompanyInformation {
  name: string;
  taxId?: string;
  website?: string;
}

export interface BusinessAffiliatePayload {
  eId: general.UUID;
  name: string;
  legal?: CompanyInformation;
  contact?: Contact;
  mainAddress?: geo.PostalAddress;
  contacts?: Record<string, Contact>;
  addresses?: Record<string, geo.PostalAddress>;
}

export interface BusinessRolePayload {
  eId: general.UUID;
  name: string;
  role: BusinessRoleType;
  notes?: string;
}

/**
 * Composite view returned by the /with-details endpoint.
 * Combines the affiliate payload with its role types.
 */
export interface BusinessAffiliateWithRoles extends BusinessAffiliatePayload {
  roles: BusinessRoleType[];
}
