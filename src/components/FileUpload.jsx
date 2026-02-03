import { useState } from "react";

export default function FileUpload({ onFilesUpdate, selectedFiles, fileStatuses, onProcessFile, onDownloadFile }) {
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            onFilesUpdate([...selectedFiles, ...newFiles]);
        }
        // Reset input value to allow selecting same file again if removed
        e.target.value = '';
    };

    const removeFile = (indexToRemove) => {
        onFilesUpdate(selectedFiles.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="upload-container">
            {selectedFiles.length === 0 ? (
                <label className="upload-zone">
                    <div className="upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                    </div>
                    <div className="upload-text">
                        <span className="prompt">Click to select HTML files</span>
                        <span className="hint">Extract data from multiple files at once</span>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept=".html,.htm,.txt"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </label>
            ) : (
                <div className="file-management">
                    <div className="file-list">
                        {selectedFiles.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="file-item">
                                <div className="file-info">
                                    <div className="file-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </div>
                                    <div className="file-details">
                                        <span className="file-name-small">{file.name}</span>
                                        <span className="file-size-small">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <span className={`status-badge ${fileStatuses[file.name] || 'pending'}`}>
                                        {fileStatuses[file.name] === 'extracted' ? '✓ Extracted' : 'Pending'}
                                    </span>
                                </div>

                                <div className="file-actions">
                                    <button
                                        className="btn-action-row extract"
                                        onClick={() => onProcessFile(file)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                        Extract
                                    </button>
                                    <button
                                        className="btn-action-row download"
                                        onClick={() => onDownloadFile(file)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Excel
                                    </button>
                                    <button
                                        className="action-btn-small remove"
                                        onClick={() => removeFile(idx)}
                                        title="Remove file"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="add-more-container">
                        <label className="btn-add-more">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add more Files
                            <input
                                type="file"
                                multiple
                                accept=".html,.htm,.txt"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
