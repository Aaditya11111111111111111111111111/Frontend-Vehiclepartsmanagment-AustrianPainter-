import { useState, useEffect } from "react";
import { staffApi } from "../../services/api";
import Modal from "../../components/common/Modal";

const EMPTY = { fullName: "", email: "", password: "", phone: "", position: "" };

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => staffApi.getAll().then(setStaff);
  useEffect(() => { load(); }, []);

  const update = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await staffApi.create(form);
      setModal(false); setForm(EMPTY); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this staff member?")) return;
    await staffApi.deactivate(id); load();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Staff Management</h1><div className="page-subtitle">Register and manage staff members</div></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModal(true); }}>+ Add Staff</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Position</th><th>Hire Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td><b>{s.fullName}</b></td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.position}</td>
                  <td>{new Date(s.hireDate).toLocaleDateString()}</td>
                  <td><span className={`badge ${s.isActive ? "badge-green" : "badge-red"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
                  <td>{s.isActive && <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(s.id)}>Deactivate</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Add Staff Member" onClose={() => setModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.fullName} onChange={update("fullName")} required /></div>
              <div className="form-group"><label className="form-label">Position</label>
                <select className="form-select" value={form.position} onChange={update("position")} required>
                  <option value="">Select...</option>
                  {["Sales Representative","Inventory Manager","Cashier","Service Advisor","Mechanic"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={update("email")} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={update("phone")} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={update("password")} required /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Register Staff"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
