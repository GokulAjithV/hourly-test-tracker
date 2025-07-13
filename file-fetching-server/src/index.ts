import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

const PORT = 3000;

app.get("/fetch-file", (req, res) => {

    const filePath = req.query.path as string;

    if (!filePath) {
        return res.status(400).json({ error: "Path query parameter is empty!"});
    }

    const resolvedPath = path.resolve(filePath);

    console.log("Trying to read : ", resolvedPath);

    fs.readFile(resolvedPath, "utf-8", (err, data) => {
        if (err) {
            console.error("Error reading file : ", err);
            return res.status(500).json({ error: "Could not read file." });
        }

        res.json({
            message: "File fetched successfully.",
            body: data
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
