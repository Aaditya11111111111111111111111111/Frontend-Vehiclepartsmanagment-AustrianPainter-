import { useState, useEffect } from "react";
import { partsApi } from "../../services/api";

const CATEGORIES = ["All", "Engine", "Brakes", "Suspension", "Electrical", "Filters", "Tyres", "Body", "Transmission", "Cooling", "Exhaust", "Ignition", "Clutch", "Lighting", "Wheel"];

export default function PartsListPage({ onNavigate }) {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    partsApi.getAll(search, category === "All" ? "" : category)
      .then(setParts)
      .finally(() => setLoading(false));
  }, [search, category]);

  const fmt = (n) => `NPR ${Number(n).toLocaleString()}`;

  const inStock = parts.filter(p => p.isActive && p.stockQuantity > 0).length;
  const outOfStock = parts.filter(p => p.isActive && p.stockQuantity === 0).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Parts Catalog</h1>
          <div className="page-subtitle">Browse available vehicle parts and pricing</div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="label">Total Parts</div>
          <div className="value">{parts.length}</div>
        </div>
        <div className="stat-card green">
          <div className="label">In Stock</div>
          <div className="value">{inStock}</div>
        </div>
        <div className="stat-card red">
          <div className="label">Out of Stock</div>
          <div className="value">{outOfStock}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px", padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-bar" style={{ flex: "1", minWidth: "200px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Parts table */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading parts...</div>
        ) : parts.length === 0 ? (
          <div className="empty-state">No parts found matching your search.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {parts.filter(p => p.isActive).map(p => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: "600" }}>{p.name}</div></td>
                    <td>
                      <code style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--surface2)", padding: "2px 6px", borderRadius: "4px" }}>
                        {p.sku}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-blue">{p.category}</span>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "240px" }}>
                      {p.description || "—"}
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--accent)" }}>
                      {fmt(p.sellingPrice)}
                    </td>
                    <td>
                      {p.stockQuantity === 0 ? (
                        <span className="badge badge-red">Out of Stock</span>
                      ) : p.stockQuantity < 10 ? (
                        <span className="badge badge-yellow">Low Stock</span>
                      ) : (
                        <span className="badge badge-green">In Stock</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onNavigate("requests", { partName: p.name })}
                        title="Request this part"
                      >
                        Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note about requesting parts */}
      <div className="alert alert-info" style={{ marginTop: "16px" }}>
        Click <b>Request</b> on any part to send a request to staff, or use <b>Request a Part</b> from the sidebar to ask for something not listed.
      </div>
    </div>
  );
}
