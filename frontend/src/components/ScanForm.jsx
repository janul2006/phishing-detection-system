import { useState } from "react";
import API from "../api";

function BrainIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function ScanForm({ setResult, onScanComplete, currentResult, onScanStateChange }) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !url.trim()) return;

    try {
      setIsLoading(true);
      onScanStateChange?.(true);
      setStatusText("> extracting features...");

      const startedAt = performance.now();
      setTimeout(() => setStatusText("> querying LightGBM model..."), 800);

      const res = await API.post("/scan-url", { url });

      const completedAt = performance.now();
      const responseData = res.data?.data || {};
      const fallbackScanTimeMs = Math.round(completedAt - startedAt);

      setStatusText("> analysis complete.");
      setTimeout(() => setStatusText(""), 2000);

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
      setStatusText("");
    } finally {
      setIsLoading(false);
      onScanStateChange?.(false);
    }
  };

  let inputStateClass = "";
  if (currentResult && currentResult.url === url && !isLoading) {
    if (currentResult.result === "phishing") {
      inputStateClass = "danger-glow";
    } else {
      inputStateClass = "safe-glow";
    }
  }

  return (
    <>
      <div className="form-header">
        <h1>Analyze URL Security</h1>
        <p>Enter a web address below to check for phishing threats in real-time.</p>
      </div>

      <form onSubmit={handleSubmit} className="scan-form">
        <div className="input-wrapper" style={{ flex: 1, position: 'relative' }}>
          <div className={`scan-beam ${isLoading ? 'active' : ''}`}></div>
          <input
            type="url"
            className={`url-input font-mono ${inputStateClass}`}
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            required
            spellCheck="false"
          />
          {isLoading && (
            <div className="hud-status active">
              <BrainIcon className="brain-pulse" />
              <span className="font-mono text-xs">{statusText}</span>
            </div>
          )}
        </div>

        <button type="submit" className={`scan-button ${isLoading ? 'scanning' : ''}`} disabled={isLoading || !url.trim()}>
          <span className="scan-button-text">{isLoading ? "Analyzing..." : "Scan URL"}</span>
          {isLoading ? (
            <div className="button-progress-bar"></div>
          ) : (
            <div className="shimmer-effect"></div>
          )}
        </button>
      </form>

      {!isLoading && !statusText && (
        <div className="hud-status idle">
          <BrainIcon className="brain-idle" />
          <span className="font-mono text-xs">{">"} AI System Ready</span>
        </div>
      )}
    </>
  );
}

export default ScanForm;
