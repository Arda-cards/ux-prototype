"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LucideIcon } from "lucide-react";
import { ArdaLogo, ArdaLogoFull } from "@/app/prototypes/applications/web/arda-logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
}

interface ArdaSidebarProps {
  navItems: NavItem[];
  collapsed: boolean;
  onToggle?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function ArdaSidebar({ navItems, collapsed, user }: ArdaSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 bg-[#0A0A0A] text-white flex flex-col transition-all duration-200 z-50 overflow-hidden",
        collapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      {/* Background Gradient */}
      <div
        className="absolute top-0 right-[-300px] w-[400px] h-full pointer-events-none skew-x-[-20deg] origin-top-right transition-colors"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(252, 90, 41, 0.08) 100%)"
        }}
      />

      {/* Logo Area */}
      <div className="relative z-10 h-14 flex items-center px-4 border-b border-white/10">
        {collapsed ? (
          <ArdaLogo size={24} />
        ) : (
          <ArdaLogoFull height={24} />
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
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
            </Link>
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
            <Link href="/logout" className="text-white/40 hover:text-white transition-colors">
              <LogOut size={16} />
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
