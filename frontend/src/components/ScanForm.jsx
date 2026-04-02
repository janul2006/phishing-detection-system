import { useState } from "react";
import API from "../api";

function ScanForm({ setResult, onScanComplete }) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      const startedAt = performance.now();
      const res = await API.post("/scan-url", { url });
      const completedAt = performance.now();
      const responseData = res.data?.data || {};
      const fallbackScanTimeMs = Math.round(completedAt - startedAt);

      setResult({
        ...responseData,
        scan_time_ms: responseData.scan_time_ms ?? fallbackScanTimeMs,
      });
      onScanComplete?.();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error scanning URL";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "300px", padding: "10px" }}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Scanning..." : "Scan"}
      </button>
    </form>
  );
}

export default ScanForm;
