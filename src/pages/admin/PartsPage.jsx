import { useState, useEffect } from "react";
import { partsApi } from "../../services/api";
import Modal from "../../components/common/Modal";

const EMPTY = { name: "", sku: "", category: "", description: "", purchasePrice: "", sellingPrice: "", stockQuantity: "", reorderLevel: 10 };

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => partsApi.getAll(search).then(setParts).finally(() => setLoading(false));
  useEffect(() => { load(); }, [search]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(""); setModal("add"); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, category: p.category, description: p.description,
      purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      stockQuantity: p.stockQuantity, reorderLevel: p.reorderLevel || 10 });
    setEditing(p); setError(""); setModal("edit");
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, purchasePrice: +form.purchasePrice, sellingPrice: +form.sellingPrice,
        stockQuantity: +form.stockQuantity, reorderLevel: +form.reorderLevel };
      if (modal === "add") await partsApi.create(payload);
      else await partsApi.update(editing.id, payload);
      setModal(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this part?")) return;
    await partsApi.delete(id);
    load();
  };

  const fmt = (n) => `NPR ${Number(n).toLocaleString()}`;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Parts Inventory</h1><div className="page-subtitle">Manage vehicle parts and stock levels</div></div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Part</button>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading parts...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Purchase Price</th><th>Selling Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {parts.map(p => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: "600" }}>{p.name}</div></td>
                    <td><code style={{ fontSize: "12px", color: "var(--text-muted)" }}>{p.sku}</code></td>
                    <td>{p.category}</td>
                    <td>{fmt(p.purchasePrice)}</td>
                    <td>{fmt(p.sellingPrice)}</td>
                    <td>
                      <span className={`badge ${p.stockQuantity < 10 ? "badge-red" : p.stockQuantity < 20 ? "badge-yellow" : "badge-green"}`}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td><span className={`badge ${p.isActive ? "badge-green" : "badge-red"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add New Part" : "Edit Part"} onClose={() => setModal(null)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Part Name</label><input className="form-input" value={form.name} onChange={update("name")} required /></div>
              <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={form.sku} onChange={update("sku")} required disabled={modal === "edit"} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={update("category")} required>
                  <option value="">Select...</option>
                  {["Engine","Brakes","Clutch","Suspension","Electrical","Filters","Tyres","Body","Transmission","Cooling","Exhaust"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Stock Quantity</label><input className="form-input" type="number" value={form.stockQuantity} onChange={update("stockQuantity")} required /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Purchase Price (NPR)</label><input className="form-input" type="number" step="0.01" value={form.purchasePrice} onChange={update("purchasePrice")} required /></div>
              <div className="form-group"><label className="form-label">Selling Price (NPR)</label><input className="form-input" type="number" step="0.01" value={form.sellingPrice} onChange={update("sellingPrice")} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Reorder Level</label><input className="form-input" type="number" value={form.reorderLevel} onChange={update("reorderLevel")} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={update("description")} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Part"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
