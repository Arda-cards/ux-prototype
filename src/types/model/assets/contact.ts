import type { PostalAddress } from '../general/geo/postal-address';

export interface Contact {
  name?: string;
  email?: string;
  phone?: string;
  address?: PostalAddress;
}
