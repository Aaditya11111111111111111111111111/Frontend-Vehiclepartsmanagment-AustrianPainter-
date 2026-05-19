import { useState, useEffect } from "react";
import { saleInvoicesApi, customersApi, partsApi } from "../../services/api";import Modal from "../../components/common/Modal";

export default function SalesInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ customerId: "", paymentType: "Cash", notes: "", items: [] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);

  const load = () => saleInvoicesApi.getAll().then(setInvoices);
  useEffect(() => {
    load();
    customersApi.getAll().then(setCustomers);
    partsApi.getAll().then(setParts);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { partId: "", quantity: 1 }] });
  const updateItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    setForm({ ...form, items });
  };
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const calcSubtotal = () => form.items.reduce((sum, item) => {
    const part = parts.find(p => p.id === +item.partId);
    return sum + (part ? part.sellingPrice * item.quantity : 0);
  }, 0);

  const subtotal = calcSubtotal();
  const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) { setError("Add at least one item."); return; }
    setSaving(true); setError("");
    try {
      await saleInvoicesApi.create({ ...form, customerId: +form.customerId, items: form.items.map(i => ({ partId: +i.partId, quantity: +i.quantity })) });
      setModal(false); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleEmail = async (id) => {
    setEmailSending(id);
    try {
      await saleInvoicesApi.sendEmail(id);
      alert("Invoice emailed successfully!");
    } catch { alert("Email failed — check SMTP settings."); }
    finally { setEmailSending(null); }
  };

  const handleMarkPaid = async (id) => {
    if (!confirm("Mark this invoice as paid? This will reduce the customer's pending credit.")) return;
    setMarkingPaid(id);
    try {
      await saleInvoicesApi.markPaid(id);
      load();
    } catch (err) { alert(err.message); }
    finally { setMarkingPaid(null); }
  };

  const fmt = n => `NPR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Sales Invoices</h1><div className="page-subtitle">Create and manage sales transactions</div></div>
        <button className="btn btn-primary" onClick={() => { setForm({ customerId:"", paymentType:"Cash", notes:"", items:[] }); setError(""); setModal(true); }}>+ New Sale</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Paid</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><code style={{ fontSize:"12px", color:"var(--accent)" }}>{inv.invoiceNumber}</code></td>
                  <td>{inv.customerName}</td>
                  <td><b>{fmt(inv.totalAmount)}</b></td>
                  <td><span className={`badge ${inv.paymentType === "Cash" ? "badge-green" : inv.paymentType === "Credit" ? "badge-yellow" : "badge-blue"}`}>{inv.paymentType}</span></td>
                  <td><span className={`badge ${inv.isPaid ? "badge-green" : "badge-red"}`}>{inv.isPaid ? "Paid" : "Unpaid"}</span></td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {!inv.isPaid && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleMarkPaid(inv.id)}
                          disabled={markingPaid === inv.id}
                        >
                          {markingPaid === inv.id ? "Saving..." : "✓ Mark Paid"}
                        </button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEmail(inv.id)} disabled={emailSending === inv.id}>
                        {emailSending === inv.id ? "Sending..." : "📧 Email"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Create Sales Invoice" onClose={() => setModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Customer</label>
                <select className="form-select" value={form.customerId} onChange={e => setForm({...form, customerId:e.target.value})} required>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} (#{c.id})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Payment Type</label>
                <select className="form-select" value={form.paymentType} onChange={e => setForm({...form, paymentType:e.target.value})}>
                  <option>Cash</option><option>Credit</option><option>Card</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <label className="form-label" style={{ margin:0 }}>Items</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 24px", gap:"8px", marginBottom:"8px", alignItems:"center" }}>
                  <select className="form-select" value={item.partId} onChange={e => updateItem(i,"partId",e.target.value)} required>
                    <option value="">Select part...</option>
                    {parts.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} — NPR {p.sellingPrice} ({p.stockQuantity} left)</option>)}
                  </select>
                  <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i,"quantity",e.target.value)} />
                  <button type="button" onClick={() => removeItem(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--red)", fontSize:"18px" }}>×</button>
                </div>
              ))}
            </div>

            {subtotal > 0 && (
              <div style={{ background:"var(--surface2)", borderRadius:"8px", padding:"12px", marginBottom:"16px", fontSize:"13px" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discount > 0 && (
                  <div className="discount-badge" style={{ marginTop:"8px" }}>
                    🎉 Loyalty Discount Applied (10%)! Purchase exceeds NPR 5,000 — saving {fmt(discount)}
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:"700", fontSize:"15px", marginTop:"8px", color:"var(--accent)" }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>
            )}

            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Invoice"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
