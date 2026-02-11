"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  Package,
  Check,
  Clock,
  MoreHorizontal,
  Truck,
} from "lucide-react";

/* ── Mock data ───────────────────────────────────────────────────────── */

interface ReceivingItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  supplier: string;
  orderMethod: string;
  status: "pending" | "partial" | "received";
  receivedQty: number;
}

const receivingItems: ReceivingItem[] = [
  { id: "R-001", name: "Printer Paper A4", sku: "PP-2847", qty: 10, unit: "ream", supplier: "Office Depot", orderMethod: "PO-2024-001", status: "pending", receivedQty: 0 },
  { id: "R-002", name: "Blue Ballpoint Pens (12-pk)", sku: "BP-1293", qty: 6, unit: "pack", supplier: "Staples", orderMethod: "PO-2024-002", status: "partial", receivedQty: 3 },
  { id: "R-003", name: "Latex Gloves (M)", sku: "LG-0042", qty: 5, unit: "box", supplier: "Fisher Scientific", orderMethod: "PO-2024-003", status: "pending", receivedQty: 0 },
  { id: "R-004", name: "Isopropyl Alcohol 70%", sku: "IA-0091", qty: 12, unit: "bottle", supplier: "Fisher Scientific", orderMethod: "PO-2024-003", status: "pending", receivedQty: 0 },
  { id: "R-005", name: "Sticky Notes 3x3 (Yellow)", sku: "SN-5501", qty: 24, unit: "pad", supplier: "Office Depot", orderMethod: "PO-2024-001", status: "pending", receivedQty: 0 },
  { id: "R-006", name: "USB-C Cable 6ft", sku: "UC-8802", qty: 5, unit: "each", supplier: "Amazon Business", orderMethod: "PO-2024-004", status: "received", receivedQty: 5 },
];

const recentlyReceived = [
  { id: "RR-001", name: "Whiteboard Markers (Assorted)", sku: "WM-3302", qty: 12, unit: "pack", supplier: "Staples", receivedDate: "Feb 7, 2026" },
  { id: "RR-002", name: "File Folders (Manila)", sku: "FF-7710", qty: 8, unit: "pack", supplier: "Office Depot", receivedDate: "Feb 6, 2026" },
  { id: "RR-003", name: "Hand Sanitizer 500ml", sku: "HS-2211", qty: 10, unit: "bottle", supplier: "Amazon Business", receivedDate: "Feb 5, 2026" },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={16} style={{ color: "#f59e0b" }} />,
  partial: <Package size={16} style={{ color: "#2563eb" }} />,
  received: <Check size={16} style={{ color: "#16a34a" }} />,
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  partial: "Partial",
  received: "Received",
};

const statusBadgeClass: Record<string, string> = {
  pending: "arda-badge--warning",
  partial: "arda-badge--info",
  received: "arda-badge--success",
};

/* ── Detail Panel (for receiving) ────────────────────────────────────── */

function ReceivingDetailPanel({
  item,
  onClose,
}: {
  item: ReceivingItem;
  onClose: () => void;
}) {
  return (
    <div className="arda-drawer-overlay open" onClick={onClose}>
      <div className="arda-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="arda-drawer__close" onClick={onClose}>
          ✕
        </button>
        <div className="arda-drawer__header">
          <div className="arda-drawer__title">{item.name}</div>
          <div className="arda-pill-switcher" style={{ alignSelf: "flex-start" }}>
            <button className="arda-pill-switcher__btn active">Item details</button>
            <button className="arda-pill-switcher__btn">Cards</button>
          </div>
        </div>
        <div className="arda-drawer__body">
          {/* Card preview */}
          <div
            style={{
              background: "var(--arda-peach)",
              padding: "24px 20px 40px",
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
          </div>

          {/* Detail fields */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "SKU", value: item.sku },
              { label: "Supplier", value: item.supplier },
              { label: "Order", value: item.orderMethod },
              { label: "Ordered", value: `${item.qty} ${item.unit}` },
              { label: "Received", value: `${item.receivedQty} ${item.unit}` },
              { label: "Status", value: statusLabels[item.status] },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 12, color: "var(--arda-muted)", marginBottom: 2 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 14, color: "var(--arda-dark)" }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="arda-drawer__footer">
          <button className="arda-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Receiving Page ──────────────────────────────────────────────────── */

export default function ReceivingPage() {
  const [activeTab, setActiveTab] = useState("receiving");
  const [selectedItem, setSelectedItem] = useState<ReceivingItem | null>(null);

  const pendingCount = receivingItems.filter((i) => i.status !== "received").length;

  return (
    <>
      {/* Breadcrumb */}
      <div className="arda-breadcrumb">
        <a href="/prototypes/applications/web">Dashboard</a>
        <ChevronRight size={14} />
        <span className="arda-breadcrumb__current">Receiving</span>
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
          Receiving
        </h1>
        <button className="arda-btn arda-btn--primary">
          <Check size={15} /> Receive All ({pendingCount})
        </button>
      </div>

      {/* Tabs */}
      <div className="arda-tabs">
        {[
          { id: "receiving", label: "Receiving", count: pendingCount },
          { id: "recent", label: "Recently Received", count: recentlyReceived.length },
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
          <input placeholder="Search receiving items…" readOnly />
        </div>
      </div>

      {/* Item List */}
      {activeTab === "receiving" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {receivingItems.map((item) => (
            <div
              key={item.id}
              className="arda-receiving-row"
              onClick={() => setSelectedItem(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="arda-receiving-row__left">
                <div
                  className="arda-receiving-row__icon"
                  style={{
                    background:
                      item.status === "received"
                        ? "#dcfce7"
                        : item.status === "partial"
                          ? "#dbeafe"
                          : "#fef3c7",
                  }}
                >
                  {statusIcons[item.status]}
                </div>
                <div className="arda-receiving-row__info">
                  <div>
                    <span className="arda-receiving-row__name">{item.name}</span>
                    <span className="arda-receiving-row__qty">
                      {item.receivedQty}/{item.qty} {item.unit}
                    </span>
                  </div>
                  <div className="arda-receiving-row__meta">
                    {item.supplier} • {item.orderMethod}
                  </div>
                </div>
              </div>
              <div className="arda-receiving-row__actions">
                <span className={`arda-badge ${statusBadgeClass[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
                {item.status !== "received" && (
                  <button
                    className="arda-btn"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Check size={13} /> Receive
                  </button>
                )}
                <button
                  className="arda-btn arda-btn--ghost"
                  style={{ padding: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentlyReceived.map((item) => (
            <div key={item.id} className="arda-receiving-row">
              <div className="arda-receiving-row__left">
                <div
                  className="arda-receiving-row__icon"
                  style={{ background: "#dcfce7" }}
                >
                  <Check size={16} style={{ color: "#16a34a" }} />
                </div>
                <div className="arda-receiving-row__info">
                  <div>
                    <span className="arda-receiving-row__name">{item.name}</span>
                    <span className="arda-receiving-row__qty">
                      {item.qty} {item.unit}
                    </span>
                  </div>
                  <div className="arda-receiving-row__meta">
                    {item.supplier} • Received {item.receivedDate}
                  </div>
                </div>
              </div>
              <div className="arda-receiving-row__actions">
                <span className="arda-badge arda-badge--success">Received</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedItem && (
        <ReceivingDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
