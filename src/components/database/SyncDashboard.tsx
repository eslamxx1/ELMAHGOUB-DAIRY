import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, Check, AlertTriangle, X, Check as CheckIcon, Cloud } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function SyncDashboard() {
  const { 
    products, 
    routes, 
    customers,
    employees, 
    salesRecords,
    syncAllData, 
    isConnectedToDb,
    lastSyncTime 
  } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncStats, setSyncStats] = useState<{
    success: boolean;
    syncedCount: number;
    errorCount: number;
    details: {
      products: { success: boolean; count: number; errors: number };
      routes: { success: boolean; count: number; errors: number };
      customers: { success: boolean; count: number; errors: number };
      employees: { success: boolean; count: number; errors: number };
      salesRecords: { success: boolean; count: number; errors: number };
    }
  } | null>(null);

  useEffect(() => {
    // مؤقت لتحديث شريط التقدم
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 95) {
            clearInterval(timer);
            return oldProgress;
          }
          return oldProgress + 5;
        });
      }, 500);
      
      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  // مزامنة البيانات مع قاعدة البيانات
  const handleSync = async () => {
    setIsLoading(true);
    setProgress(10);
    
    try {
      // استخدام الوظيفة المحسنة syncAllData من السياق
      const success = await syncAllData();
      setProgress(100);
      
      // تعيين إحصائيات المزامنة
      setSyncStats({
        success,
        syncedCount: success ? products.length + routes.length + customers.length + employees.length + salesRecords.length : 0,
        errorCount: success ? 0 : 1,
        details: {
          products: { success, count: products.length, errors: success ? 0 : 1 },
          routes: { success, count: routes.length, errors: success ? 0 : 1 },
          customers: { success, count: customers.length, errors: success ? 0 : 1 },
          employees: { success, count: employees.length, errors: success ? 0 : 1 },
          salesRecords: { success, count: salesRecords.length, errors: success ? 0 : 1 }
        }
      });
      
    } catch (error) {
      console.error("Error during sync:", error);
      toast.error("حدث خطأ أثناء المزامنة");
      setProgress(100);
      setSyncStats({
        success: false,
        syncedCount: 0,
        errorCount: 1,
        details: {
          products: { success: false, count: 0, errors: 1 },
          routes: { success: false, count: 0, errors: 1 },
          customers: { success: false, count: 0, errors: 1 },
          employees: { success: false, count: 0, errors: 1 },
          salesRecords: { success: false, count: 0, errors: 1 }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full border-dairy-100 shadow-md">
      <CardHeader className="bg-dairy-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 font-cairo">
          <Database className="h-5 w-5 text-dairy-600" />
          <span>مزامنة قاعدة البيانات</span>
        </CardTitle>
        <CardDescription className="font-cairo">
          مزامنة البيانات المحلية مع قاعدة البيانات المركزية
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 font-cairo">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="details">تفاصيل البيانات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-sm font-medium mb-1 font-cairo">حالة الاتصال:</div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnectedToDb ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="font-cairo">{isConnectedToDb ? "متصل بقاعدة البيانات" : "غير متصل بقاعدة البيانات"}</span>
              </div>
            </div>
            
            {lastSyncTime && (
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-medium mb-1 font-cairo">آخر مزامنة:</div>
                <div className="flex items-center gap-2">
                  <span className="font-cairo">{lastSyncTime}</span>
                  {syncStats && (
                    syncStats.success ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )
                  )}
                </div>
                {syncStats && (
                  <div className="mt-2 text-sm">
                    {syncStats.success && (
                      <div className="flex items-center gap-1 font-cairo">
                        <CheckIcon className="h-4 w-4 text-green-500" />
                        <div>تمت مزامنة {syncStats.syncedCount} سجل بنجاح</div>
                      </div>
                    )}
                    {syncStats.errorCount > 0 && (
                      <div className="flex items-center gap-1 mt-1 font-cairo">
                        <X className="h-4 w-4 text-red-500" />
                        <div>فشلت المزامنة في {syncStats.errorCount} سجل</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {isLoading && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium font-cairo">جاري المزامنة...</span>
                  <span className="text-sm text-dairy-600 font-cairo">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <DataCard title="المنتجات" count={products.length} color="bg-green-50 text-green-700" icon={<Check className="h-4 w-4" />} />
              <DataCard title="المسارات" count={routes.length} color="bg-blue-50 text-blue-700" icon={<Check className="h-4 w-4" />} />
              <DataCard title="العملاء" count={customers.length} color="bg-purple-50 text-purple-700" icon={<Check className="h-4 w-4" />} />
              <DataCard title="الموظفون" count={employees.length} color="bg-pink-50 text-pink-700" icon={<Check className="h-4 w-4" />} />
              <DataCard title="المبيعات" count={salesRecords.length} color="bg-amber-50 text-amber-700" icon={<Check className="h-4 w-4" />} />
            </div>
            
            {syncStats && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h3 className="font-medium font-cairo">تفاصيل آخر مزامنة:</h3>
                <SyncDetails title="المنتجات" stats={syncStats.details.products} />
                <SyncDetails title="المسارات" stats={syncStats.details.routes} />
                <SyncDetails title="العملاء" stats={syncStats.details.customers} />
                <SyncDetails title="الموظفين" stats={syncStats.details.employees} />
                <SyncDetails title="المبيعات" stats={syncStats.details.salesRecords} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSync} 
          disabled={isLoading || !isConnectedToDb}
          className="w-full bg-dairy-700 hover:bg-dairy-800 text-white font-cairo gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          مزامنة جميع البيانات مع قاعدة البيانات
        </Button>
      </CardFooter>
    </Card>
  );
}

function DataCard({ title, count, color, icon }: { title: string; count: number; color: string; icon: React.ReactNode }) {
  return (
    <div className={`${color} p-3 rounded-lg border border-opacity-50 shadow-sm`}>
      <div className="flex justify-between items-center">
        <span className="font-medium font-cairo">{title}</span>
        {icon}
      </div>
      <div className="text-xl font-bold mt-1 font-cairo">{count}</div>
    </div>
  );
}

function SyncDetails({ 
  title, 
  stats 
}: { 
  title: string; 
  stats: { success: boolean; count: number; errors: number } 
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
      <span className="font-cairo">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-cairo">
          {stats.success ? (
            <span className="text-green-600">تمت المزامنة ({stats.count})</span>
          ) : (
            <span className="text-red-600">فشل في المزامنة ({stats.errors})</span>
          )}
        </span>
        {stats.success ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
}
