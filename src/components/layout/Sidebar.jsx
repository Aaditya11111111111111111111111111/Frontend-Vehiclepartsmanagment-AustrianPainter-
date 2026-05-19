import { useAuth } from "../../context/AuthContext";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  parts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3 3z"/><path d="M5 15v4h4l9.3-9.3-4-4L5 15z"/></svg>,
  customers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  staff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  vendors: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  invoices: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  purchase: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>,
  appointments: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  notifications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  history: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ai: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 0v4m0 14v-4m-7-7H2m20 0h-3M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2l2.8-2.8"/></svg>,
  reviews: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  requests: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  vehicles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
};

const adminNav = [
  { key: "dashboard", label: "Dashboard", section: "Overview" },
  { key: "parts", label: "Parts Inventory", section: "Inventory" },
  { key: "vendors", label: "Vendors" },
  { key: "purchase", label: "Purchase Orders" },
  { key: "customers", label: "Customers", section: "Operations" },
  { key: "staff", label: "Staff Management" },
  { key: "invoices", label: "Sales Invoices" },
  { key: "reports", label: "Reports & Analytics", section: "Finance" },
  { key: "notifications", label: "Notifications", section: "System" },
];

const staffNav = [
  { key: "dashboard", label: "Dashboard", section: "Overview" },
  { key: "customers", label: "Customers", section: "Customers" },
  { key: "invoices", label: "Sales Invoices", section: "Sales" },
  { key: "parts", label: "Parts Catalog", section: "Inventory" },
  { key: "appointments", label: "Appointments" },
  { key: "requests", label: "Part Requests" },
  { key: "reports", label: "Customer Reports", section: "Reports" },
];

const customerNav = [
  { key: "dashboard",    label: "Dashboard",            section: "Home" },
  { key: "parts",        label: "Parts Catalog",        section: "Browse" },
  { key: "history",      label: "My History",           section: "My Account" },
  { key: "profile",      label: "My Profile" },
  { key: "vehicles",     label: "My Vehicles" },
  { key: "appointments", label: "Book Appointment",     section: "Services" },
  { key: "ai",           label: "AI Part Predictor" },
  { key: "requests",     label: "Request a Part" },
  { key: "reviews",      label: "Reviews" },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const navItems = user?.role === "Admin" ? adminNav : user?.role === "Staff" ? staffNav : customerNav;

  let lastSection = "";
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>⚙ VehicleParts</h2>
        <span>Management System</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <div key={item.key}>
              {showSection && <div className="nav-label">{item.section}</div>}
              <button
                className={`nav-item ${activePage === item.key ? "active" : ""}`}
                onClick={() => onNavigate(item.key)}
              >
                {icons[item.key]} {item.label}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{user?.fullName?.[0] || "U"}</div>
          <div className="user-info">
            <div className="user-name">{user?.fullName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="btn-logout" onClick={logout} title="Logout">
            {icons.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}
