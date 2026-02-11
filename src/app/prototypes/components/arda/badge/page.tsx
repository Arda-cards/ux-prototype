"use client";

import Link from "next/link";
import { ChevronLeft, Info, HelpCircle } from "lucide-react";
import { ArdaBadge } from "@/components/arda/badge";

export default function BadgePrototype() {
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Badge</h1>
            <p className="mt-2 text-muted-foreground">
              Small status indicators used for labeling, tagging, and displaying states in tables and cards.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Variants */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Variants</h2>
            <div className="flex flex-wrap gap-4 p-8 bg-white rounded-xl border border-border shadow-sm">
              <ArdaBadge variant="default">Default</ArdaBadge>
              <ArdaBadge variant="success">Success</ArdaBadge>
              <ArdaBadge variant="warning">Warning</ArdaBadge>
              <ArdaBadge variant="info">Info</ArdaBadge>
              <ArdaBadge variant="destructive">Destructive</ArdaBadge>
              <ArdaBadge variant="outline">Outline</ArdaBadge>
            </div>
          </section>

          {/* With Dot */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">With Dot Indicator</h2>
            <div className="flex flex-wrap gap-4 p-8 bg-white rounded-xl border border-border shadow-sm">
              <ArdaBadge variant="default" dot>Offline</ArdaBadge>
              <ArdaBadge variant="success" dot>Active</ArdaBadge>
              <ArdaBadge variant="warning" dot>Pending</ArdaBadge>
              <ArdaBadge variant="info" dot>Processing</ArdaBadge>
              <ArdaBadge variant="destructive" dot>Error</ArdaBadge>
              <ArdaBadge variant="outline" dot>Draft</ArdaBadge>
            </div>
          </section>

          {/* Real World Examples */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Real World Examples</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Order Status */}
              <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Order Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm font-medium">Order #12345</span>
                    <ArdaBadge variant="success" dot>Delivered</ArdaBadge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm font-medium">Order #12346</span>
                    <ArdaBadge variant="info" dot>In Transit</ArdaBadge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Order #12347</span>
                    <ArdaBadge variant="warning" dot>Processing</ArdaBadge>
                  </div>
                </div>
              </div>

              {/* Inventory Levels */}
              <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Inventory Levels</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <HelpCircle size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Resistors 10k</p>
                      <p className="text-xs text-muted-foreground">Location: A-1</p>
                    </div>
                    <ArdaBadge variant="destructive">Critical Low</ArdaBadge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Info size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Capacitors 22uF</p>
                      <p className="text-xs text-muted-foreground">Location: B-4</p>
                    </div>
                    <ArdaBadge variant="success">Healthy</ArdaBadge>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
