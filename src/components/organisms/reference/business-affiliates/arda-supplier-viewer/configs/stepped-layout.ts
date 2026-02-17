import type { TabConfig } from '@/components/organisms/shared/entity-viewer';

/** 4-tab stepped layout configuration for the ArdaSupplierViewer. */
export const supplierTabs: readonly TabConfig[] = [
  { name: 'identity', label: 'Identity', fieldKeys: ['eId', 'name', 'roles'], order: 0 },
  { name: 'contact', label: 'Contact', fieldKeys: ['contact'], order: 1 },
  { name: 'address-legal', label: 'Address & Legal', fieldKeys: ['mainAddress', 'legal'], order: 2 },
  { name: 'notes', label: 'Notes', fieldKeys: ['notes'], order: 3 },
];
