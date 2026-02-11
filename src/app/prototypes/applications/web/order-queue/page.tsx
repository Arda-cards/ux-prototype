"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Package,
  MoreHorizontal,
} from "lucide-react";

/* ── Mock data ───────────────────────────────────────────────────────── */

interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  unit: string;
  price: string;
}

interface SupplierGroup {
  supplier: string;
  itemCount: number;
  total: string;
  items: OrderItem[];
}

const suppliers: SupplierGroup[] = [
  {
    supplier: "Office Depot",
    itemCount: 3,
    total: "$243.47",
    items: [
      { name: "Printer Paper A4", sku: "PP-2847", qty: 10, unit: "ream", price: "$59.90" },
      { name: "Sticky Notes 3x3", sku: "SN-5501", qty: 24, unit: "pad", price: "$71.76" },
      { name: "File Folders (Manila)", sku: "FF-7710", qty: 8, unit: "pack", price: "$95.92" },
    ],
  },
  {
    supplier: "Fisher Scientific",
    itemCount: 2,
    total: "$171.98",
    items: [
      { name: "Isopropyl Alcohol 70%", sku: "IA-0091", qty: 12, unit: "bottle", price: "$102.00" },
      { name: "Latex Gloves (M)", sku: "LG-0042", qty: 5, unit: "box", price: "$64.95" },
    ],
  },
  {
    supplier: "Staples",
    itemCount: 2,
    total: "$127.48",
    items: [
      { name: "Blue Ballpoint Pens (12-pk)", sku: "BP-1293", qty: 6, unit: "pack", price: "$26.94" },
      { name: "Whiteboard Markers (Assorted)", sku: "WM-3302", qty: 12, unit: "pack", price: "$89.88" },
    ],
  },
  {
    supplier: "Amazon Business",
    itemCount: 2,
    total: "$109.98",
    items: [
      { name: "USB-C Cable 6ft", sku: "UC-8802", qty: 5, unit: "each", price: "$49.95" },
      { name: "Hand Sanitizer 500ml", sku: "HS-2211", qty: 10, unit: "bottle", price: "$62.50" },
    ],
  },
];

/* ── Collapsible Group ───────────────────────────────────────────────── */

function SupplierSection({ group }: { group: SupplierGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="arda-supplier-group">
      <div
        className="arda-supplier-group__header"
        onClick={() => setOpen(!open)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{group.supplier}</span>
          <span
            className="arda-tab__badge"
            style={{ fontSize: 11 }}
          >
            {group.itemCount} items
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "var(--arda-muted)" }}>
            {group.total}
          </span>
          <button className="arda-btn arda-btn--primary" style={{ fontSize: 12, padding: "4px 10px" }}>
            <ShoppingCart size={13} /> Order All
          </button>
        </div>
      </div>

      {open &&
        group.items.map((item) => (
          <div key={item.sku} className="arda-supplier-group__item">
            <div className="arda-supplier-group__item-left">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--arda-secondary-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={16} style={{ color: "var(--arda-muted)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--arda-muted)" }}>
                  {item.sku} • {item.qty} {item.unit}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.price}</span>
              <button
                className="arda-btn arda-btn--ghost"
                style={{ padding: 4 }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ── Order Queue Page ────────────────────────────────────────────────── */

export default function OrderQueuePage() {
  const [activeTab, setActiveTab] = useState("queue");

  const totalItems = suppliers.reduce((a, s) => a + s.itemCount, 0);

  return (
    <>
      {/* Breadcrumb */}
      <div className="arda-breadcrumb">
        <a href="/prototypes/applications/web">Dashboard</a>
        <ChevronRight size={14} />
        <span className="arda-breadcrumb__current">Order Queue</span>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--arda-dark)" }}>
          Order Queue
        </h1>
        <button className="arda-btn arda-btn--primary">
          <ShoppingCart size={15} /> Order All ({totalItems})
        </button>
      </div>

      {/* Tabs */}
      <div className="arda-tabs">
        {[
          { id: "queue", label: "Order Queue", count: totalItems },
          { id: "history", label: "Order History", count: 42 },
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

      {/* Search */}
      <div className="arda-toolbar">
        <div className="arda-toolbar__search">
          <Search />
          <input placeholder="Search orders…" readOnly />
        </div>
      </div>

      {/* Supplier Groups */}
      {activeTab === "queue" ? (
        <div>
          {suppliers.map((g) => (
            <SupplierSection key={g.supplier} group={g} />
          ))}
        </div>
      ) : (
        <div className="arda-empty-state">
          <ShoppingCart />
          <div style={{ fontSize: 14, fontWeight: 500 }}>Order History</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Past orders will appear here.
          </div>
        </div>
      )}
    </>
  );
}
