import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload";
import DataPreview from "./components/DataPreview";
import ActionPanel from "./components/ActionPanel";
import "./App.css";

const API_BASE = "https://html-to-xls.onrender.com";

function App() {
  const [files, setFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({}); // { fileName: 'extracted' | 'pending' }
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Sync statuses when files change
    const newStatuses = { ...fileStatuses };
    const fileNames = files.map(f => f.name);

    // Clean up statuses for removed files
    Object.keys(newStatuses).forEach(name => {
      if (!fileNames.includes(name)) delete newStatuses[name];
    });

    // Initialize new files as pending
    files.forEach(file => {
      if (!newStatuses[file.name]) newStatuses[file.name] = 'pending';
    });

    setFileStatuses(newStatuses);
  }, [files]);

  const handleProcess = async (specificFiles = null) => {
    const filesToProcess = specificFiles || files;
    if (filesToProcess.length === 0) return;

    setProcessing(true);
    setStatus(specificFiles ? `Analyzing ${specificFiles[0].name}...` : "Analyzing documents...");
    setData(null);

    const formData = new FormData();
    filesToProcess.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(`${API_BASE}/upload?preview=true`, {
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

      // Update statuses
      const updatedStatuses = { ...fileStatuses };
      filesToProcess.forEach(f => {
        updatedStatuses[f.name] = 'extracted';
      });
      setFileStatuses(updatedStatuses);

      setStatus(`Found ${result.records.length} records from ${filesToProcess.length} file(s). Ready to export!`);
    } catch (err) {
      console.error(err);
      setStatus("Server connection failed. Is the backend running locally on port 5000?");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (specificFiles = null) => {
    const filesToDownload = specificFiles || files;
    if (filesToDownload.length === 0) return;

    setStatus(specificFiles ? `Generating Excel for ${specificFiles[0].name}...` : "Generating bulk Excel file...");

    const formData = new FormData();
    filesToDownload.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const fileName = specificFiles
          ? `${specificFiles[0].name.split('.')[0]}_extracted.xls`
          : `TrafficFines_Bulk_Extracted.xls`;
        a.download = fileName;
        a.click();
        setStatus(`Success! Excel file downloaded.`);
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
        <p className="subtitle">Convert multiple traffic fine documents to a structured Excel report.</p>
      </div>

      <FileUpload
        onFilesUpdate={setFiles}
        selectedFiles={files}
        fileStatuses={fileStatuses}
        onProcessFile={(file) => handleProcess([file])}
        onDownloadFile={(file) => handleDownload([file])}
      />

      <ActionPanel
        onProcess={() => handleProcess()}
        onDownload={() => handleDownload()}
        canProcess={files.length > 0}
        hasData={!!data && data.length > 0}
        processing={processing}
      />

      {status && <p className={`status-msg ${status.includes('failed') ? 'error' : 'success'}`}>{status}</p>}

      <DataPreview data={data} />
    </div>
  );
}

export default App;
