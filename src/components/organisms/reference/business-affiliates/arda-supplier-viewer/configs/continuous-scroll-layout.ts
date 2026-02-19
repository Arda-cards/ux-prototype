import type { BusinessAffiliate } from '@/types/reference/business-affiliates/business-affiliate';

/** Field order for the continuous-scroll layout of ArdaSupplierViewer. */
export const supplierFieldOrder: (keyof BusinessAffiliate)[] = [
  'eId',
  'name',
  'roles',
  'contact',
  'mainAddress',
  'legal',
  'notes',
];
