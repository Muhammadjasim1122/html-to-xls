import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataPreview from "./components/DataPreview";
import ActionPanel from "./components/ActionPanel";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setStatus("Analyzing document...");
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Get JSON preview
      const res = await fetch("https://html-to-excel-1.onrender.com/upload?preview=true", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Extraction failed");
        setStatus("Extraction failed.");
        return;
      }

      const result = await res.json();
      setData(result.records);
      setStatus(`Found ${result.records.length} records. Ready to export!`);
    } catch (err) {
      console.error(err);
      setStatus("Server connection failed. Is the backend running?");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    setStatus("Generating Excel file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://html-to-excel-1.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.split('.')[0]}_extracted.xls`;
        a.click();
        setStatus("Success! Excel file downloaded.");
      } else {
        alert("Failed to generate Excel.");
      }
    } catch (err) {
      console.error(err);
      alert("Download error.");
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Fine Extractor <span className="highlight">Pro</span></h1>
        <p className="subtitle">Convert traffic fine documents to structured Excel reports instantly.</p>
      </div>

      <FileUpload onFileSelect={setFile} selectedFile={file} />

      <ActionPanel
        onProcess={handleProcess}
        onDownload={handleDownload}
        canProcess={!!file}
        hasData={!!data && data.length > 0}
        processing={processing}
      />

      {status && <p className={`status-msg ${status.includes('failed') ? 'error' : 'success'}`}>{status}</p>}

      <DataPreview data={data} />
    </div>
  );
}

export default App;
