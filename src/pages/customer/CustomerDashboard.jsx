import { useState, useEffect } from "react";
import { customersApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useProfessionalPageAnimation from "../../hooks/useProfessionalPageAnimation";
import "../../styles/staff-dashboard.css";

const ACTIONS = [
  { key: "parts",        icon: "🔧", label: "Parts Catalog",          desc: "Browse available parts & pricing"       },
  { key: "appointments", icon: "📅", label: "Book Appointment",        desc: "Schedule a service visit"               },
  { key: "history",      icon: "📋", label: "Purchase History",        desc: "View all your past invoices"            },
  { key: "vehicles",     icon: "🚗", label: "My Vehicles",             desc: "View & update your registered vehicles" },
  { key: "ai",           icon: "🤖", label: "AI Part Predictor",       desc: "Get predictive maintenance insights"    },
  { key: "requests",     icon: "🔍", label: "Request a Part",          desc: "Ask staff to source a specific part"    },
  { key: "reviews",      icon: "⭐", label: "Leave a Review",          desc: "Share your experience with us"          },
];

export default function CustomerDashboard({ onNavigate }) {
  const pageRef = useProfessionalPageAnimation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customersApi.getMe().then(setProfile).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="staff-dashboard">
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
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
            <h1 className="page-title">Welcome back, {profile?.fullName?.split(" ")[0]}! 👋</h1>
            <p className="page-subtitle">Here's a summary of your account</p>
          </div>
          <button className="btn btn-secondary" onClick={() => onNavigate("profile")}>
            ✏️ Edit Profile
          </button>
        </header>

        {/* Stat cards */}
        <section className="dashboard-section dashboard-section--stats">
          <div className="stat-grid">
            <div className="stat-card green">
              <div className="label">Total Spent</div>
              <div className="value">{fmt(profile?.totalSpent)}</div>
              <div className="sub">Lifetime purchases</div>
            </div>
            <div className="stat-card red">
              <div className="label">Pending Credit</div>
              <div className="value">{fmt(profile?.pendingCredit)}</div>
              <div className="sub">Outstanding balance</div>
            </div>
            <div className="stat-card" style={{ background: "var(--accent-dim)", borderColor: "rgba(249,115,22,0.25)" }}>
              <div className="label">Member Since</div>
              <div className="value" style={{ fontSize: "20px", color: "var(--accent)" }}>
                {new Date(profile?.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
              <div className="sub">Account age</div>
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

              {/* Profile card */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 className="card-title" style={{ margin: 0 }}>Your Profile</h2>
                  <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("profile")}>Edit</button>
                </div>
                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px", background: "var(--surface2)", borderRadius: "10px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: "var(--accent-dim)", border: "2px solid var(--accent)",
                    display: "grid", placeItems: "center",
                    fontWeight: "700", fontSize: "18px", color: "var(--accent)", flexShrink: 0
                  }}>
                    {profile?.fullName?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{profile?.fullName}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{profile?.email}</div>
                  </div>
                </div>
                <div className="meta-grid">
                  <div>
                    <div className="meta-label">Phone</div>
                    <div className="meta-value">{profile?.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Address</div>
                    <div className="meta-value">{profile?.address || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Service center card */}
              <div className="card">
                <div className="section-header">
                  <h2 className="card-title">Service Center</h2>
                </div>
                <div className="low-stock-list">
                  {[
                    { icon: "🕐", label: "Hours",    value: "Sun–Fri, 9AM–6PM"         },
                    { icon: "📍", label: "Location", value: "Itahari, Sunsari, Nepal"  },
                    { icon: "📞", label: "Phone",    value: "+977-25-580000"            },
                    { icon: "📧", label: "Email",    value: "service@vehicleparts.com" },
                  ].map(row => (
                    <div key={row.label} className="low-stock-row">
                      <div className="low-stock-name">{row.icon} {row.label}</div>
                      <div className="low-stock-meta">{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </section>

      </div>
    </div>
  );
}
