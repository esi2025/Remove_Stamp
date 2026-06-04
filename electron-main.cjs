// Electron Main process file for running this utility as a standalone Windows App
const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let serverInstance;

function startExpressServer() {
  const server = express();
  const PORT = 35432; // Custom port to avoid any collisions
  const distPath = path.join(__dirname, 'dist');
  
  server.use(express.static(distPath));
  server.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  serverInstance = server.listen(PORT, '127.0.0.1', () => {
    console.log(`Internal local Express server started on http://127.0.0.1:${PORT}`);
  });
  return PORT;
}

function createWindow() {
  const port = startExpressServer();
  
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "سامانه استخراج و تفکیک هوشمند مهر و امضا",
    icon: path.join(__dirname, 'public/icon.svg'), // Electron works with SVG/PNG icons
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.setMenu(null); // Gives a beautiful, sleek, frameless/clean native application look

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverInstance) {
      serverInstance.close();
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
