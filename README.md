# Hourly Test Tracker

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-96.9%25-blue" alt="TypeScript">
  <img src="https://shields.io/badge/React-18.x-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Material--UI-5.x-0081CB" alt="MUI">
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=fff&style=flat">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

> **A desktop application for analyzing production test data with real-time analytics, offline storage, and multi-machine CSV file aggregation.**

***

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
  - [Engineering Login](#engineering-login)
  - [Production Dashboard](#production-dashboard)
- [Data Model](#data-model)
- [Architecture](#architecture)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

***

## 🎯 Overview

**Hourly Test Tracker** is a production analytics tool designed for manufacturing environments where test machines generate CSV output files. The application aggregates data from multiple test stations, calculates key performance metrics (yield, pass/fail rates, retest counts), and provides interactive visualizations for production monitoring.

### Key Capabilities

- **Multi-machine data aggregation** from network paths (UNC format)
- **Offline-first architecture** using IndexedDB for data persistence
- **Real-time analytics** with dynamic filtering by date, time, shift, and tester ID
- **Role-based access** with Engineering (admin) and Production (viewer) roles
- **Export functionality** for filtered analytics data

***

## ✨ Features

### Engineering View (Admin)
- 🔐 Password-protected authentication
- 📁 Configure up to 4 machine CSV file paths (UNC format)
- 📅 Set date and time filters for data fetching
- 💾 Persistent path and filter storage across sessions
- 🔄 Manual data refresh with timestamp tracking

### Production Dashboard
- 📊 **Stats Grid**: Key metrics (Input, Pass, Yield %, Fail, Retest) by station
- 🔍 **Advanced Filters**: Date range, time range, shift (A/B/C), Tester ID
- 📉 **Top 5 Failures Analysis**: Most common error codes and content
- 🥧 **Pie Chart Visualization**: Pass/Fail distribution
- 📤 **CSV Export**: Export filtered analytics with applied filter metadata
- 🌐 **Offline Operation**: View cached data without network connectivity

### Data Management
- 🗄️ **IndexedDB Storage**: Automatic caching for offline access
- 🔄 **Session Persistence**: Data survives page refresh and re-login
- 📈 **Large Dataset Support**: Handles thousands of test records efficiently

***

## 📸 Screenshots

<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/4d45f3c4-a89a-4b94-b703-323ea98d9459" />

<img width="1919" height="851" alt="image" src="https://github.com/user-attachments/assets/6d047e1a-491c-4ca9-9c54-4caf56a4c161" />

<img width="1919" height="863" alt="image" src="https://github.com/user-attachments/assets/3a4ee8fe-aabe-45a1-9927-c74a2e940d32" />

<img width="1895" height="864" alt="image" src="https://github.com/user-attachments/assets/8099eed6-afb6-46d6-814f-fefefefc482c" />

<img width="1895" height="856" alt="image" src="https://github.com/user-attachments/assets/49318c4c-221f-470e-869d-57b7bbf5efc2" />

<img width="1899" height="843" alt="image" src="https://github.com/user-attachments/assets/1c626018-e99d-401f-a640-103ca9cd8b4d" />

<img width="1892" height="863" alt="image" src="https://github.com/user-attachments/assets/06d9b7fa-d660-4756-be40-d19b1c7bd914" />


***

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Material-UI (MUI) |
| **Backend** | Express.js |
| **Data Grid** | MUI DataGrid |
| **Storage** | IndexedDB (via custom dbManager) |
| **State Management** | React Context API |
| **Date/Time** | date-fns |
| **Build Tool** | Vite |
| **Desktop Packaging** | Electron (optional, for standalone app) |

***

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Installation

Here’s a concise doc you can drop into your README.

***

## How to Run the Application

### 1. Run backend (file-fetching-server)

From repo root:

```bash
cd file-fetching-server
npm install
npm run dev   # or npm start (whatever your package.json uses)
```

Make sure it logs something like:

```text
Server running on http://127.0.0.1:3000
```

### 2. Run frontend (hourly-test-client) in browser

In a second terminal:

```bash
cd hourly-test-client
npm install
npm run dev   # or npm start
```

Open the printed URL (usually `http://localhost:5173` for Vite).  
The UI will talk to the backend at `http://127.0.0.1:3000/api/...` (as configured in your client code).

***

## How to Package as a Desktop App (Electron)

### 0. Pre-req

- Node.js and npm installed
- Your backend and frontend both working in dev

Big picture:

1. Build the frontend (static files).
2. Use Electron to load those files.
3. Start the backend from Electron (or run it separately).
4. Use `electron-builder` to produce an installer (`.exe`).

***

### 1. Build the frontend

From repo root:

```bash
cd hourly-test-client
# ensure vite.config has: base: './'
npm run build
```

This creates `hourly-test-client/dist/` with `index.html` and `assets/`.

***

### 2. Set up Electron wrapper

From repo root:

```bash
mkdir electron-app
cd electron-app
npm init -y
npm install electron electron-builder
```

Create `electron-app/main.js`:

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load built frontend
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

Copy the built frontend into Electron:

```bash
rm -rf frontend
mkdir frontend
cp -r ../hourly-test-client/dist/* frontend/
```

At this stage:

```bash
npm start   # after adding "start": "electron ." in electron-app/package.json
```

should open the UI (with backend still running separately on port 3000).

***

### 3. (Optional) Start backend from Electron

If you want one-click start (no separate backend terminal), modify `main.js`:

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend() {
  const serverPath = path.join(__dirname, 'backend', 'dist', 'index.js'); // compiled JS
  backendProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: '3000' },
    shell: true,
  });

  backendProcess.stdout.on('data', d => console.log(`Backend: ${d}`));
  backendProcess.stderr.on('data', d => console.error(`Backend Error: ${d}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  startBackend();          // start API server
  setTimeout(createWindow, 2000);  // small delay so backend is ready
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
```

To make this work, you need a built backend in `electron-app/backend/dist`:

```bash
# From repo root
cd file-fetching-server
npm run build   # produces dist/

cd ../electron-app
rm -rf backend
mkdir -p backend/dist
cp -r ../file-fetching-server/dist/* backend/dist/
```

***

### 4. Configure electron-app/package.json

In `electron-app/package.json`:

```json
{
  "name": "hourly-test-tracker",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build-win": "electron-builder --win --x64"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  },
  "build": {
    "appId": "com.company.hourlytesttracker",
    "productName": "Hourly Test Tracker",
    "files": [
      "main.js",
      "frontend/**/*",
      "backend/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "icon.ico"
    }
  }
}
```

***

### 5. Build the installer

From `electron-app`:

```bash
npm install   # first time
npm run build-win
```

Output will be in `electron-app/dist/`, e.g.:

```text
dist/Hourly Test Tracker Setup 1.0.0.exe
```

You can give this `.exe` to users; they install and run it like any normal Windows app (no Node.js required).

***

**Summary**

- Dev mode: run backend + frontend separately.
- Desktop app: build frontend, (optionally) build backend, wire them via Electron, then run `electron-builder` to produce a single installer.
***

## 📖 Usage Guide

### Engineering Login

**Purpose**: Configure data sources and fetch test records.

#### Step 1: Authentication
- Navigate to Engineering Login
- Enter password: `*******` (default)
- Click **Login**

#### Step 2: Configure Paths
Enter CSV file paths in UNC format for up to 4 machines:
```
\\192.168.1.101\test-data\machine1\output.csv
\\192.168.1.102\test-data\machine2\output.csv
\\192.168.1.103\test-data\machine3\output.csv
\\192.168.1.104\test-data\machine4\output.csv
```

#### Step 3: Set Filters
- **Date**: Select specific date for data extraction
- **Time**: Set minimum time threshold (records >= this time)

#### Step 4: Fetch Data
- Click **Fetch Data**
- Application reads CSV files from all configured paths
- Merges data and stores in IndexedDB
- Auto-redirects to Production Dashboard

**Note**: Paths and filters are saved automatically and persist across sessions.

***

### Production Dashboard

**Purpose**: Analyze test data with interactive filters and visualizations.

#### Analytics Sections

**1. Stats Grid**

Displays aggregated metrics per station:

| Metric | Formula | Description |
|--------|---------|-------------|
| **Input** | `COUNT(UNIQUE DUT_SN)` | Unique units tested |
| **Pass** | `COUNT(UNIQUE DUT_SN WHERE Tester_Result = 'Pass')` | Units that passed (at least once) |
| **Yield %** | `(Pass / Input) × 100` | Pass rate percentage |
| **Fail** | `Input - Pass` | Units that never passed |
| **Retest** | `Total Records - Input` | Additional test attempts |

**Export Feature**: Click "Export" to download filtered stats as CSV with filter metadata.

**2. Filter Section**

Apply filters to narrow down data:
- **Date**: Specific date
- **Start Time / End Time**: Time range
- **Shift**: A / B / C
- **Tester ID**: Specific tester machine

**3. Top 5 Failures Analysis**

Shows most common failure reasons:
- Error codes frequency
- Error content descriptions
- Failure count per error type

**4. Pass/Fail Pie Chart**

Visual representation of overall pass/fail distribution.

***

## 📊 Data Model

### CSV File Structure

Expected CSV columns:

```csv
Date,Tester_Location,Tester_Result,NG_Qty,TesterID,Carrier_SN,DUT_SN,Error_Code,Error_Content,TesterIP,Project_Name,Script_Name,Serial_Number_Name,Tester_Duration,Tester_Start_Time,Tester_End_Time,Record_Time
```

**Key Fields**:
- `DUT_SN`: Device Under Test Serial Number (unique identifier)
- `Tester_Result`: `Pass` or `Fail`
- `Tester_Start_Time`: Test execution timestamp
- `Error_Code` / `Error_Content`: Failure diagnostics

### IndexedDB Schema

**Database**: `HourlyTrackerDB`

**Object Stores**:
- `csv_data`: Raw test records array
- `hourly_tracker_engineering_inputs`: Path configurations
- `hourly_tracker_last_fetch`: Last data fetch timestamp
- `hourly_tracker_auth_state`: Authentication status
- `hourly_tracker_current_view`: Current view state

***

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ Engineering  │  │  Production  │  │  Context   ││
│  │   Login      │  │  Dashboard   │  │   API      ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
                         ↓↑
┌─────────────────────────────────────────────────────┐
│              IndexedDB (Local Storage)               │
│  - CSV Data Cache                                    │
│  - Configuration                                     │
│  - Session State                                     │
└─────────────────────────────────────────────────────┘
                         ↓↑
┌─────────────────────────────────────────────────────┐
│          Network File System (UNC Paths)             │
│  Machine 1: \\192.168.1.101\data\output.csv        │
│  Machine 2: \\192.168.1.102\data\output.csv        │
│  Machine 3: \\192.168.1.103\data\output.csv        │
│  Machine 4: \\192.168.1.104\data\output.csv        │
└─────────────────────────────────────────────────────┘
```

### Key Components

- **AppContext.tsx**: Global state management (data, filters, auth)
- **indexedDB.ts**: Database operations (save, retrieve, delete)
- **useFilteredData.ts**: Custom hook for data filtering
- **StatsGrid.tsx**: Analytics metrics calculation and display
- **FilterSection.tsx**: Filter UI and state management

***

## 🔨 Building for Production

### Web Application

```bash
# Create optimized build
npm run build

# Deploy to web server
# Copy contents of build/ folder to server
```

### Desktop Application (Electron)

```bash
# Windows
npm run electron-build-win
# Output: dist/Hourly-Test-Tracker-Setup-1.0.0.exe

# macOS
npm run electron-build-mac
# Output: dist/Hourly-Test-Tracker-1.0.0.dmg

# Linux
npm run electron-build-linux
# Output: dist/Hourly-Test-Tracker-1.0.0.AppImage
```

**Installer includes**:
- ✅ Self-contained Node.js runtime
- ✅ Chromium browser engine
- ✅ All dependencies bundled
- ✅ Desktop shortcut and Start Menu entry

**End users do NOT need Node.js installed!**

***

## 📦 Deployment

### Option 1: Network Share
```
\\company-server\applications\Hourly-Test-Tracker-Setup.exe
```
Users install from shared network folder.

### Option 2: Portable Version
Build as portable (no installation required):
```json
// package.json
"build": {
  "win": {
    "target": ["portable"]
  }
}
```

### Option 3: Auto-Update (Electron)
Configure automatic updates via GitHub releases or internal server:
```javascript
// public/electron.js
const { autoUpdater } = require('electron-updater');
autoUpdater.checkForUpdatesAndNotify();
```

***

## 🔧 Troubleshooting

### Issue: Cannot fetch CSV files from network paths

**Solution**: 
- Ensure network paths are accessible (test with Windows Explorer: `\\192.168.1.101\...`)
- Check file share permissions
- Verify CSV file format matches expected structure

### Issue: Data not persisting after refresh

**Solution**:
- Check browser/app IndexedDB storage (DevTools → Application → IndexedDB)
- Clear IndexedDB and re-fetch data
- Ensure `dbManager.initDB()` completes successfully

### Issue: Electron app won't start

**Solution**:
- Check logs in: `%APPDATA%\hourly-test-tracker\logs`
- Rebuild: `npm run electron-build-win`
- Run in dev mode: `npm run electron-dev` to see console errors

### Issue: Incorrect metrics calculation

**Solution**:
- Verify CSV contains `DUT_SN` and `Tester_Result` columns
- Check for duplicate or missing `DUT_SN` values
- Review formulas in `StatsGrid.tsx`

***

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Code Standards**:
- TypeScript strict mode
- ESLint compliant
- Component documentation
- Unit tests for critical functions

***

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

***

## 👥 Authors

**Gokul Ajith V**  
GitHub: [@GokulAjithV](https://github.com/GokulAjithV)

***

## 🙏 Acknowledgments

- Material-UI for component library
- React community for excellent documentation
- Electron team for desktop app framework
- date-fns for date manipulation utilities

***

## 📞 Support

For issues, questions, or feature requests:
- Open an issue: [GitHub Issues](https://github.com/GokulAjithV/hourly-test-tracker/issues)
- Email: [your-email@example.com]

***

## 📈 Roadmap

- [ ] Multi-language support (Tamil, Hindi)
- [ ] Real-time data sync (WebSocket)
- [ ] Advanced charts (trend analysis, time-series)
- [ ] PDF report generation
- [ ] User role management
- [ ] Dark mode theme
- [ ] Mobile responsive design
- [ ] REST API for external integrations

***

**Last Updated**: February 5, 2026  
**Version**: 1.0.0

***

<p align="center">Made with ❤️ for production teams</p>
