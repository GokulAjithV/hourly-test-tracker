// electron-app/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// Start backend server directly in main process
function startBackend() {
  try {
    const serverPath = path.join(__dirname, 'backend', 'dist', 'index.js');
    console.log('Loading backend from:', serverPath);
    
    // Set the port before requiring the server
    process.env.PORT = '3000';
    
    // Require the backend directly - it will start the server
    require(serverPath);
    
    console.log('Backend server started on port 3000');
  } catch (error) {
    console.error('Failed to start backend:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  // Wait a moment for server to start
  setTimeout(() => {
    createWindow();
  }, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
