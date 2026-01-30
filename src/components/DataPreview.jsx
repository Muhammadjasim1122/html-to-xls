export default function DataPreview({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="empty-preview">
                <div className="box">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="48" color="#cbd5e0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5c0 .621.504 1.125 1.125 1.125m17.25-1.125a1.125 1.125 0 0 1 1.125 1.125m-1.125-1.125c0 .621.504 1.125 1.125 1.125m0-1.125V6.75m0 12.75a1.125 1.125 0 0 1-1.125-1.125m1.125 1.125c.621 0 1.125-.504 1.125-1.125M11.25 3h1.5a1.125 1.125 0 0 1 1.125 1.125v1.5a1.125 1.125 0 0 1-1.125 1.125h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a1.125 1.125 0 0 1 1.125-1.125Z" />
                    </svg>
                    <p>No Data Extracted Yet</p>
                    <span className="hint">Select a file and click Extract to see results.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="data-preview">
            <h3>Found {data.length} Records</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Plate No</th>
                            <th>Category</th>
                            <th>Code</th>
                            <th>Ticket No</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Source</th>
                            <th>Fee</th>
                            <th>Status</th>
                            <th>Offense Terms</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 15).map((row, idx) => (
                            <tr key={idx}>
                                <td className="bold">{row["Plate Number"]}</td>
                                <td>{row["Plate Category"]}</td>
                                <td>{row["Plate Code"]}</td>
                                <td>{row["Ticket Number"]}</td>
                                <td>{row["Ticket Date"]}</td>
                                <td>{row["Ticket Time"]}</td>
                                <td>{row["Fines source"]}</td>
                                <td className="amount">{row["Ticket Fee"]}</td>
                                <td>{row["Ticket Status"]}</td>
                                <td className="small-text">{row["The terms of the offense"]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length > 15 && <div className="more-indicator">+ {data.length - 15} more records</div>}
            </div>
        </div>
    );
}
