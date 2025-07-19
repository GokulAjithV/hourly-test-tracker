import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const app = express();

const PORT = 3000;

app.get("/fetch-file", (req, res) => {

    const filePath = req.query.path as string;

    if (!filePath) {
        return res.status(400).json({ error: "Path query parameter is empty!"});
    }

    const resolvedPath = path.resolve(filePath);

    console.log("Trying to read : ", resolvedPath);

    const rows: Record<string, string>[] = []

    fs.createReadStream(resolvedPath)
    .pipe(csv())
    .on("data", (data) => {rows.push(data)})
    .on("end", () => {
        res.status(200).json({
            message: "CSV parsed successfully",
            rowCount: rows.length,
            data: rows
        });
    })
    .on("error", (err) => {
        console.error("Error parsing CSV : ", err);
        res.status(500).json({ error: "Error parsing CSV file."});
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
