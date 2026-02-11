"use client";

import Link from "next/link";
import { ChevronLeft, Download, ExternalLink } from "lucide-react";

interface AssetCardProps {
  name: string;
  filename: string;
  category: string;
  description: string;
  isImage?: boolean;
}

function AssetCard({ name, filename, description }: AssetCardProps) {
  const path = `/images/arda/${filename}`;

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-40 w-full bg-[#f0f0f0] flex items-center justify-center p-6 pattern-grid">
        <img
          src={path}
          alt={name}
          className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground text-sm">{name}</h3>
          <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {filename.split('.').pop()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex-1 mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-auto">
          <a
            href={path}
            download
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Download size={12} />
            Download
          </a>
          <a
            href={path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AssetsPrototype() {
  const assets = [
    {
      name: "Arda Main Logo",
      filename: "ArdaLogoV1.svg",
      category: "Branding",
      description: "The primary brand mark used in light themes and headers."
    },
    {
      name: "Arda Logo Black",
      filename: "ArdaLogoBlack.svg",
      category: "Branding",
      description: "Monochrome version used for high-contrast or formal contexts."
    },
    {
      name: "Mobile Mark",
      filename: "ArdaLogoMobileV1.svg",
      category: "Branding",
      description: "Simplified mark optimized for mobile headers and small avatars."
    },
    {
      name: "QR Code Template",
      filename: "QRC.svg",
      category: "Components",
      description: "Template for generated QR codes used in item tracking labels."
    },
    {
      name: "Sidebar Footer",
      filename: "SidebarFooter.svg",
      category: "UI Graphics",
      description: "Visual element used for the background or decorative footer in the app sidebar."
    },
    {
      name: "Puddle Illustration 1",
      filename: "Puddle1.svg",
      category: "Decorations",
      description: "Organic background element used for subtle page texturing."
    },
    {
      name: "Video Placeholder",
      filename: "PlaceholderVideo.svg",
      category: "Media",
      description: "UI placeholder for video content or loading states."
    },
    {
      name: "Example Item Card",
      filename: "imageExampleCard.png",
      category: "Content",
      description: "Example product image used for testing item detail layouts."
    }
  ];

  const themes = [
    { name: "Light Theme", filename: "theme-light.svg" },
    { name: "Dark Theme", filename: "theme-dark.svg" },
    { name: "System Theme", filename: "theme-system.svg" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <style jsx>{`
        .pattern-grid {
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .sidebar-gradient-preview {
          position: absolute;
          top: 0;
          right: -100px;
          width: 200px;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(252, 90, 41, 0.08) 100%
          );
          transform: skewX(-20deg);
          transform-origin: top right;
        }
      `}</style>

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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Brand Assets</h1>
            <p className="mt-2 text-muted-foreground">
              A collection of static assets, illustrations, and UI graphics extracted from the Arda
              production environment.
            </p>
          </div>
        </div>

        <div className="space-y-16">
          {/* Section: Branding */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">Core Assets</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {assets.map((asset) => (
                <AssetCard key={asset.filename} {...asset} />
              ))}
            </div>
          </section>

          {/* Section: UI Patterns */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">UI Patterns & Backgrounds</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-40 bg-[#0a0a0a] relative overflow-hidden">
                  <div className="absolute inset-0 sidebar-gradient-preview" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm">Sidebar Brand Gradient</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Characteristic slanted gradient used in sidebars and sign-in pages to provide
                    depth and brand identity.
                  </p>
                  <code className="mt-3 block text-[10px] bg-muted p-2 rounded text-muted-foreground leading-tight">
                    background: linear-gradient(180deg,
                    <br />
                    &nbsp;&nbsp;rgba(255, 255, 255, 0.04) 0%,
                    <br />
                    &nbsp;&nbsp;rgba(252, 90, 41, 0.08) 100%);
                    <br />
                    transform: skewX(-20deg);
                  </code>
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-40 bg-white relative pattern-grid" />
                <div className="p-4">
                  <h3 className="font-semibold text-sm">Fine Grid Pattern</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subtle radial dot grid used as a background for canvas areas, modals, and asset
                    previews.
                  </p>
                  <code className="mt-3 block text-[10px] bg-muted p-2 rounded text-muted-foreground leading-tight">
                    background-image: radial-gradient(#e5e5e5 1px, transparent 1px);
                    <br />
                    background-size: 16px 16px;
                  </code>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Themes */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">Theme Representation</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-3">
              {themes.map((theme) => (
                <div
                  key={theme.filename}
                  className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border bg-white transition-all hover:shadow-md"
                >
                  <img
                    src={`/images/arda/${theme.filename}`}
                    alt={theme.name}
                    className="h-24 w-auto object-contain"
                  />
                  <span className="text-sm font-medium">{theme.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All assets are copyright &copy; Arda Systems. Use these only for official Arda prototype development.
          </p>
        </div>
      </div>
    </div>
  );
}
