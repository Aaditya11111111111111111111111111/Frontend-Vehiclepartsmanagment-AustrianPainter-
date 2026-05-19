import { useState, useEffect } from "react";
import { reportsApi, saleInvoicesApi } from "../../services/api";

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly");
  const [financial, setFinancial] = useState(null);
  const [customerPurchases, setCustomerPurchases] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [activeTab, setActiveTab] = useState("financial");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [markingPaid, setMarkingPaid] = useState(null);

  const loadAll = (p) => {
    setLoading(true);
    Promise.all([
      reportsApi.financial(p),
      reportsApi.customerPurchases(),
      reportsApi.overdueCredits(),
      reportsApi.inventory(),
    ]).then(([fin, cp, ov, inv]) => {
      setFinancial(fin);
      setCustomerPurchases(cp);
      setOverdue(ov);
      setInventory(inv);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(period); }, [period]);

  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleMarkPaid = async (invoiceId) => {
    if (!confirm("Mark this invoice as paid? This will reduce the customer's pending credit.")) return;
    setMarkingPaid(invoiceId);
    try {
      await saleInvoicesApi.markPaid(invoiceId);
      loadAll(period);
    } catch (err) { alert(err.message); }
    finally { setMarkingPaid(null); }
  };

  const fmt = n => `NPR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const tabs = ["financial", "customers", "overdue", "inventory"];

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><div className="page-subtitle">Business performance insights</div></div>
        {activeTab === "financial" && (
          <select className="form-select" style={{ width: "150px" }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="daily">Daily (today)</option>
            <option value="monthly">Last 30 days</option>
            <option value="calendarMonth">Calendar month</option>
            <option value="yearly">Yearly</option>
          </select>
        )}
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" }}>
        {tabs.map(t => (
          <button key={t} className={`btn ${activeTab === t ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, justifyContent: "center", borderRadius: "7px", border: "none" }}
            onClick={() => setActiveTab(t)}>
            {t === "financial" ? "Financial" : t === "customers" ? "Top Customers" : t === "overdue" ? "Overdue Credits" : "Inventory"}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading report...</div> : (
        <>
          {activeTab === "financial" && financial && (
            <div>
              <div className="stat-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card green"><div className="label">Total Revenue</div><div className="value">{fmt(financial.totalRevenue)}</div><div className="sub">{financial.totalSales} sales</div></div>
                <div className="stat-card red"><div className="label">Total Purchases</div><div className="value">{fmt(financial.totalPurchases)}</div><div className="sub">{financial.totalPurchaseOrders} orders</div></div>
                <div className="stat-card blue"><div className="label">Gross Profit</div><div className="value">{fmt(financial.grossProfit)}</div></div>
                <div className="stat-card accent"><div className="label">Profit Margin</div>
                  <div className="value">{financial.totalRevenue > 0 ? ((financial.grossProfit / financial.totalRevenue) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Period: {new Date(financial.from).toLocaleDateString()} — {new Date(financial.to).toLocaleDateString()}</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Gross Profit = Total Revenue − Total Purchases</p>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="card">
              <div className="card-title">Customer Purchase Breakdown</div>
              {customerPurchases.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No purchase data yet.</p>
              ) : customerPurchases.map((c, index) => (
                <div key={c.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "4px", marginBottom: "4px" }}>
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

                  {expanded[c.id] && (
                    <div style={{ marginLeft: "28px", marginBottom: "8px" }}>
                      {c.invoices.map(inv => (
                        <div key={inv.id} style={{ background: "var(--surface2)", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px", border: "1px solid var(--border)" }}>
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

          {activeTab === "overdue" && (
            <div className="card">
              <div className="card-title">Customers with Overdue Credits (&gt;1 month)</div>
              {overdue.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No overdue credits found.</p> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Pending Amount</th><th>Last Credit Date</th></tr></thead>
                    <tbody>{overdue.map(c => (
                      <tr key={c.id}>
                        <td><b>{c.name}</b></td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td><b style={{ color: "var(--red)" }}>{fmt(c.pendingCredit)}</b></td>
                        <td>{new Date(c.lastCreditDate).toLocaleDateString()}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "inventory" && inventory && (
            <div>
              <div className="stat-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card blue"><div className="label">Total Parts</div><div className="value">{inventory.totalParts}</div></div>
                <div className="stat-card accent"><div className="label">Low Stock Parts</div><div className="value">{inventory.lowStockCount}</div></div>
                <div className="stat-card green"><div className="label">Total Stock Value</div><div className="value" style={{ fontSize: "20px" }}>{fmt(inventory.totalStockValue)}</div></div>
              </div>
              <div className="card">
                <div className="card-title">All Parts Inventory</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Stock</th><th>Stock Value</th><th>Status</th></tr></thead>
                    <tbody>{inventory.parts.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td><code style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.sku}</code></td>
                        <td>{p.category}</td>
                        <td><span className={`badge ${p.isLowStock ? "badge-red" : "badge-green"}`}>{p.stockQuantity}</span></td>
                        <td>{fmt(p.stockValue)}</td>
                        <td>{p.isLowStock ? <span className="badge badge-red">Low Stock</span> : <span className="badge badge-green">OK</span>}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
