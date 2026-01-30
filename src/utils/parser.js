/**
 * Parses raw text or HTML content to extract traffic fine records.
 * Pattern expected:
 * BLOCK START (Vehicle Name, e.g., "AUDI A6, 2022, Black")
 * "Date and Time of Issuing The Fine..."
 * "AmountAED ..."
 * "Source..."
 * "Black points..."
 */
export const parseTrafficFines = (content) => {
    // Normalize content: remove extra whitespace, treat as line-based
    const lines = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const records = [];
    let currentRecord = {};

    // We'll iterate through lines and try to identify fields.
    // A new vehicle line often indicates a new record or start of a block.
    // Given the strict pattern, we can look for the keywords.

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for "Date and Time" - this is a strong anchor
        if (line.startsWith("Date and Time of Issuing The Fine")) {
            // If we found a date, it means the *previous* line was likely the Vehicle
            // UNLESS the previous line was part of another record.
            // Let's look at the previous line for Vehicle.
            if (i > 0) {
                let vehicleCandidate = lines[i - 1];
                // simple heuristic: if the previous line isn't a known keyword header
                currentRecord.Vehicle = vehicleCandidate;
            }

            currentRecord.DateTime = line.replace("Date and Time of Issuing The Fine", "").trim();
            continue;
        }

        if (line.startsWith("Amount")) {
            const amountRaw = line.replace("Amount", "").trim();
            // Remove "AED" and parse format
            currentRecord.Amount = amountRaw.replace("AED", "").trim();
            continue;
        }

        if (line.startsWith("Source")) {
            currentRecord.Source = line.replace("Source", "").trim();
            continue;
        }

        if (line.startsWith("Black points")) {
            currentRecord.BlackPoints = line.replace("Black points", "").trim();

            // "Black points" seems to be the last field in the sample. 
            // So push the record and reset.
            if (currentRecord.Vehicle && currentRecord.DateTime) {
                records.push({ ...currentRecord });
                currentRecord = {};
            }
            continue;
        }
    }

    return records;
};

/**
 * Helper to read file as text
 */
export const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};
