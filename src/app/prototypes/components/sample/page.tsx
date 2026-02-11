import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SamplePrototypePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Gallery
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/#components" className="hover:text-foreground">
          Components
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Sample Component</span>
      </nav>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Sample Component
      </h1>
      <p className="mb-8 text-muted-foreground">
        A template component prototype. Copy this folder to create a new
        component prototype.
      </p>

      {/* ── Form Section ────────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Entity Form</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="field-name"
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>
            <input
              id="field-name"
              type="text"
              placeholder="Enter name…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="field-type"
              className="mb-1 block text-sm font-medium"
            >
              Type
            </label>
            <select
              id="field-type"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>
                Select type…
              </option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="component">Component</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="field-description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="field-description"
              rows={3}
              placeholder="Describe the entity…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="field-active"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              defaultChecked
            />
            <label htmlFor="field-active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Save
          </button>
          <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
            Cancel
          </button>
        </div>
      </section>

      {/* ── Table Section ───────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Data Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-medium text-muted-foreground">
                  ID
                </th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="pb-3 font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "001",
                  name: "Widget Alpha",
                  type: "Product",
                  status: "Active",
                },
                {
                  id: "002",
                  name: "Service Beta",
                  type: "Service",
                  status: "Inactive",
                },
                {
                  id: "003",
                  name: "Part Gamma",
                  type: "Component",
                  status: "Active",
                },
              ].map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs">{row.id}</td>
                  <td className="py-3 pr-4">{row.name}</td>
                  <td className="py-3 pr-4">{row.type}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Card Grid Section ───────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Card Grid</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {["Metric A", "Metric B", "Metric C"].map((label) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-background p-4"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">42</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
