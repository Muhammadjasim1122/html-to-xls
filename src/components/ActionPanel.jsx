export default function ActionPanel({ onProcess, onDownload, canProcess, hasData, processing }) {
    return (
        <div className="action-panel">
            <div className="button-stack">
                <button
                    className={`btn-primary ${processing ? 'loading' : ''}`}
                    onClick={onProcess}
                    disabled={!canProcess || processing}
                >
                    {processing ? (
                        <>
                            <span className="spinner"></span>
                            Extracting...
                        </>
                    ) : (
                        "Extract Data"
                    )}
                </button>

                {hasData && (
                    <button className="btn-success" onClick={onDownload}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download Excel Report
                    </button>
                )}
            </div>
        </div>
    );
}
