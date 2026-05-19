import { useState, useEffect } from "react";
import { appointmentsApi } from "../../services/api";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ appointmentDate: "", serviceType: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => appointmentsApi.getAll().then(setAppointments);
  useEffect(() => { load(); }, []);

  const handleBook = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await appointmentsApi.create({ ...form, appointmentDate: new Date(form.appointmentDate).toISOString() });
      setModal(false); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const statusColors = { Pending: "yellow", Confirmed: "blue", Completed: "green", Cancelled: "red" };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Appointments</h1><div className="page-subtitle">Service appointment management</div></div>
        {user?.role === "Customer" && (
          <button className="btn btn-primary" onClick={() => { setForm({ appointmentDate:"", serviceType:"", description:"" }); setError(""); setModal(true); }}>+ Book Appointment</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr>
              {user?.role !== "Customer" && <th>Customer</th>}
              <th>Service Type</th><th>Description</th><th>Date</th><th>Status</th>
              {(user?.role === "Admin" || user?.role === "Staff") && <th>Actions</th>}
            </tr></thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  {user?.role !== "Customer" && <td><b>{a.customerName}</b></td>}
                  <td>{a.serviceType}</td>
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{a.description}</td>
                  <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${statusColors[a.status]||"gray"}`}>{a.status}</span></td>
                  {(user?.role === "Admin" || user?.role === "Staff") && (
                    <td>
                      <select className="form-select" style={{ width:"120px", padding:"4px 8px", fontSize:"12px" }}
                        value={a.status} onChange={async e => { await appointmentsApi.updateStatus(a.id, e.target.value); load(); }}>
                        {["Pending","Confirmed","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Book Service Appointment" onClose={() => setModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleBook}>
            <div className="form-group"><label className="form-label">Service Type</label>
              <select className="form-select" value={form.serviceType} onChange={e => setForm({...form, serviceType:e.target.value})} required>
                <option value="">Select service...</option>
                {["Oil Change","Brake Service","Tire Rotation","Engine Tune-up","AC Repair","Battery Replacement","Suspension Check","Full Service","Diagnostic","Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Preferred Date & Time</label>
              <input className="form-input" type="datetime-local" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate:e.target.value})} required />
            </div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Describe the issue..." value={form.description} onChange={e => setForm({...form, description:e.target.value})} required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Booking..." : "Book Appointment"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
