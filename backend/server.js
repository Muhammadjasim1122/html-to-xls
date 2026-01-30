import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import * as XLSX from "xlsx";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const content = fs.readFileSync(filePath, "utf8");

        let textData = "";

        if (content.includes("<html") || content.includes("<body")) {
            const $ = cheerio.load(content);

            // Force block elements to have newlines to keep text separated
            $('br, div, p, tr, li, h1, h2, h3, h4, h5, h6, th, td').each((i, el) => {
                $(el).prepend('\n').append('\n');
            });

            textData = $("body").text();
        } else {
            textData = content;
        }

        // Cleanup: remove multiple spaces, but keep newlines
        textData = textData.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        const records = [];
        // Fuzzy anchor to find the start of each fine record
        const anchorRegex = /Date and Time of Issuing\s*(?:The)?\s*Fine/i;

        // Find all matches for the anchor
        const matches = [];
        let match;
        const globalAnchorRegex = new RegExp(anchorRegex.source, "gi");
        while ((match = globalAnchorRegex.exec(textData)) !== null) {
            matches.push({ index: match.index, text: match[0] });
        }

        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = (i < matches.length - 1) ? matches[i + 1].index : textData.length;
            const segment = textData.substring(start, end);

            // Look "above" the anchor for the vehicle
            const prevTextStart = (i === 0) ? 0 : matches[i - 1].index;
            const prevText = textData.substring(prevTextStart, start);
            const prevLines = prevText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            let vehicleText = "Unknown";
            const excludeKeywords = ["home", "about", "contact", "fine", "account", "login", "source", "amount", "points", "date", "time", "issuing", "issuance"];

            // Look at multiple lines back to catch full vehicle info (e.g. AUDI A6 on one line, 2022 White on another)
            let possibleVehicleLines = [];
            for (let l = prevLines.length - 1; l >= 0 && possibleVehicleLines.length < 3; l--) {
                const line = prevLines[l];
                if (!excludeKeywords.some(kw => line.toLowerCase().includes(kw)) && line.length > 2) {
                    possibleVehicleLines.unshift(line);
                }
            }
            vehicleText = possibleVehicleLines.join(", ");

            // Split vehicle into Name, Year, Color using smart classification
            let vName = "Unknown", vYear = "Unknown", vColor = "Unknown";
            if (vehicleText !== "" && vehicleText !== "Unknown") {
                // Split by comma first, then spaces
                let tokens = vehicleText.split(/[,\s]+/).map(t => t.trim()).filter(t => t);
                console.log(`[DEBUG] Vehicle segment: "${vehicleText}" | Tokens:`, tokens);

                // 1. Identify Year (Look for 2 or 4 digits)
                const yearIndex = tokens.findIndex(t => /^\d{4}$/.test(t) || (/^\d{2}$/.test(t) && parseInt(t) < 50));
                if (yearIndex !== -1) {
                    vYear = tokens[yearIndex];
                    tokens.splice(yearIndex, 1);
                }

                // 2. Identify Color (Match against common names)
                const colors = ["white", "black", "blue", "red", "grey", "silver", "gray", "green", "brown", "yellow", "orange"];
                const colorIndex = tokens.findIndex(t => colors.includes(t.toLowerCase()));
                if (colorIndex !== -1) {
                    vColor = tokens[colorIndex];
                    tokens.splice(colorIndex, 1);
                }

                // 3. Name is the rest
                vName = tokens.join(" ") || "Unknown";
                console.log(`[DEBUG] Classified: Name="${vName}", Year="${vYear}", Color="${vColor}"`);
            }

            // Reconstruct the record to match the 12-column template exactly
            const record = {
                "Plate Number": "",
                "Plate Category": "",
                "Plate Code": "",
                "License Number": "",
                "License From": "",
                "Ticket Number": "",
                "Ticket Date": "",
                "Ticket Time": "",
                "Fines source": "",
                "Ticket Fee": "0",
                "Ticket Status": "Yes",
                "The terms of the offense": ""
            };

            // Extract Date and Time (Full Date vs Time)
            const escapedAnchor = matches[i].text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const dateMatch = segment.match(new RegExp(`${escapedAnchor}\\s*(.*)`, "i"));
            if (dateMatch) {
                const fullDateTime = dateMatch[1].split('\n')[0].trim();
                const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i;
                const timePart = fullDateTime.match(timeRegex);
                if (timePart) {
                    record["Ticket Time"] = timePart[0].trim();
                    record["Ticket Date"] = fullDateTime.replace(timePart[0], "").trim();
                } else {
                    record["Ticket Date"] = fullDateTime;
                    record["Ticket Time"] = "";
                }
            }

            // Extract Amount (AED) -> Ticket Fee
            const amtMatch = segment.match(/Amount\s*(?::|AED)?\s*([\d,.]+)/i);
            if (amtMatch) record["Ticket Fee"] = amtMatch[1].trim();

            // Extract Source -> Fines source
            const srcMatch = segment.match(/Source\s*(?::)?\s*(.*)/i);
            if (srcMatch) record["Fines source"] = srcMatch[1].split('\n')[0].trim();

            // Extract Ticket/Fine Number if present
            const tnMatch = segment.match(/(?:Ticket|Fine)\s*Number\s*(?::)?\s*(\d+)/i);
            if (tnMatch) record["Ticket Number"] = tnMatch[1].trim();

            // Extract Offense Description (The terms of the offense)
            // Look for sentences that don't match other labels
            const offenseMatch = segment.match(/(?:Offense|Violation|Terms)\s*(?::)?\s*(.*)/i);
            if (offenseMatch) {
                record["The terms of the offense"] = offenseMatch[1].split('\n')[0].trim();
            }

            // Always add the record if we found the anchor
            records.push(record);
        }

        if (records.length === 0) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: "No records detected. Please check file format." });
        }

        if (req.query.preview === "true") {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.json({ records });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(records);
        XLSX.utils.book_append_sheet(wb, ws, "Fines");

        const excelPath = path.join(uploadDir, `fines_${Date.now()}.xls`);
        XLSX.writeFile(wb, excelPath);

        res.download(excelPath, "TrafficFines_Extracted.xls", () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(excelPath)) fs.unlinkSync(excelPath);
        });
    } catch (err) {
        console.error("Processing error:", err);
        res.status(500).json({ error: "Server error during processing" });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
