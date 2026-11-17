"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const cors_1 = __importDefault(require("cors"));
const stream_1 = require("stream");
console.log('=== BACKEND MODULE LOADING ===');
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
const app = (0, express_1.default)();
// Add request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
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
function parseCSVFromString(csvText) {
    return new Promise((resolve, reject) => {
        const results = [];
        stream_1.Readable.from([csvText])
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}
function isArray(param) {
    return Array.isArray(param);
}
function isHttpUrl(value) {
    return /^https?:\/\//i.test(value);
}
function fileReadable(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Checks existence + read permission
        yield fs_1.default.promises.access(filePath, fs_1.default.constants.R_OK);
    });
}
function parseCSV(filePathOrUrl) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Processing path: ${filePathOrUrl}`);
            // Case 1: HTTP URL
            if (isHttpUrl(filePathOrUrl)) {
                console.log(`Fetching HTTP URL: ${filePathOrUrl}`);
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                try {
                    const response = yield fetch(filePathOrUrl, {
                        signal: controller.signal
                    });
                    clearTimeout(timeout);
                    console.log(`Fetch response status: ${response.status}`);
                    if (!response.ok) {
                        return reject(new Error(`Failed to download CSV. HTTP ${response.status} ${response.statusText}`));
                    }
                    const csvText = yield response.text();
                    console.log(`Fetched ${csvText.length} bytes`);
                    const rows = yield parseCSVFromString(csvText);
                    console.log(`Parsed ${rows.length} rows`);
                    return resolve(rows);
                }
                catch (fetchErr) {
                    clearTimeout(timeout);
                    console.error(`Fetch error for ${filePathOrUrl}:`, fetchErr);
                    return reject(fetchErr);
                }
            }
            // Case 2: Local / UNC path
            console.log(`Reading local file: ${filePathOrUrl}`);
            const resolvedFilePath = path_1.default.resolve(filePathOrUrl);
            // Validate early
            yield fileReadable(resolvedFilePath);
            const results = [];
            fs_1.default.createReadStream(resolvedFilePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                console.log(`Read ${results.length} rows from local file`);
                resolve(results);
            })
                .on('error', (err) => {
                console.error(`File read error:`, err);
                reject(err);
            });
        }
        catch (err) {
            console.error(`ParseCSV error:`, err);
            reject(err);
        }
    }));
}
app.post("/fetch-csvs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("=== /fetch-csvs endpoint called ===");
    const paths = req.body.paths;
    console.log("Request body params :", req.body);
    console.log("Paths received:", paths);
    if (!isArray(paths) || paths.length === 0) {
        console.log("Invalid paths array");
        return res.status(400).json({ error: "Please provide atleast one path" });
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
        const allDataArrays = yield Promise.all(allCsvPromises);
        console.log("All promises resolved");
        const mergedData = allDataArrays.flat();
        const successMessage = "CSV files merged successfully";
        res.status(200).json({
            message: successMessage,
            rowCount: mergedData.length,
            data: mergedData
        });
        console.log(successMessage);
        console.log("Total records fetched : ", mergedData.length);
    }
    catch (err) {
        console.error("Error processing files: ", err);
        res.status(500).json({ error: "Failed to fetch or parse CSV files" });
    }
}));
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});
module.exports = server;
