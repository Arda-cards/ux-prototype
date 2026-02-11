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
  PanelLeftOpen,
  Search,
  ScanLine,
  HelpCircle,
  Bell,
  LogOut,
  Plus,
  Download,
  Trash2,
  Mail,
  Copy,
  Check,
  MoreVertical,
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  History,
  FileText
} from "lucide-react";

interface IconCardProps {
  icon: React.ElementType;
  name: string;
  category: string;
}

function IconCard({ icon: Icon, name, category }: IconCardProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 transition-all hover:border-[var(--base-primary)] hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-orange-50 group-hover:text-[var(--base-primary)]">
        <Icon size={20} />
      </div>
      <div className="w-full text-center">
        <p className="text-xs font-semibold text-foreground truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{category}</p>
      </div>
      <button
        onClick={copyToClipboard}
        className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-[var(--base-primary)]"
      >
        {copied ? (
          <>
            <Check size={10} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={10} />
            <span>Copy Name</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function IconsPrototype() {
  const categories = [
    {
      name: "Navigation",
      icons: [
        { icon: LayoutDashboard, name: "LayoutDashboard", category: "App Shell" },
        { icon: Package, name: "Package", category: "Inventory" },
        { icon: ShoppingCart, name: "ShoppingCart", category: "Purchasing" },
        { icon: Truck, name: "Truck", category: "Logistics" },
        { icon: PanelLeftClose, name: "PanelLeftClose", category: "Controls" },
        { icon: PanelLeftOpen, name: "PanelLeftOpen", category: "Controls" },
      ]
    },
    {
      name: "Actions & Buttons",
      icons: [
        { icon: Search, name: "Search", category: "Header" },
        { icon: ScanLine, name: "ScanLine", category: "Header" },
        { icon: Plus, name: "Plus", category: "CRUD" },
        { icon: Download, name: "Download", category: "Export" },
        { icon: Trash2, name: "Trash2", category: "Destructive" },
        { icon: Filter, name: "Filter", category: "Tables" },
        { icon: MoreVertical, name: "MoreVertical", category: "Menus" },
        { icon: ArrowRight, name: "ArrowRight", category: "Navigation" },
      ]
    },
    {
      name: "Status & Info",
      icons: [
        { icon: HelpCircle, name: "HelpCircle", category: "Support" },
        { icon: Bell, name: "Bell", category: "Alerts" },
        { icon: LogOut, name: "LogOut", category: "Account" },
        { icon: Mail, name: "Mail", category: "Communication" },
        { icon: TrendingUp, name: "TrendingUp", category: "Metrics" },
        { icon: TrendingDown, name: "TrendingDown", category: "Metrics" },
        { icon: Clock, name: "Clock", category: "Status" },
        { icon: History, name: "History", category: "Tabs" },
        { icon: FileText, name: "FileText", category: "Reports" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="mx-auto max-w-5xl">
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Icons</h1>
            <p className="mt-2 text-muted-foreground">
              Standard icon set from Lucide-React used across the Arda application for consistent visual communication.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {categories.map((cat) => (
            <section key={cat.name} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">{cat.name}</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {cat.icons.map((item) => (
                  <IconCard key={item.name} {...item} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl bg-muted p-8 text-center border border-border">
          <h3 className="text-lg font-semibold mb-2">Adding New Icons</h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            We use the <strong>Lucide</strong> library for consistent line weights and aesthetics. When adding new icons, ensure they use a 20px size and follow the established category naming conventions.
          </p>
          <a
            href="https://lucide.dev/icons"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--base-primary)] hover:underline"
          >
            Browse all Lucide Icons
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
