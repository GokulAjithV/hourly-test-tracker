import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import cors from 'cors';
import { Readable } from 'stream';

console.log('=== BACKEND MODULE LOADING ===');
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Test endpoint
app.get('/health', (req, res) => {
    console.log('Health check received');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
      console.log(`Processing path: ${filePathOrUrl}`);
      
      // Case 1: HTTP URL
      if (isHttpUrl(filePathOrUrl)) {
        console.log(`Fetching HTTP URL: ${filePathOrUrl}`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(filePathOrUrl, { 
            signal: controller.signal 
          });
          clearTimeout(timeout);
          
          console.log(`Fetch response status: ${response.status}`);

          if (!response.ok) {
            return reject(
              new Error(`Failed to download CSV. HTTP ${response.status} ${response.statusText}`)
            );
          }

          const csvText = await response.text();
          console.log(`Fetched ${csvText.length} bytes`);
          
          const rows = await parseCSVFromString(csvText);
          console.log(`Parsed ${rows.length} rows`);
          return resolve(rows);
        } catch (fetchErr) {
          clearTimeout(timeout);
          console.error(`Fetch error for ${filePathOrUrl}:`, fetchErr);
          return reject(fetchErr);
        }
      }

      // Case 2: Local / UNC path
      console.log(`Reading local file: ${filePathOrUrl}`);
      const resolvedFilePath = path.resolve(filePathOrUrl);

      // Validate early
      await fileReadable(resolvedFilePath);

      const results: Record<string, string>[] = [];

      fs.createReadStream(resolvedFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`Read ${results.length} rows from local file`);
          resolve(results);
        })
        .on('error', (err) => {
          console.error(`File read error:`, err);
          reject(err);
        });
    } catch (err) {
      console.error(`ParseCSV error:`, err);
      reject(err);
    }
  });
}

app.post("/fetch-csvs", async (req, res) => {
    console.log("=== /fetch-csvs endpoint called ===");
    const paths: string[] = req.body.paths;

    console.log("Request body params :", req.body);
    console.log("Paths received:", paths);

    if (!isArray(paths) || paths.length === 0) {
        console.log("Invalid paths array");
        return res.status(400).json({ error: "Please provide atleast one path"});
    }

    const validPaths = paths.filter(path => !!path);
    console.log("Valid paths:", validPaths);

    try {
        console.log("Starting to process paths...");
        const allCsvPromises = validPaths.map((path, index) => {
            console.log(`Creating promise ${index} for path: ${path}`);
            return parseCSV(path);
        });
        
        console.log("Waiting for all promises to resolve...");
        const allDataArrays = await Promise.all(allCsvPromises);
        console.log("All promises resolved");
        
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