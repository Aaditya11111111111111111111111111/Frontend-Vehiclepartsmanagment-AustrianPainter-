import { useState, useEffect } from "react";
import { customersApi } from "../../services/api";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";

const EMPTY_VEHICLE = { vehicleNumber: "", make: "", model: "", year: new Date().getFullYear(), fuelType: "Petrol", mileage: 0, condition: "Good" };

export default function CustomersPage({ onViewCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // Register customer modal
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Customer detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add vehicle modal
  const [vehicleModal, setVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE);
  const [vehicleError, setVehicleError] = useState("");
  const [vehicleSaving, setVehicleSaving] = useState(false);

  const load = () => customersApi.getAll(search).then(setCustomers);
  useEffect(() => { load(); }, [search]);

  const update = k => e => setForm({ ...form, [k]: e.target.value });
  const updateVehicle = k => e => setVehicleForm({ ...vehicleForm, [k]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await customersApi.register(form);
      setModal(false); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!confirm(`Permanently delete "${customer.fullName}"?\n\nTheir invoices will be kept but the account will be removed.`)) return;
    try {
      await customersApi.delete(customer.id);
      load();
    } catch (err) {
      alert("Failed to delete customer: " + err.message);
    }
  };

  const openDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailModal(true);
    setDetailLoading(true);
    try {
      const detail = await customersApi.getById(customer.id);
      setCustomerDetail(detail);
    } catch {
      setCustomerDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAddVehicle = () => {
    setVehicleForm(EMPTY_VEHICLE);
    setVehicleError("");
    setVehicleModal(true);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault(); setVehicleSaving(true); setVehicleError("");
    try {
      await customersApi.addVehicle(selectedCustomer.id, {
        ...vehicleForm,
        year: Number(vehicleForm.year),
        mileage: Number(vehicleForm.mileage),
      });
      setVehicleModal(false);
      // Refresh customer detail to show new vehicle
      const detail = await customersApi.getById(selectedCustomer.id);
      setCustomerDetail(detail);
    } catch (err) { setVehicleError(err.message); }
    finally { setVehicleSaving(false); }
  };

  const fmt = n => `NPR ${Number(n || 0).toLocaleString()}`;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Customers</h1><div className="page-subtitle">Search and manage customer records</div></div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Name, phone, ID, vehicle..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setForm({ fullName:"",email:"",password:"",phone:"",address:"" }); setError(""); setModal(true); }}>+ Register Customer</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Total Spent</th><th>Pending Credit</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><span className="badge badge-gray">#{c.id}</span></td>
                  <td><b>{c.fullName}</b></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td style={{ color: "var(--green)", fontWeight: "600" }}>{fmt(c.totalSpent)}</td>
                  <td>{c.pendingCredit > 0 ? <span style={{ color: "var(--red)", fontWeight: "600" }}>{fmt(c.pendingCredit)}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(c)}>View Details</button>
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCustomer(c)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Customer Modal */}
      {modal && (
        <Modal title="Register New Customer" onClose={() => setModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.fullName} onChange={update("fullName")} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={update("phone")} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={update("email")} required /></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={update("password")} required /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={update("address")} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Registering..." : "Register Customer"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Customer Detail Modal */}
      {detailModal && selectedCustomer && (
        <Modal title={`Customer: ${selectedCustomer.fullName}`} onClose={() => { setDetailModal(false); setCustomerDetail(null); }}>
          {detailLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
          ) : customerDetail ? (
            <div>
              {/* Customer Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px", fontSize: "13px" }}>
                <div><span style={{ color: "var(--text-muted)" }}>Email:</span> <b>{selectedCustomer.email}</b></div>
                <div><span style={{ color: "var(--text-muted)" }}>Phone:</span> <b>{selectedCustomer.phone}</b></div>
                <div><span style={{ color: "var(--text-muted)" }}>Address:</span> <b>{selectedCustomer.address || "—"}</b></div>
                <div><span style={{ color: "var(--text-muted)" }}>Total Spent:</span> <b style={{ color: "var(--green)" }}>{fmt(selectedCustomer.totalSpent)}</b></div>
              </div>

              {/* Vehicles Section */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>🚗 Registered Vehicles</div>
                <button className="btn btn-primary btn-sm" onClick={openAddVehicle}>+ Add Vehicle</button>
              </div>

              {customerDetail.vehicles && customerDetail.vehicles.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {customerDetail.vehicles.map(v => (
                    <div key={v.id} style={{ background: "var(--bg-secondary, #f8f9fa)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>{v.make} {v.model} <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>({v.year})</span></div>
                      <div style={{ display: "flex", gap: "16px", color: "var(--text-secondary)" }}>
                        <span>🔢 {v.vehicleNumber}</span>
                        <span>⛽ {v.fuelType}</span>
                        <span>📏 {v.mileage?.toLocaleString()} km</span>
                        <span>🔧 {v.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info" style={{ marginBottom: "16px" }}>No vehicles registered for this customer yet.</div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setDetailModal(false); setCustomerDetail(null); }}>Close</button>
              </div>
            </div>
          ) : (
            <div className="alert alert-error">Failed to load customer details.</div>
          )}
        </Modal>
      )}

      {/* Add Vehicle Modal */}
      {vehicleModal && (
        <Modal title={`Add Vehicle for ${selectedCustomer?.fullName}`} onClose={() => setVehicleModal(false)}>
          {vehicleError && <div className="alert alert-error">{vehicleError}</div>}
          <form onSubmit={handleAddVehicle}>
            <div className="form-group">
              <label className="form-label">Vehicle Number (Plate)</label>
              <input className="form-input" placeholder="e.g. BA-1-CHA-1234" value={vehicleForm.vehicleNumber} onChange={updateVehicle("vehicleNumber")} required />
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Make</label><input className="form-input" placeholder="e.g. Toyota" value={vehicleForm.make} onChange={updateVehicle("make")} required /></div>
              <div className="form-group"><label className="form-label">Model</label><input className="form-input" placeholder="e.g. Corolla" value={vehicleForm.model} onChange={updateVehicle("model")} required /></div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Year</label>
                <input className="form-input" type="number" min="1990" max={new Date().getFullYear()} value={vehicleForm.year} onChange={updateVehicle("year")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select className="form-select" value={vehicleForm.fuelType} onChange={updateVehicle("fuelType")}>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                  <option>CNG</option>
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mileage (km)</label>
                <input className="form-input" type="number" min="0" value={vehicleForm.mileage} onChange={updateVehicle("mileage")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-select" value={vehicleForm.condition} onChange={updateVehicle("condition")}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setVehicleModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={vehicleSaving}>{vehicleSaving ? "Adding..." : "Add Vehicle"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
