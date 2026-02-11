"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Columns3,
} from "lucide-react";

/* ── Mock data ───────────────────────────────────────────────────────── */

const items = [
  { id: "ITM-001", name: "Printer Paper A4", sku: "PP-2847", category: "Office Supplies", qty: 342, unit: "ream", price: "$5.99", status: "In Stock" },
  { id: "ITM-002", name: "Blue Ballpoint Pens (12-pk)", sku: "BP-1293", category: "Writing", qty: 87, unit: "pack", price: "$4.49", status: "In Stock" },
  { id: "ITM-003", name: "Latex Gloves (M)", sku: "LG-0042", category: "Safety", qty: 12, unit: "box", price: "$12.99", status: "Low Stock" },
  { id: "ITM-004", name: "Isopropyl Alcohol 70%", sku: "IA-0091", category: "Lab Supplies", qty: 0, unit: "bottle", price: "$8.50", status: "Out of Stock" },
  { id: "ITM-005", name: "Sticky Notes 3x3 (Yellow)", sku: "SN-5501", category: "Office Supplies", qty: 250, unit: "pad", price: "$2.99", status: "In Stock" },
  { id: "ITM-006", name: "USB-C Cable 6ft", sku: "UC-8802", category: "Electronics", qty: 45, unit: "each", price: "$9.99", status: "In Stock" },
  { id: "ITM-007", name: "Nitrile Gloves (L)", sku: "NG-0043", category: "Safety", qty: 8, unit: "box", price: "$14.99", status: "Low Stock" },
  { id: "ITM-008", name: "Whiteboard Markers (Assorted)", sku: "WM-3302", category: "Writing", qty: 64, unit: "pack", price: "$7.49", status: "In Stock" },
  { id: "ITM-009", name: "Hand Sanitizer 500ml", sku: "HS-2211", category: "Safety", qty: 3, unit: "bottle", price: "$6.25", status: "Low Stock" },
  { id: "ITM-010", name: "File Folders (Manila, 25-pk)", sku: "FF-7710", category: "Office Supplies", qty: 120, unit: "pack", price: "$11.99", status: "In Stock" },
];

const statusMap: Record<string, string> = {
  "In Stock": "arda-badge--success",
  "Low Stock": "arda-badge--warning",
  "Out of Stock": "",
};

/* ── Detail Panel (inline) ───────────────────────────────────────────── */

function ItemDetailPanel({
  item,
  onClose,
  onEdit,
}: {
  item: (typeof items)[0];
  onClose: () => void;
  onEdit: () => void;
}) {
  const [tab, setTab] = useState<"details" | "cards">("details");

  return (
    <div className="arda-drawer-overlay open" onClick={onClose}>
      <div className="arda-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="arda-drawer__close" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="arda-drawer__header">
          <div className="arda-drawer__title">{item.name}</div>

          {/* Pill tabs */}
          <div className="arda-pill-switcher">
            <button
              className={`arda-pill-switcher__btn${tab === "details" ? " active" : ""}`}
              onClick={() => setTab("details")}
            >
              Item details
            </button>
            <button
              className={`arda-pill-switcher__btn${tab === "cards" ? " active" : ""}`}
              onClick={() => setTab("cards")}
            >
              Cards
            </button>
          </div>

          {/* Action toolbar */}
          {tab === "details" && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <button className="arda-btn arda-btn--ghost" onClick={onEdit}>
                ✏️ Edit item
              </button>
              <button className="arda-btn arda-btn--ghost">🛒 Add to cart</button>
              <button className="arda-btn arda-btn--ghost">🖨️ Print card</button>
              <button className="arda-btn arda-btn--ghost">🏷️ Print label</button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="arda-drawer__body">
          {tab === "details" ? (
            <>
              {/* Card preview */}
              <div
                style={{
                  background: "var(--arda-peach)",
                  padding: "24px 20px 48px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 200,
                    height: 130,
                    border: "1px solid var(--arda-border)",
                    borderRadius: 10,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "var(--arda-muted)",
                  }}
                >
                  Card Preview
                </div>
                <span style={{ fontSize: 12, color: "var(--arda-muted)" }}>
                  1 of 1
                </span>
              </div>

              {/* Detail fields */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "SKU", value: item.sku },
                  { label: "Category", value: item.category },
                  { label: "Quantity on hand", value: `${item.qty} ${item.unit}` },
                  { label: "Unit Price", value: item.price },
                  { label: "Link", value: "https://example.com/product", isLink: true },
                  { label: "GL Code", value: "6100-Office-Supplies" },
                ].map((f) => (
                  <div key={f.label}>
                    <div style={{ fontSize: 12, color: "var(--arda-muted)", marginBottom: 2 }}>
                      {f.label}
                    </div>
                    {f.isLink ? (
                      <a
                        href="#"
                        style={{
                          fontSize: 14,
                          color: "var(--arda-link)",
                          textDecoration: "underline",
                        }}
                      >
                        {f.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: 14, color: "var(--arda-dark)" }}>
                        {f.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Cards tab */
            <div className="arda-empty-state">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <div style={{ fontSize: 14 }}>Manage Cards</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Card management will be available in the production app.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="arda-drawer__footer">
          <button className="arda-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Item Form Panel (Simplified — Divergence) ───────────────────────── */

function ItemFormPanel({
  item,
  onClose,
}: {
  item: (typeof items)[0] | null;
  onClose: () => void;
}) {
  return (
    <div className="arda-drawer-overlay open" onClick={onClose}>
      <div
        className="arda-drawer arda-divergence"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 520 }}
      >
        {/* Close */}
        <button className="arda-drawer__close" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="arda-drawer__header">
          <div className="arda-drawer__title">
            {item ? "Edit Item" : "Add Item"}
          </div>
        </div>

        {/* Body */}
        <div className="arda-drawer__body" style={{ padding: 20 }}>
          {/* TOC */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
              fontSize: 12,
            }}
          >
            {[
              "General",
              "Vendor Info",
              "Ordering",
              "Pricing",
              "Stock",
              "Attachments",
            ].map((s, i) => (
              <span
                key={s}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: i === 0 ? "var(--arda-dark)" : "var(--arda-secondary-bg)",
                  color: i === 0 ? "#fff" : "var(--arda-muted)",
                  fontWeight: 500,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* General section */}
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--arda-dark)",
            }}
          >
            General
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Item Name", value: item?.name ?? "", placeholder: "e.g. Printer Paper A4" },
              { label: "SKU", value: item?.sku ?? "", placeholder: "e.g. PP-2847" },
              { label: "Category", value: item?.category ?? "", placeholder: "Select category" },
              { label: "Description", value: "", placeholder: "Enter a description…", multiline: true },
            ].map((f) => (
              <div key={f.label}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 4,
                    color: "var(--arda-dark)",
                  }}
                >
                  {f.label}
                </label>
                {f.multiline ? (
                  <textarea
                    rows={3}
                    placeholder={f.placeholder}
                    defaultValue={f.value}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid var(--arda-border)",
                      borderRadius: 8,
                      fontSize: 13,
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    defaultValue={f.value}
                    style={{
                      width: "100%",
                      height: 36,
                      padding: "0 12px",
                      border: "1px solid var(--arda-border)",
                      borderRadius: 8,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Vendor section */}
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginTop: 28,
              marginBottom: 16,
              color: "var(--arda-dark)",
            }}
          >
            Vendor Info
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Supplier", value: "", placeholder: "Select supplier" },
              { label: "Vendor SKU", value: "", placeholder: "Vendor's SKU" },
            ].map((f) => (
              <div key={f.label}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 4,
                    color: "var(--arda-dark)",
                  }}
                >
                  {f.label}
                </label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  defaultValue={f.value}
                  style={{
                    width: "100%",
                    height: 36,
                    padding: "0 12px",
                    border: "1px solid var(--arda-border)",
                    borderRadius: 8,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Placeholder for remaining sections */}
          <div
            className="arda-divergence"
            style={{
              marginTop: 28,
              padding: 24,
              borderRadius: 10,
              textAlign: "center",
              fontSize: 13,
              color: "var(--arda-muted)",
            }}
          >
            Remaining sections (Ordering, Pricing, Stock, Attachments) are
            omitted in this prototype. The production form has 100+ fields across
            8 sections.
          </div>
        </div>

        {/* Footer */}
        <div className="arda-drawer__footer">
          <button className="arda-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="arda-btn arda-btn--primary" onClick={onClose}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Items Page ──────────────────────────────────────────────────────── */

export default function ItemsPage() {
  const [selectedItem, setSelectedItem] = useState<(typeof items)[0] | null>(null);
  const [formItem, setFormItem] = useState<(typeof items)[0] | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  const showForm = formItem !== undefined;

  return (
    <>
      {/* Breadcrumb */}
      <div className="arda-breadcrumb">
        <a href="/prototypes/applications/web">Dashboard</a>
        <ChevronRight size={14} />
        <span className="arda-breadcrumb__current">Items</span>
      </div>

      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--arda-dark)" }}>
          Items
        </h1>
        <button
          className="arda-btn arda-btn--primary"
          onClick={() => setFormItem(null)}
        >
          <Plus size={15} /> Add item
        </button>
      </div>

      {/* Tabs */}
      <div className="arda-tabs">
        {[
          { id: "all", label: "All Items", count: items.length },
          { id: "low", label: "Low Stock", count: 3 },
          { id: "out", label: "Out of Stock", count: 1 },
        ].map((t) => (
          <button
            key={t.id}
            className={`arda-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            <span className="arda-tab__badge">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="arda-toolbar">
        <div className="arda-toolbar__search">
          <Search />
          <input placeholder="Search items…" readOnly />
        </div>
        <button className="arda-btn">
          <Filter size={14} /> Filter
        </button>
        <button className="arda-btn">
          <Columns3 size={14} /> Columns <ChevronDown size={12} />
        </button>
        <div style={{ flex: 1 }} />
        <button className="arda-btn">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Data Table */}
      <div
        style={{
          border: "1px solid var(--arda-border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table className="arda-table">
          <thead>
            <tr>
              <th style={{ width: 32, paddingLeft: 16 }}>
                <input type="checkbox" readOnly style={{ accentColor: "var(--arda-orange)" }} />
              </th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} onClick={() => setSelectedItem(item)}>
                <td style={{ paddingLeft: 16 }}>
                  <input
                    type="checkbox"
                    readOnly
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: "var(--arda-orange)" }}
                  />
                </td>
                <td style={{ fontWeight: 500, color: "var(--arda-link)" }}>
                  {item.name}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                  {item.sku}
                </td>
                <td>{item.category}</td>
                <td>
                  {item.qty} {item.unit}
                </td>
                <td>{item.price}</td>
                <td>
                  <span className={`arda-badge ${statusMap[item.status] ?? ""}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="arda-btn arda-btn--ghost"
                    style={{ padding: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          fontSize: 13,
          color: "var(--arda-muted)",
        }}
      >
        <span>Showing 1–10 of 2,847 items</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="arda-btn" style={{ padding: "4px 8px" }}>
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3, "…", 285].map((p, i) => (
            <button
              key={i}
              className="arda-btn"
              style={{
                padding: "4px 10px",
                minWidth: 32,
                justifyContent: "center",
                ...(p === 1
                  ? {
                      background: "var(--arda-dark)",
                      color: "#fff",
                      borderColor: "var(--arda-dark)",
                    }
                  : {}),
              }}
            >
              {p}
            </button>
          ))}
          <button className="arda-btn" style={{ padding: "4px 8px" }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Drawers ──────────────────────────────────────────────── */}

      {/* Item Detail Panel */}
      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => {
            setFormItem(selectedItem);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Item Form Panel */}
      {showForm && (
        <ItemFormPanel
          item={formItem}
          onClose={() => setFormItem(undefined)}
        />
      )}
    </>
  );
}
