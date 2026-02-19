import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  BarChart3,
  Settings,
  Search,
  Bell,
} from 'lucide-react';

import { ArdaSidebar, type NavItem } from '@/components/organisms/sidebar/sidebar';

const defaultNavItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/items', icon: Package, label: 'Items' },
  { href: '/orders', icon: ShoppingCart, label: 'Order Queue' },
  { href: '/suppliers', icon: Building2, label: 'Suppliers' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const defaultUser = {
  name: 'Alex Rivera',
  email: 'alex.rivera@arda.cards',
};

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  banner?: React.ReactNode;
}

export function AppLayout({ children, currentPath = '/', banner }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-secondary">
      <ArdaSidebar
        navItems={defaultNavItems}
        collapsed={false}
        currentPath={currentPath}
        user={defaultUser}
      />
      <div className="ml-[240px] flex flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2 flex-1 max-w-[400px]">
            <Search size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Search items, orders, suppliers...
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-muted-foreground" />
          </div>
        </header>

        {/* Banner (for dev/design variants) */}
        {banner}

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
