"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ScanLine,
  HelpCircle,
  Bell,
  LogOut,
} from "lucide-react";
import { ArdaLogoFull, ArdaLogo } from "./arda-logo";
import "./web.css";

const navItems = [
  {
    href: "/prototypes/applications/web",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  {
    href: "/prototypes/applications/web/items",
    icon: Package,
    label: "Items",
  },
  {
    href: "/prototypes/applications/web/order-queue",
    icon: ShoppingCart,
    label: "Order Queue",
  },
  {
    href: "/prototypes/applications/web/receiving",
    icon: Truck,
    label: "Receiving",
  },
];

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  /* Don't render sidebar/header on sign-in page */
  if (pathname.endsWith("/signin")) {
    return <>{children}</>;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={`arda-sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="arda-sidebar__gradient" />

        {/* Logo */}
        <div className="arda-sidebar__logo" style={{ position: "relative", zIndex: 1 }}>
          {collapsed ? (
            <ArdaLogo size={24} />
          ) : (
            <ArdaLogoFull height={24} />
          )}
        </div>

        {/* Nav */}
        <nav className="arda-sidebar__nav" style={{ position: "relative", zIndex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`arda-sidebar__link${active ? " active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="arda-sidebar__user" style={{ position: "relative", zIndex: 1 }}>
          <div className="arda-sidebar__avatar">U</div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 500,
                  color: "#fff",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Demo User
              </div>
              <div style={{ fontSize: 12 }}>demo@arda.cards</div>
            </div>
          )}
          {!collapsed && (
            <Link
              href="/prototypes/applications/web/signin"
              style={{ color: "rgba(255,255,255,0.4)", display: "flex" }}
              title="Sign out"
            >
              <LogOut size={16} />
            </Link>
          )}
        </div>
      </aside>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className={`arda-header${collapsed ? " sidebar-collapsed" : ""}`}
      >
        {/* Toggle */}
        <button
          className="arda-header__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Search */}
        <div className="arda-header__search">
          <Search />
          <input placeholder="Search…" readOnly />
        </div>

        {/* Scan */}
        <button className="arda-header__scan">
          <ScanLine size={16} />
          <span>Scan</span>
        </button>

        {/* Right-side icons */}
        <div className="arda-header__actions">
          <button className="arda-header__icon-btn" aria-label="Help">
            <HelpCircle size={18} />
          </button>
          <button className="arda-header__icon-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="arda-header__badge" />
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className={`arda-main${collapsed ? " sidebar-collapsed" : ""}`}>
        {children}
      </main>
    </>
  );
}
