import { useState, useEffect } from "react";
import { reportsApi, saleInvoicesApi } from "../../services/api";

export default function StaffReportsPage() {
  const [customerPurchases, setCustomerPurchases] = useState([]);
  const [regular, setRegular] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [tab, setTab] = useState("purchases");
  const [expanded, setExpanded] = useState({});
  const [markingPaid, setMarkingPaid] = useState(null);

  const loadAll = () => {
    reportsApi.customerPurchases().then(setCustomerPurchases);
    reportsApi.regularCustomers().then(setRegular);
    reportsApi.overdueCredits().then(setOverdue);
  };

  useEffect(() => { loadAll(); }, []);

  const fmt = n => `NPR ${Number(n || 0).toLocaleString()}`;
  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleMarkPaid = async (invoiceId) => {
    if (!confirm("Mark this invoice as paid? This will reduce the customer's pending credit.")) return;
    setMarkingPaid(invoiceId);
    try {
      await saleInvoicesApi.markPaid(invoiceId);
      loadAll();
    } catch (err) { alert(err.message); }
    finally { setMarkingPaid(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Customer Reports</h1><div className="page-subtitle">Insights to better serve your customers</div></div>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {[["purchases", "Customer Purchases"], ["regular", "Regular Customers"], ["overdue", "Overdue Credits"]].map(([k, l]) => (
          <button key={k} className={`btn ${tab === k ? "btn-primary" : "btn-secondary"}`} style={{ borderRadius: "7px", border: "none" }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Customer Purchases — expandable per customer */}
      {tab === "purchases" && (
        <div className="card">
          <div className="card-title">All Customer Purchases</div>
          {customerPurchases.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No purchase data yet.</p>
          ) : customerPurchases.map((c, index) => (
            <div key={c.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "4px", marginBottom: "4px" }}>
              {/* Customer row */}
              <div
                onClick={() => toggleExpand(c.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", cursor: "pointer", borderRadius: "6px", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", width: "16px" }}>
                    {expanded[c.id] ? "▾" : "▸"}
                  </span>
                  {/* Rank badge */}
                  <span style={{
                    fontSize: "12px", fontWeight: "700", width: "28px", textAlign: "center",
                    color: index === 0 ? "#b45309" : index === 1 ? "var(--text-muted)" : index === 2 ? "#92400e" : "var(--text-muted)"
                  }}>
                    {index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </span>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                      {c.name}
                      {index === 0 && <span className="badge badge-yellow" style={{ fontSize: "10px" }}>Top Spender</span>}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.email} · {c.phone}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "24px", alignItems: "center", fontSize: "13px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", color: "var(--green)" }}>{fmt(c.totalSpent)}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>total spent</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700" }}>{c.invoiceCount}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>invoices</div>
                  </div>
                </div>
              </div>

              {/* Expanded: invoices + products */}
              {expanded[c.id] && (
                <div style={{ marginLeft: "28px", marginBottom: "8px" }}>
                  {c.invoices.map(inv => (
                    <div key={inv.id} style={{ background: "var(--surface2)", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px", border: "1px solid var(--border)" }}>
                      {/* Invoice header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <code style={{ fontSize: "12px", color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 8px", borderRadius: "4px" }}>{inv.invoiceNumber}</code>
                          <span className={`badge ${inv.paymentType === "Cash" ? "badge-green" : inv.paymentType === "Credit" ? "badge-yellow" : "badge-blue"}`}>{inv.paymentType}</span>
                          <span className={`badge ${inv.isPaid ? "badge-green" : "badge-red"}`}>{inv.isPaid ? "Paid" : "Unpaid"}</span>
                          {!inv.isPaid && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleMarkPaid(inv.id)}
                              disabled={markingPaid === inv.id}
                            >
                              {markingPaid === inv.id ? "Saving..." : "✓ Mark Paid"}
                            </button>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                          <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                          <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{fmt(inv.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Products in this invoice */}
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
                            <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "regular" && (
        <div className="card">
          <div className="card-title">Regular Customers (3+ Purchases)</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Purchase Count</th><th>Total Spent</th></tr></thead>
              <tbody>{regular.map(c => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td>
                  <td>{c.email}</td>
                  <td><span className="badge badge-blue">{c.purchaseCount} orders</span></td>
                  <td>{fmt(c.totalSpent)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "overdue" && (
        <div className="card">
          <div className="card-title">Customers with Overdue Credit (&gt;1 Month)</div>
          {overdue.length === 0
            ? <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No overdue credits. 🎉</p>
            : <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Phone</th><th>Pending Amount</th><th>Since</th></tr></thead>
                  <tbody>{overdue.map(c => (
                    <tr key={c.id}>
                      <td><b>{c.name}</b></td>
                      <td>{c.phone}</td>
                      <td style={{ color: "var(--red)", fontWeight: "700" }}>{fmt(c.pendingCredit)}</td>
                      <td>{new Date(c.lastCreditDate).toLocaleDateString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
          }
        </div>
      )}
    </div>
  );
}
