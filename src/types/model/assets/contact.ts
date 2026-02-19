import type { PostalAddress } from '../general/geo/postal-address';

export interface Contact {
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  postalAddress?: PostalAddress;
  emails?: Record<string, string>;
  phones?: Record<string, string>;
  addresses?: Record<string, PostalAddress>;
  sites?: Record<string, string>;
}

/**
 * Build a display-friendly full name from Contact name parts.
 * Concatenates non-empty parts: salutation, firstName, middleName, lastName.
 */
export function getContactDisplayName(contact?: Contact): string {
  if (!contact) return '';
  const parts = [
    contact.salutation,
    contact.firstName,
    contact.middleName,
    contact.lastName,
  ].filter(Boolean);
  return parts.join(' ');
}
