
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Wifi, WifiOff, RefreshCw, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { SupabaseSyncService } from '@/services/SupabaseSyncService';
import { useStore } from '@/context/StoreContext';
import { toast } from '@/components/ui/sonner';

const DatabaseStatus = () => {
  const { products, routes, customers, employees, salesRecords, syncAllData } = useStore();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // فحص حالة الاتصال بقاعدة البيانات
  const checkConnection = async () => {
    try {
      setIsChecking(true);
      const isConnected = await SupabaseSyncService.checkConnection();
      setIsConnected(isConnected);
    } catch (error) {
      console.error('فشل في الاتصال بقاعدة البيانات:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  // مزامنة البيانات مع قاعدة البيانات
  const syncData = async () => {
    if (!isConnected) return;
    
    // التحقق من وجود بيانات للمزامنة
    const hasData = products.length > 0 || routes.length > 0 || 
                   customers.length > 0 || employees.length > 0 || 
                   salesRecords.length > 0;
    
    if (!hasData) {
      toast.warning("لا توجد بيانات للمزامنة");
      return;
    }
    
    try {
      setIsSyncing(true);
      // استخدام دالة مزامنة كل البيانات من سياق المتجر
      const success = await syncAllData();
      
      if (success) {
        toast.success("تم مزامنة البيانات بنجاح");
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("فشل في مزامنة البيانات");
    } finally {
      setIsSyncing(false);
    }
  };

  // فحص الاتصال عند تحميل المكون
  useEffect(() => {
    checkConnection();
    
    // فحص الاتصال كل دقيقة
    const intervalId = setInterval(() => {
      checkConnection();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (isConnected === null) return null;

  return (
    <div className={cn(
      "fixed left-4 bottom-4 transition-transform duration-300 z-40",
      showStatus ? "translate-y-0" : "translate-y-[calc(100%-40px)]"
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div 
          className="flex items-center cursor-pointer justify-between mb-2"
          onClick={() => setShowStatus(!showStatus)}
        >
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-2 text-dairy-600 dark:text-dairy-400" />
            <span className="font-medium text-sm">حالة قاعدة البيانات</span>
          </div>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500",
            isChecking && "animate-pulse"
          )}></div>
        </div>
        
        {showStatus && (
          <div className="pt-1 pb-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center mt-2 text-sm">
              {isConnected ? (
                <Wifi className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 mr-2 text-red-500" />
              )}
              <span>
                {isConnected 
                  ? "متصل بقاعدة البيانات" 
                  : "غير متصل بقاعدة البيانات"}
              </span>
            </div>
            
            <div className="flex flex-col space-y-2 mt-2">
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="text-center bg-gray-100 dark:bg-gray-700 p-1 rounded">
                  <div className="font-medium">المنتجات</div>
                  <div className="text-dairy-600">{products.length}</div>
                </div>
                <div className="text-center bg-gray-100 dark:bg-gray-700 p-1 rounded">
                  <div className="font-medium">المسارات</div>
                  <div className="text-dairy-600">{routes.length}</div>
                </div>
                <div className="text-center bg-gray-100 dark:bg-gray-700 p-1 rounded">
                  <div className="font-medium">المبيعات</div>
                  <div className="text-dairy-600">{salesRecords.length}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                onClick={checkConnection}
                disabled={isChecking}
              >
                <RefreshCw className={cn("h-3 w-3 mr-2", isChecking && "animate-spin")} />
                تحديث
              </Button>
              
              {isConnected && (
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs flex-1"
                  onClick={syncData}
                  disabled={isSyncing}
                >
                  <ArrowUpDown className={cn("h-3 w-3 mr-2", isSyncing && "animate-spin")} />
                  مزامنة
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;
