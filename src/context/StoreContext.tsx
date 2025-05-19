
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { indexedDBService } from '@/services/IndexedDBService';
import { StoreContextType } from './types';
import { defaultProducts, defaultRoutes, getData, saveData } from './storeUtils';
import { useStoreOperations } from './useStoreOperations';
import { exportData as exportStoreData, importData as importStoreData, importDataFromFile } from './storeDataSync';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectedToDb, setIsConnectedToDb] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Initialize store operations with empty arrays
  const store = useStoreOperations(
    defaultProducts,
    defaultRoutes,
    [],
    [],
    []
  );

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log("Initializing data storage...");
        
        // تهيئة قاعدة البيانات IndexedDB
        await indexedDBService.init();
        console.log("IndexedDB initialized");
        
        // تحميل البيانات - تعطي الأولوية لنظام الملفات عند استخدام Electron
        const loadedProducts = await getData('products', defaultProducts);
        const loadedRoutes = await getData('routes', defaultRoutes);
        const loadedCustomers = await getData('customers', []);
        const loadedEmployees = await getData('employees', []);
        const loadedSalesRecords = await getData('salesRecords', []);
        
        console.log("Data loaded, updating state");
        console.log("Products loaded:", loadedProducts.length);
        console.log("Routes loaded:", loadedRoutes.length);
        console.log("Customers loaded:", loadedCustomers.length);
        console.log("Employees loaded:", loadedEmployees.length);
        console.log("Sales records loaded:", loadedSalesRecords.length);
        
        store.setProducts(loadedProducts);
        store.setRoutes(loadedRoutes);
        store.setCustomers(loadedCustomers);
        store.setEmployees(loadedEmployees);
        store.setSalesRecords(loadedSalesRecords);
        
        setIsInitialized(true);
        console.log('تم تحميل البيانات بنجاح');
        
        // إظهار إشعار للمستخدم بنجاح التحميل
        if (window.electronAPI) {
          toast.success("تم تحميل البيانات من نظام الملفات");
        } else {
          toast.success("تم تحميل البيانات من المتصفح");
        }
        
        // التحقق من الاتصال بقاعدة البيانات Supabase
        const dbConnected = await SupabaseSyncService.checkConnection();
        setIsConnectedToDb(dbConnected);
        
        if (dbConnected) {
          toast.success("تم الاتصال بقاعدة البيانات بنجاح");
          
          // محاولة مزامنة جميع البيانات الموجودة
          if (loadedSalesRecords.length > 0 || loadedProducts.length > 0 || 
              loadedRoutes.length > 0 || loadedCustomers.length > 0 || 
              loadedEmployees.length > 0) {
                
            const syncResults = await SupabaseSyncService.syncAllData(
              loadedProducts,
              loadedRoutes,
              loadedCustomers,
              loadedEmployees,
              loadedSalesRecords
            );
            
            let totalSynced = 0;
            let totalErrors = 0;
            
            Object.entries(syncResults).forEach(([key, result]) => {
              totalSynced += result.syncedCount;
              totalErrors += result.errorCount;
            });
            
            if (totalSynced > 0) {
              toast.success(`تم مزامنة ${totalSynced} سجل مع قاعدة البيانات`);
              setLastSyncTime(new Date().toLocaleString('ar'));
            }
          }
        }
      } catch (error) {
        console.error("فشل في تحميل البيانات:", error);
        toast.error("فشل في تحميل البيانات. يرجى تحديث الصفحة.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // AutoSave data when it changes
  useEffect(() => {
    if (!isInitialized) return;
    const autoSaveData = async () => {
      await saveData('products', store.products);
    };
    autoSaveData();
  }, [store.products, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    const autoSaveData = async () => {
      await saveData('routes', store.routes);
    };
    autoSaveData();
  }, [store.routes, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    const autoSaveData = async () => {
      await saveData('customers', store.customers);
    };
    autoSaveData();
  }, [store.customers, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    const autoSaveData = async () => {
      await saveData('employees', store.employees);
    };
    autoSaveData();
  }, [store.employees, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized) return;
    const autoSaveData = async () => {
      await saveData('salesRecords', store.salesRecords);
    };
    autoSaveData();
  }, [store.salesRecords, isInitialized]);
  
  // Auto sync all data with Supabase when they change
  const syncAllDataWithDatabase = async () => {
    if (!isInitialized || !isConnectedToDb) return;
    
    try {
      const syncResults = await SupabaseSyncService.syncAllData(
        store.products,
        store.routes,
        store.customers,
        store.employees,
        store.salesRecords
      );
      
      let totalSynced = 0;
      let totalErrors = 0;
      
      Object.entries(syncResults).forEach(([key, result]) => {
        totalSynced += result.syncedCount;
        totalErrors += result.errorCount;
      });
      
      if (totalSynced > 0 || totalErrors > 0) {
        console.log(`تمت المزامنة التلقائية: ${totalSynced} سجل بنجاح، ${totalErrors} خطأ`);
        setLastSyncTime(new Date().toLocaleString('ar'));
      }
    } catch (error) {
      console.error("فشل في المزامنة التلقائية:", error);
    }
  };
  
  // مزامنة عند تغيير البيانات
  useEffect(() => {
    if (!isInitialized || !isConnectedToDb) return;
    
    // استخدم setTimeout لتأخير المزامنة لتجنب المزامنة المتكررة
    const timeoutId = setTimeout(syncAllDataWithDatabase, 5000);
    return () => clearTimeout(timeoutId);
  }, [
    store.products,
    store.routes,
    store.customers,
    store.employees,
    store.salesRecords,
    isInitialized,
    isConnectedToDb
  ]);

  // Save data before window unload
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      // Show a confirmation dialog before leaving
      event.preventDefault();
      event.returnValue = '';
      
      // Save all data
      try {
        console.log("Saving all data before unload");
        await Promise.all([
          saveData('products', store.products),
          saveData('routes', store.routes),
          saveData('customers', store.customers),
          saveData('employees', store.employees),
          saveData('salesRecords', store.salesRecords)
        ]);
        
        // Final sync with database if connected
        if (isConnectedToDb) {
          await syncAllDataWithDatabase();
        }
      } catch (error) {
        console.error("Failed to save data on unload:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    store.products, 
    store.routes, 
    store.customers, 
    store.employees, 
    store.salesRecords, 
    isInitialized,
    isConnectedToDb
  ]);

  // Manually sync all data with database
  const syncAllData = async () => {
    if (!isConnectedToDb) {
      const connected = await SupabaseSyncService.checkConnection();
      if (!connected) {
        toast.error("غير متصل بقاعدة البيانات");
        return false;
      }
      setIsConnectedToDb(true);
    }
    
    toast.info("جاري مزامنة البيانات مع قاعدة البيانات...");
    
    try {
      const syncResults = await SupabaseSyncService.syncAllData(
        store.products,
        store.routes,
        store.customers,
        store.employees,
        store.salesRecords
      );
      
      let totalSynced = 0;
      let totalErrors = 0;
      
      Object.entries(syncResults).forEach(([key, result]) => {
        totalSynced += result.syncedCount;
        totalErrors += result.errorCount;
      });
      
      setLastSyncTime(new Date().toLocaleString('ar'));
      
      if (totalErrors === 0) {
        toast.success(`تم مزامنة ${totalSynced} سجل مع قاعدة البيانات`);
        return true;
      } else {
        toast.warning(`تم مزامنة ${totalSynced} سجل، وفشل في مزامنة ${totalErrors} سجل`);
        return false;
      }
    } catch (error) {
      console.error("فشل في مزامنة البيانات:", error);
      toast.error("فشل في مزامنة البيانات مع قاعدة البيانات");
      return false;
    }
  };

  // Export and import data methods
  const exportData = async () => {
    console.log("Preparing to export data");
    console.log("Current state - Products:", store.products.length);
    console.log("Current state - Routes:", store.routes.length);
    console.log("Current state - Customers:", store.customers.length);
    console.log("Current state - Employees:", store.employees.length);
    console.log("Current state - Sales Records:", store.salesRecords.length);
    
    // تحقق مما إذا كانت هناك بيانات للتصدير
    if (
      store.products.length === 0 && 
      store.routes.length === 0 && 
      store.customers.length === 0 && 
      store.employees.length === 0 && 
      store.salesRecords.length === 0
    ) {
      // إذا كانت جميع المصفوفات فارغة، حاول تحميل البيانات مرة أخرى قبل التصدير
      console.log("All data arrays are empty, attempting to refresh data from storage");
      
      try {
        const freshProducts = await getData('products', defaultProducts);
        const freshRoutes = await getData('routes', defaultRoutes);
        const freshCustomers = await getData('customers', []);
        const freshEmployees = await getData('employees', []);
        const freshSalesRecords = await getData('salesRecords', []);
        
        console.log("Fresh data loaded for export:", {
          products: freshProducts.length,
          routes: freshRoutes.length,
          customers: freshCustomers.length,
          employees: freshEmployees.length,
          salesRecords: freshSalesRecords.length
        });
        
        // تحديث الحالة بالبيانات المحدثة
        if (freshProducts.length > 0) store.setProducts(freshProducts);
        if (freshRoutes.length > 0) store.setRoutes(freshRoutes);
        if (freshCustomers.length > 0) store.setCustomers(freshCustomers);
        if (freshEmployees.length > 0) store.setEmployees(freshEmployees);
        if (freshSalesRecords.length > 0) store.setSalesRecords(freshSalesRecords);
        
        // إذا كانت جميع المصفوفات لا تزال فارغة، أظهر تحذيرًا
        if (
          freshProducts.length === 0 && 
          freshRoutes.length === 0 && 
          freshCustomers.length === 0 && 
          freshEmployees.length === 0 && 
          freshSalesRecords.length === 0
        ) {
          toast.warning("تحذير: لم يتم العثور على بيانات للتصدير");
        }
      } catch (error) {
        console.error("Error refreshing data before export:", error);
      }
    }
    
    return exportStoreData({
      products: store.products,
      routes: store.routes,
      customers: store.customers,
      employees: store.employees,
      salesRecords: store.salesRecords
    });
  };

  const importData = async (data: any) => {
    return importStoreData(data, {
      setProducts: store.setProducts,
      setRoutes: store.setRoutes,
      setCustomers: store.setCustomers,
      setEmployees: store.setEmployees,
      setSalesRecords: store.setSalesRecords
    });
  };

  // New method to import from file using Electron
  const importFromFile = async () => {
    return importDataFromFile({
      setProducts: store.setProducts,
      setRoutes: store.setRoutes,
      setCustomers: store.setCustomers,
      setEmployees: store.setEmployees,
      setSalesRecords: store.setSalesRecords
    });
  };

  const value: StoreContextType = {
    ...store,
    exportData,
    importData,
    importFromFile,
    isLoading,
    syncAllData,
    isConnectedToDb,
    lastSyncTime
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
