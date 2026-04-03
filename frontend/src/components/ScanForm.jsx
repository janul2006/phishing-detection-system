import { useState } from "react";
import API from "../api";

function ScanForm({ setResult, onScanComplete }) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !url.trim()) return;

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
    <>
      <div className={`pulse-overlay ${isLoading ? 'active' : ''}`}></div>
      
      <div className="form-header">
        <h1>Analyze URL Security</h1>
        <p>Enter a web address below to check for phishing threats in real-time.</p>
      </div>

      <form onSubmit={handleSubmit} className="scan-form">
        <input
          type="url"
          className="url-input"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          required
        />
        <button type="submit" className="scan-button" disabled={isLoading || !url.trim()}>
          {isLoading ? "Analyzing..." : "Scan URL"}
        </button>
      </form>
    </>
  );
}

export default ScanForm;
