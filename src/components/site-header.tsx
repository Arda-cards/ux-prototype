"use client";

import Link from "next/link";
import { WireframeToggle } from "@/components/wireframe-toggle";
import { Layers } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Layers className="h-5 w-5 text-[var(--base-primary)]" />
          <span>Arda UX Prototypes</span>
        </Link>
        <WireframeToggle />
      </div>
    </header>
  );
}
