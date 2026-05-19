import { useState, useEffect } from "react";
import { notificationsApi } from "../../services/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  const load = () => notificationsApi.getAll().then(setNotifications);
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await notificationsApi.markRead(id); load(); };

  const unread = notifications.filter(n => !n.isRead);
  const read = notifications.filter(n => n.isRead);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Notifications</h1><div className="page-subtitle">{unread.length} unread notifications</div></div>
      </div>

      {unread.length > 0 && (
        <div className="card" style={{ marginBottom:"16px" }}>
          <div className="card-title" style={{ color:"var(--accent)" }}>🔔 Unread ({unread.length})</div>
          {unread.map(n => (
            <div key={n.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
              <div>
                <span className={`badge ${n.type === "LowStock" ? "badge-red" : "badge-yellow"}`} style={{ marginBottom:"6px" }}>{n.type}</span>
                <div style={{ fontSize:"13px", marginTop:"4px" }}>{n.message}</div>
                <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"4px" }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => markRead(n.id)}>Mark Read</button>
            </div>
          ))}
        </div>
      )}

      {read.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ color:"var(--text-muted)" }}>✓ Read ({read.length})</div>
          {read.map(n => (
            <div key={n.id} style={{ padding:"12px 0", borderBottom:"1px solid var(--border)", opacity:0.5 }}>
              <div style={{ fontSize:"12px", color:"var(--text-secondary)" }}>{n.message}</div>
              <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"4px" }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="card">
          <div className="empty-state"><div>No notifications yet.</div></div>
        </div>
      )}
    </div>
  );
}
