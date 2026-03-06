import type { BusinessAffiliate } from '@/types/extras';

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
