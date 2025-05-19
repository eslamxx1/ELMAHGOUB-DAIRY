
interface ElectronAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; data: string; error?: string }>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  listFiles: (dirPath: string) => Promise<{ success: boolean; files: string[]; error?: string }>;
  
  // Add backup APIs
  createBackup: (backupName?: string) => Promise<{ success: boolean; backupPath?: string; error?: string }>;
  listBackups: () => Promise<{ success: boolean; backups?: Array<{name: string; date: Date; path: string}>; error?: string }>;
  restoreBackup: (backupPath: string) => Promise<{ success: boolean; error?: string }>;
  
  // Add file dialog APIs
  selectImportFile: () => Promise<{ success: boolean; data?: string; error?: string }>;
  selectExportPath: (defaultFilename: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  exportData: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
