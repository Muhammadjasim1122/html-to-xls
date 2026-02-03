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

app.post("/upload", upload.array("files"), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        let allRecords = [];
        const filePaths = req.files.map(f => f.path);

        for (const file of req.files) {
            const filePath = file.path;
            const content = fs.readFileSync(filePath, "utf8");

            let textData = "";

            if (content.includes("<html") || content.includes("<body")) {
                const $ = cheerio.load(content);
                $('br, div, p, tr, li, h1, h2, h3, h4, h5, h6, th, td').each((i, el) => {
                    $(el).prepend('\n').append('\n');
                });
                textData = $("body").text();
            } else {
                textData = content;
            }

            textData = textData.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');

            const anchorRegex = /Date and Time of Issuing\s*(?:The)?\s*Fine/i;
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

                const amtMatch = segment.match(/Amount\s*(?::|AED)?\s*([\d,.]+)/i);
                if (amtMatch) record["Ticket Fee"] = amtMatch[1].trim();

                const srcMatch = segment.match(/Source\s*(?::)?\s*(.*)/i);
                if (srcMatch) record["Fines source"] = srcMatch[1].split('\n')[0].trim();

                const tnMatch = segment.match(/(?:Ticket|Fine)\s*Number\s*(?::)?\s*(\d+)/i);
                if (tnMatch) record["Ticket Number"] = tnMatch[1].trim();

                const offenseMatch = segment.match(/(?:Offense|Violation|Terms)\s*(?::)?\s*(.*)/i);
                if (offenseMatch) {
                    record["The terms of the offense"] = offenseMatch[1].split('\n')[0].trim();
                }

                allRecords.push(record);
            }
        }

        if (allRecords.length === 0) {
            filePaths.forEach(fp => { if (fs.existsSync(fp)) fs.unlinkSync(fp); });
            return res.status(400).json({ error: "No records detected in uploaded files." });
        }

        if (req.query.preview === "true") {
            filePaths.forEach(fp => { if (fs.existsSync(fp)) fs.unlinkSync(fp); });
            return res.json({ records: allRecords });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(allRecords);
        XLSX.utils.book_append_sheet(wb, ws, "Fines");

        const excelPath = path.join(uploadDir, `fines_bulk_${Date.now()}.xls`);
        XLSX.writeFile(wb, excelPath);

        res.download(excelPath, "TrafficFines_Bulk_Extracted.xls", () => {
            filePaths.forEach(fp => { if (fs.existsSync(fp)) fs.unlinkSync(fp); });
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
