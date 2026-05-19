import { useState, useEffect } from "react";
import { reviewsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { reviewsApi.getAll().then(setReviews); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await reviewsApi.submit(form); setSubmitted(true); reviewsApi.getAll().then(setReviews); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Reviews</h1><div className="page-subtitle">Customer feedback and ratings</div></div></div>

      {user?.role === "Customer" && !submitted && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-title">Leave a Review</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Rating</label>
              <div style={{ display:"flex", gap:"8px" }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({...form, rating:n})}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:"28px", color: n <= form.rating ? "var(--yellow)" : "var(--border)" }}>★</button>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Comment</label>
              <textarea className="form-textarea" placeholder="Share your experience..." value={form.comment} onChange={e => setForm({...form, comment:e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Submitting..." : "Submit Review"}</button>
          </form>
        </div>
      )}
      {submitted && <div className="alert alert-success">Thank you for your review!</div>}

      <div className="card">
        <div className="card-title">Customer Reviews ({reviews.length})</div>
        {reviews.length === 0 && <p style={{ color:"var(--text-muted)", fontSize:"13px" }}>No reviews yet.</p>}
        {reviews.map(r => (
          <div key={r.id} style={{ padding:"16px 0", borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontWeight:"700", fontSize:"14px" }}>{r.customerName}</div>
                <div style={{ color:"var(--yellow)", fontSize:"18px", margin:"4px 0" }}>{stars(r.rating)}</div>
                <div style={{ fontSize:"13px", color:"var(--text-secondary)" }}>{r.comment}</div>
              </div>
              <div style={{ fontSize:"11px", color:"var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
