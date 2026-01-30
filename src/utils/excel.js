import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel file from the provided data.
 * @param {Array} data - Array of fine objects { Vehicle, DateTime, Amount, Source, BlackPoints }
 * @param {string} filename - Name of the file to download
 */
export const generateExcel = (data, filename = 'TrafficFines.xls') => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Define headers in specific order
    const headers = ["Vehicle", "DateTime", "Amount", "Source", "BlackPoints"];

    // Create sheet data with headers first
    const sheetData = [headers];

    // Map data to rows based on header order to ensure strict column mapping
    data.forEach(row => {
        sheetData.push([
            row.Vehicle || '',
            row.DateTime || '',
            row.Amount || '',  // Ensure numeric strings are preserved or parsed if needed. 
            // Requirement says "numeric value only", usually text is fine, 
            // or we can parseFloat if valid number.
            row.Source || '',
            row.BlackPoints || ''
        ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Fines");

    // Write file and trigger download
    XLSX.writeFile(wb, filename, { bookType: 'xls', type: 'binary' });
};
