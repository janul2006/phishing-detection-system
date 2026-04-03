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
          <table className="modern-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Scanned At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((scan) => {
                const isPhishing = scan.result === "phishing";
                const badgeClass = isPhishing ? "status-phishing" : "status-safe";
                const displayResult = isPhishing ? "Phishing" : "Safe";
                const confidence = scan.confidence ? `${Number(scan.confidence).toFixed(1)}%` : "N/A";
                
                return (
                  <tr key={scan.id}>
                    <td style={{ wordBreak: "break-all", maxWidth: "300px" }}>{scan.url}</td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        {displayResult}
                      </span>
                    </td>
                    <td>{confidence}</td>
                    <td>
                      {scan.created_at ? new Date(scan.created_at).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryTable;
