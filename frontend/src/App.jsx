import { useState } from "react";
import ScanForm from "./components/ScanForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";

function App() {
  const [result, setResult] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleScanComplete = () => {
    setHistoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛡️ Phishing Detection System</h1>

      <ScanForm setResult={setResult} onScanComplete={handleScanComplete} />

      {/* Show result only if available */}
      {result && <ResultCard result={result} />}

      <HistoryTable refreshKey={historyRefreshKey} />
    </div>
  );
}

export default App;
