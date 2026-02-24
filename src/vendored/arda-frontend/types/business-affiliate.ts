import * as geo from "./geo";

export interface Contact {
  name: string;
  address?: geo.PostalAddress;
}

export interface BusinessAffiliate {
  name: string;
  contact?: Contact;
}