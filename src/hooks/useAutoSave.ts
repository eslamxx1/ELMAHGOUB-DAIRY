
import { useEffect } from 'react';
import { fileSystemService } from '@/services/FileSystemService';

interface AutoSaveOptions {
  interval?: number;
  onBeforeUnload?: boolean;
}

/**
 * Hook for automatically saving data periodically and before page unload
 */
export const useAutoSave = <T>(
  key: string, 
  data: T, 
  options: AutoSaveOptions = { interval: 60000, onBeforeUnload: true }
) => {
  useEffect(() => {
    // Save data on component mount
    saveData();
    
    // Set up interval for periodic saving
    const intervalId = options.interval ? 
      setInterval(saveData, options.interval) : 
      undefined;
    
    // Set up beforeunload event handler
    if (options.onBeforeUnload) {
      window.addEventListener('beforeunload', saveData);
    }
    
    // Clean up on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (options.onBeforeUnload) {
        window.removeEventListener('beforeunload', saveData);
      }
      saveData(); // Save one last time on unmount
    };
  }, [data, key]);
  
  const saveData = async () => {
    try {
      await fileSystemService.writeFile(key, data);
      console.log(`Auto-saved data for key: ${key}`);
    } catch (error) {
      console.error(`Error auto-saving data for key: ${key}`, error);
    }
  };
};
