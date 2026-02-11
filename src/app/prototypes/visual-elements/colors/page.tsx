"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check } from "lucide-react";

interface ColorSwatchProps {
  name: string;
  variable: string;
  hex: string;
  description: string;
}

function ColorSwatch({ name, variable, hex, description }: ColorSwatchProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div
        className="h-32 w-full transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            title="Copy hex code"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs font-mono text-muted-foreground mb-2 bg-muted/50 px-2 py-1 rounded inline-block self-start">
          {hex}
        </p>
        <p className="text-sm text-muted-foreground flex-1">
          {description}
        </p>
        <div className="mt-3 pt-3 border-t border-border/50">
          <code className="text-[10px] text-muted-foreground/70">
            {variable}
          </code>
        </div>
      </div>
    </div>
  );
}

export default function ColorsPrototype() {
  const brandColors = [
    { name: "Arda Orange (Primary)", hex: "#FC5A29", variable: "--base-primary", description: "The core brand color used for primary actions, branding, and status indicators." },
    { name: "Accent Light", hex: "#FEF7F5", variable: "--accent-light", description: "Soft orange background used for highlighting and low-contrast states." },
  ];

  const uiColors = [
    { name: "Background", hex: "#FFFFFF", variable: "--base-background", description: "Primary app background color." },
    { name: "Secondary / Surface", hex: "#F5F5F5", variable: "--base-secondary", description: "Used for subtle backgrounds, secondary cards, and alternating table rows." },
    { name: "Foreground", hex: "#0A0A0A", variable: "--base-foreground", description: "Core text color for headings and body content." },
    { name: "Muted Foreground", hex: "#737373", variable: "--base-muted-foreground", description: "Used for secondary text, labels, and helper messages." },
    { name: "Border", hex: "#E5E5E5", variable: "--base-border", description: "Standard border color for inputs, cards, and dividers." },
  ];

  const functionalColors = [
    { name: "Destructive", hex: "#DC2626", variable: "--base-destructive", description: "Used for dangerous actions like delete or cancel." },
    { name: "Link Blue", hex: "#0A68F3", variable: "--colors-link-light", description: "Standard blue for inline hyperlinks and navigation links." },
    { name: "Hover Dark", hex: "#282828", variable: "--hover-color", description: "Dark hover state used primarily in the sidebar." },
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Color Palette</h1>
            <p className="mt-2 text-muted-foreground">
              Visual tokens extracted from the Arda frontend application. These are the source of truth for all styling.
            </p>
          </div>
        </div>

        <div className="space-y-16">
          {/* Section: Brand */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">Brand Identity</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {brandColors.map((color) => (
                <ColorSwatch key={color.hex} {...color} />
              ))}
            </div>
          </section>

          {/* Section: UI Surfaces */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">UI & Surfaces</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {uiColors.map((color) => (
                <ColorSwatch key={color.hex} {...color} />
              ))}
            </div>
          </section>

          {/* Section: Functional */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">Functional & Interactive</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {functionalColors.map((color) => (
                <ColorSwatch key={color.hex} {...color} />
              ))}
            </div>
          </section>
        </div>

        {/* Usage Tip */}
        <div className="mt-16 rounded-xl bg-orange-50 p-6 border border-orange-100">
          <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">💡 Usage Tip</h3>
          <p className="text-orange-900 text-sm leading-relaxed">
            In your CSS, prefer using these variables instead of hardcoded hex values. This ensures that if the brand palette updates, the prototype remains in sync with the production app automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
