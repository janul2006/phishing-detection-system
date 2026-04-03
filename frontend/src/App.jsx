import { useState, useEffect } from "react";
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
  const [theme, setTheme] = useState("dark"); // Default dark mode

  useEffect(() => {
    // Apply theme class to document body/root
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleScanComplete = () => {
    setHistoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="nav-brand">
          <SentryLogo />
          <span className="brand-text">SentryURL</span>
        </div>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </nav>

      <main className="main-content">
        <section className="scan-form-container glass-card">
          <ScanForm setResult={setResult} onScanComplete={handleScanComplete} />
        </section>

        {/* Show result only if available */}
        {result && <ResultCard result={result} />}

        <HistoryTable refreshKey={historyRefreshKey} />
      </main>
    </div>
  );
}

export default App;
