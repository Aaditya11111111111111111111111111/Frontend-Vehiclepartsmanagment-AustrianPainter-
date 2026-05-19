import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

export default function LoginPage({ onRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, password) => setForm({ email, password });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><b>⚙ VehicleParts</b> System</div>
        <div className="auth-tagline">Sign in to access the management portal</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
          New customer?{" "}
          <button onClick={onRegister} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: "600" }}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
