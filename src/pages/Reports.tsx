
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parse, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const Reports = () => {
  const { routes, products, salesRecords } = useStore();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [filteredRecords, setFilteredRecords] = useState(salesRecords);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleDateChange = (date: string) => {
    setDateInput(date);
    // محاولة تحويل النص إلى تاريخ
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
    } else {
      setSelectedDate(null);
    }
  };

  const searchRecords = () => {
    let filtered = salesRecords;
    
    // تصفية حسب التاريخ
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(record => record.date === dateString);
    }
    
    // تصفية حسب خط السير
    if (selectedRouteId && selectedRouteId !== 'all') {
      filtered = filtered.filter(record => record.routeId === selectedRouteId);
    }
    
    setFilteredRecords(filtered);
    setHasSearched(true);
    
    if (filtered.length === 0) {
      toast.info('لم يتم العثور على سجلات مبيعات تطابق معايير البحث');
    } else {
      toast.success(`تم العثور على ${filtered.length} سجل`);
    }
  };

  const exportToCsv = () => {
    if (filteredRecords.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    
    // إنشاء محتوى ملف CSV
    let csvContent = 'التاريخ,خط السير,إجمالي المبيعات,إجمالي التوالف\n';
    
    filteredRecords.forEach(record => {
      const route = routes.find(r => r.id === record.routeId);
      const routeName = route ? route.name : 'خط غير معروف';
      csvContent += `${record.date},${routeName},${record.totalSales},${record.totalLosses}\n`;
    });
    
    // إنشاء رابط تنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_المبيعات_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('تم تصدير البيانات بنجاح');
  };

  const resetFilters = () => {
    setSelectedRouteId('all');
    setSelectedDate(null);
    setDateInput('');
    setFilteredRecords(salesRecords);
    setHasSearched(false);
  };
  
  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-cairo">تقارير المبيعات</h1>
      
      <Card className="border border-dairy-100 shadow-md">
        <CardHeader className="bg-dairy-50">
          <CardTitle className="font-cairo text-dairy-800">البحث في سجلات المبيعات</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium font-cairo">التاريخ</label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateInput}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full"
                  placeholder="اختر التاريخ"
                  dir="ltr"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium font-cairo">خط السير</label>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر خط السير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الخطوط</SelectItem>
                  {routes.map(route => (
                    <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={searchRecords} className="bg-dairy-700 hover:bg-dairy-800 flex-1">
                <Search className="ml-2 h-4 w-4" />
                بحث
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="ml-2 h-4 w-4" />
                إعادة ضبط
              </Button>
              <Button onClick={exportToCsv} className="bg-green-600 hover:bg-green-700">
                <Download className="ml-2 h-4 w-4" />
                تصدير CSV
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden shadow">
            <Table>
              <TableHeader className="bg-dairy-50">
                <TableRow>
                  <TableHead className="font-cairo">التاريخ</TableHead>
                  <TableHead className="font-cairo">خط السير</TableHead>
                  <TableHead className="font-cairo">المنتجات المباعة</TableHead>
                  <TableHead className="font-cairo">إجمالي المبيعات</TableHead>
                  <TableHead className="font-cairo">إجمالي التوالف</TableHead>
                  <TableHead className="font-cairo">تفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => {
                    const route = routes.find(r => r.id === record.routeId);
                    
                    // حساب المنتجات المباعة
                    const soldProducts = record.entries
                      ? record.entries
                          .filter(entry => entry.net && entry.net > 0)
                          .map(entry => {
                            const product = products.find(p => p.id === entry.productId);
                            return {
                              name: product?.name || 'غير معروف',
                              quantity: entry.net || 0
                            };
                          })
                      : [];
                    
                    return (
                      <TableRow key={record.id || record.date + record.routeId} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell>{route?.name || 'غير معروف'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {soldProducts.slice(0, 3).map((product, idx) => (
                              <Badge key={idx} variant="outline" className="bg-dairy-50">
                                {product.name}: {product.quantity}
                              </Badge>
                            ))}
                            {soldProducts.length > 3 && (
                              <Badge variant="outline" className="bg-dairy-50">
                                +{soldProducts.length - 3} منتج أخر
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-600 font-bold">{record.totalSales?.toFixed(2) || '0.00'} ج.م</TableCell>
                        <TableCell className="text-red-600 font-bold">{record.totalLosses?.toFixed(2) || '0.00'} ج.م</TableCell>
                        <TableCell>
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDetails(record)}
                              >
                                عرض التفاصيل
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>تفاصيل المبيعات - {record.date}</DrawerTitle>
                                <DrawerDescription>
                                  خط السير: {route?.name || 'غير معروف'}
                                </DrawerDescription>
                              </DrawerHeader>
                              <div className="p-4 overflow-auto max-h-[60vh]">
                                <h3 className="font-bold mb-2">تفاصيل المنتجات:</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>المنتج</TableHead>
                                      <TableHead>العدد</TableHead>
                                      <TableHead>المرتجع</TableHead>
                                      <TableHead>التالف</TableHead>
                                      <TableHead>الصافي</TableHead>
                                      <TableHead>السعر</TableHead>
                                      <TableHead>قيمة المبيع</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {record.entries?.map((entry: any) => {
                                      const product = products.find(p => p.id === entry.productId);
                                      const count = entry.count || 0;
                                      const returned = entry.returned || 0;
                                      const damaged = entry.damaged || 0;
                                      const net = Math.max(0, count - returned - damaged);
                                      const price = product?.price || 0;
                                      
                                      return (
                                        <TableRow key={`${record.id}-${entry.productId}`}>
                                          <TableCell>{product?.name || 'غير معروف'}</TableCell>
                                          <TableCell>{count}</TableCell>
                                          <TableCell>{returned}</TableCell>
                                          <TableCell>{damaged}</TableCell>
                                          <TableCell>{net}</TableCell>
                                          <TableCell>{price.toFixed(2)} ج.م</TableCell>
                                          <TableCell>{(net * price).toFixed(2)} ج.م</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                              <DrawerFooter className="border-t pt-4">
                                <div className="flex justify-between mb-4">
                                  <div>
                                    <p>إجمالي المبيعات: <span className="font-bold text-green-600">{record.totalSales?.toFixed(2) || '0.00'} ج.م</span></p>
                                  </div>
                                  <div>
                                    <p>إجمالي التوالف: <span className="font-bold text-red-600">{record.totalLosses?.toFixed(2) || '0.00'} ج.م</span></p>
                                  </div>
                                </div>
                                <DrawerClose asChild>
                                  <Button variant="outline">إغلاق</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : hasSearched ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      لم يتم العثور على سجلات مبيعات تطابق معايير البحث
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      الرجاء تحديد معايير البحث والضغط على زر "بحث"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            {hasSearched && filteredRecords.length > 0 ? (
              <p className="font-cairo">
                تم العثور على {filteredRecords.length} سجل من إجمالي {salesRecords.length} سجل
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
