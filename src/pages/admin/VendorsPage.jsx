import { useState, useEffect } from "react";
import { vendorsApi } from "../../services/api";
import Modal from "../../components/common/Modal";

const EMPTY = { name: "", contactPerson: "", email: "", phone: "", address: "" };

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => vendorsApi.getAll().then(setVendors);
  useEffect(() => { load(); }, []);

  const update = k => e => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(""); setModal(true); };
  const openEdit = v => { setForm({ name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, address: v.address }); setEditing(v); setError(""); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (editing) await vendorsApi.update(editing.id, form);
      else await vendorsApi.create(form);
      setModal(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this vendor?")) return;
    await vendorsApi.delete(id); load();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Vendors</h1><div className="page-subtitle">Manage supplier and vendor information</div></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Vendor</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Address</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td><b>{v.name}</b></td>
                  <td>{v.contactPerson}</td>
                  <td>{v.email}</td>
                  <td>{v.phone}</td>
                  <td>{v.address}</td>
                  <td><span className={`badge ${v.isActive ? "badge-green" : "badge-red"}`}>{v.isActive ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>Edit</button>
                      {v.isActive && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={editing ? "Edit Vendor" : "Add Vendor"} onClose={() => setModal(null)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={form.name} onChange={update("name")} required /></div>
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contactPerson} onChange={update("contactPerson")} required /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={update("email")} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={update("phone")} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={update("address")} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
