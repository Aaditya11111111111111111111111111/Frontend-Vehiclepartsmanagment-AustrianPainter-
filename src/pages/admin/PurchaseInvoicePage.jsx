import { useState, useEffect } from "react";
import { purchaseInvoicesApi, vendorsApi, partsApi } from "../../services/api";
import Modal from "../../components/common/Modal";

export default function PurchaseInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vendorId: "", isPaid: false, notes: "", items: [] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => purchaseInvoicesApi.getAll().then(setInvoices);
  useEffect(() => {
    load();
    vendorsApi.getAll().then(vs => setVendors(vs.filter(v => v.isActive)));
    partsApi.getAll().then(setParts);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { partId: "", quantity: 1, unitCost: "" }] });
  const updateItem = (i, k, v) => { const items = [...form.items]; items[i] = { ...items[i], [k]: v }; setForm({ ...form, items }); };
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const total = form.items.reduce((s, i) => s + (+i.unitCost || 0) * (+i.quantity || 0), 0);
  const fmt = n => `NPR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.items.length) { setError("Add at least one item."); return; }
    setSaving(true); setError("");
    try {
      await purchaseInvoicesApi.create({
        vendorId: +form.vendorId, isPaid: form.isPaid, notes: form.notes,
        items: form.items.map(i => ({ partId: +i.partId, quantity: +i.quantity, unitCost: +i.unitCost }))
      });
      setModal(false); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Purchase Orders</h1><div className="page-subtitle">Create vendor purchase invoices and update stock</div></div>
        <button className="btn btn-primary" onClick={() => { setForm({ vendorId:"", isPaid:false, notes:"", items:[] }); setError(""); setModal(true); }}>+ New Purchase Order</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice #</th><th>Vendor</th><th>Total</th><th>Paid</th><th>Date</th><th>Items</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><code style={{ fontSize:"12px", color:"var(--blue)" }}>{inv.invoiceNumber}</code></td>
                  <td>{inv.vendor?.name}</td>
                  <td><b>{fmt(inv.totalAmount)}</b></td>
                  <td><span className={`badge ${inv.isPaid ? "badge-green" : "badge-yellow"}`}>{inv.isPaid ? "Paid" : "Pending"}</span></td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>{inv.items?.length || 0} parts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Create Purchase Order" onClose={() => setModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Vendor</label>
                <select className="form-select" value={form.vendorId} onChange={e => setForm({...form, vendorId:e.target.value})} required>
                  <option value="">Select vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Payment Status</label>
                <select className="form-select" value={form.isPaid} onChange={e => setForm({...form, isPaid: e.target.value === "true"})}>
                  <option value="false">Pending</option>
                  <option value="true">Paid</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <label className="form-label" style={{ margin:0 }}>Items</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 70px 90px 24px", gap:"8px", marginBottom:"8px", alignItems:"center" }}>
                  <select className="form-select" value={item.partId} onChange={e => updateItem(i,"partId",e.target.value)} required>
                    <option value="">Select part...</option>
                    {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                  <input className="form-input" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i,"quantity",e.target.value)} />
                  <input className="form-input" type="number" step="0.01" placeholder="Cost" value={item.unitCost} onChange={e => updateItem(i,"unitCost",e.target.value)} />
                  <button type="button" onClick={() => removeItem(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--red)", fontSize:"18px" }}>×</button>
                </div>
              ))}
              {total > 0 && <div style={{ textAlign:"right", fontWeight:"700", color:"var(--blue)", fontSize:"14px" }}>Total: {fmt(total)}</div>}
            </div>

            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Order"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
