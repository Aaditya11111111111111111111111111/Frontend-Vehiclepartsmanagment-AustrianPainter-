import { useState, useEffect } from "react";
import { customersApi } from "../../services/api";

const STATUS_COLORS = { Pending: "yellow", Confirmed: "blue", Completed: "green", Cancelled: "red" };

export default function HistoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("purchases");
  const [apptFilter, setApptFilter] = useState("All");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    customersApi.getMyHistory().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;

  const fmt = n => `NPR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const invoices = data?.invoices || [];
  const allAppointments = data?.appointments || [];
  const appointments = apptFilter === "All"
    ? allAppointments
    : allAppointments.filter(a => a.status === apptFilter);

  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My History</h1>
          <div className="page-subtitle">Complete record of your purchases and appointments</div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {["purchases", "appointments"].map(t => (
          <button
            key={t}
            className={`btn ${tab === t ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: "7px", border: "none" }}
            onClick={() => setTab(t)}
          >
            {t === "purchases" ? `🧾 Purchases (${invoices.length})` : `📅 Appointments (${allAppointments.length})`}
          </button>
        ))}
      </div>

      {/* Purchases tab — expandable invoice rows */}
      {tab === "purchases" && (
        <div className="card">
          {invoices.length === 0 ? (
            <div className="empty-state">No purchases yet.</div>
          ) : invoices.map(inv => (
            <div key={inv.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "4px", marginBottom: "4px" }}>

              {/* Invoice summary row — click to expand */}
              <div
                onClick={() => toggleExpand(inv.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", cursor: "pointer", borderRadius: "6px", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", width: "16px" }}>
                    {expanded[inv.id] ? "▾" : "▸"}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <code style={{ fontSize: "12px", color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 8px", borderRadius: "4px" }}>
                        {inv.invoiceNumber}
                      </code>
                      <span className={`badge ${inv.paymentType === "Cash" ? "badge-green" : inv.paymentType === "Credit" ? "badge-yellow" : "badge-blue"}`}>
                        {inv.paymentType}
                      </span>
                      <span className={`badge ${inv.isPaid ? "badge-green" : "badge-red"}`}>
                        {inv.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(inv.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      {inv.items?.length > 0 && ` · ${inv.items.length} item${inv.items.length > 1 ? "s" : ""}`}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>{fmt(inv.totalAmount)}</div>
                  {inv.discountAmount > 0 && (
                    <div style={{ fontSize: "11px", color: "var(--green)" }}>
                      -{fmt(inv.discountAmount)} discount
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded: full invoice detail */}
              {expanded[inv.id] && (
                <div style={{ marginLeft: "28px", marginBottom: "10px" }}>
                  <div style={{ background: "var(--surface2)", borderRadius: "8px", padding: "12px 14px", border: "1px solid var(--border)" }}>

                    {/* Invoice totals summary */}
                    {inv.discountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                        <span>Subtotal: <b>{fmt(inv.subTotal)}</b></span>
                        <span style={{ color: "var(--green)" }}>Loyalty Discount ({inv.discountPercent}%): <b>-{fmt(inv.discountAmount)}</b></span>
                        <span>Total: <b style={{ color: "var(--text-primary)" }}>{fmt(inv.totalAmount)}</b></span>
                      </div>
                    )}

                    {/* Products table */}
                    {inv.items?.length > 0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            <th style={{ textAlign: "left", padding: "4px 8px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Part</th>
                            <th style={{ textAlign: "left", padding: "4px 8px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>SKU</th>
                            <th style={{ textAlign: "left", padding: "4px 8px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</th>
                            <th style={{ textAlign: "right", padding: "4px 8px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Qty</th>
                            <th style={{ textAlign: "right", padding: "4px 8px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unit Price</th>
                            <th style={{ textAlign: "right", padding: "4px 8px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < inv.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                              <td style={{ padding: "6px 8px", fontWeight: "600" }}>{item.name}</td>
                              <td style={{ padding: "6px 8px", color: "var(--text-muted)" }}>{item.sku}</td>
                              <td style={{ padding: "6px 8px" }}><span className="badge badge-blue">{item.category}</span></td>
                              <td style={{ padding: "6px 8px", textAlign: "right" }}>{item.quantity}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "700", color: "var(--green)" }}>{fmt(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No item details available.</div>
                    )}

                    {/* Notes */}
                    {inv.notes && (
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                        📝 <b>Note:</b> {inv.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Appointments tab */}
      {tab === "appointments" && (
        <>
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
            {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${apptFilter === s ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setApptFilter(s)}
              >
                {s}
                {s !== "All" && (
                  <span style={{ marginLeft: "4px", opacity: 0.7 }}>
                    ({allAppointments.filter(a => a.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card">
            {appointments.length === 0 ? (
              <div className="empty-state">
                {apptFilter === "All" ? "No appointments yet." : `No ${apptFilter.toLowerCase()} appointments.`}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id}>
                        <td><b>{a.serviceType}</b></td>
                        <td style={{ maxWidth: "240px", color: "var(--text-secondary)", fontSize: "13px" }}>{a.description}</td>
                        <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${STATUS_COLORS[a.status] || "gray"}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
