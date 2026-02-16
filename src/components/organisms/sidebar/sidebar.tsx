import { LogOut, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ArdaLogo, ArdaLogoFull } from './arda-logo';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
}

/** Design-time configuration — structural properties set at composition time. */
export interface ArdaSidebarStaticConfig {
  /** Navigation items defining the sidebar menu structure. */
  navItems: NavItem[];
  /** User information displayed in the sidebar footer. */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

/** Runtime configuration — properties that change during component lifetime. */
export interface ArdaSidebarRuntimeConfig {
  /** Whether the sidebar is in collapsed (icon-only) mode. */
  collapsed: boolean;
  /** Current route path used for active item highlighting. */
  currentPath?: string;
  /** Called when a navigation item is clicked. */
  onNavigate?: (href: string) => void;
  /** Called when the logout button is clicked. */
  onLogout?: () => void;
}

/** Combined props for ArdaSidebar. */
export interface ArdaSidebarProps extends ArdaSidebarStaticConfig, ArdaSidebarRuntimeConfig {}

export function ArdaSidebar({
  navItems,
  collapsed,
  currentPath = '/',
  user,
  onNavigate,
  onLogout,
}: ArdaSidebarProps) {
  const isActive = (href: string, exact?: boolean) =>
    exact ? currentPath === href : currentPath.startsWith(href);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 bg-sidebar-bg text-white flex flex-col transition-all duration-200 z-50 overflow-hidden',
        collapsed ? 'w-[56px]' : 'w-[240px]',
      )}
    >
      {/* Background Gradient */}
      <div
        className="absolute top-0 right-[-300px] w-[400px] h-full pointer-events-none skew-x-[-20deg] origin-top-right transition-colors"
        style={{
          background:
            'linear-gradient(180deg, var(--sidebar-gradient-end) 0%, var(--sidebar-gradient-start) 100%)',
        }}
      />

      {/* Logo Area */}
      <div className="relative z-10 h-14 flex items-center px-4 border-b border-sidebar-border">
        {collapsed ? <ArdaLogo size={24} /> : <ArdaLogoFull height={24} />}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.href);
                }
              }}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                active
                  ? 'bg-sidebar-active-bg text-sidebar-text-active font-medium'
                  : 'text-[var(--sidebar-text)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.9)]',
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-active-indicator rounded-r-full" />
              )}
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 bg-sidebar-tooltip-bg px-2 py-1 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {item.label}
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="relative z-10 border-t border-sidebar-border p-3 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
            {user.avatar || user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-xs text-sidebar-text-muted truncate leading-tight">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="text-sidebar-text-muted hover:text-sidebar-text-active transition-colors"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
