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
        'fixed inset-y-0 left-0 bg-[#0A0A0A] text-white flex flex-col transition-all duration-200 z-50 overflow-hidden',
        collapsed ? 'w-[56px]' : 'w-[240px]',
      )}
    >
      {/* Background Gradient */}
      <div
        className="absolute top-0 right-[-300px] w-[400px] h-full pointer-events-none skew-x-[-20deg] origin-top-right transition-colors"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(252, 90, 41, 0.08) 100%)',
        }}
      />

      {/* Logo Area */}
      <div className="relative z-10 h-14 flex items-center px-4 border-b border-white/10">
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
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90',
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FC5A29] rounded-r-full" />
              )}
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 bg-[#1A1A1A] px-2 py-1 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {item.label}
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="relative z-10 border-t border-white/10 p-3 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
            {user.avatar || user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-[11px] text-white/40 truncate leading-tight">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="text-white/40 hover:text-white transition-colors"
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
