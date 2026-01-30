import { useState } from "react";

export default function FileUpload({ onFileSelect, selectedFile }) {
    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="upload-container">
            <label className={`upload-zone ${selectedFile ? 'has-file' : ''}`}>
                <div className="upload-icon">
                    {selectedFile ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                    )}
                </div>
                <div className="upload-text">
                    {selectedFile ? (
                        <>
                            <span className="file-name">{selectedFile.name}</span>
                            <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </>
                    ) : (
                        <>
                            <span className="prompt">Click or drag a file here</span>
                            <span className="hint">Supports HTML, HTM, TXT</span>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    name="file"
                    accept=".html,.htm,.txt"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
            </label>
        </div>
    );
}
