/**
 * Use-case-specific sidebar for Business Affiliates stories.
 *
 * Imports the vendored AppSidebar and injects the Suppliers menu item
 * via the menuItems prop — no duplication of the sidebar rendering.
 */
import { Building2 } from 'lucide-react';
import { AppSidebar, mainMenuItems } from '@frontend/components/app-sidebar';

const menuItemsWithSuppliers = [
  ...mainMenuItems.slice(0, 2), // Dashboard, Items
  {
    id: 'suppliers' as const,
    label: 'Suppliers',
    icon: Building2,
    url: '/suppliers',
    children: [] as never[],
  },
  ...mainMenuItems.slice(2), // Order Queue, Receiving
];

export function BusinessAffiliatesSidebar() {
  return <AppSidebar menuItems={menuItemsWithSuppliers} />;
}
