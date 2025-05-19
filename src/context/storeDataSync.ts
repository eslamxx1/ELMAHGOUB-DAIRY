
import { toast } from '@/components/ui/sonner';
import { saveData, getData } from './storeUtils';
import { fileSystemService } from '@/services/FileSystemService';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';

export interface StoreState {
  products: any[];
  routes: any[];
  customers: any[];
  employees: any[];
  salesRecords: any[];
}

export interface StoreActions {
  setProducts: (products: any[]) => void;
  setRoutes: (routes: any[]) => void;
  setCustomers: (customers: any[]) => void;
  setEmployees: (employees: any[]) => void;
  setSalesRecords: (salesRecords: any[]) => void;
}

// تهيئة الاتصال بقاعدة البيانات
const initializeDatabaseConnection = async () => {
  return await SupabaseSyncService.checkConnection();
};

// تصدير جميع البيانات
export const exportData = async (state: StoreState): Promise<any> => {
  try {
    // التحقق من وجود اتصال بقاعدة البيانات
    const isConnected = await initializeDatabaseConnection();
    if (isConnected) {
      toast.info("يتم الاتصال بقاعدة البيانات...");
    }
    
    // تحقق من البيانات قبل التصدير
    console.log("Exporting data:", state);
    console.log("Products count:", state.products.length);
    console.log("Routes count:", state.routes.length);
    console.log("Customers count:", state.customers.length);
    console.log("Employees count:", state.employees.length);
    console.log("Sales records count:", state.salesRecords.length);
    
    // فحص إذا كانت جميع البيانات فارغة رغم أنها من المفترض أن تكون موجودة
    if (
      state.products.length === 0 && 
      state.routes.length === 0 && 
      state.customers.length === 0 && 
      state.employees.length === 0 && 
      state.salesRecords.length === 0
    ) {
      console.log("All data arrays are empty, attempting to fetch fresh data");
      
      // محاولة للحصول على أحدث البيانات من المخازن
      const freshProducts = await getData('products', []);
      const freshRoutes = await getData('routes', []);
      const freshCustomers = await getData('customers', []);
      const freshEmployees = await getData('employees', []);
      const freshSalesRecords = await getData('salesRecords', []);
      
      console.log("Fresh data loaded - Products:", freshProducts.length);
      console.log("Fresh data loaded - Routes:", freshRoutes.length);
      console.log("Fresh data loaded - Customers:", freshCustomers.length);
      console.log("Fresh data loaded - Employees:", freshEmployees.length);
      console.log("Fresh data loaded - Sales Records:", freshSalesRecords.length);
      
      // استخدام البيانات المحدثة
      const data = {
        products: freshProducts.length > 0 ? freshProducts : state.products,
        routes: freshRoutes.length > 0 ? freshRoutes : state.routes,
        customers: freshCustomers.length > 0 ? freshCustomers : state.customers,
        employees: freshEmployees.length > 0 ? freshEmployees : state.employees,
        salesRecords: freshSalesRecords.length > 0 ? freshSalesRecords : state.salesRecords,
        exportDate: new Date().toISOString(),
        version: "1.1.0"
      };
      
      if (
        freshProducts.length === 0 && 
        freshRoutes.length === 0 && 
        freshCustomers.length === 0 && 
        freshEmployees.length === 0 && 
        freshSalesRecords.length === 0
      ) {
        console.warn("Warning: Could not load any data, export may be empty");
        toast.warning("تحذير: لم يتم العثور على بيانات للتصدير");
      }
      
      return await saveAndExportData(data);
    }
    
    // إذا كان هناك بيانات، قم بتصديرها مباشرة
    const data = {
      products: state.products,
      routes: state.routes,
      customers: state.customers,
      employees: state.employees,
      salesRecords: state.salesRecords,
      exportDate: new Date().toISOString(),
      version: "1.1.0"
    };
    
    return await saveAndExportData(data);
  } catch (error) {
    console.error("Failed to export data:", error);
    toast.error("فشل في تصدير البيانات");
    return null;
  }
};

// وظيفة مساعدة لحفظ وتصدير البيانات
const saveAndExportData = async (data: any): Promise<any> => {
  if (window.electronAPI) {
    // استخدام واجهة الإلكترون لتصدير البيانات إلى ملف
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `dairy-export-${timestamp}.json`;
    
    try {
      const result = await fileSystemService.selectExportPath(fileName);
      
      if (result.success && result.filePath) {
        console.log("Exporting data to file:", result.filePath);
        console.log("Data to export:", JSON.stringify(data));
        
        await fileSystemService.exportDataToFile(result.filePath, data);
        toast.success("تم تصدير البيانات بنجاح");
      } else if (result.error) {
        toast.error(`فشل تصدير البيانات: ${result.error}`);
      } else {
        toast.info("تم إلغاء تصدير البيانات");
      }
    } catch (error) {
      console.error("Error in file dialog:", error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    }
  } else {
    // محاولة نسخ البيانات للحافظة في حالة عدم استخدام Electron
    try {
      await navigator.clipboard.writeText(JSON.stringify(data));
      toast.success("تم نسخ البيانات للحافظة");
    } catch (clipboardError) {
      console.error("فشل في نسخ البيانات للحافظة:", clipboardError);
      // تحويل البيانات إلى JSON URL للتنزيل المباشر
      const jsonString = JSON.stringify(data);
      const dataBlob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // إنشاء رابط تنزيل
      const a = document.createElement('a');
      a.href = url;
      a.download = `dairy-export-${new Date().toISOString().replace(/:/g, '-')}.json`;
      a.click();
      
      // تنظيف
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل ملف البيانات");
    }
  }
  
  // التحقق من وجود اتصال بقاعدة البيانات ومزامنة البيانات
  try {
    const isConnected = await initializeDatabaseConnection();
    if (isConnected) {
      // مزامنة جميع البيانات مع قاعدة البيانات المركزية
      const syncResults = await SupabaseSyncService.syncAllData(
        data.products,
        data.routes,
        data.customers,
        data.employees,
        data.salesRecords
      );
      
      let totalSynced = 0;
      let totalErrors = 0;
      
      Object.entries(syncResults).forEach(([key, result]) => {
        totalSynced += result.syncedCount;
        totalErrors += result.errorCount;
      });
      
      if (totalErrors === 0) {
        toast.success(`تم مزامنة ${totalSynced} سجل مع قاعدة البيانات`);
      } else {
        toast.warning(`تم مزامنة ${totalSynced} سجل، وفشل في مزامنة ${totalErrors} سجل`);
      }
    }
  } catch (syncError) {
    console.error("Error synchronizing with database:", syncError);
    toast.error("فشل في مزامنة البيانات مع قاعدة البيانات");
  }
  
  return data;
};

// استيراد البيانات
export const importData = async (
  data: any, 
  actions: StoreActions
): Promise<boolean> => {
  try {
    if (!data) {
      toast.error("البيانات المستوردة غير صالحة");
      return false;
    }
    
    if (data.products && Array.isArray(data.products)) {
      console.log("Importing products:", data.products.length);
      await saveData('products', data.products);
      actions.setProducts(data.products);
    }
    
    if (data.routes && Array.isArray(data.routes)) {
      console.log("Importing routes:", data.routes.length);
      await saveData('routes', data.routes);
      actions.setRoutes(data.routes);
    }
    
    if (data.customers && Array.isArray(data.customers)) {
      console.log("Importing customers:", data.customers.length);
      await saveData('customers', data.customers);
      actions.setCustomers(data.customers);
    }
    
    if (data.employees && Array.isArray(data.employees)) {
      console.log("Importing employees:", data.employees.length);
      await saveData('employees', data.employees);
      actions.setEmployees(data.employees);
    }
    
    if (data.salesRecords && Array.isArray(data.salesRecords)) {
      console.log("Importing sales records:", data.salesRecords.length);
      await saveData('salesRecords', data.salesRecords);
      actions.setSalesRecords(data.salesRecords);
      
      // مزامنة البيانات المستوردة مع قاعدة البيانات
      const isConnected = await initializeDatabaseConnection();
      if (isConnected && data.products && data.routes) {
        try {
          const syncResults = await SupabaseSyncService.syncAllData(
            data.products,
            data.routes,
            data.customers,
            data.employees,
            data.salesRecords
          );
          
          let totalSynced = 0;
          let totalErrors = 0;
          
          Object.entries(syncResults).forEach(([key, result]) => {
            totalSynced += result.syncedCount;
            totalErrors += result.errorCount;
          });
          
          if (totalErrors === 0) {
            toast.success(`تم مزامنة ${totalSynced} سجل مع قاعدة البيانات`);
          } else {
            toast.warning(`تم مزامنة ${totalSynced} سجل، وفشل في مزامنة ${totalErrors} سجل`);
          }
        } catch (syncError) {
          console.error("Error synchronizing imported data:", syncError);
        }
      }
    }
    
    toast.success("تم استيراد البيانات بنجاح");
    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    toast.error("فشل في استيراد البيانات");
    return false;
  }
};

// استيراد البيانات من ملف
export const importDataFromFile = async (
  actions: StoreActions
): Promise<boolean> => {
  try {
    if (!window.electronAPI) {
      toast.error("واجهة Electron غير متاحة");
      return false;
    }
    
    const result = await window.electronAPI.selectImportFile();
    
    if (!result.success) {
      if (result.error) {
        toast.error("فشل في قراءة الملف: " + result.error);
      } else {
        toast.info("تم إلغاء استيراد البيانات");
      }
      return false;
    }
    
    if (!result.data) {
      toast.error("لم يتم تحديد ملف أو الملف فارغ");
      return false;
    }
    
    try {
      const importedData = JSON.parse(result.data);
      console.log("Imported data:", importedData);
      
      return await importData(importedData, actions);
    } catch (parseError) {
      toast.error("فشل في تحليل ملف البيانات");
      console.error("Parse error:", parseError);
      return false;
    }
  } catch (error) {
    console.error("Error importing data from file:", error);
    toast.error(`فشل في استيراد البيانات: ${error}`);
    return false;
  }
};
