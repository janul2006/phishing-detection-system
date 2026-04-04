import { useEffect, useState } from "react";
import API from "../api";

function HistoryTable({ refreshKey = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await API.get("/history", {
          params: { _t: Date.now() },
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        const items = res?.data?.data?.data || [];

        if (!ignore) {
          setRows(items);
        }
      } catch (err) {
        if (!ignore) {
          setError("Failed to load scan history.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return (
    <div className="history-section glass-card" style={{ marginTop: "30px", textAlign: "left" }}>
      <h2>Recent Scans</h2>

      {loading && <p>Loading history...</p>}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No scans yet.</p>}

      {!loading && !error && rows.length > 0 && (
        <div className="table-container">
          <div className="history-card-header">
            <div>URL</div>
            <div>Result</div>
            <div>Confidence</div>
            <div>Scanned At</div>
          </div>
          {rows.map((scan) => {
            const isPhishing = scan.result === "phishing";
            const badgeClass = isPhishing ? "status-phishing" : "status-safe";
            const displayResult = isPhishing ? "Phishing" : "Safe";
            const confValue = scan.confidence ? Number(scan.confidence) : 0;
            const confidenceStr = scan.confidence ? `${confValue.toFixed(1)}%` : "N/A";
            const barWidth = scan.confidence ? `${confValue}%` : "0%";
            const barColor = isPhishing ? "var(--danger)" : "var(--success)";
            
            return (
              <div className="history-card-row" key={scan.id}>
                <div style={{ wordBreak: "break-all", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}>
                  {scan.url}
                </div>
                <div>
                  <span className={`status-badge ${badgeClass}`}>
                    {displayResult}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{confidenceStr}</div>
                  {scan.confidence && (
                    <div className="confidence-bar-container">
                      <div className="confidence-fill" style={{ width: barWidth, backgroundColor: barColor }}></div>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {scan.created_at ? new Date(scan.created_at).toLocaleString() : "N/A"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryTable;
