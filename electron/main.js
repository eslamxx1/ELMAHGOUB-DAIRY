const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// Create data directory if it doesn't exist
const userDataPath = app.getPath('userData');
const dataDir = path.join(userDataPath, 'data');
const backupsDir = path.join(userDataPath, 'backups');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // Load from the dist directory in production mode
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production file from:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
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

// Periodically create backups (every hour)
const BACKUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
let backupTimer = null;

function startBackupScheduler() {
  if (backupTimer) {
    clearInterval(backupTimer);
  }
  
  backupTimer = setInterval(createAutoBackup, BACKUP_INTERVAL);
  console.log('Backup scheduler started');
}

async function createAutoBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(backupsDir, `auto-backup-${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const files = await fs.promises.readdir(dataDir);
    
    for (const file of files) {
      const srcPath = path.join(dataDir, file);
      const destPath = path.join(backupDir, file);
      
      const data = await fs.promises.readFile(srcPath, 'utf8');
      await fs.promises.writeFile(destPath, data, 'utf8');
    }
    
    console.log(`Auto backup created at ${backupDir}`);
    
    // Keep only the last 10 backups
    const allBackups = await fs.promises.readdir(backupsDir);
    const autoBackups = allBackups
      .filter(dir => dir.startsWith('auto-backup-'))
      .sort((a, b) => b.localeCompare(a)); // Sort in descending order (newest first)
    
    if (autoBackups.length > 10) {
      for (let i = 10; i < autoBackups.length; i++) {
        const oldBackupDir = path.join(backupsDir, autoBackups[i]);
        await fs.promises.rm(oldBackupDir, { recursive: true, force: true });
        console.log(`Removed old backup: ${oldBackupDir}`);
      }
    }
  } catch (error) {
    console.error('Auto backup failed:', error);
  }
}

// Start backup scheduler when app is ready
app.on('ready', startBackupScheduler);

// IPC handlers for file system operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    console.log(`Reading file: ${filePath} from ${dataDir}`);
    const fullPath = path.join(dataDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`File exists: ${fullPath}`);
      const data = await fs.promises.readFile(fullPath, 'utf8');
      console.log(`File data length: ${data.length}`);
      return { success: true, data };
    } else {
      console.log(`File not found: ${fullPath}`);
      return { success: false, error: 'File not found' };
    }
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    console.log(`Writing file: ${filePath} to ${dataDir}`);
    const fullPath = path.join(dataDir, filePath);
    const dirPath = path.dirname(fullPath);
    
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
    
    await fs.promises.writeFile(fullPath, data, 'utf8');
    console.log(`File written successfully: ${fullPath}`);
    return { success: true };
  } catch (error) {
    console.error(`Error writing file: ${filePath}`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-files', async (event, dirPath) => {
  try {
    const fullPath = path.join(dataDir, dirPath || '');
    
    if (!fs.existsSync(fullPath)) {
      await fs.promises.mkdir(fullPath, { recursive: true });
      return { success: true, files: [] };
    }
    
    const files = await fs.promises.readdir(fullPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Add new handlers for backup operations
ipcMain.handle('create-backup', async (event, backupName) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(backupsDir, `${backupName || 'manual'}-${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const files = await fs.promises.readdir(dataDir);
    
    for (const file of files) {
      const srcPath = path.join(dataDir, file);
      const destPath = path.join(backupDir, file);
      
      const data = await fs.promises.readFile(srcPath, 'utf8');
      await fs.promises.writeFile(destPath, data, 'utf8');
    }
    
    return { success: true, backupPath: backupDir };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-backups', async () => {
  try {
    if (!fs.existsSync(backupsDir)) {
      return { success: true, backups: [] };
    }
    
    const files = await fs.promises.readdir(backupsDir);
    const backups = [];
    
    for (const file of files) {
      const backupDir = path.join(backupsDir, file);
      const stats = await fs.promises.stat(backupDir);
      
      if (stats.isDirectory()) {
        backups.push({
          name: file,
          date: stats.mtime,
          path: backupDir
        });
      }
    }
    
    return { success: true, backups: backups.sort((a, b) => b.date - a.date) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, backupPath) => {
  try {
    // Create a backup of current data before restoring
    await ipcMain.handle('create-backup', event, 'pre-restore');
    
    const files = await fs.promises.readdir(backupPath);
    
    for (const file of files) {
      const srcPath = path.join(backupPath, file);
      const destPath = path.join(dataDir, file);
      
      const data = await fs.promises.readFile(srcPath, 'utf8');
      await fs.promises.writeFile(destPath, data, 'utf8');
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-import-file', async () => {
  try {
    console.log("Opening file dialog for import");
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    console.log("File dialog result:", result);
    
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: "User canceled file selection" };
    }
    
    const filePath = result.filePaths[0];
    console.log("Reading selected file:", filePath);
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      console.log("File read successfully, data length:", data.length);
      return { success: true, data };
    } catch (readError) {
      console.error("Error reading file:", readError);
      return { success: false, error: readError.message };
    }
  } catch (error) {
    console.error("Error in select-import-file:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-export-path', async (event, defaultFilename) => {
  try {
    console.log("Opening file dialog for export:", defaultFilename);
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultFilename,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    console.log("Save dialog result:", result);
    
    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }
    
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error("Error in select-export-path:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-data', async (event, filePath, data) => {
  try {
    console.log(`Exporting data to: ${filePath}`);
    await fs.promises.writeFile(filePath, data, 'utf8');
    console.log("Data exported successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in export-data:", error);
    return { success: false, error: error.message };
  }
});
