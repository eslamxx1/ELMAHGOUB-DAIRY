
import { fileSystemService } from '@/services/FileSystemService';
import { indexedDBService } from '@/services/IndexedDBService';
import { Product, Route, Customer, Employee, SaleRecord } from '@/types';

// Default data
export const defaultProducts: Product[] = [
  { id: "1", name: "زبادي كبير", price: 5.5 },
  { id: "2", name: "زبادي صغير", price: 4.75 },
  { id: "3", name: "زبادي جامبو", price: 6.25 },
  { id: "4", name: "ارز باللبن", price: 8.5 },
  { id: "5", name: "رايب", price: 9.5 },
  { id: "6", name: "جيلي كاستر", price: 8.5 },
  { id: "7", name: "كريمة", price: 120.0 },
  { id: "8", name: "قريش", price: 70.0 },
  { id: "9", name: "ارز فرن", price: 8.5 },
];

export const defaultRoutes: Route[] = [
  { id: "1", name: "عصافرة سيدي بشر" },
  { id: "2", name: "محرم بك" },
  { id: "3", name: "خورشيد المراغي الفلكي" },
  { id: "4", name: "القصعي الساعه" },
  { id: "5", name: "كفر الدوار" },
];

// Generator for random IDs
export const generateId = () => Math.random().toString(36).substring(2, 10);

// Generate customer code
export const generateCustomerCode = (customers: Customer[]) => {
  const existingCodes = customers.map(c => c.code);
  let i = 1;
  let code;
  
  do {
    code = `C${i.toString().padStart(3, '0')}`;
    i++;
  } while (existingCodes.includes(code));
  
  return code;
};

// Generate employee code
export const generateEmployeeCode = (employees: Employee[]) => {
  const existingCodes = employees.map(e => e.code);
  let i = 1;
  let code;
  
  do {
    code = `E${i.toString().padStart(3, '0')}`;
    i++;
  } while (existingCodes.includes(code));
  
  return code;
};

// Helper to save data to FileSystem or IndexedDB
export const saveData = async (storeName: string, data: any) => {
  try {
    // حفظ البيانات في IndexedDB
    await indexedDBService.saveItems(storeName, data);
    
    // حفظ نسخة احتياطية في نظام الملفات (إذا كان الإلكترون متاحًا)
    if (window.electronAPI) {
      console.log(`Saving ${storeName} to file system, data:`, data);
      await fileSystemService.writeFile(storeName, data);
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving data: ${storeName}`, error);
    return false;
  }
};

// تحسين استرداد البيانات من IndexedDB أو نظام الملفات
export const getData = async <T,>(storeName: string, defaultValue: T[]): Promise<T[]> => {
  try {
    console.log(`Getting data for ${storeName}`);
    
    // تحقق من وجود Electron API أولاً
    if (window.electronAPI) {
      console.log(`Electron API available, trying to read ${storeName} from file system`);
      try {
        const fileData = await fileSystemService.readFile<T[]>(storeName);
        console.log(`Data from file system for ${storeName}:`, fileData);
        
        if (Array.isArray(fileData) && fileData.length > 0) {
          // إذا نجحت القراءة من نظام الملفات، أيضًا قم بتحديث IndexedDB
          await indexedDBService.saveItems(storeName, fileData);
          return fileData;
        }
      } catch (fsError) {
        console.log(`Error reading from file system:`, fsError);
        // استمر في المحاولة باستخدام IndexedDB
      }
    }
    
    // محاولة استرداد البيانات من IndexedDB
    console.log(`Trying to get ${storeName} from IndexedDB`);
    const data = await indexedDBService.getAllItems<T>(storeName);
    console.log(`Data from IndexedDB for ${storeName}:`, data);
    
    if (Array.isArray(data) && data.length > 0) {
      // إذا وجدنا بيانات في IndexedDB ولدينا Electron، نحفظ نسخة في نظام الملفات
      if (window.electronAPI) {
        await fileSystemService.writeFile(storeName, data);
      }
      return data;
    }
    
    console.log(`No data found for ${storeName}, returning default value`);
    return defaultValue;
  } catch (error) {
    console.error(`Error getting data for ${storeName}:`, error);
    return defaultValue;
  }
};
