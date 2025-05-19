
export interface FileReadResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileWriteResult {
  success: boolean;
  error?: string;
}

export const fileSystemService = {
  selectExportPath: async (defaultPath: string): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.selectExportPath(defaultPath);
        return { success: result.success, filePath: result.filePath, error: result.error };
      } else {
        return { success: false, error: "Electron API not available" };
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      return { success: false, error: String(error) };
    }
  },

  exportDataToFile: async (filePath: string, data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      if (window.electronAPI) {
        console.log(`Preparing to export data to: ${filePath}`);
        console.log("Data to export (summary):", 
          Object.keys(data).map(key => `${key}: ${Array.isArray(data[key]) ? data[key].length : typeof data[key]}`));
        
        const jsonStr = JSON.stringify(data, null, 2);
        console.log(`JSON data size: ${jsonStr.length} characters`);
        
        const result = await window.electronAPI.exportData(filePath, jsonStr);
        console.log("Export result:", result);
        
        return { success: result.success, error: result.error };
      }
      return { success: false, error: "Electron API not available" };
    } catch (error) {
      console.error("Error exporting data:", error);
      return { success: false, error: String(error) };
    }
  },

  readFile: async <T>(fileName: string): Promise<T | undefined> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.readFile(fileName);
        if (result.success && result.data) {
          return JSON.parse(result.data) as T;
        }
      } else {
        // For web version, use localStorage
        const data = localStorage.getItem(fileName);
        if (data) {
          return JSON.parse(data) as T;
        }
      }
      return undefined;
    } catch (error) {
      console.error(`Error reading file "${fileName}":`, error);
      return undefined;
    }
  },

  writeFile: async <T>(fileName: string, data: T): Promise<FileWriteResult> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.writeFile(
          fileName, 
          JSON.stringify(data, null, 2)
        );
        return { success: result.success, error: result.error };
      } else {
        // For web version, use localStorage
        localStorage.setItem(fileName, JSON.stringify(data));
        return { success: true };
      }
    } catch (error) {
      console.error(`Error writing file "${fileName}":`, error);
      return { success: false, error: String(error) };
    }
  },

  createBackup: async (backupName?: string): Promise<{ success: boolean; backupPath?: string; error?: string }> => {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.createBackup(backupName);
      }
      return { success: false, error: "Electron API not available" };
    } catch (error) {
      console.error("Error creating backup:", error);
      return { success: false, error: String(error) };
    }
  },

  listBackups: async (): Promise<{ success: boolean; backups?: Array<{name: string; date: Date; path: string}>; error?: string }> => {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.listBackups();
      }
      return { success: false, error: "Electron API not available", backups: [] };
    } catch (error) {
      console.error("Error listing backups:", error);
      return { success: false, error: String(error), backups: [] };
    }
  },

  restoreBackup: async (backupPath: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.restoreBackup(backupPath);
        console.log("Restore backup result:", result);
        
        if (result.success) {
          // إعادة تحميل البيانات من النسخ الاحتياطية بعد استعادتها
          console.log("Backup restored successfully, reloading data from backup");
          
          // حدث البيانات في localStorage أو قم بإعادة تحميل الصفحة
          // لتطبيق التغييرات
          const products = await window.electronAPI.readFile('products');
          const routes = await window.electronAPI.readFile('routes');
          const customers = await window.electronAPI.readFile('customers');
          const employees = await window.electronAPI.readFile('employees');
          const salesRecords = await window.electronAPI.readFile('salesRecords');
          
          if (products.success && products.data) {
            localStorage.setItem('products', products.data);
          }
          
          if (routes.success && routes.data) {
            localStorage.setItem('routes', routes.data);
          }
          
          if (customers.success && customers.data) {
            localStorage.setItem('customers', customers.data);
          }
          
          if (employees.success && employees.data) {
            localStorage.setItem('employees', employees.data);
          }
          
          if (salesRecords.success && salesRecords.data) {
            localStorage.setItem('salesRecords', salesRecords.data);
          }
        }
        
        return result;
      }
      return { success: false, error: "Electron API not available" };
    } catch (error) {
      console.error("Error restoring backup:", error);
      return { success: false, error: String(error) };
    }
  },

  exportAllData: async (defaultFilename: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // تحضير البيانات للتصدير
      const products = localStorage.getItem('products') || '[]';
      const routes = localStorage.getItem('routes') || '[]';
      const customers = localStorage.getItem('customers') || '[]';
      const employees = localStorage.getItem('employees') || '[]';
      const salesRecords = localStorage.getItem('salesRecords') || '[]';

      // تسجيل البيانات التي سيتم تصديرها
      console.log("Preparing data for export");
      console.log("Products from localStorage:", JSON.parse(products).length);
      console.log("Routes from localStorage:", JSON.parse(routes).length);
      console.log("Customers from localStorage:", JSON.parse(customers).length);
      console.log("Employees from localStorage:", JSON.parse(employees).length);
      console.log("Sales records from localStorage:", JSON.parse(salesRecords).length);

      const exportData = {
        products: JSON.parse(products),
        routes: JSON.parse(routes),
        customers: JSON.parse(customers),
        employees: JSON.parse(employees),
        salesRecords: JSON.parse(salesRecords),
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };

      if (window.electronAPI) {
        const selectResult = await window.electronAPI.selectExportPath(defaultFilename);
        
        if (selectResult.success && selectResult.filePath) {
          console.log("Selected export path:", selectResult.filePath);
          console.log("Exporting data with sizes:", {
            products: exportData.products.length,
            routes: exportData.routes.length,
            customers: exportData.customers.length,
            employees: exportData.employees.length,
            salesRecords: exportData.salesRecords.length
          });
          
          const result = await window.electronAPI.exportData(
            selectResult.filePath, 
            JSON.stringify(exportData, null, 2)
          );
          return result;
        } else {
          // إستخدام خاصية error بدلاً من canceled
          return { success: false, error: selectResult.error || "فشل في تحديد مسار الملف" };
        }
      } else {
        // للبيئة الويب - استخدام رابط تنزيل
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = defaultFilename;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove();
        
        return { success: true };
      }
    } catch (error) {
      console.error("Error exporting all data:", error);
      return { success: false, error: String(error) };
    }
  },

  importAllData: async (): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.selectImportFile();
        
        if (result.success && result.data) {
          const importedData = JSON.parse(result.data);
          console.log("Imported data:", importedData); // سجّل البيانات المستوردة
          
          // تخزين البيانات المستوردة
          if (importedData.products) {
            localStorage.setItem('products', JSON.stringify(importedData.products));
            console.log("Products imported:", importedData.products.length);
          }
          
          if (importedData.routes) {
            localStorage.setItem('routes', JSON.stringify(importedData.routes));
            console.log("Routes imported:", importedData.routes.length);
          }
          
          if (importedData.customers) {
            localStorage.setItem('customers', JSON.stringify(importedData.customers));
            console.log("Customers imported:", importedData.customers.length);
          }
          
          if (importedData.employees) {
            localStorage.setItem('employees', JSON.stringify(importedData.employees));
            console.log("Employees imported:", importedData.employees.length);
          }
          
          if (importedData.salesRecords) {
            localStorage.setItem('salesRecords', JSON.stringify(importedData.salesRecords));
            console.log("Sales records imported:", importedData.salesRecords.length);
          }
          
          return { success: true };
        } else {
          // إستخدام خاصية error بدلاً من canceled
          return { success: false, error: result.error || "فشل في استيراد البيانات" };
        }
      } else {
        // لبيئة الويب - استخدام مدخل الملف
        return { 
          success: true, 
          error: "يرجى تحديد ملف للاستيراد", 
          data: null 
        };
      }
    } catch (error) {
      console.error("Error importing all data:", error);
      return { success: false, error: String(error) };
    }
  },
  
  importDataFromFile: async (file: File): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      try {
        if (!file) {
          resolve({ success: false, error: "لم يتم تحديد أي ملف" });
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const fileContent = event.target?.result as string;
            if (!fileContent) {
              resolve({ success: false, error: "فشل قراءة محتوى الملف" });
              return;
            }

            console.log("File content loaded, length:", fileContent.length);
            const importedData = JSON.parse(fileContent);
            console.log("Parsed imported data:", importedData);
            
            // التحقق من صحة البيانات
            if (!importedData.products && !importedData.customers && !importedData.salesRecords) {
              console.error("Invalid data format in file:", importedData);
              resolve({ success: false, error: "الملف المحدد لا يحتوي على بيانات صالحة" });
              return;
            }
            
            console.log("Data imported successfully:", importedData);
            
            // تخزين البيانات المستوردة
            if (importedData.products) {
              localStorage.setItem('products', JSON.stringify(importedData.products));
              console.log("Products stored in localStorage:", importedData.products.length);
            }
            
            if (importedData.routes) {
              localStorage.setItem('routes', JSON.stringify(importedData.routes));
              console.log("Routes stored in localStorage:", importedData.routes.length);
            }
            
            if (importedData.customers) {
              localStorage.setItem('customers', JSON.stringify(importedData.customers));
              console.log("Customers stored in localStorage:", importedData.customers.length);
            }
            
            if (importedData.employees) {
              localStorage.setItem('employees', JSON.stringify(importedData.employees));
              console.log("Employees stored in localStorage:", importedData.employees.length);
            }
            
            if (importedData.salesRecords) {
              localStorage.setItem('salesRecords', JSON.stringify(importedData.salesRecords));
              console.log("Sales records stored in localStorage:", importedData.salesRecords.length);
            }
            
            resolve({ success: true });
          } catch (error) {
            console.error("Error parsing imported file:", error);
            resolve({ success: false, error: `فشل في تحليل الملف: ${error}` });
          }
        };
        
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          resolve({ success: false, error: "فشل في قراءة الملف" });
        };
        
        console.log("Starting to read file as text");
        reader.readAsText(file);
      } catch (error) {
        console.error("Error in importDataFromFile:", error);
        resolve({ success: false, error: String(error) });
      }
    });
  },

  selectAndImportFromExportFile: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (window.electronAPI) {
        // اختيار ملف للاستيراد باستخدام نافذة حوار الملفات
        const result = await window.electronAPI.selectImportFile();
        console.log("Select import file result:", result);
        
        if (result.success && result.data) {
          try {
            // تحليل البيانات المستوردة
            const importedData = JSON.parse(result.data);
            console.log("Import data selected:", importedData);
            
            // التحقق من أنها بيانات تصدير صالحة
            if (!importedData.products && !importedData.customers && !importedData.salesRecords) {
              console.error("Invalid data format:", importedData);
              return { success: false, error: "الملف المحدد لا يحتوي على بيانات صالحة" };
            }
            
            // تخزين البيانات المستوردة في التخزين المحلي
            if (importedData.products) {
              localStorage.setItem('products', JSON.stringify(importedData.products));
              console.log("Products stored:", importedData.products.length);
            }
            
            if (importedData.routes) {
              localStorage.setItem('routes', JSON.stringify(importedData.routes));
              console.log("Routes stored:", importedData.routes.length);
            }
            
            if (importedData.customers) {
              localStorage.setItem('customers', JSON.stringify(importedData.customers));
              console.log("Customers stored:", importedData.customers.length);
            }
            
            if (importedData.employees) {
              localStorage.setItem('employees', JSON.stringify(importedData.employees));
              console.log("Employees stored:", importedData.employees.length);
            }
            
            if (importedData.salesRecords) {
              localStorage.setItem('salesRecords', JSON.stringify(importedData.salesRecords));
              console.log("Sales records stored:", importedData.salesRecords.length);
            }
            
            return { success: true };
          } catch (parseError) {
            console.error("Error parsing import data:", parseError);
            return { success: false, error: "فشل في تحليل بيانات الملف المستورد" };
          }
        } else {
          // إستخدام خاصية error بدلاً من canceled
          return { success: false, error: result.error || "فشل في استيراد البيانات" };
        }
      } else {
        // للبيئة الويب، نحتاج إلى استخدام طريقة مختلفة
        return { 
          success: false, 
          error: "استخدم زر استيراد البيانات من الملف في بيئة الويب"
        };
      }
    } catch (error) {
      console.error("Error importing from export file:", error);
      return { success: false, error: String(error) };
    }
  }
};
