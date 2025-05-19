
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Download, Upload, Settings2, Database } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { SyncDashboard } from '@/components/database/SyncDashboard';

export default function Settings() {
  const { exportData, importFromFile } = useStore();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExport = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const handleImport = async () => {
    try {
      await importFromFile();
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error("Error importing data:", error);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 w-[400px]">
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>إدارة البيانات</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>قاعدة البيانات</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>تصدير البيانات</CardTitle>
                <CardDescription>
                  تصدير جميع البيانات كملف JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  يمكنك تصدير جميع البيانات الموجودة في التطبيق إلى ملف JSON للنسخ الاحتياطي.
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  تصدير البيانات
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>استيراد البيانات</CardTitle>
                <CardDescription>
                  استيراد البيانات من ملف JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  يمكنك استيراد البيانات من ملف JSON تم تصديره مسبقًا. سيتم استبدال البيانات الحالية.
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setIsImportDialogOpen(true)} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  استيراد البيانات
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="database">
          <div className="grid gap-4 md:grid-cols-2">
            <SyncDashboard />
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>استيراد البيانات</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي استيراد البيانات إلى استبدال جميع البيانات الحالية.
              هل أنت متأكد من أنك تريد المتابعة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              استيراد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
