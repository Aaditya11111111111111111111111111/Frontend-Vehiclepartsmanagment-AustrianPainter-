import { useState, useEffect } from "react";
import { partRequestsApi } from "../../services/api";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";

export default function PartRequestsPage({ prefillPartName }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ partName: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => partRequestsApi.getAll().then(setRequests).catch(() => setRequests([]));
  useEffect(() => { load(); }, []);

  // Auto-open modal and prefill part name when coming from Parts Catalog
  useEffect(() => {
    if (prefillPartName) {
      setForm({ partName: prefillPartName, description: "" });
      setModal(true);
    }
  }, [prefillPartName]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await partRequestsApi.create(form);
      setModal(false);
      setForm({ partName: "", description: "" });
      load();
    }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const closeModal = () => {
    setModal(false);
    setForm({ partName: "", description: "" });
    setError("");
  };

  const statusColors = { Pending: "yellow", Fulfilled: "green", Rejected: "red" };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Part Requests</h1><div className="page-subtitle">Request parts not currently in stock</div></div>
        {user?.role === "Customer" && <button className="btn btn-primary" onClick={() => { setForm({ partName:"", description:"" }); setError(""); setModal(true); }}>+ Request Part</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr>
              {user?.role !== "Customer" && <th>Customer</th>}
              <th>Part Name</th><th>Description</th><th>Status</th><th>Date</th>
              {user?.role !== "Customer" && <th>Actions</th>}
            </tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  {user?.role !== "Customer" && <td>{r.customer?.user?.fullName || "—"}</td>}
                  <td><b>{r.partName}</b></td>
                  <td>{r.description}</td>
                  <td><span className={`badge badge-${statusColors[r.status]||"gray"}`}>{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  {user?.role !== "Customer" && (
                    <td><select className="form-select" style={{ width:"120px", padding:"4px 8px", fontSize:"12px" }}
                        value={r.status} onChange={async e => { await partRequestsApi.updateStatus(r.id, e.target.value); load(); }}>
                        {["Pending","Fulfilled","Rejected"].map(s => <option key={s}>{s}</option>)}
                      </select></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Request a Part" onClose={closeModal}>
          {prefillPartName && (
            <div className="alert alert-info" style={{ marginBottom: "16px" }}>
              Requesting from Parts Catalog — part name pre-filled. Add any extra details below.
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Part Name</label>
              <input
                className="form-input"
                placeholder="e.g. Honda Civic Air Filter"
                value={form.partName}
                onChange={e => setForm({...form, partName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Details</label>
              <textarea
                className="form-textarea"
                placeholder="Part number, specs, urgency, quantity needed..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Submitting..." : "Submit Request"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
