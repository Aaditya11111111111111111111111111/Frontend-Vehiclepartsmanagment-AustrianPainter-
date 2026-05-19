import { useState, useEffect } from "react";
import { reportsApi, partsApi, notificationsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useProfessionalPageAnimation from "../../hooks/useProfessionalPageAnimation";
import "../../styles/staff-dashboard.css";

const ACTIONS = [
  { key: "invoices",      icon: "🧾", label: "New Sale Invoice",      desc: "Create a sale for a customer"         },
  { key: "customers",     icon: "👥", label: "Manage Customers",       desc: "View, register & manage customers"    },
  { key: "parts",         icon: "🔧", label: "Parts Inventory",        desc: "Manage stock and part details"        },
  { key: "purchase",      icon: "📦", label: "Purchase Orders",        desc: "Record vendor purchase invoices"      },
  { key: "reports",       icon: "📊", label: "Reports & Analytics",    desc: "Financial and customer insights"      },
  { key: "staff",         icon: "🧑‍💼", label: "Staff Management",      desc: "Add or deactivate staff members"      },
  { key: "vendors",       icon: "🏪", label: "Vendors",                desc: "Manage supplier information"          },
  { key: "notifications", icon: "🔔", label: "Notifications",          desc: "View system alerts and low stock"     },
];

export default function AdminDashboard({ onNavigate }) {
  const pageRef = useProfessionalPageAnimation();
  const { user } = useAuth();
  const [financial, setFinancial] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try { setLowStock(await partsApi.getLowStock()); } catch {}
      try {
        const notifs = await notificationsApi.getAll();
        setNotifications(notifs.filter(n => !n.isRead));
      } catch {}
      try { setFinancial(await reportsApi.financial("monthly")); } catch {}
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="staff-dashboard">
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    </div>
  );

  const fmt = n => `NPR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const profitMargin = financial?.totalRevenue > 0
    ? ((financial.grossProfit / financial.totalRevenue) * 100).toFixed(1)
    : "0.0";

  return (
    <div ref={pageRef} className="staff-dashboard">
      <div className="dashboard-container">

        {/* Header */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.fullName?.split(" ")[0]}! 👋</h1>
            <p className="page-subtitle">Admin overview · last 30 days</p>
          </div>
          {notifications.length > 0 && (
            <button className="btn btn-secondary" onClick={() => onNavigate("notifications")}>
              🔔 {notifications.length} new notification{notifications.length > 1 ? "s" : ""}
            </button>
          )}
        </header>

        {/* Stat cards */}
        <section className="dashboard-section dashboard-section--stats">
          <div className="stat-grid">
            <div className="stat-card green">
              <div className="label">Total Revenue</div>
              <div className="value">{fmt(financial?.totalRevenue)}</div>
              <div className="sub">{financial?.totalSales ?? 0} sales</div>
            </div>
            <div className="stat-card red">
              <div className="label">Total Purchases</div>
              <div className="value">{fmt(financial?.totalPurchases)}</div>
              <div className="sub">{financial?.totalPurchaseOrders ?? 0} orders</div>
            </div>
            <div className="stat-card blue">
              <div className="label">Gross Profit</div>
              <div className="value">{fmt(financial?.grossProfit)}</div>
              <div className="sub">Revenue − Purchases</div>
            </div>
            <div className="stat-card" style={{ background: "var(--accent-dim)", borderColor: "rgba(249,115,22,0.25)" }}>
              <div className="label">Profit Margin</div>
              <div className="value" style={{ color: "var(--accent)" }}>{profitMargin}%</div>
              <div className="sub">Of total revenue</div>
            </div>
          </div>
        </section>

        {/* Main layout */}
        <section className="dashboard-section">
          <div className="dashboard-layout">

            {/* Quick actions grid */}
            <div className="dashboard-primary">
              <div className="card">
                <div className="section-header">
                  <h2 className="card-title">Quick Actions</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {ACTIONS.map(a => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => onNavigate(a.key)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "12px",
                        background: "var(--surface2)", border: "1px solid var(--border)",
                        borderRadius: "10px", padding: "14px", cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.background = "var(--accent-dim)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--surface2)";
                      }}
                    >
                      <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>{a.label}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{a.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="dashboard-sidebar">

              {/* Low stock alert */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 className="card-title card-title--warn" style={{ margin: 0 }}>⚠ Low Stock</h2>
                  <span className="badge badge-red">{lowStock.length} parts</span>
                </div>
                {lowStock.length === 0 ? (
                  <div className="low-stock-row">
                    <div className="low-stock-name" style={{ color: "var(--text-muted)", fontWeight: 400 }}>All parts well-stocked ✓</div>
                  </div>
                ) : (
                  <div className="low-stock-list">
                    {lowStock.slice(0, 5).map(p => (
                      <div key={p.partId} className="low-stock-row">
                        <div className="low-stock-name">{p.name}</div>
                        <div className="low-stock-meta">
                          <span style={{ color: "var(--red)", fontWeight: "600" }}>{p.stockQuantity}</span> left · {p.sku}
                        </div>
                      </div>
                    ))}
                    {lowStock.length > 5 && <div className="low-stock-more">+{lowStock.length - 5} more</div>}
                  </div>
                )}
                <button type="button" className="btn btn-secondary btn-full-width btn-sm" onClick={() => onNavigate("parts")}>
                  View Parts Inventory
                </button>
              </div>

              {/* Recent notifications */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 className="card-title" style={{ margin: 0 }}>🔔 Notifications</h2>
                  {notifications.length > 0 && <span className="badge badge-blue">{notifications.length} new</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="low-stock-row">
                    <div className="low-stock-name" style={{ color: "var(--text-muted)", fontWeight: 400 }}>No new notifications.</div>
                  </div>
                ) : (
                  <div className="low-stock-list">
                    {notifications.slice(0, 4).map(n => (
                      <div key={n.id} className="low-stock-row">
                        <div className="low-stock-name">{n.message}</div>
                        <div className="low-stock-meta">{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" className="btn btn-secondary btn-full-width btn-sm" onClick={() => onNavigate("notifications")}>
                  View All Notifications
                </button>
              </div>

            </aside>
          </div>
        </section>

      </div>
    </div>
  );
}
