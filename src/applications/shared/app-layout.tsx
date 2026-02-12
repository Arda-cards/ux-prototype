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

import { ArdaSidebar } from '@/components/organisms/sidebar/sidebar';
import type { NavItem } from '@/components/organisms/sidebar/sidebar';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <ArdaSidebar
        navItems={defaultNavItems}
        collapsed={false}
        currentPath={currentPath}
        user={defaultUser}
      />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: 56,
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 400 }}>
            <Search size={16} color="#737373" />
            <span style={{ color: '#737373', fontSize: 14 }}>Search items, orders, suppliers...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Bell size={18} color="#737373" />
          </div>
        </header>

        {/* Banner (for dev/design variants) */}
        {banner}

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
