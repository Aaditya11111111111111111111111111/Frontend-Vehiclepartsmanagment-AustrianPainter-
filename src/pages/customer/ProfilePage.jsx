import { useState, useEffect } from "react";
import { customersApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "", phone: "", address: "",
    currentPassword: "", newPassword: "", confirmPassword: ""
  });

  useEffect(() => {
    customersApi.getMe().then(p => {
      setProfile(p);
      setForm(f => ({ ...f, fullName: p.fullName, phone: p.phone, address: p.address || "" }));
    }).finally(() => setLoading(false));
  }, []);

  const update = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match."); return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setError("New password must be at least 6 characters."); return;
    }

    setSaving(true);
    try {
      const updated = await customersApi.updateMe({
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null,
      });
      setProfile(updated);
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <div className="page-subtitle">Update your personal details and password</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>

        {/* Profile info form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "20px" }}>Personal Information</div>
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName} onChange={update("fullName")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={profile?.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Email cannot be changed.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={update("phone")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={update("address")} placeholder="Your address" />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", margin: "20px 0 16px", paddingTop: "16px" }}>
              <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "12px", color: "var(--text-secondary)" }}>
                Change Password <span style={{ fontWeight: "400", color: "var(--text-muted)" }}>(leave blank to keep current)</span>
              </div>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={form.currentPassword} onChange={update("currentPassword")} placeholder="Required to change password" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={form.newPassword} onChange={update("newPassword")} placeholder="Min 6 characters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Repeat new password" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Account summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: "16px" }}>Account Summary</div>
            <div className="meta-grid">
              <div>
                <div className="meta-label">Member Since</div>
                <div className="meta-value">{new Date(profile?.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="meta-label">Role</div>
                <div className="meta-value">{user?.role}</div>
              </div>
              <div>
                <div className="meta-label">Total Spent</div>
                <div className="meta-value" style={{ color: "var(--green)" }}>
                  NPR {Number(profile?.totalSpent || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="meta-label">Pending Credit</div>
                <div className="meta-value" style={{ color: profile?.pendingCredit > 0 ? "var(--red)" : "var(--text-primary)" }}>
                  NPR {Number(profile?.pendingCredit || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-info" style={{ margin: 0 }}>
            To register a new vehicle, please contact staff at the service center. You can update mileage and condition of existing vehicles from <b>My Vehicles</b>.
          </div>
        </div>

      </div>
    </div>
  );
}
