"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { ArdaSidebar } from "@/components/arda/sidebar";

export default function SidebarPrototype() {
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = [
    { href: "#dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { href: "#items", icon: Package, label: "Items" },
    { href: "#orders", icon: ShoppingCart, label: "Order Queue" },
    { href: "#shipping", icon: Truck, label: "Receiving" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Gallery
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">App Sidebar</h1>
            <p className="mt-2 text-muted-foreground">
              Main navigation shell with brand gradient, collapsible states, and integrated user profile.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Interactive Toggle */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Interactive Demo</h2>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FC5A29] text-white font-bold text-sm shadow-md hover:brightness-110 transition-all"
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </button>
            </div>

            <div className="relative h-[600px] w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
              <div className="absolute inset-y-0 left-0">
                <div className="h-full relative overflow-hidden" style={{ width: collapsed ? '56px' : '240px', transition: 'width 200ms ease' }}>
                    <ArdaSidebar
                        navItems={navItems}
                        collapsed={collapsed}
                        user={{
                            name: "Alex Arda",
                            email: "alex@arda.cards"
                        }}
                    />
                </div>
              </div>
              <div className="ml-[240px] p-8 transition-all" style={{ marginLeft: collapsed ? '56px' : '240px' }}>
                <div className="max-w-xl space-y-4">
                  <h3 className="text-xl font-bold">Dashboard Preview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The sidebar uses a characteristic <strong>skanted brand gradient</strong> and
                    a <strong>left-accent marker</strong> for active items. This layout is the foundation
                    for all Arda internal applications.
                  </p>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="h-32 rounded-xl bg-white border border-border shadow-sm" />
                    <div className="h-32 rounded-xl bg-white border border-border shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-bold text-foreground">Visual Feedback</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Orange primary accent for active states</li>
                <li>Glassmorphism effect in brand gradient</li>
                <li>Tooltips for navigation icons when collapsed</li>
                <li>Truncated labels to prevent overflow</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-foreground">Layout Specs</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Width: 240px (Expanded) / 56px (Collapsed)</li>
                <li>Base: #0A0A0A (Near black)</li>
                <li>Header: Fixed 56px height</li>
                <li>Icon size: 18px (Navigation) / 16px (Secondary)</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
