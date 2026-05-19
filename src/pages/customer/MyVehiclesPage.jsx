import { useState, useEffect } from "react";
import { customersApi } from "../../services/api";
import Modal from "../../components/common/Modal";

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ mileage: 0, condition: "Good" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    customersApi.getMyVehicles()
      .then(data => setVehicles(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (v) => {
    setEditing(v);
    setForm({ mileage: v.mileage, condition: v.condition });
    setError(""); setSuccess("");
    setEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await customersApi.updateMyVehicle(editing.id, {
        mileage: Number(form.mileage),
        condition: form.condition,
      });
      setEditModal(false);
      setSuccess(`${editing.make} ${editing.model} updated.`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const conditionColor = c => ({
    Excellent: "var(--green)", Good: "var(--blue)",
    Fair: "var(--yellow)", Poor: "var(--red)"
  }[c] || "var(--text-muted)");

  if (loading) return <div className="loading">Loading vehicles...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Vehicles</h1>
          <div className="page-subtitle">View and update your registered vehicles</div>
        </div>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{success}</div>}

      {vehicles.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 40, height: 40, opacity: 0.3, marginBottom: 12 }}>
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5"/>
              <circle cx="16" cy="19" r="2"/><circle cx="7" cy="19" r="2"/>
              <path d="M14 17H9"/>
            </svg>
            <div>No vehicles registered yet.</div>
            <div style={{ fontSize: "13px", marginTop: "6px", color: "var(--text-muted)" }}>
              Contact staff at the service center to register your vehicle.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {vehicles.map(v => (
            <div key={v.id} className="card" style={{ position: "relative" }}>
              {/* Vehicle header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "17px" }}>{v.make} {v.model}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{v.year} · {v.fuelType}</div>
                </div>
                <code style={{ fontSize: "12px", color: "var(--accent)", background: "var(--accent-dim)", padding: "3px 8px", borderRadius: "6px", fontWeight: "600" }}>
                  {v.vehicleNumber}
                </code>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "var(--surface2)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>Mileage</div>
                  <div style={{ fontWeight: "700", fontSize: "16px", marginTop: "4px" }}>{v.mileage.toLocaleString()} km</div>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>Condition</div>
                  <div style={{ fontWeight: "700", fontSize: "16px", marginTop: "4px", color: conditionColor(v.condition) }}>{v.condition}</div>
                </div>
              </div>

              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => openEdit(v)}>
                ✏️ Update Mileage &amp; Condition
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: "16px" }}>
        To register a new vehicle or update plate number / make / model, please contact staff at the service center.
      </div>

      {editModal && editing && (
        <Modal title={`Update — ${editing.make} ${editing.model}`} onClose={() => setEditModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Current Mileage (km)</label>
              <input
                className="form-input"
                type="number"
                min={editing.mileage}
                value={form.mileage}
                onChange={e => setForm({ ...form, mileage: e.target.value })}
                required
              />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Previous: {editing.mileage.toLocaleString()} km — mileage can only increase.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-select" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
