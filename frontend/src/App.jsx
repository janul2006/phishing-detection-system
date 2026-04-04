import { useState, useEffect, useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import ScanForm from "./components/ScanForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";
import "./App.css";

function SentryLogo() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="brand-icon">
      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
      <line x1="14" y1="9" x2="10" y2="15" strokeWidth="2.5" />
    </svg>
  );
}

function App() {
  const [result, setResult] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: "grab" }, resize: true },
      modes: { grab: { distance: 140, links: { opacity: 0.5, color: "#00D2FF" } } },
    },
    particles: {
      color: { value: "#00D2FF" },
      links: { color: "#00D2FF", distance: 150, enable: true, opacity: 0.1, width: 1 },
      move: { direction: "none", enable: true, speed: 0.8, outModes: { default: "out" } },
      number: { density: { enable: true, area: 800 }, value: 30 },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  const handleScanComplete = () => {
    setHistoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-wrapper">
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="particles-layer" />
      
      <nav className="navbar">
        <div className="nav-brand">
          <SentryLogo />
          <span className="brand-text text-gradient">SentryURL</span>
        </div>
        <div className="nav-actions">
          {/* HUD Status if needed globally could go here */}
        </div>
      </nav>

      <main className="main-content">
        <section className="scan-form-container glass-card">
          <ScanForm setResult={setResult} onScanComplete={handleScanComplete} currentResult={result} />
        </section>

        {result && <ResultCard result={result} />}

        <HistoryTable refreshKey={historyRefreshKey} />
      </main>
    </div>
  );
}

export default App;
