import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Truck,
  FileText,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Plus,
} from "lucide-react";

/* ── Mock data ───────────────────────────────────────────────────────── */

const metrics = [
  { label: "Total Inventory", value: "2,847", trend: "+4.3%", up: true },
  { label: "Low-Stock Items", value: "23", trend: "+2", up: false },
  { label: "Pending Orders", value: "18", trend: "-3", up: true },
  { label: "Monthly Spend", value: "$12,450", trend: "+8.1%", up: false },
];

const recentOrders = [
  {
    id: "ORD-1024",
    supplier: "Office Depot",
    items: 5,
    total: "$342.50",
    status: "Pending",
    date: "Feb 8, 2026",
  },
  {
    id: "ORD-1023",
    supplier: "Staples",
    items: 3,
    total: "$128.00",
    status: "Shipped",
    date: "Feb 7, 2026",
  },
  {
    id: "ORD-1022",
    supplier: "Amazon Business",
    items: 12,
    total: "$1,245.99",
    status: "Delivered",
    date: "Feb 5, 2026",
  },
  {
    id: "ORD-1021",
    supplier: "Fisher Scientific",
    items: 2,
    total: "$89.00",
    status: "Pending",
    date: "Feb 4, 2026",
  },
];

const getStartedItems = [
  { label: "Add your first item", done: true },
  { label: "Set up a supplier", done: true },
  { label: "Create an order", done: false },
  { label: "Invite team members", done: false },
];

const statusStyles: Record<string, string> = {
  Pending: "arda-badge--warning",
  Shipped: "arda-badge--info",
  Delivered: "arda-badge--success",
};

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <>
      {/* ── Welcome Card ───────────────────────────────────────── */}
      <div className="arda-welcome">
        <div className="arda-welcome__title">Welcome back, Demo User!</div>
        <div className="arda-welcome__subtitle">
          Here&apos;s a quick overview of your workspace.
        </div>

        <div className="arda-welcome__actions">
          {[
            { icon: Plus, label: "Add Item", color: "#fef2ec", iconColor: "#fc5a29" },
            { icon: ShoppingCart, label: "New Order", color: "#eef6ff", iconColor: "#2563eb" },
            { icon: Truck, label: "Receive", color: "#ecfdf5", iconColor: "#16a34a" },
            { icon: FileText, label: "Reports", color: "#faf5ff", iconColor: "#9333ea" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.label} className="arda-welcome__action-card">
                <div
                  className="arda-welcome__action-icon"
                  style={{ background: a.color }}
                >
                  <Icon size={22} style={{ color: a.iconColor }} />
                </div>
                <span className="arda-welcome__action-label">{a.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Metrics ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {metrics.map((m) => (
          <div key={m.label} className="arda-metric-card">
            <div className="arda-metric-card__label">{m.label}</div>
            <div className="arda-metric-card__value">{m.value}</div>
            <div
              className={`arda-metric-card__trend ${
                m.up ? "arda-metric-card__trend--up" : "arda-metric-card__trend--down"
              }`}
            >
              {m.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column: Orders + Get Started ────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Recent Orders Table */}
        <div
          style={{
            border: "1px solid var(--arda-border)",
            borderRadius: 12,
            background: "var(--arda-card-bg)",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Orders</h2>
            <Link
              href="/prototypes/applications/web/order-queue"
              style={{
                fontSize: 13,
                color: "var(--arda-orange)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <table className="arda-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} style={{ cursor: "default" }}>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                    {o.id}
                  </td>
                  <td>{o.supplier}</td>
                  <td>{o.items}</td>
                  <td>{o.total}</td>
                  <td>
                    <span className={`arda-badge ${statusStyles[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--arda-muted)" }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Get Started Panel */}
        <div className="arda-getstarted">
          <div className="arda-getstarted__title">Get Started</div>
          {getStartedItems.map((item) => (
            <div key={item.label} className="arda-getstarted__item">
              <div
                className={`arda-getstarted__checkbox${item.done ? " checked" : ""}`}
              >
                {item.done && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ margin: "auto", display: "block" }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: item.done ? "var(--arda-muted)" : "var(--arda-dark)",
                  textDecoration: item.done ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
