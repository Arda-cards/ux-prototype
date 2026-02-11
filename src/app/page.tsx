import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Image,
  Palette,
  Target,
  AppWindow,
} from "lucide-react";

/* ── Data types ──────────────────────────────────────────────────────── */

type Status = "draft" | "in-review" | "approved";

interface Prototype {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly status: Status;
}

interface PrototypeGroup {
  readonly name: string;
  readonly items: readonly Prototype[];
}

interface Section {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly basePath: string;
  readonly items?: readonly Prototype[];
  readonly groups?: readonly PrototypeGroup[];
}

/* ── Status styling ──────────────────────────────────────────────────── */

const statusStyles: Record<Status, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  "in-review": "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
};

const statusLabels: Record<Status, string> = {
  draft: "Draft",
  "in-review": "In Review",
  approved: "Approved",
};

/* ── Gallery data ────────────────────────────────────────────────────── */

const sections: readonly Section[] = [
  {
    id: "visual-elements",
    title: "Visual Elements",
    description:
      "Icons, images, color palettes, and other visual assets used across components and pages.",
    icon: <Image className="h-5 w-5" />,
    basePath: "/prototypes/visual-elements",
    items: [
      {
        slug: "colors",
        title: "Colors",
        description: "Brand and UI color palette used in the Arda frontend application.",
        status: "approved",
      },
      {
        slug: "icons",
        title: "Icons",
        description: "Standard icon set used for navigation, actions, and status representation.",
        status: "approved",
      },
      {
        slug: "assets",
        title: "Brand Assets",
        description: "Logos, illustrations, and background elements used across the app.",
        status: "approved",
      },
    ],
  },
  {
    id: "components",
    title: "Component Prototypes",
    description:
      "Reusable UI components that can be composed across multiple screens and use cases.",
    icon: <Blocks className="h-5 w-5" />,
    basePath: "/prototypes/components",
    groups: [
      {
        name: "Arda UI Kit",
        items: [
          {
            slug: "arda/item-card",
            title: "Item Card",
            description: "High-fidelity physical card representation for Kanban inventory management.",
            status: "approved",
          },
          {
            slug: "arda/sidebar",
            title: "App Sidebar",
            description: "Main navigation shell with brand gradient and active markers.",
            status: "approved",
          },
          {
            slug: "arda/table",
            title: "Data Table",
            description: "Standard table layout for listing inventory, orders, and system records.",
            status: "approved",
          },
          {
            slug: "arda/badge",
            title: "Badge",
            description: "Small status indicators used for labeling, tagging, and states.",
            status: "approved",
          },
          {
            slug: "foundations/button",
            title: "Button",
            description: "High-fidelity Arda button with multiple variants, sizes, and states.",
            status: "approved",
          },
        ],
      },
      {
        name: "Templates & Overlays",
        items: [
          {
            slug: "sample",
            title: "Sample Component",
            description:
              "A template demonstrating forms, tables, and card grids.",
            status: "approved",
          },
        ],
      },
    ],
  },
  {
    id: "styles",
    title: "Styles",
    description:
      "Representative pages and components rendered in different visual styles — light/dark, color palettes, and brand variations.",
    icon: <Palette className="h-5 w-5" />,
    basePath: "/prototypes/styles",
    items: [],
  },
  {
    id: "use-cases",
    title: "Use Case Prototypes",
    description:
      "Targeted prototypes that demonstrate specific user flows and scenarios end-to-end.",
    icon: <Target className="h-5 w-5" />,
    basePath: "/prototypes/use-cases",
    items: [],
  },
  {
    id: "applications",
    title: "Application Prototypes",
    description:
      "Full-application wireframes with navigation, layout, and page structure — one sub-section per platform (Web, Mobile, etc.).",
    icon: <AppWindow className="h-5 w-5" />,
    basePath: "/prototypes/applications",
    items: [
      {
        slug: "web",
        title: "Arda Web App",
        description:
          "High-fidelity prototype of the Arda web application — Sign-in, Dashboard, Items, Order Queue, Receiving, and detail/form drawers.",
        status: "draft",
      },
    ],
  },
];

/* ── Components ──────────────────────────────────────────────────────── */

function PrototypeCard({
  proto,
  basePath,
}: Readonly<{ proto: Prototype; basePath: string }>) {
  return (
    <Link
      href={`${basePath}/${proto.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[proto.status]}`}
        >
          {statusLabels[proto.status]}
        </span>
      </div>
      <h3 className="text-base font-semibold text-card-foreground">
        {proto.title}
      </h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">
        {proto.description}
      </p>
      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--base-primary)] opacity-0 transition-opacity group-hover:opacity-100">
        View prototype
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function EmptyPlaceholder({
  sectionPath,
}: Readonly<{ sectionPath: string }>) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center text-muted-foreground">
      <p className="text-sm">
        Add a new prototype under{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          src/app{sectionPath}/
        </code>
      </p>
    </div>
  );
}

function GallerySection({ section }: Readonly<{ section: Section }>) {
  return (
    <section id={section.id} className="scroll-mt-20">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {section.icon}
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {section.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {section.description}
          </p>
        </div>
      </div>

      {section.groups ? (
        <div className="space-y-8">
          {section.groups.map((group) => (
            <div key={group.name} className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {group.name}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((proto) => (
                  <PrototypeCard
                    key={proto.slug}
                    proto={proto}
                    basePath={section.basePath}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((proto) => (
            <PrototypeCard
              key={proto.slug}
              proto={proto}
              basePath={section.basePath}
            />
          ))}
          {(!section.items || section.items.length === 0) && (
            <EmptyPlaceholder sectionPath={section.basePath} />
          )}
        </div>
      )}
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Prototype Gallery
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse wireframe prototypes for the Arda frontend. Toggle wireframe
          mode in the header to see the sketch aesthetic.
        </p>

        {/* Section quick-nav */}
        <nav className="mt-4 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {s.icon}
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      <div className="space-y-16">
        {sections.map((section) => (
          <GallerySection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
