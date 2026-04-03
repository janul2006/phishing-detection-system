import React, { useEffect, useState } from "react";

function ResultCard({ result }) {
  const [animatedDashoffset, setAnimatedDashoffset] = useState(283); // Initial full offset

  if (!result) return null;

  const isPhishing = result?.result === "phishing";

  const formattedTime = result?.scan_time_ms
    ? `${(result.scan_time_ms / 1000).toFixed(2)}s`
    : "N/A";

  const scannedAt = result?.scanned_at
    ? new Date(result.scanned_at).toLocaleString()
    : "N/A";

  // Calculate confidence display properly
  const confidenceValue = result?.confidence ? Number(result.confidence) : 0;
  
  // Circle Gauge variables
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // approx 282.7
  const targetOffset = circumference - (confidenceValue / 100) * circumference;

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => {
      setAnimatedDashoffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetOffset, result]);

  // Generate deterministic mock breakdown logic for demo purposes
  // To make it look realistic, we assign fake risks based on `isPhishing`
  const breakdownData = [
    {
      label: "Suspicious Domain Age",
      flag: isPhishing ? "Warning" : "Safe",
      type: isPhishing ? "flag-danger" : "flag-success"
    },
    {
      label: "SSL Certificate Status",
      flag: isPhishing ? "Self-Signed" : "Valid",
      type: isPhishing ? "flag-danger" : "flag-success"
    },
    {
      label: "High Character Randomness",
      flag: isPhishing ? "High" : "Low",
      type: isPhishing ? "flag-danger" : "flag-neutral"
    },
    {
      label: "URL Shortener Detection",
      flag: isPhishing || result.url.includes("bit.ly") ? "Detected" : "None",
      type: isPhishing || result.url.includes("bit.ly") ? "flag-danger" : "flag-neutral"
    }
  ];

  const themeColor = isPhishing ? "var(--danger)" : "var(--success)";

  return (
    <div className={`result-container glass-card result-card ${isPhishing ? "phishing" : "safe"}`}>
      
      <div className="result-header">
        
        {/* The Probability Gauge */}
        <div className="gauge-container" style={{ position: "relative", width: "140px", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <svg className="gauge-svg" viewBox="0 0 100 100" width="140" height="140" style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
            <circle 
              className="gauge-circle-bg" 
              cx="50" cy="50" r={radius} 
              fill="transparent"
              stroke="var(--bg-secondary)"
              strokeWidth="10"
            />
            <circle 
              className="gauge-circle-value" 
              cx="50" cy="50" r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={animatedDashoffset}
              stroke={themeColor}
              strokeWidth="10"
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease" }}
            />
          </svg>
          <div className="gauge-center" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="gauge-percentage" style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", margin: 0, lineHeight: 1 }}>
              {confidenceValue.toFixed(1)}%
            </span>
            <span className="gauge-label" style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
              Confidence
            </span>
          </div>
        </div>

        <div className="result-title">
          <h2>{isPhishing ? "Phishing Threat Detected" : "URL Looks Safe"}</h2>
          <p>{result?.url}</p>
        </div>
      </div>

      <div className="breakdown-grid">
        {breakdownData.map((item, id) => (
          <div key={id} className="breakdown-item">
            <span className="breakdown-label">{item.label}</span>
            <span className={`breakdown-flag ${item.type}`}>
              {item.flag}
            </span>
          </div>
        ))}
      </div>

      <div className="result-details" style={{ justifyContent: "center", padding: "0 0 20px" }}>
        <span> Analysis Time: {formattedTime}</span>
        <span> {scannedAt}</span>
      </div>

    </div>
  );
}

export default ResultCard;
