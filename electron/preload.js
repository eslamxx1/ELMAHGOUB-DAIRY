
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  listFiles: (dirPath) => ipcRenderer.invoke('list-files', dirPath),
  
  // Backup APIs
  createBackup: (backupName) => ipcRenderer.invoke('create-backup', backupName),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  restoreBackup: (backupPath) => ipcRenderer.invoke('restore-backup', backupPath),
  
  // File dialog APIs
  selectImportFile: () => ipcRenderer.invoke('select-import-file'),
  selectExportPath: (defaultFilename) => ipcRenderer.invoke('select-export-path', defaultFilename),
  exportData: (filePath, data) => ipcRenderer.invoke('export-data', filePath, data)
});
