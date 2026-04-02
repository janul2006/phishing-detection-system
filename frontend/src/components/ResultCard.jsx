function ResultCard({ result }) {
  if (!result) return null;

  const isPhishing = result?.result === "phishing";
  const normalizedConfidence =
    typeof result?.confidence === "number"
      ? result.confidence <= 1
        ? result.confidence * 100
        : result.confidence
      : null;

  const formattedTime = result?.scan_time_ms
    ? `${(result.scan_time_ms / 1000).toFixed(2)}s`
    : "N/A";

  const scannedAt = result?.scanned_at
    ? new Date(result.scanned_at).toLocaleString()
    : "N/A";

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        background: isPhishing ? "#ffdddd" : "#ddffdd",
        borderRadius: "10px",
      }}
    >
      <h2>{isPhishing ? "⚠️ Phishing" : "✅ Safe"}</h2>
      <p><strong>URL:</strong> {result?.url || "N/A"}</p>
      <p>
        <strong>Confidence:</strong>{" "}
        {normalizedConfidence !== null ? `${normalizedConfidence.toFixed(2)}%` : "N/A"}
      </p>
      <p><strong>Scan Time:</strong> {formattedTime}</p>
      <p><strong>Scanned At:</strong> {scannedAt}</p>
    </div>
  );
}

export default ResultCard;
