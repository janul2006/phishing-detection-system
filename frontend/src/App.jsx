import { useState } from "react";
import ScanForm from "./components/ScanForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";
import DataConstellation from "./components/DataConstellation";
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
  const [isScanning, setIsScanning] = useState(false);

  const handleScanComplete = () => {
    setHistoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-wrapper">
      <DataConstellation isScanning={isScanning} result={result} />
      
      <nav className="navbar">
        <div className="nav-brand">
          <SentryLogo />
          <span className="brand-text text-gradient">SentryURL</span>
        </div>
        <div className="nav-actions">
        </div>
      </nav>

      <main className="main-content">
        <section className="scan-form-container glass-card">
          <ScanForm 
            setResult={setResult} 
            onScanComplete={handleScanComplete} 
            currentResult={result} 
            onScanStateChange={setIsScanning}
          />
        </section>

        {result && <ResultCard result={result} />}

        <HistoryTable refreshKey={historyRefreshKey} />
      </main>
    </div>
  );
}

export default App;
