import { useState } from "react";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage({ onBack }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await authApi.register(form);
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><b>⚙ VehicleParts</b> System</div>
        <div className="auth-tagline">Create your customer account</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" value={form.fullName} onChange={update("fullName")} required /></div>
            <div className="form-group"><label className="form-label">Phone</label>
              <input className="form-input" placeholder="98XXXXXXXX" value={form.phone} onChange={update("phone")} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={update("email")} required /></div>
          <div className="form-group"><label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={update("password")} required /></div>
          <div className="form-group"><label className="form-label">Address</label>
            <input className="form-input" placeholder="Kathmandu, Nepal" value={form.address} onChange={update("address")} /></div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: "600" }}>Sign In</button>
        </div>
      </div>
    </div>
  );
}
