
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Cloud, CheckCircle, Clock, Server, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';

export function DatabaseStatus() {
  const { isConnectedToDb, lastSyncTime, syncAllData } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSync = async () => {
    setIsSyncing(true);
    setProgress(10);
    
    try {
      // محاكاة تقدم المزامنة
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      await syncAllData();
      clearInterval(progressTimer);
      setProgress(100);
      
      toast.success('تمت مزامنة البيانات بنجاح');
      
      // إعادة تعيين شريط التقدم بعد لحظات
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('فشل في مزامنة البيانات');
      setProgress(0);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="border-dairy-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-dairy-50 rounded-t-lg py-3">
        <CardTitle className="text-base font-medium flex items-center gap-2 font-cairo">
          <Database className="h-5 w-5 text-dairy-600" />
          حالة قاعدة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${isConnectedToDb ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className={`text-sm ${isConnectedToDb ? 'text-green-700' : 'text-red-700'} font-cairo`}>
              {isConnectedToDb ? 'متصل بقاعدة البيانات' : 'غير متصل بقاعدة البيانات'}
            </span>
          </div>
          <div className="flex items-center bg-dairy-50 px-2 py-1 rounded">
            <Server className="h-4 w-4 text-dairy-600 mr-1" />
            <span className="text-xs text-dairy-700 font-cairo">سحابي</span>
          </div>
        </div>
        
        {lastSyncTime && (
          <div className="flex items-center text-dairy-700 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span className="font-cairo">آخر مزامنة: {lastSyncTime}</span>
          </div>
        )}
        
        {isSyncing && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dairy-600 font-cairo">جاري المزامنة...</span>
              <span className="text-xs text-dairy-600 font-cairo">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="pt-2">
          <Button
            className="w-full text-xs bg-dairy-700 hover:bg-dairy-800 font-cairo gap-2 py-1 h-8"
            size="sm"
            onClick={handleSync}
            disabled={!isConnectedToDb || isSyncing}
          >
            {isSyncing ? (
              <Cloud className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle className="h-3 w-3" />
            )}
            {isSyncing ? 'جاري المزامنة...' : 'مزامنة البيانات'}
          </Button>
        </div>
        
        {!isConnectedToDb && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-xs text-red-700 font-cairo">
              تعذر الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
