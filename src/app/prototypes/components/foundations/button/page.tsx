"use client";

import Link from "next/link";
import { ChevronLeft, Plus, Download, Trash2, Loader2, Mail } from "lucide-react";
import "./button-demo.css";

export default function ButtonPrototype() {
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Button</h1>
            <p className="mt-2 text-muted-foreground">
              Core interactive element for triggering actions. Follows Arda's design tokens for colors, radius, and shadows.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Section: Variants */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Variants</h2>
            <div className="btn-demo-grid">
              <div className="btn-demo-group">
                <span className="btn-demo-label">Primary</span>
                <button className="arda-btn arda-btn-primary arda-btn-md">Primary Action</button>
              </div>
              <div className="btn-demo-group">
                <span className="btn-demo-label">Secondary</span>
                <button className="arda-btn arda-btn-secondary arda-btn-md">Secondary Action</button>
              </div>
              <div className="btn-demo-group">
                <span className="btn-demo-label">Ghost</span>
                <button className="arda-btn arda-btn-ghost arda-btn-md">Ghost Action</button>
              </div>
              <div className="btn-demo-group">
                <span className="btn-demo-label">Destructive</span>
                <button className="arda-btn arda-btn-destructive arda-btn-md">Delete Item</button>
              </div>
            </div>
          </section>

          {/* Section: Sizes */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Sizes</h2>
            <div className="btn-demo-grid">
              <div className="btn-demo-group col-span-full">
                <div className="btn-row">
                  <div className="flex flex-col gap-2">
                    <span className="btn-demo-label">Small (32px)</span>
                    <button className="arda-btn arda-btn-primary arda-btn-sm">Small Button</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="btn-demo-label">Medium (40px)</span>
                    <button className="arda-btn arda-btn-primary arda-btn-md">Medium Button</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="btn-demo-label">Large (48px)</span>
                    <button className="arda-btn arda-btn-primary arda-btn-lg">Large Button</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: States */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">States</h2>
            <div className="btn-demo-grid">
              <div className="btn-demo-group">
                <span className="btn-demo-label">Disabled</span>
                <button className="arda-btn arda-btn-primary arda-btn-md" disabled>
                  Can't Click This
                </button>
              </div>
              <div className="btn-demo-group">
                <span className="btn-demo-label">Loading</span>
                <button className="arda-btn arda-btn-primary arda-btn-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </button>
              </div>
              <div className="btn-demo-group">
                <span className="btn-demo-label">Icon + Text</span>
                <button className="arda-btn arda-btn-primary arda-btn-md">
                  <Plus className="h-4 w-4" />
                  New Item
                </button>
              </div>
              <div className="btn-demo-group">
                <span className="btn-demo-label">Icon Only</span>
                <div className="btn-row">
                  <button className="arda-btn arda-btn-secondary arda-btn-md" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="arda-btn arda-btn-ghost arda-btn-md" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Real World Examples */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Real World Examples</h2>
            <div className="rounded-xl border border-border bg-white p-8">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[var(--base-primary)]">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-lg font-semibold">Confirm your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation link to your inbox. Please click it to activate your account.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="arda-btn arda-btn-secondary arda-btn-md">Remind me later</button>
                  <button className="arda-btn arda-btn-primary arda-btn-md">Resend Link</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
