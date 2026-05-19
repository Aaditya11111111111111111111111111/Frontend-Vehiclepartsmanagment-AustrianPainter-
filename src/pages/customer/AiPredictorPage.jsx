import { useState, useEffect } from "react";
import { customersApi, aiApi } from "../../services/api";

export default function AiPredictorPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    customersApi.getMyVehicles()
      .then(data => setVehicles(data || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const analyze = async () => {
    if (!selectedVehicle) { setError("Select a vehicle first."); return; }
    setLoading(true); setError("");
    try {
      const result = await aiApi.predict(selectedVehicle);
      setPredictions(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Part Failure Predictor</h1>
          <div className="page-subtitle">Intelligent analysis of your vehicle's condition and part wear patterns</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-title">How it works</div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Our AI analyzes your vehicle's mileage, age, fuel type, and reported condition to predict which parts may need attention soon. This helps you service your vehicle proactively and avoid costly breakdowns.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <select className="form-select" style={{ flex: 1 }} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} disabled={loadingVehicles}>
            <option value="">{loadingVehicles ? "Loading vehicles..." : "Select your vehicle..."}</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} — {v.vehicleNumber} ({v.year})
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={analyze} disabled={loading || !selectedVehicle || loadingVehicles}>
            {loading ? "Analyzing..." : "🔍 Analyze"}
          </button>
        </div>
        {!loadingVehicles && vehicles.length === 0 && (
          <div className="alert alert-info" style={{ marginTop: "12px" }}>
            No vehicles registered. Please contact staff to register your vehicle, then come back to use the AI predictor.
          </div>
        )}
        {error && <div className="alert alert-error" style={{ marginTop: "12px" }}>{error}</div>}
      </div>

      {predictions && (
        <div>
          <div className="card" style={{ marginBottom: "16px" }}>
            <div className="card-title">Vehicle: {predictions.make} {predictions.model}</div>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <span>🚗 <b>{predictions.vehicleNumber}</b></span>
              <span>📏 <b>{predictions.mileage?.toLocaleString()} km</b> mileage</span>
            </div>
          </div>

          {predictions.predictions?.map((p, i) => (
            <div key={i} className="card" style={{ marginBottom: "12px", borderLeft: `3px solid ${p.risk === "High" ? "var(--red)" : p.risk === "Medium" ? "var(--yellow)" : "var(--green)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>{p.part}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{p.reason}</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>⏱ {p.urgency}</div>
                </div>
                <span className={`badge ${p.risk === "High" ? "badge-red" : p.risk === "Medium" ? "badge-yellow" : "badge-green"}`}>
                  {p.risk} Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
