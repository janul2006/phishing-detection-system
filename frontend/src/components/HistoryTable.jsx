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
        const res = await API.get("/history");
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
    <div style={{ marginTop: "30px", textAlign: "left" }}>
      <h2>Recent Scans</h2>

      {loading && <p>Loading history...</p>}
      {error && <p style={{ color: "#ff8080" }}>{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No scans yet.</p>}

      {!loading && !error && rows.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #555",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #555", padding: "8px" }}>URL</th>
              <th style={{ border: "1px solid #555", padding: "8px" }}>Result</th>
              <th style={{ border: "1px solid #555", padding: "8px" }}>Confidence</th>
              <th style={{ border: "1px solid #555", padding: "8px" }}>Scanned At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((scan) => {
              const confidenceValue =
                typeof scan.confidence === "number"
                  ? scan.confidence <= 1
                    ? scan.confidence * 100
                    : scan.confidence
                  : null;

              return (
                <tr key={scan.id}>
                  <td style={{ border: "1px solid #555", padding: "8px" }}>{scan.url}</td>
                  <td style={{ border: "1px solid #555", padding: "8px" }}>{scan.result}</td>
                  <td style={{ border: "1px solid #555", padding: "8px" }}>
                    {confidenceValue !== null ? `${confidenceValue.toFixed(2)}%` : "N/A"}
                  </td>
                  <td style={{ border: "1px solid #555", padding: "8px" }}>
                    {scan.created_at ? new Date(scan.created_at).toLocaleString() : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistoryTable;
