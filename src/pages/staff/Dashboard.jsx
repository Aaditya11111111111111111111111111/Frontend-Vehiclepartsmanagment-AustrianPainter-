import { useState, useEffect } from "react";
import { customersApi, partsApi, saleInvoicesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useProfessionalPageAnimation from "../../hooks/useProfessionalPageAnimation";
import "../../styles/staff-dashboard.css";

const ACTIONS = [
  { key: "customers",    icon: "👥", label: "New Customer",        desc: "Register a new customer account"      },
  { key: "invoices",     icon: "🧾", label: "New Sale Invoice",    desc: "Create a sale for a customer"         },
  { key: "parts",        icon: "🔧", label: "Parts Catalog",       desc: "Browse and manage parts stock"        },
  { key: "appointments", icon: "📅", label: "Appointments",        desc: "View and manage service bookings"     },
  { key: "requests",     icon: "🔍", label: "Part Requests",       desc: "Review customer part requests"        },
  { key: "reports",      icon: "📊", label: "Customer Reports",    desc: "Spending and credit insights"         },
];

export default function StaffDashboard({ onNavigate }) {
  const pageRef = useProfessionalPageAnimation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalCustomers: 0, totalParts: 0, lowStockParts: 0, todaySales: 0, monthlySales: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [customers, parts, lowStock, sales] = await Promise.all([
          customersApi.getAll().then(d => d.length),
          partsApi.getAll().then(d => d.length),
          partsApi.getLowStock().then(d => d.length),
          saleInvoicesApi.getAll().then(data => {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const rollingStart = new Date(todayStart); rollingStart.setDate(rollingStart.getDate() - 30);
            const d = s => new Date(s.createdAt);
            return {
              todaySales: data.filter(s => d(s) >= todayStart).reduce((sum, s) => sum + Number(s.totalAmount ?? 0), 0),
              monthlySales: data.filter(s => d(s) >= rollingStart).reduce((sum, s) => sum + Number(s.totalAmount ?? 0), 0),
              recent: data.slice(0, 5),
            };
          }),
        ]);
        const lowStockDetails = await partsApi.getLowStock();
        setStats({ totalCustomers: customers, totalParts: parts, lowStockParts: lowStock, todaySales: sales.todaySales, monthlySales: sales.monthlySales });
        setRecentSales(sales.recent);
        setLowStockItems(lowStockDetails);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="staff-dashboard">
      <div className="dashboard-container">
        <div className="loading">Loading dashboard…</div>
      </div>
    </div>
  );

  const fmt = n => `NPR ${Number(n || 0).toLocaleString()}`;

  return (
    <div ref={pageRef} className="staff-dashboard">
      <div className="dashboard-container">

        {/* Header */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.fullName?.split(" ")[0]}! 👋</h1>
            <p className="page-subtitle">Staff dashboard · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate("invoices")}>
            + New Sale
          </button>
        </header>

        {/* Stat cards */}
        <section className="dashboard-section dashboard-section--stats">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Total Customers</div>
              <div className="value">{stats.totalCustomers}</div>
              <div className="sub">Registered accounts</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Parts</div>
              <div className="value">{stats.totalParts}</div>
              <div className="sub">In catalog</div>
            </div>
            <div className="stat-card red">
              <div className="label">Low Stock</div>
              <div className="value">{stats.lowStockParts}</div>
              <div className="sub">Need reordering</div>
            </div>
            <div className="stat-card green">
              <div className="label">Today's Sales</div>
              <div className="value">{fmt(stats.todaySales)}</div>
              <div className="sub">Revenue today</div>
            </div>
            <div className="stat-card blue">
              <div className="label">Last 30 Days</div>
              <div className="value">{fmt(stats.monthlySales)}</div>
              <div className="sub">Rolling revenue</div>
            </div>
          </div>
        </section>

        {/* Main layout */}
        <section className="dashboard-section">
          <div className="dashboard-layout">

            {/* Left: recent sales + quick actions */}
            <div className="dashboard-primary" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Quick actions grid */}
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

              {/* Recent sales table */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 className="card-title" style={{ margin: 0 }}>Recent Sales</h2>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onNavigate("invoices")}>View all</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.length === 0 ? (
                        <tr><td colSpan={4} className="table-empty">No sales yet</td></tr>
                      ) : recentSales.map(s => (
                        <tr key={s.id}>
                          <td><code style={{ fontSize: "12px", color: "var(--accent)" }}>{s.invoiceNumber}</code></td>
                          <td>{s.customerName}</td>
                          <td className="amount-cell">{fmt(s.totalAmount)}</td>
                          <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="dashboard-sidebar">

              {/* Staff info */}
              <div className="card">
                <div className="section-header">
                  <h2 className="card-title">Your Details</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px", background: "var(--surface2)", borderRadius: "10px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: "var(--accent-dim)", border: "2px solid var(--accent)",
                    display: "grid", placeItems: "center",
                    fontWeight: "700", fontSize: "18px", color: "var(--accent)", flexShrink: 0
                  }}>
                    {user?.fullName?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{user?.fullName}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user?.email}</div>
                  </div>
                </div>
                <div className="meta-grid">
                  <div><div className="meta-label">Role</div><div className="meta-value">{user?.role}</div></div>
                  <div><div className="meta-label">Hours</div><div className="meta-value">9:00–18:00</div></div>
                  <div><div className="meta-label">Phone</div><div className="meta-value">{user?.phone || "—"}</div></div>
                  <div><div className="meta-label">Department</div><div className="meta-value">Sales &amp; Service</div></div>
                </div>
              </div>

              {/* Low stock */}
              {lowStockItems.length > 0 && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h2 className="card-title card-title--warn" style={{ margin: 0 }}>⚠ Low Stock</h2>
                    <span className="badge badge-red">{lowStockItems.length}</span>
                  </div>
                  <div className="low-stock-list">
                    {lowStockItems.slice(0, 4).map(p => (
                      <div key={p.partId} className="low-stock-row">
                        <div className="low-stock-name">{p.name}</div>
                        <div className="low-stock-meta">
                          <span style={{ color: "var(--red)", fontWeight: "600" }}>{p.stockQuantity}</span> left · {p.sku}
                        </div>
                      </div>
                    ))}
                    {lowStockItems.length > 4 && <div className="low-stock-more">+{lowStockItems.length - 4} more</div>}
                  </div>
                  <button type="button" className="btn btn-secondary btn-full-width btn-sm" onClick={() => onNavigate("parts")}>
                    View Parts
                  </button>
                </div>
              )}

            </aside>
          </div>
        </section>

      </div>
    </div>
  );
}
