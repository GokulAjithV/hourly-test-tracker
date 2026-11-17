import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import cors from 'cors';
import { Readable } from 'stream';

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const PORT = 3000;

function parseCSVFromString(csvText: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];

    Readable.from([csvText])
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function isArray(param: any) {
    return Array.isArray(param)
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

type CSVParseOk = { ok: true; path: string; rows: Record<string, string>[] };
type CSVParseErr = { ok: false; path: string; error: string; code?: string };

async function fileReadable(filePath: string) {
  // Checks existence + read permission
  await fs.promises.access(filePath, fs.constants.R_OK);
}

function parseCSV(filePathOrUrl: string): Promise<Record<string, string>[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Case 1: HTTP URL
      if (isHttpUrl(filePathOrUrl)) {
        const response = await fetch(filePathOrUrl);

        if (!response.ok) {
          return reject(
            new Error(`Failed to download CSV. HTTP ${response.status} ${response.statusText}`)
          );
        }

        const csvText = await response.text();
        const rows = await parseCSVFromString(csvText);
        return resolve(rows);
      }

      // Case 2: Local / UNC path
      const resolvedFilePath = path.resolve(filePathOrUrl);

      // Validate early
      await fileReadable(resolvedFilePath);

      const results: Record<string, string>[] = [];

      fs.createReadStream(resolvedFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

app.post("/fetch-csvs", async (req, res) => {
    const paths: string[] = req.body.paths;

    console.log("Request body params :", req.body);

    if (!isArray(paths) || paths.length === 0) {
        return res.status(400).json({ error: "Please provide atleast one path"});
    }

    const validPaths = paths.filter(path => !!path);

    try {
        const allCsvPromises = validPaths.map(parseCSV);
        const allDataArrays = await Promise.all(allCsvPromises);
        const mergedData = allDataArrays.flat();
        const successMessage = "CSV files merged successfully"

        res.status(200).json({
            message: successMessage,
            rowCount: mergedData.length,
            data: mergedData
        })
        console.log(successMessage)
        console.log("Total records fetched : ", mergedData.length)
    }
    catch (err) {
        console.error("Error processing files: ", err);
        res.status(500).json({ error: "Failed to fetch or parse CSV files"})
    }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const server = app.listen(PORT, '127.0.0.1',() => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});

module.exports = server